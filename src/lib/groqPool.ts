import Groq from 'groq-sdk';
import {
  isOpenRouterConfigured,
  callOpenRouterAnalysis,
  getOpenRouterModels,
} from './openRouter';

interface AnalysisRequestOptions {
  systemPrompt: string;
  userMessage: string;
}

/**
 * Coleta e valida todas as chaves Groq configuradas nas variáveis de ambiente.
 * Suporta:
 * - GROQ_API_KEYS="chave1,chave2,chave3" (múltiplas chaves separadas por vírgula)
 * - GROQ_API_KEY="chave1" (chave primária padrão)
 * - GROQ_API_KEY_2, GROQ_API_KEY_3, GROQ_API_KEY_BACKUP (chaves adicionais)
 */
export function getGroqApiKeys(): string[] {
  const keys: string[] = [];

  const rawEnvValues = [
    process.env.GROQ_API_KEYS,
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_BACKUP,
  ];

  for (const raw of rawEnvValues) {
    if (!raw) continue;
    // Divide por vírgula, ponto-e-vírgula ou quebra de linha caso haja mais de uma chave na mesma variável
    const splitKeys = raw
      .split(/[,;\n]/)
      .map(k => k.replace(/["']/g, '').trim())
      .filter(k => k.length > 0);

    for (const key of splitKeys) {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
  }

  return keys;
}

/**
 * Retorna true se houver ao menos um provedor de IA com chave configurada (Groq ou OpenRouter).
 */
export function hasConfiguredAiKeys(): boolean {
  return getGroqApiKeys().length > 0 || isOpenRouterConfigured();
}

// Ponteiro global para distribuição Round-Robin entre as requisições Groq
let currentKeyIndex = 0;

/**
 * Cache de instâncias Groq SDK por chave para evitar recriação constante de conexões
 */
const clientCache = new Map<string, Groq>();

function getGroqClient(apiKey: string): Groq {
  let client = clientCache.get(apiKey);
  if (!client) {
    client = new Groq({ apiKey });
    clientCache.set(apiKey, client);
  }
  return client;
}

const GROQ_MODEL_NAME = 'openai/gpt-oss-120b';

// Controle de concorrência global (Semáforo FIFO em memória)
// Garante que rajadas de submissões simultâneas não estourem limites do servidor ou APIs
const MAX_CONCURRENT_REQUESTS = 10;
const QUEUE_TIMEOUT_MS = 60000; // 60s de timeout máximo na fila de espera

let activeRequestsCount = 0;
const requestQueue: Array<() => void> = [];

async function acquireConcurrencySlot(): Promise<() => void> {
  if (activeRequestsCount < MAX_CONCURRENT_REQUESTS) {
    activeRequestsCount++;
    return () => releaseConcurrencySlot();
  }

  return new Promise<() => void>((resolve, reject) => {
    let timer: NodeJS.Timeout | null = null;

    const proceed = () => {
      if (timer) clearTimeout(timer);
      activeRequestsCount++;
      resolve(() => releaseConcurrencySlot());
    };

    timer = setTimeout(() => {
      const idx = requestQueue.indexOf(proceed);
      if (idx !== -1) {
        requestQueue.splice(idx, 1);
      }
      reject(
        new Error(
          'Fila de requisições cheia. O tempo limite de espera foi excedido. Tente novamente em instantes.'
        )
      );
    }, QUEUE_TIMEOUT_MS);

    requestQueue.push(proceed);
  });
}

function releaseConcurrencySlot(): void {
  activeRequestsCount = Math.max(0, activeRequestsCount - 1);
  const next = requestQueue.shift();
  if (next) {
    next();
  }
}

/**
 * Executa a chamada à IA com arquitetura híbrida de resiliência:
 * 1. Tenta o pool da Groq (Tier 1 - gratuito e rápido) com Round-Robin e Failover entre chaves.
 * 2. Se a Groq retornar Rate Limit (429) ou estiver indisponível, aciona imediatamente
 *    o OpenRouter (Tier 2 - fallback de alta capacidade com DeepSeek).
 * 3. Se não houver chaves da Groq configuradas, encaminha diretamente para o OpenRouter.
 */
export async function runLoadBalancedAnalysis({
  systemPrompt,
  userMessage,
}: AnalysisRequestOptions): Promise<string> {
  const groqKeys = getGroqApiKeys();
  const openRouterActive = isOpenRouterConfigured();

  if (groqKeys.length === 0 && !openRouterActive) {
    throw new Error(
      'Nenhuma chave de IA configurada nas variáveis de ambiente (.env). Configure GROQ_API_KEYS ou OPENROUTER_API_KEY.'
    );
  }

  // 1. Obtém uma vaga no semáforo de concorrência
  const releaseSlot = await acquireConcurrencySlot();

  try {
    // Caso 1: Sem chaves da Groq, vai direto para OpenRouter
    if (groqKeys.length === 0) {
      return await callOpenRouterAnalysis({ systemPrompt, userMessage });
    }

    // Caso 2: Tenta executar via Groq (Tier 1) com Round-Robin entre as chaves
    const startIndex = currentKeyIndex % groqKeys.length;
    currentKeyIndex = (currentKeyIndex + 1) % groqKeys.length;

    const orderedKeys = [
      ...groqKeys.slice(startIndex),
      ...groqKeys.slice(0, startIndex),
    ];

    let lastGroqError: unknown = null;

    for (let i = 0; i < orderedKeys.length; i++) {
      const apiKey = orderedKeys[i];
      const client = getGroqClient(apiKey);

      try {
        const completion = await client.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          model: GROQ_MODEL_NAME,
          temperature: 0.1,
          response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          return content;
        }
      } catch (err: unknown) {
        lastGroqError = err;
        const isRateLimit =
          (typeof err === 'object' &&
            err !== null &&
            'status' in err &&
            (err as { status: number }).status === 429) ||
          (err instanceof Error && err.message.includes('429'));

        console.warn(
          `[Groq Load Balancer] Chave ${i + 1}/${orderedKeys.length} falhou (${
            isRateLimit ? 'Rate Limit 429' : 'Erro'
          }).`
        );

        // Se houver mais chaves no pool Groq, tenta a próxima chave
        if (i < orderedKeys.length - 1) {
          console.warn('[Groq Load Balancer] Acionando failover para a próxima chave Groq...');
          continue;
        }
      }
    }

    // Caso 3: Todas as chaves Groq falharam ou atingiram Rate Limit
    if (openRouterActive) {
      const modelChain = getOpenRouterModels().join(' -> ');
      console.warn(
        `[AI Failover] Todas as chaves Groq falharam ou atingiram limite de taxa (429). Redirecionando automaticamente para OpenRouter (${modelChain})...`
      );
      try {
        const openRouterResponse = await callOpenRouterAnalysis({
          systemPrompt,
          userMessage,
        });
        return openRouterResponse;
      } catch (openRouterError) {
        console.error('[AI Failover] Erro também no fallback do OpenRouter:', openRouterError);
        throw openRouterError;
      }
    }

    // Sem OpenRouter configurado para fallback
    throw (
      lastGroqError ||
      new Error('Todas as chaves da API Groq estão temporariamente indisponíveis.')
    );
  } finally {
    // Libera a vaga no semáforo para a próxima requisição na fila
    releaseSlot();
  }
}
