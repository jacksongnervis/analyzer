/**
 * Heurística abrangente para verificar se a entrada tem características reais de código Java
 * antes de despachar para a API da IA, economizando tempo e tokens.
 */
export function checkJavaHeuristics(code: string): { isValid: boolean; reason?: string } {
  const trimmed = code.trim();

  // 1. Detecção de Spam de Teclas / Repetição excessiva de letras (Gibberish)
  // Ex: "aaaaaaaaaaaaaaaaaaaaa" (ignora espaços, quebras de linha e símbolos de código como '=', '-', '*')
  if (/([a-zA-Z])\1{20,}/.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código contém repetição excessiva de caracteres consecutivos (spam de teclas).',
    };
  }

  // Detecção de repetição massiva de palavras idênticas em loop (ex: "teste teste teste teste teste teste")
  if (/\b([a-zA-Z_]\w{2,})\b(?:\s+\1\b){6,}/.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O texto contém repetições anormais de palavras idênticas.',
    };
  }

  // 2. Detecção de código "Só com Comentários"
  // Remove comentários de linha única (//...) e de bloco (/*...*/)
  const codeWithoutComments = trimmed
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .trim();

  if (codeWithoutComments.length === 0) {
    return {
      isValid: false,
      reason: 'O código fornecido contém apenas comentários. Envie ao menos uma declaração, método ou classe Java.',
    };
  }

  // 3. Filtros Específicos para Outras Linguagens e Formatos de Arquivo

  // HTML / XML
  if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /^\s*<html[\s>]/i.test(trimmed) || /<\/(div|p|body|script|head|section|table)>/i.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser HTML / marcação web, não código Java.',
    };
  }

  // JSON Puro (ex: { "key": "value" })
  if (/^\s*\{[\s\n]*"[a-zA-Z0-9_$-]+"\s*:[\s\S]*\}\s*$/.test(trimmed) || /^\s*\[[\s\n]*\{[\s\S]*\}\s*\]\s*$/.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido é um arquivo JSON, não código Java.',
    };
  }

  // SQL Queries (ex: SELECT ... FROM ..., INSERT INTO ..., CREATE TABLE ...)
  if (/^\s*(SELECT\s+[\s\S]+?\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser uma query SQL, não código Java.',
    };
  }

  // Python (ex: def funcao():, elif, print("..."), import pandas)
  if (/^\s*(def\s+[a-zA-Z_]\w*\s*\(.*?\)\s*:|elif\s+|import\s+pandas|import\s+numpy|from\s+\w+\s+import)/m.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser Python. Por favor, envie código Java.',
    };
  }

  // PHP (ex: <?php, $variavel)
  if (/<\?php/i.test(trimmed) || /^\s*\$[a-zA-Z_]\w*\s*=/m.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser PHP. Por favor, envie código Java.',
    };
  }

  // C# (ex: using System;, Console.WriteLine, namespace MeuNamespace)
  if (/\busing\s+System(\.\w+)*\s*;/i.test(trimmed) || /\bConsole\.(WriteLine|Write)\b/.test(trimmed) || /^\s*namespace\s+[A-Za-z0-9_.]+\s*\{/m.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser C#. Por favor, envie código Java.',
    };
  }

  // JavaScript / TypeScript (ex: const x = () =>, console.log, export default, import React)
  if (
    /\b(const|let|var)\s+[a-zA-Z_]\w*\s*=\s*(\(.*?\)|[a-zA-Z_]\w*)\s*=>/.test(trimmed) ||
    /\bconsole\.(log|warn|error|info)\s*\(/.test(trimmed) ||
    /\bexport\s+default\s+/.test(trimmed) ||
    /\bimport\s+React\b/.test(trimmed) ||
    /\bdocument\.(getElementById|querySelector)\b/.test(trimmed)
  ) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser JavaScript/TypeScript. Por favor, envie código Java.',
    };
  }

  // Markdown ou Texto Livre com cabeçalhos markdown
  if (/^#{1,6}\s+[^\n]+/m.test(trimmed) && !/[;{}]/.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O texto fornecido parece ser um documento Markdown ou texto formatado, não código Java.',
    };
  }

  // 4. Balanço de Chaves ({ }) - Alerta para código severamente desbalanceado
  const openBraces = (codeWithoutComments.match(/\{/g) || []).length;
  const closeBraces = (codeWithoutComments.match(/\}/g) || []).length;

  if (openBraces > 0 && closeBraces === 0 && openBraces >= 2) {
    return {
      isValid: false,
      reason: 'O código Java parece incompleto ou truncado (há blocos abertos com "{" sem o respectivo fechamento com "}").',
    };
  }

  // 5. Verificação de Palavras-Chave e Sintaxe Java
  const javaKeywordsRegex = /\b(public|private|protected|class|interface|enum|record|void|int|long|double|float|boolean|char|byte|short|String|Integer|Long|Double|Boolean|List|Map|Set|ArrayList|HashMap|HashSet|Optional|Stream|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|new|static|final|abstract|synchronized|volatile|transient|extends|implements|package|import|super|this|null|true|false|System\.out|System\.err|Override|Autowired|Service|Component|Repository|Controller|RestController|Entity|Table|Column|Id|Getter|Setter|Builder|Value|Data|Slf4j)\b/;

  const hasJavaKeyword = javaKeywordsRegex.test(trimmed);
  const hasBracesOrSemicolons = /[{};]/.test(trimmed);
  const hasMethodCallOrDeclaration = /\w+\s*\([^)]*\)\s*([{;]|\s*->)/.test(trimmed);

  if (!hasJavaKeyword && !hasBracesOrSemicolons && !hasMethodCallOrDeclaration) {
    return {
      isValid: false,
      reason: 'O texto não parece ser código Java válido (não foram encontradas declarações, tipos ou sintaxe Java reconhecíveis).',
    };
  }

  return { isValid: true };
}
