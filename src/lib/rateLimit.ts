export interface RateLimitResult {
  readonly allowed: boolean;
  readonly resetInSeconds: number;
  readonly reason?: 'cooldown' | 'ip_burst';
}

const sessionCooldownMap = new Map<string, number>();
const ipBurstMap = new Map<string, number[]>();

// Cooldown de 60 segundos por sessão de aluno
const COOLDOWN_SECONDS = 60;
const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;

// Limite de segurança contra rajadas abusivas no mesmo IP (max 45 requisições por minuto por IP)
// Permite que 30 alunos na mesma rede submetam de forma independente, mas bloqueia scripts abusivos
const IP_BURST_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_IP_WINDOW = 45;
const MAX_MAP_ENTRIES = 2000;

function cleanupExpiredEntries(now: number): void {
  if (sessionCooldownMap.size > MAX_MAP_ENTRIES) {
    for (const [key, nextAllowedTime] of sessionCooldownMap.entries()) {
      if (now >= nextAllowedTime) {
        sessionCooldownMap.delete(key);
      }
    }
  }

  if (ipBurstMap.size > MAX_MAP_ENTRIES) {
    for (const [ip, timestamps] of ipBurstMap.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < IP_BURST_WINDOW_MS);
      if (validTimestamps.length === 0) {
        ipBurstMap.delete(ip);
      } else {
        ipBurstMap.set(ip, validTimestamps);
      }
    }
  }
}

/**
 * Valida o rate limit individual por sessão (evitando colisões de NAT em laboratórios)
 * e aplica proteção secundária contra rajadas globais no mesmo IP.
 */
export function checkRateLimit(ip: string, sessionId: string): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const sessionKey = `${ip}#${sessionId}`;

  // 1. Verifica cooldown individual do aluno (60 segundos após submissão)
  const nextAllowedTime = sessionCooldownMap.get(sessionKey);
  if (nextAllowedTime && now < nextAllowedTime) {
    const remainingSeconds = Math.ceil((nextAllowedTime - now) / 1000);
    return {
      allowed: false,
      resetInSeconds: remainingSeconds,
      reason: 'cooldown',
    };
  }

  // 2. Verifica rajadas anômalas no mesmo IP (anti-DDoS/anti-spam)
  const currentIpTimestamps = (ipBurstMap.get(ip) ?? []).filter(
    t => now - t < IP_BURST_WINDOW_MS
  );

  if (currentIpTimestamps.length >= MAX_REQUESTS_PER_IP_WINDOW) {
    const oldestTimestamp = currentIpTimestamps[0];
    const resetInSeconds = Math.ceil((IP_BURST_WINDOW_MS - (now - oldestTimestamp)) / 1000);
    return {
      allowed: false,
      resetInSeconds: Math.max(1, resetInSeconds),
      reason: 'ip_burst',
    };
  }

  // Registra a submissão para a sessão e para o IP
  sessionCooldownMap.set(sessionKey, now + COOLDOWN_MS);
  currentIpTimestamps.push(now);
  ipBurstMap.set(ip, currentIpTimestamps);

  return {
    allowed: true,
    resetInSeconds: 0,
  };
}
