/**
 * Utilitário de comparação de similaridade de código para evitar requisições
 * redundantes ou envios de código inicial sem refatoração.
 */

const SIMILARITY_THRESHOLD = 0.95;

/**
 * Normaliza o código removendo comentários e todos os espaços em branco para comparação pura.
 */
export function normalizeCodeForComparison(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/\s+/g, '');
}

/**
 * Calcula a similaridade entre dois trechos de código (de 0 a 1) usando o coeficiente de Sørensen-Dice sobre bigramas.
 */
export function calculateCodeSimilarity(codeA: string, codeB: string): number {
  const normA = normalizeCodeForComparison(codeA);
  const normB = normalizeCodeForComparison(codeB);

  if (normA === normB) return 1.0;
  if (normA.length < 2 || normB.length < 2) return 0.0;

  const bigramsA = new Map<string, number>();
  for (let i = 0; i < normA.length - 1; i++) {
    const bigram = normA.slice(i, i + 2);
    bigramsA.set(bigram, (bigramsA.get(bigram) ?? 0) + 1);
  }

  let intersectionCount = 0;
  for (let i = 0; i < normB.length - 1; i++) {
    const bigram = normB.slice(i, i + 2);
    const count = bigramsA.get(bigram) ?? 0;
    if (count > 0) {
      bigramsA.set(bigram, count - 1);
      intersectionCount++;
    }
  }

  const totalBigrams = normA.length - 1 + normB.length - 1;
  return (2.0 * intersectionCount) / totalBigrams;
}

/**
 * Verifica se o código do aluno é excessivamente similar ao código inicial do exercício (sem refatoração).
 */
export function isTooSimilarToInitialCode(
  studentCode: string,
  initialExerciseCode: string,
  threshold: number = SIMILARITY_THRESHOLD
): boolean {
  const similarity = calculateCodeSimilarity(studentCode, initialExerciseCode);
  return similarity >= threshold;
}
