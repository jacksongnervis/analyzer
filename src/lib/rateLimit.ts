export interface RateLimitResult {
  readonly allowed: boolean;
  readonly resetInSeconds: number;
}

const cooldownMap = new Map<string, number>();

// Cooldown de 60 segundos após cada requisição por IP
const COOLDOWN_SECONDS = 60;
const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;
const MAX_ENTRIES = 1000;

function cleanupExpiredEntries(now: number): void {
  if (cooldownMap.size > MAX_ENTRIES) {
    for (const [ip, nextAllowedTime] of cooldownMap.entries()) {
      if (now >= nextAllowedTime) {
        cooldownMap.delete(ip);
      }
    }
  }
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const nextAllowedTime = cooldownMap.get(ip);

  if (nextAllowedTime && now < nextAllowedTime) {
    const remainingSeconds = Math.ceil((nextAllowedTime - now) / 1000);
    return {
      allowed: false,
      resetInSeconds: remainingSeconds,
    };
  }

  // Registra o próximo momento em que o IP poderá fazer uma nova requisição
  cooldownMap.set(ip, now + COOLDOWN_MS);

  return {
    allowed: true,
    resetInSeconds: 0,
  };
}
