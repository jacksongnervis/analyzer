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

export function getCodeHash(code: string): string {
  return createHash('sha256').update(code).digest('hex');
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
