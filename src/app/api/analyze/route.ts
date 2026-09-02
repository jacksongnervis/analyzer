import { NextResponse } from 'next/server';
import { CLEAN_CODE_ANALYZER_PROMPT } from '@/prompts/analyzerPrompt';
import { sanitizeCode } from '@/lib/sanitizer';
import { checkJavaHeuristics } from '@/lib/heuristics';
import { getCodeHash, getCachedAnalysis, setCachedAnalysis } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerExerciseById } from '@/lib/exercisesServer';
import { runLoadBalancedAnalysis, getGroqApiKeys } from '@/lib/groqPool';
import { isTooSimilarToInitialCode } from '@/lib/similarity';
import { validateAndSanitizeAnalysisResult } from '@/lib/responseValidator';
import { logSubmission } from '@/lib/auditLogger';

export const dynamic = 'force-dynamic';

const MAX_CODE_LENGTH = 5000;
const MIN_CODE_LENGTH = 10;
const SESSION_COOKIE_NAME = 'analyzer_session_id';

function extractSessionId(request: Request): { sessionId: string; isNew: boolean } {
  // 1. Tenta extrair cookie da sessão
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)analyzer_session_id=([a-zA-Z0-9_-]+)/);
  if (cookieMatch?.[1]) {
    return { sessionId: cookieMatch[1], isNew: false };
  }

  // 2. Tenta extrair cabeçalho customizado x-client-session-id enviado pelo frontend
  const headerSession = request.headers.get('x-client-session-id');
  if (headerSession && /^[a-zA-Z0-9_-]{8,64}$/.test(headerSession)) {
    return { sessionId: headerSession, isNew: false };
  }

  // 3. Gera um novo identificador único criptograficamente seguro para o aluno
  const newId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);

  return { sessionId: newId, isNew: true };
}

