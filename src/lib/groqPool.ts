import Groq from 'groq-sdk';
import {
  isOpenRouterConfigured,
  callOpenRouterAnalysis,
  getOpenRouterModel,
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
 * Executa a chamada à IA com arquitetura balanceada e failover imediato:
 * 1. O algoritmo Round-Robin seleciona uma chave Groq para a requisição.
 * 2. Se a chave da Groq responder com sucesso, retorna imediatamente (~0.5s).
 * 3. Se a chave da Groq falhar ou atingir Rate Limit (429), NÃO perde tempo testando
 *    outras chaves da Groq em série (que também estariam saturadas no mesmo segundo):
 *    aciona IMEDIATAMENTE o OpenRouter (DeepSeek) como fallback transparente!
 * 4. Se não houver chaves da Groq configuradas, encaminha diretamente para o OpenRouter.
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

    // Caso 2: Round-Robin seleciona a chave Groq desta requisição
    const selectedKeyIndex = currentKeyIndex % groqKeys.length;
    currentKeyIndex = (currentKeyIndex + 1) % groqKeys.length;

    const apiKey = groqKeys[selectedKeyIndex];
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
    } catch (groqErr: unknown) {
      const isRateLimit =
        (typeof groqErr === 'object' &&
          groqErr !== null &&
          'status' in groqErr &&
          (groqErr as { status: number }).status === 429) ||
        (groqErr instanceof Error && groqErr.message.includes('429'));

      // Se o OpenRouter estiver ativo, aciona IMEDIATAMENTE o DeepSeek sem perder tempo com outras chaves Groq saturadas
      if (openRouterActive) {
        const modelName = getOpenRouterModel();
        console.warn(
          `[AI Failover] Chave Groq #${selectedKeyIndex + 1} atingiu ${
            isRateLimit ? 'Rate Limit (429)' : 'Erro'
          }. Acionando fallback direto para OpenRouter (${modelName})...`
        );
        return await callOpenRouterAnalysis({ systemPrompt, userMessage });
      }

      // Se OpenRouter NÃO estiver configurado, aí sim tenta as outras chaves Groq como plano de emergência
      console.warn(
        `[Groq Load Balancer] Chave Groq #${selectedKeyIndex + 1} falhou (${
          isRateLimit ? 'Rate Limit 429' : 'Erro'
        }). Tentando chaves secundárias...`
      );

      const remainingKeys = [
        ...groqKeys.slice(selectedKeyIndex + 1),
        ...groqKeys.slice(0, selectedKeyIndex),
      ];

      for (let i = 0; i < remainingKeys.length; i++) {
        const backupKey = remainingKeys[i];
        const backupClient = getGroqClient(backupKey);
        try {
          const comp = await backupClient.chat.completions.create({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            model: GROQ_MODEL_NAME,
            temperature: 0.1,
            response_format: { type: 'json_object' },
          });
          const c = comp.choices[0]?.message?.content;
          if (c) return c;
        } catch {
          continue;
        }
      }

      throw groqErr;
    }

    throw new Error('Resposta vazia da API Groq.');
  } finally {
    // Libera a vaga no semáforo para a próxima requisição na fila
    releaseSlot();
  }
}
