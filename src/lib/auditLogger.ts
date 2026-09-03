export type SubmissionStatus =
  | 'SUCCESS'
  | 'CACHE_HIT'
  | 'RATE_LIMIT'
  | 'HEURISTIC_REJECT'
  | 'SIMILARITY_REJECT'
  | 'INVALID_PAYLOAD'
  | 'AI_ERROR';

export interface AuditLogEntry {
  timestamp: string;
  ip: string;
  sessionId: string;
  exerciseId: string;
  status: SubmissionStatus;
  codeHash?: string;
  codeLength?: number;
  pontuacao?: number | null;
  durationMs: number;
  error?: string | null;
}

const statusEmoji: Record<SubmissionStatus, string> = {
  SUCCESS: '✅',
  CACHE_HIT: '⚡',
  RATE_LIMIT: '⏳',
  HEURISTIC_REJECT: '🛑',
  SIMILARITY_REJECT: '🔄',
  INVALID_PAYLOAD: '❌',
  AI_ERROR: '💥',
};

/**
 * Exibe a submissão de forma concisa no console sem criar arquivos no disco.
 * Mantém o console limpo e informativo para acompanhamento pelo instrutor.
 */
export function logSubmission(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const time = new Date().toISOString().slice(11, 19);
  const emoji = statusEmoji[entry.status] || '📝';
  const scoreStr =
    entry.pontuacao !== undefined && entry.pontuacao !== null
      ? `| Nota: ${entry.pontuacao}/10 `
      : '';
  const errorSuffix = entry.error ? ` | Erro: ${entry.error}` : '';

  console.info(
    `[AUDIT ${time}] ${emoji} [${entry.status}] ` +
      `Sessão: ${entry.sessionId.slice(0, 8)} | ` +
      `Ex: ${entry.exerciseId} ${scoreStr}(${entry.durationMs}ms)${errorSuffix}`
  );
}