function attachSession(response: NextResponse, sessionId: string): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas de validade (janela do evento)
  });
  response.headers.set('x-client-session-id', sessionId);
  return response;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  const { sessionId } = extractSessionId(request);

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'anonymous-client';

  let currentExerciseId = 'free-mode';

  try {
    // 1. Rate Limiting por Sessão + Proteção Anti-Burst por IP (resolve colisão de Wi-Fi/NAT)
    const rateLimit = checkRateLimit(clientIp, sessionId);
    if (!rateLimit.allowed) {
      const errorMessage = rateLimit.reason === 'ip_burst'
        ? 'Muitas requisições simultâneas nesta rede. Por favor, aguarde alguns segundos antes de tentar novamente.'
        : `Por favor, aguarde ${rateLimit.resetInSeconds} segundo${rateLimit.resetInSeconds > 1 ? 's' : ''} antes de realizar uma nova análise.`;

      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: currentExerciseId,
        status: 'RATE_LIMIT',
        durationMs: Date.now() - startTime,
        error: errorMessage,
      });

      const rateLimitResponse = NextResponse.json(
        { error: errorMessage },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetInSeconds.toString(),
          }
        }
      );
      return attachSession(rateLimitResponse, sessionId);
    }

    // 2. Validação do corpo da requisição
    const body = await request.json().catch(() => null);

    if (!body || typeof body.code !== 'string') {
      const errorMsg = 'Payload inválido. O campo "code" deve ser uma string.';
      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: currentExerciseId,
        status: 'INVALID_PAYLOAD',
        durationMs: Date.now() - startTime,
        error: errorMsg,
      });

      const badReqResponse = NextResponse.json({ error: errorMsg }, { status: 400 });
      return attachSession(badReqResponse, sessionId);
    }

    // 3. Sanitização de caracteres invisíveis, de controle e normalização de espaços
    const sanitizedCode = sanitizeCode(body.code);

    if (typeof body.exerciseId === 'string' && body.exerciseId.trim().length > 0) {
      currentExerciseId = body.exerciseId.trim();
    }

    if (sanitizedCode.length === 0) {
      const emptyError = 'Código Java não fornecido.';
      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: currentExerciseId,
        status: 'INVALID_PAYLOAD',
        durationMs: Date.now() - startTime,
        error: emptyError,
      });
      const emptyResponse = NextResponse.json({ error: emptyError }, { status: 400 });
      return attachSession(emptyResponse, sessionId);
    }

    if (sanitizedCode.length < MIN_CODE_LENGTH) {
      const shortError = `O código enviado é muito curto para análise (mínimo ${MIN_CODE_LENGTH} caracteres).`;
      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: currentExerciseId,
        status: 'INVALID_PAYLOAD',
        durationMs: Date.now() - startTime,
        codeLength: sanitizedCode.length,
        error: shortError,
      });
      const shortResponse = NextResponse.json({ error: shortError }, { status: 400 });
      return attachSession(shortResponse, sessionId);
    }

    if (sanitizedCode.length > MAX_CODE_LENGTH) {
      const longError = `O código excede o limite máximo permitido de ${MAX_CODE_LENGTH.toLocaleString('pt-BR')} caracteres.`;
      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: currentExerciseId,
        status: 'INVALID_PAYLOAD',
        durationMs: Date.now() - startTime,
        codeLength: sanitizedCode.length,
        error: longError,
      });
      const longResponse = NextResponse.json({ error: longError }, { status: 400 });
      return attachSession(longResponse, sessionId);
    }

    // 4. Heurística Java: valida se o código parece Java antes de chamar a IA
    const heuristic = checkJavaHeuristics(sanitizedCode);
    if (!heuristic.isValid) {
      const reason = heuristic.reason || 'O código fornecido não parece ser Java válido.';
      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: currentExerciseId,
        status: 'HEURISTIC_REJECT',
        durationMs: Date.now() - startTime,
        codeLength: sanitizedCode.length,
        error: reason,
      });
      const heuristicResponse = NextResponse.json({ error: reason }, { status: 400 });
      return attachSession(heuristicResponse, sessionId);
    }

    // 5. Verifica se há contexto de exercício pré-pronto com solução de referência
    const exercise = currentExerciseId !== 'free-mode' ? getServerExerciseById(currentExerciseId) : undefined;

    if (exercise && isTooSimilarToInitialCode(sanitizedCode, exercise.initialCode)) {
      const simError = 'O código enviado é praticamente idêntico ao código inicial do exercício. Tente realizar a refatoração antes de solicitar a análise.';
      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: exercise.id,
        status: 'SIMILARITY_REJECT',
        durationMs: Date.now() - startTime,
        codeLength: sanitizedCode.length,
        error: simError,
      });
      const similarResponse = NextResponse.json({ error: simError }, { status: 400 });
      return attachSession(similarResponse, sessionId);
    }

    // 6. Verificação do cache em memória (SHA-256 isolado por exercício)
    const codeHash = getCodeHash(sanitizedCode, currentExerciseId);
    const cachedResult = getCachedAnalysis(codeHash);

    if (cachedResult) {
      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: currentExerciseId,
        status: 'CACHE_HIT',
        codeHash,
        codeLength: sanitizedCode.length,
        pontuacao: cachedResult.pontuacao,
        durationMs: Date.now() - startTime,
      });

      const cachedResponse = NextResponse.json(cachedResult, {
        status: 200,
        headers: { 'X-Cache': 'HIT' }
      });
      return attachSession(cachedResponse, sessionId);
    }

    // 7. Verificação das chaves da API do Groq no Pool
    const availableKeys = getGroqApiKeys();
    if (availableKeys.length === 0) {
      const noKeyError = 'Nenhuma chave da API do Groq configurada no servidor (.env).';
      logSubmission({
        ip: clientIp,
        sessionId,
        exerciseId: currentExerciseId,
        status: 'AI_ERROR',
        durationMs: Date.now() - startTime,
        error: noKeyError,
      });
      const noKeyResponse = NextResponse.json({ error: noKeyError }, { status: 500 });
      return attachSession(noKeyResponse, sessionId);
    }

    // 8. Encapsula o código do aluno e injeta o gabarito de referência quando for um exercício
    let userMessage = `<codigo_do_aluno_para_analise>\n${sanitizedCode}\n</codigo_do_aluno_para_analise>`;

    if (exercise) {
      userMessage += `\n\n<gabarito_do_professor_para_comparacao>
Exercício: ${exercise.title} (${exercise.category} - Dificuldade: ${exercise.difficulty})
Objetivo: ${exercise.description}
Critérios esperados:
${exercise.objectives.map(obj => `- ${obj}`).join('\n')}

DIRETRIZ CRUCIAL DE ESCOPO E ARQUITETURA PARA ESTE EXERCÍCIO:
- O nível de arquitetura e abstração esperado para este exercício é EXATAMENTE o do gabarito abaixo.
- Se o gabarito do professor estiver contido em uma única classe (como neste exercício), É ESTRITAMENTE PROIBIDO apontar "God Class" ou exigir a criação de novas classes (como classe Aluno, etc.).
- Avalie se o aluno cumpriu os objetivos específicos deste exercício (${exercise.category}). Se a solução do aluno for equivalente em clareza ao gabarito, atribua NOTA 10.

Gabarito ideal de referência do professor:
${exercise.expectedCleanCode}
</gabarito_do_professor_para_comparacao>`;
    }

    // 9. Chamada balanceada à API Groq com Semáforo de Concorrência, Round-Robin e Failover
    const aiContent = await runLoadBalancedAnalysis({
      systemPrompt: CLEAN_CODE_ANALYZER_PROMPT,
      userMessage,
    });

    if (!aiContent) {
      throw new Error('Resposta vazia da API.');
    }

    // 10. Parse com validação e sanitização estrita de schema (evita crashes no frontend)
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Erro ao fazer JSON.parse da resposta da IA:', parseError, '\nConteúdo:', aiContent);
      throw new Error('Formato de resposta retornado pela IA é inválido.');
    }

    const validatedResult = validateAndSanitizeAnalysisResult(parsedJson);

    // Salva no cache a estrutura estritamente validada
    setCachedAnalysis(codeHash, validatedResult);

    logSubmission({
      ip: clientIp,
      sessionId,
      exerciseId: currentExerciseId,
      status: 'SUCCESS',
      codeHash,
      codeLength: sanitizedCode.length,
      pontuacao: validatedResult.pontuacao,
      durationMs: Date.now() - startTime,
    });

    const successResponse = NextResponse.json(validatedResult, {
      status: 200,
      headers: { 'X-Cache': 'MISS' }
    });
    return attachSession(successResponse, sessionId);

  } catch (error: unknown) {
    console.error('Erro ao analisar código:', error);

    const isRateLimit = (typeof error === 'object' && error !== null && 'status' in error && (error as { status: number }).status === 429) ||
      (error instanceof Error && error.message.includes('429'));

    const errorMsg = error instanceof Error ? error.message : 'Erro interno ao processar';

    logSubmission({
      ip: clientIp,
      sessionId,
      exerciseId: currentExerciseId,
      status: 'AI_ERROR',
      durationMs: Date.now() - startTime,
      error: errorMsg,
    });

    if (isRateLimit) {
      const rateLimitErrResponse = NextResponse.json(
        { error: 'Muitas requisições simultâneas na API da IA. Rate limit excedido. Tente novamente em alguns segundos.' },
        { status: 429 }
      );
      return attachSession(rateLimitErrResponse, sessionId);
    }

    const genericErrResponse = NextResponse.json(
      { error: 'Falha ao processar a análise do código. Tente novamente.' },
      { status: 500 }
    );
    return attachSession(genericErrResponse, sessionId);
  }
}
