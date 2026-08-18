import { NextResponse } from 'next/server';
import { CLEAN_CODE_ANALYZER_PROMPT } from '@/prompts/analyzerPrompt';
import { sanitizeCode } from '@/lib/sanitizer';
import { checkJavaHeuristics } from '@/lib/heuristics';
import { getCodeHash, getCachedAnalysis, setCachedAnalysis } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rateLimit';
import { getServerExerciseById } from '@/lib/exercisesServer';
import { runLoadBalancedAnalysis, getGroqApiKeys } from '@/lib/groqPool';
import { isTooSimilarToInitialCode } from '@/lib/similarity';

export const dynamic = 'force-dynamic';

const MAX_CODE_LENGTH = 5000;
const MIN_CODE_LENGTH = 10;

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting por IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip')
      || 'anonymous-client';

    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Por favor, aguarde ${rateLimit.resetInSeconds} segundo${rateLimit.resetInSeconds > 1 ? 's' : ''} antes de realizar uma nova análise.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetInSeconds.toString(),
          }
        }
      );
    }

    // 2. Validação do corpo da requisição
    const body = await request.json().catch(() => null);

    if (!body || typeof body.code !== 'string') {
      return NextResponse.json(
        { error: 'Payload inválido. O campo "code" deve ser uma string.' },
        { status: 400 }
      );
    }

    // 3. Sanitização de caracteres invisíveis, de controle e normalização de espaços
    const sanitizedCode = sanitizeCode(body.code);

    if (sanitizedCode.length === 0) {
      return NextResponse.json({ error: 'Código Java não fornecido.' }, { status: 400 });
    }

    if (sanitizedCode.length < MIN_CODE_LENGTH) {
      return NextResponse.json(
        { error: 'O código enviado é muito curto para análise (mínimo 10 caracteres).' },
        { status: 400 }
      );
    }

    if (sanitizedCode.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `O código excede o limite máximo permitido de ${MAX_CODE_LENGTH.toLocaleString('pt-BR')} caracteres.` },
        { status: 400 }
      );
    }

    // 4. Heurística Java: valida se o código parece Java antes de chamar a IA
    const heuristic = checkJavaHeuristics(sanitizedCode);
    if (!heuristic.isValid) {
      return NextResponse.json(
        { error: heuristic.reason || 'O código fornecido não parece ser Java válido.' },
        { status: 400 }
      );
    }

    // 5. Verifica se há contexto de exercício pré-pronto com solução de referência
    const exerciseId = typeof body.exerciseId === 'string' ? body.exerciseId : undefined;
    const exercise = exerciseId ? getServerExerciseById(exerciseId) : undefined;

    if (exercise && isTooSimilarToInitialCode(sanitizedCode, exercise.initialCode)) {
      return NextResponse.json(
        {
          error: 'O código enviado é praticamente idêntico ao código inicial do exercício. Tente realizar a refatoração antes de solicitar a análise.',
        },
        { status: 400 }
      );
    }

    // 6. Cache por Hash SHA-256 (inclui o exerciseId se houver para evitar colisões com modo livre)
    const cacheKey = exercise ? `${sanitizedCode}_ex_${exercise.id}` : sanitizedCode;
    const codeHash = getCodeHash(cacheKey);
    const cachedResult = getCachedAnalysis(codeHash);

    if (cachedResult) {
      return NextResponse.json(cachedResult, {
        status: 200,
        headers: { 'X-Cache': 'HIT' }
      });
    }

    // 7. Verificação das chaves da API do Groq no Pool
    const availableKeys = getGroqApiKeys();
    if (availableKeys.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma chave da API do Groq configurada no servidor (.env).' },
        { status: 500 }
      );
    }

    // 8. Encapsula o código do aluno e injeta o gabarito de referência quando for um exercício
    let userMessage = `<codigo_do_aluno_para_analise>\n${sanitizedCode}\n</codigo_do_aluno_para_analise>`;

    if (exercise) {
      userMessage += `\n\n<gabarito_do_professor_para_comparacao>
Exercício: ${exercise.title} (${exercise.category} - Dificuldade: ${exercise.difficulty})
Objetivo: ${exercise.description}
Critérios esperados:
${exercise.objectives.map(obj => `- ${obj}`).join('\n')}

Gabarito ideal de referência:
${exercise.expectedCleanCode}
</gabarito_do_professor_para_comparacao>`;
    }

    // 9. Chamada balanceada à API Groq com Round-Robin e Failover automático
    const aiContent = await runLoadBalancedAnalysis({
      systemPrompt: CLEAN_CODE_ANALYZER_PROMPT,
      userMessage,
    });

    if (!aiContent) {
      throw new Error('Resposta vazia da API.');
    }

    // 10. Parse e validação do JSON
    const parsedData = JSON.parse(aiContent);

    // Salva no cache
    setCachedAnalysis(codeHash, parsedData);

    return NextResponse.json(parsedData, {
      status: 200,
      headers: { 'X-Cache': 'MISS' }
    });

  } catch (error: unknown) {
    console.error('Erro ao analisar código:', error);

    const isRateLimit = (typeof error === 'object' && error !== null && 'status' in error && (error as { status: number }).status === 429) ||
      (error instanceof Error && error.message.includes('429'));

    if (isRateLimit) {
      return NextResponse.json(
        { error: 'Muitas requisições simultâneas na API da IA. Rate limit excedido. Tente novamente em alguns segundos.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Falha ao processar a análise do código. Tente novamente.' },
      { status: 500 }
    );
  }
}
