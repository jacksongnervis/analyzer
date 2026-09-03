interface OpenRouterRequestOptions {
  systemPrompt: string;
  userMessage: string;
}

interface OpenRouterErrorResponse {
  error?: {
    message?: string;
    code?: number | string;
    metadata?: unknown;
  };
}

const DEFAULT_MODEL = 'deepseek/deepseek-chat';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 45000; // 45s de timeout

/**
 * Remove aspas e espaços do nome do modelo.
 */
function sanitizeModelName(model: string): string {
  return model.replace(/^["'\s]+|["'\s]+$/g, '').trim();
}

/**
 * Verifica se a chave do OpenRouter está configurada nas variáveis de ambiente.
 */
export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}

/**
 * Retorna o modelo configurado para o OpenRouter (padrão: deepseek/deepseek-chat).
 */
export function getOpenRouterModel(): string {
  const envModel = process.env.OPENROUTER_MODEL?.trim();
  return envModel && envModel.length > 0 ? sanitizeModelName(envModel) : DEFAULT_MODEL;
}

/**
 * Retorna a lista de modelos ativos (para compatibilidade com logs do orquestrador).
 */
export function getOpenRouterModels(): string[] {
  return [getOpenRouterModel()];
}

/**
 * Executa a chamada de análise na API do OpenRouter diretamente no modelo DeepSeek de alta velocidade.
 */
export async function callOpenRouterAnalysis({
  systemPrompt,
  userMessage,
}: OpenRouterRequestOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY não foi configurada nas variáveis de ambiente (.env).');
  }

  const model = getOpenRouterModel();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const siteName = 'Clean Code Analyzer';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const start = Date.now();

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    const elapsed = Date.now() - start;

    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      try {
        const errorData = (await response.json()) as OpenRouterErrorResponse;
        if (errorData?.error?.message) {
          errorMessage += `: ${errorData.error.message}`;
        }
      } catch {
        const text = await response.text().catch(() => '');
        if (text) errorMessage += `: ${text}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('A API retornou uma resposta vazia ou em formato inesperado.');
    }

    return content;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Tempo limite de ${REQUEST_TIMEOUT_MS / 1000}s excedido na API do OpenRouter.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
