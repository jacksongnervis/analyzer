interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Configuração: máximo de 15 requisições por minuto por IP
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_ENTRIES = 1000;

function cleanupExpiredEntries(now: number): void {
  if (rateLimitMap.size > MAX_ENTRIES) {
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Nova janela
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetInSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
    resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
  };
}
