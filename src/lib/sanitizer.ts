const ZERO_WIDTH_REGEX = /[\u200B-\u200F\uFEFF\u202A-\u202E\u00AD\u2060]/g;
const ASCII_CONTROL_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EXCESSIVE_NEWLINES_REGEX = /\n{3,}/g;

/**
 * Sanitiza o código-fonte removendo caracteres invisíveis, de controle e normalizando quebras excessivas.
 */
export function sanitizeCode(code: string): string {
  if (!code) return '';

  return code
    // Normalização Unicode
    .normalize('NFC')
    // Remove caracteres de largura zero, BOM e caracteres direcionais (usados em prompt injections)
    .replace(ZERO_WIDTH_REGEX, '')
    // Remove caracteres de controle ASCII perigosos (mantendo \t, \n, \r)
    .replace(ASCII_CONTROL_REGEX, '')
    // Remove espaços em branco no final de cada linha de forma segura e eficiente (O(n) sem ReDoS)
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    // Normaliza linhas em branco excessivas (3 ou mais linhas em branco viram 2, preservando comentários)
    .replace(EXCESSIVE_NEWLINES_REGEX, '\n\n')
    .trim();
}
