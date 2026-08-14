import { createHash } from 'crypto';
import { AnalysisResult } from '@/types';

interface CacheEntry {
  result: AnalysisResult;
  timestamp: number;
}

// Cache em memória com TTL de 24 horas e limite de 500 entradas
const cacheMap = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const MAX_CACHE_ENTRIES = 500;

/**
 * Normaliza o código de forma canônica para que variações inofensivas de espaçamento
 * ou quebras de linha extras acertem o cache com 100% de precisão.
 */
export function getCanonicalCode(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    // Remove espaços no final das linhas
    .replace(/[ \t]+$/gm, '')
    // Normaliza múltiplas quebras de linha consecutivas para uma só
    .replace(/\n+/g, '\n')
    // Normaliza múltiplos espaços consecutivos que não sejam identação inicial
    .replace(/([^\n\s])[ \t]{2,}/g, '$1 ')
    .trim();
}

export function getCodeHash(code: string): string {
  const canonicalCode = getCanonicalCode(code);
  return createHash('sha256').update(canonicalCode).digest('hex');
}

export function getCachedAnalysis(hash: string): AnalysisResult | null {
  const entry = cacheMap.get(hash);
  if (!entry) return null;

  // Verifica se expirou
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cacheMap.delete(hash);
    return null;
  }

  return entry.result;
}

export function setCachedAnalysis(hash: string, result: AnalysisResult): void {
  // Limpeza de cache mais antigo se exceder o limite
  if (cacheMap.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cacheMap.keys().next().value;
    if (oldestKey) cacheMap.delete(oldestKey);
  }

  cacheMap.set(hash, {
    result,
    timestamp: Date.now(),
  });
}
