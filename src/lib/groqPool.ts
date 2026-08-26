import Groq from 'groq-sdk';

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
    const splitKeys = raw.split(/[,;\n]/)
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

// Ponteiro global para distribuição Round-Robin entre as requisições
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

const MODEL_NAME = 'openai/gpt-oss-120b';

// Controle de concorrência global (Semáforo FIFO em memória)
// Garante que rajadas de submissões simultâneas não estourem a taxa da API do Groq
const MAX_CONCURRENT_REQUESTS = 4;
const QUEUE_TIMEOUT_MS = 30000; // 30s de timeout máximo na fila de espera

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
      reject(new Error('Fila de requisições cheia. O tempo limite de espera foi excedido. Tente novamente em instantes.'));
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
 * Executa a chamada à IA com Semáforo de Concorrência, Load Balancer Round-Robin e Failover automático.
 */
export async function runLoadBalancedAnalysis({
  systemPrompt,
  userMessage,
}: AnalysisRequestOptions): Promise<string> {
  const keys = getGroqApiKeys();

  if (keys.length === 0) {
    throw new Error('Nenhuma chave da API Groq configurada nas variáveis de ambiente.');
  }

  // 1. Obtém uma vaga no semáforo de concorrência
  const releaseSlot = await acquireConcurrencySlot();

  try {
    // 2. Seleciona a chave da vez pelo algoritmo Round-Robin
    const startIndex = currentKeyIndex % keys.length;
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;

    const orderedKeys = [
      ...keys.slice(startIndex),
      ...keys.slice(0, startIndex),
    ];

    let lastError: unknown = null;

    // 3. Tenta executar no modelo com as chaves disponíveis no pool
    for (let i = 0; i < orderedKeys.length; i++) {
      const apiKey = orderedKeys[i];
      const client = getGroqClient(apiKey);

      try {
        const completion = await client.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          model: MODEL_NAME,
          temperature: 0.1,
          response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          return content;
        }
      } catch (err: unknown) {
        lastError = err;
        const isRateLimit = (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 429) ||
          (err instanceof Error && err.message.includes('429'));

        console.warn(`[Groq Load Balancer] Chave ${i + 1}/${orderedKeys.length} falhou (${isRateLimit ? 'Rate Limit 429' : 'Erro'}), acionando failover para a próxima chave...`);

        // Se houver mais chaves no pool, tenta a próxima chave imediatamente
        if (i < orderedKeys.length - 1) {
          continue;
        }
      }
    }

    throw lastError || new Error('Todas as chaves da API Groq estão temporariamente indisponíveis.');
  } finally {
    // Libera a vaga no semáforo para a próxima requisição na fila
    releaseSlot();
  }
}
