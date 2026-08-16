/**
 * Heurística abrangente para verificar se a entrada tem características reais de código Java
 * antes de despachar para a API da IA, economizando tempo e tokens.
 *
 * Não expõe qual linguagem foi detectada — apenas que o conteúdo não é Java, já que só
 * aceitamos Java. Isso elimina a necessidade de uma mensagem por linguagem: os checks de
 * "outra linguagem" viram duas regexes combinadas (agrupadas por flag compatível) que
 * devolvem um booleano, e todos `true` mapeia para a mesma resposta (NOT_JAVA_RESULT,
 * reaproveitada como singleton).
 */

// ---------------------------------------------------------------------------
// Constantes de configuração — evita "magic numbers" (regra Sonar S109) nos
// pontos onde o número é de fato um literal numérico no código (não dentro de
// um regex, onde a regra não se aplica).
// ---------------------------------------------------------------------------
const MIN_SPAM_WORD_LENGTH = 3;
const MIN_SPAM_WORD_COUNT = 7;
const MIN_OPEN_BRACES_FOR_TRUNCATION_CHECK = 2;

const NOT_JAVA_REASON = 'O código fornecido não parece ser Java. Aceitamos apenas código Java.';

// ---------------------------------------------------------------------------
// Regexes pré-compiladas em nível de módulo para performance.
// Nenhuma delas usa grupos aninhados com quantificador ambíguo (ex.: (a+)+),
// que é o padrão que o hotspot de segurança S5852 (ReDoS) do SonarQube busca.
// ---------------------------------------------------------------------------
const KEY_SPAM_REGEX = /([a-z])\1{20,}/i;
const HTML_XML_REGEX = /^\s*<!DOCTYPE\s+html|^\s*<html[\s>]|<\/(?:div|p|body|script|head|section|table)>/i;
const JSON_OBJECT_REGEX = /^\s*\{[\s\n]*"[a-zA-Z0-9_$-]+"\s*:[\s\S]*\}\s*$/;
const JSON_ARRAY_REGEX = /^\s*\[[\s\n]*\{[\s\S]*\}\s*\]\s*$/;
const SQL_QUERY_REGEX = /^\s*(?:SELECT\s+[\s\S]+?\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i;
const PYTHON_REGEX = /^\s*(?:def\s+[a-zA-Z_]\w*\s*\(.*?\)\s*:|elif\s+|import\s+pandas|import\s+numpy|from\s+\w+\s+import)/m;
const PHP_REGEX = /<\?php|^\s*\$[a-zA-Z_]\w*\s*=/m;
// `[\w.]*` no lugar do antigo `(?:\.\w+)*` — mesmo alcance prático ("using System;",
// "using System.Collections.Generic;"), mas sem grupo aninhado repetido, o que evita
// o hotspot de regex do SonarQube (S5852) mesmo sendo o padrão original inofensivo.
const CSHARP_REGEX = /\busing\s+System[\w.]*\s*;|\bConsole\.(?:WriteLine|Write)\b|^\s*namespace\s+[A-Za-z0-9_.]+\s*\{/m;
const JS_TS_REGEX = /\b(?:const|let|var)\s+[a-zA-Z_]\w*\s*=\s*(?:\(.*?\)|[a-zA-Z_]\w*)\s*=>|\bconsole\.(?:log|warn|error|info)\s*\(|\bexport\s+default\s+|\bimport\s+React\b|\bdocument\.(?:getElementById|querySelector)\b/;
const MARKDOWN_HEADER_REGEX = /^#{1,6}\s+[^\n]+/m;

const JAVA_KEYWORDS_REGEX = /\b(?:public|private|protected|class|interface|enum|record|void|int|long|double|float|boolean|char|byte|short|String|Integer|Long|Double|Boolean|List|Map|Set|ArrayList|HashMap|HashSet|Optional|Stream|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|new|static|final|abstract|synchronized|volatile|transient|extends|implements|package|import|super|this|null|true|false|System\.out|System\.err|Override|Autowired|Service|Component|Repository|Controller|RestController|Entity|Table|Column|Id|Getter|Setter|Builder|Value|Data|Slf4j)\b/;
const JAVA_SYMBOLS_REGEX = /[{};]/;
const JAVA_METHOD_REGEX = /\w+\s*\([^)]*\)\s*(?:[{;]|\s*->)/;

// ---------------------------------------------------------------------------
// Detectores de "não é Java", combinados em regexes únicas por grupo de flag
// compatível — em vez de rodar 8 `.test()` separados, rodamos no máximo 2.
//
// `mergeAlternatives` junta o `.source` de várias regexes já existentes numa
// única regex com alternância (`(?:A)|(?:B)|(?:C)`). O agrupamento `(?:...)`
// em volta de cada uma preserva o comportamento original de cada regex
// (inclusive suas próprias âncoras `^`/`$` internas), então isso NÃO é
// reescrever a lógica à mão — é composição, gerada a partir das regexes que já
// existem acima. Se `PYTHON_REGEX` mudar amanhã, a regex combinada acompanha
// automaticamente, sem risco de ficar desatualizada.
//
// Só é seguro juntar regexes que compartilham exatamente as mesmas flags. Por
// isso são dois grupos, não um só:
// ---------------------------------------------------------------------------
function mergeAlternatives(regexes: readonly RegExp[], flags: string): RegExp {
  return new RegExp(regexes.map((r) => `(?:${r.source})`).join('|'), flags);
}

// Grupo 1 — flag `i`, SEM `m`. HTML, JSON e SQL ancoram ao início/fim do texto
// inteiro (não de cada linha) de propósito, para não confundir com Java que
// contenha um bloco de string multilinha com SQL/JSON dentro.
const NON_JAVA_WHOLE_STRING_REGEX = mergeAlternatives(
  [HTML_XML_REGEX, JSON_OBJECT_REGEX, JSON_ARRAY_REGEX, SQL_QUERY_REGEX],
  'i',
);

// Grupo 2 — flag `m`, SEM `i`. Os marcadores de Python/PHP/C#/JS-TS podem
// aparecer em qualquer linha do trecho colado, não só na primeira.
const NON_JAVA_PER_LINE_REGEX = mergeAlternatives(
  [PYTHON_REGEX, PHP_REGEX, CSHARP_REGEX, JS_TS_REGEX],
  'm',
);

function looksLikeNonJavaLanguage(trimmed: string): boolean {
  // O check de Markdown fica de fora dos grupos acima porque é uma condição
  // "E NÃO" (tem cabeçalho E NÃO tem chaves/ponto-e-vírgula), não um "OU"
  // simples. Forçar isso dentro de uma única regex normalmente exige um
  // lookahead negativo repetido (`(?:(?!X)[\s\S])*`) — que é justamente o
  // padrão clássico de ReDoS que evitamos no restante do arquivo. Não vale a
  // troca de 1 `.test()` a menos por reintroduzir esse risco.
  return (
    NON_JAVA_WHOLE_STRING_REGEX.test(trimmed) ||
    NON_JAVA_PER_LINE_REGEX.test(trimmed) ||
    (MARKDOWN_HEADER_REGEX.test(trimmed) && !JAVA_SYMBOLS_REGEX.test(trimmed))
  );
}

export interface JavaHeuristicResult {
  isValid: boolean;
  reason?: string;
}

const VALID_RESULT: JavaHeuristicResult = { isValid: true };
const NOT_JAVA_RESULT: JavaHeuristicResult = { isValid: false, reason: NOT_JAVA_REASON };

/**
 * Detecção linear segura de repetição massiva de palavras (sem risco de ReDoS).
 */
function hasConsecutiveWordSpam(text: string): boolean {
  const words = text.split(/\s+/).filter((w) => w.length >= MIN_SPAM_WORD_LENGTH);
  let count = 1;
  for (let i = 1; i < words.length; i++) {
    if (words[i].toLowerCase() === words[i - 1].toLowerCase()) {
      count++;
      if (count >= MIN_SPAM_WORD_COUNT) return true;
    } else {
      count = 1;
    }
  }
  return false;
}

function detectSpam(trimmed: string): JavaHeuristicResult | null {
  if (KEY_SPAM_REGEX.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código contém repetição excessiva de caracteres consecutivos (spam de teclas).',
    };
  }
  if (hasConsecutiveWordSpam(trimmed)) {
    return {
      isValid: false,
      reason: 'O texto contém repetições anormais de palavras idênticas.',
    };
  }
  return null;
}

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .trim();
}

function detectTruncatedBraces(codeWithoutComments: string): JavaHeuristicResult | null {
  const openBraces = (codeWithoutComments.match(/\{/g) || []).length;
  const closeBraces = (codeWithoutComments.match(/\}/g) || []).length;

  if (openBraces >= MIN_OPEN_BRACES_FOR_TRUNCATION_CHECK && closeBraces === 0) {
    return {
      isValid: false,
      reason: 'O código Java parece incompleto ou truncado (há blocos abertos com "{" sem o respectivo fechamento com "}").',
    };
  }
  return null;
}

function hasJavaSyntax(trimmed: string): boolean {
  return (
    JAVA_KEYWORDS_REGEX.test(trimmed) ||
    JAVA_SYMBOLS_REGEX.test(trimmed) ||
    JAVA_METHOD_REGEX.test(trimmed)
  );
}

export function checkJavaHeuristics(code: string): JavaHeuristicResult {
  const trimmed = code.trim();

  const spamResult = detectSpam(trimmed);
  if (spamResult) return spamResult;

  const codeWithoutComments = stripComments(trimmed);
  if (codeWithoutComments.length === 0) {
    return {
      isValid: false,
      reason: 'O código fornecido contém apenas comentários. Envie ao menos uma declaração, método ou classe Java.',
    };
  }

  if (looksLikeNonJavaLanguage(trimmed)) {
    return NOT_JAVA_RESULT;
  }

  const truncatedResult = detectTruncatedBraces(codeWithoutComments);
  if (truncatedResult) return truncatedResult;

  if (!hasJavaSyntax(trimmed)) {
    return {
      isValid: false,
      reason: 'O texto não parece ser código Java válido (não foram encontradas declarações, tipos ou sintaxe Java reconhecíveis).',
    };
  }

  return VALID_RESULT;
}