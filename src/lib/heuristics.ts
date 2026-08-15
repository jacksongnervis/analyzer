/**
 * Heurística abrangente para verificar se a entrada tem características reais de código Java
 * antes de despachar para a API da IA, economizando tempo e tokens.
 */

// Regexes pré-compiladas em nível de módulo para melhor performance e conformidade SonarQube
const KEY_SPAM_REGEX = /([a-z])\1{20,}/i;
const HTML_XML_REGEX = /^\s*<!DOCTYPE\s+html|^\s*<html[\s>]|<\/(?:div|p|body|script|head|section|table)>/i;
const JSON_OBJECT_REGEX = /^\s*\{[\s\n]*"[a-zA-Z0-9_$-]+"\s*:[\s\S]*\}\s*$/;
const JSON_ARRAY_REGEX = /^\s*\[[\s\n]*\{[\s\S]*\}\s*\]\s*$/;
const SQL_QUERY_REGEX = /^\s*(?:SELECT\s+[\s\S]+?\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i;
const PYTHON_REGEX = /^\s*(?:def\s+[a-zA-Z_]\w*\s*\(.*?\)\s*:|elif\s+|import\s+pandas|import\s+numpy|from\s+\w+\s+import)/m;
const PHP_REGEX = /<\?php|^\s*\$[a-zA-Z_]\w*\s*=/m;
const CSHARP_REGEX = /\busing\s+System(?:\.\w+)*\s*;|\bConsole\.(?:WriteLine|Write)\b|^\s*namespace\s+[A-Za-z0-9_.]+\s*\{/m;
const JS_TS_REGEX = /\b(?:const|let|var)\s+[a-zA-Z_]\w*\s*=\s*(?:\(.*?\)|[a-zA-Z_]\w*)\s*=>|\bconsole\.(?:log|warn|error|info)\s*\(|\bexport\s+default\s+|\bimport\s+React\b|\bdocument\.(?:getElementById|querySelector)\b/;
const MARKDOWN_HEADER_REGEX = /^#{1,6}\s+[^\n]+/m;

const JAVA_KEYWORDS_REGEX = /\b(?:public|private|protected|class|interface|enum|record|void|int|long|double|float|boolean|char|byte|short|String|Integer|Long|Double|Boolean|List|Map|Set|ArrayList|HashMap|HashSet|Optional|Stream|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|new|static|final|abstract|synchronized|volatile|transient|extends|implements|package|import|super|this|null|true|false|System\.out|System\.err|Override|Autowired|Service|Component|Repository|Controller|RestController|Entity|Table|Column|Id|Getter|Setter|Builder|Value|Data|Slf4j)\b/;
const JAVA_SYMBOLS_REGEX = /[{};]/;
const JAVA_METHOD_REGEX = /\w+\s*\([^)]*\)\s*(?:[{;]|\s*->)/;

/**
 * Detecção linear segura de repetição massiva de palavras (sem risco de ReDoS)
 */
function hasConsecutiveWordSpam(text: string): boolean {
  const words = text.split(/\s+/).filter(w => w.length >= 3);
  let count = 1;
  for (let i = 1; i < words.length; i++) {
    if (words[i].toLowerCase() === words[i - 1].toLowerCase()) {
      count++;
      if (count >= 7) return true;
    } else {
      count = 1;
    }
  }
  return false;
}

export function checkJavaHeuristics(code: string): { isValid: boolean; reason?: string } {
  const trimmed = code.trim();

  // 1. Detecção de Spam de Teclas / Repetição excessiva de letras (Gibberish)
  if (KEY_SPAM_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código contém repetição excessiva de caracteres consecutivos (spam de teclas).',
    };
  }

  // Detecção linear de repetição massiva de palavras idênticas
  if (hasConsecutiveWordSpam(trimmed)) {
    return {
      isValid: false,
      reason: 'O texto contém repetições anormais de palavras idênticas.',
    };
  }

  // 2. Detecção de código "Só com Comentários"
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
  if (HTML_XML_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser HTML / marcação web, não código Java.',
    };
  }

  if (JSON_OBJECT_REGEX.test(trimmed) || JSON_ARRAY_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido é um arquivo JSON, não código Java.',
    };
  }

  if (SQL_QUERY_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser uma query SQL, não código Java.',
    };
  }

  if (PYTHON_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser Python. Por favor, envie código Java.',
    };
  }

  if (PHP_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser PHP. Por favor, envie código Java.',
    };
  }

  if (CSHARP_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser C#. Por favor, envie código Java.',
    };
  }

  if (JS_TS_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser JavaScript/TypeScript. Por favor, envie código Java.',
    };
  }

  if (MARKDOWN_HEADER_REGEX.test(trimmed) && !JAVA_SYMBOLS_REGEX.test(trimmed)) {
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
  const hasJavaKeyword = JAVA_KEYWORDS_REGEX.test(trimmed);
  const hasBracesOrSemicolons = JAVA_SYMBOLS_REGEX.test(trimmed);
  const hasMethodCallOrDeclaration = JAVA_METHOD_REGEX.test(trimmed);

  if (!hasJavaKeyword && !hasBracesOrSemicolons && !hasMethodCallOrDeclaration) {
    return {
      isValid: false,
      reason: 'O texto não parece ser código Java válido (não foram encontradas declarações, tipos ou sintaxe Java reconhecíveis).',
    };
  }

  return { isValid: true };
}
