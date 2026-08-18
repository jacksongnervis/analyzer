import fs from 'node:fs';
import path from 'node:path';

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

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'submissions.jsonl');

/**
 * Registra a submissão de código de forma estruturada e append-only em arquivo,
 * garantindo persistência para auditoria, contestações e acompanhamento das notas da oficina.
 */
export function logSubmission(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const fullEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const logLine = JSON.stringify(fullEntry) + '\n';

  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logLine, 'utf-8');
  } catch (fsErr) {
    console.error('[AuditLogger] Erro ao gravar log de auditoria no disco:', fsErr);
  }

  // Log conciso e legível no console para acompanhamento ao vivo pelo instrutor
  const statusEmoji: Record<SubmissionStatus, string> = {
    SUCCESS: '✅',
    CACHE_HIT: '⚡',
    RATE_LIMIT: '⏳',
    HEURISTIC_REJECT: '🛑',
    SIMILARITY_REJECT: '🔄',
    INVALID_PAYLOAD: '❌',
    AI_ERROR: '💥',
  };

  const emoji = statusEmoji[fullEntry.status] || '📝';
  const scoreStr = fullEntry.pontuacao !== undefined && fullEntry.pontuacao !== null
    ? `| Nota: ${fullEntry.pontuacao}/10 `
    : '';

  console.info(
    `[AUDIT ${fullEntry.timestamp.slice(11, 19)}] ${emoji} [${fullEntry.status}] ` +
    `IP: ${fullEntry.ip} | Sessão: ${fullEntry.sessionId.slice(0, 8)} | ` +
    `Ex: ${fullEntry.exerciseId} ${scoreStr}(${fullEntry.durationMs}ms)`
  );
}
