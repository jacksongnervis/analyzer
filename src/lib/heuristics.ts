/**
 * Heurística para verificar se a entrada tem características de código Java
 * antes de despachar para a API da IA, economizando tempo e tokens.
 */
export function checkJavaHeuristics(code: string): { isValid: boolean; reason?: string } {
  const trimmed = code.trim();

  // 1. Rejeita HTML ou tags XML óbvias
  if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /^\s*<html[\s>]/i.test(trimmed) || /<\/(div|p|body|script|head)>/i.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser HTML ou marcação web, não código Java.',
    };
  }

  // 2. Rejeita scripts óbvios de Python / PHP / Ruby / Shell
  if (/^\s*def\s+[a-zA-Z_]\w*\s*\(.*?\)\s*:/m.test(trimmed) || /^\s*elif\s+/m.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser Python. Por favor, envie código Java.',
    };
  }

  if (/<\?php/i.test(trimmed)) {
    return {
      isValid: false,
      reason: 'O código fornecido parece ser PHP. Por favor, envie código Java.',
    };
  }

  // 3. Verifica se contém ao menos alguns elementos ou palavras-chave típicos de Java
  // (palavras-chave, estruturas de controle, anotações, tipagem ou sintaxe Java)
  const javaKeywordsRegex = /\b(public|private|protected|class|interface|enum|record|void|int|long|double|float|boolean|char|byte|short|String|Integer|Long|Double|Boolean|List|Map|Set|ArrayList|HashMap|HashSet|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|new|static|final|abstract|synchronized|volatile|transient|extends|implements|package|import|super|this|null|true|false|System\.out|System\.err|Override|Autowired|Service|Component|Repository|Controller|RestController|Entity|Table|Column|Id|Getter|Setter|Builder|Value|Data)\b/;

  const hasJavaKeyword = javaKeywordsRegex.test(trimmed);
  const hasBracesOrSemicolons = /[{};]/.test(trimmed);
  const hasMethodCallOrDeclaration = /\w+\s*\([^)]*\)\s*([{;]|\s*->)/.test(trimmed);

  // Se não tiver nenhuma palavra-chave e nenhuma pontuação de código, provavelmente é texto solto
  if (!hasJavaKeyword && !hasBracesOrSemicolons && !hasMethodCallOrDeclaration) {
    return {
      isValid: false,
      reason: 'O texto não parece ser código Java válido (não foram encontradas declarações, tipos ou sintaxe Java).',
    };
  }

  return { isValid: true };
}
