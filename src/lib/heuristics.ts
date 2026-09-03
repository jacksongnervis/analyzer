import { parse } from 'java-parser';
import type { CstNode } from 'java-parser';

const MIN_SPAM_WORD_LENGTH = 3;
const MIN_SPAM_WORD_COUNT = 7;

const NOT_JAVA_REASON = 'O código fornecido não parece ser válido. Envie um código Java válido.';
const ONLY_COMMENTS_REASON =
  'O código fornecido contém apenas comentários.';
const NO_SUBSTANCE_REASON =
  'O código enviado é sintaticamente válido, mas não tem nenhuma instrução para analisar (ex.: classe vazia, só um campo, import ou assinatura de método sem corpo). Envie um trecho com pelo menos uma linha de lógica.';
const ONLY_PRINTS_REASON =
  'O código enviado contém apenas impressões simples de texto e nenhuma regra de negócio ou lógica para ser avaliada.';
const TRIVIAL_EXERCISE_REASON =
  'O código enviado foi excessivamente reduzido e não implementa as regras de negócio do exercício.';

const KEY_SPAM_REGEX = /([a-z])\1{20,}/i;

export interface JavaHeuristicResult {
  readonly isValid: boolean;
  readonly reason?: string;
}

const VALID_RESULT: JavaHeuristicResult = { isValid: true };
const NOT_JAVA_RESULT: JavaHeuristicResult = { isValid: false, reason: NOT_JAVA_REASON };
const ONLY_COMMENTS_RESULT: JavaHeuristicResult = { isValid: false, reason: ONLY_COMMENTS_REASON };
const NO_SUBSTANCE_RESULT: JavaHeuristicResult = { isValid: false, reason: NO_SUBSTANCE_REASON };
const ONLY_PRINTS_RESULT: JavaHeuristicResult = { isValid: false, reason: ONLY_PRINTS_REASON };

const FRAGMENT_ENTRY_POINTS = ['compilationUnit', 'classBodyDeclaration'] as const;

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

function isTrivialPrintOnlyCode(code: string): boolean {
  const clean = stripComments(code);
  // Remove chamadas de System.out.print / println / printf
  const withoutPrints = clean.replace(/System\s*\.\s*out\s*\.\s*(?:println|print|printf)\s*\([^;]*\)\s*;/g, '').trim();

  // Remove estrutura básica de boilerplate (packages, imports, declaração de classe e main)
  const withoutBoilerplate = withoutPrints
    .replace(/package\s+[\w.]+\s*;/g, '')
    .replace(/import\s+[\w.*]+\s*;/g, '')
    .replace(/(?:public|protected|private|static|final|\s)*class\s+\w+(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{?/g, '')
    .replace(/(?:public|protected|private|static|final|\s)*void\s+main\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\s*\{?/g, '')
    .replace(/[\{\}\s]/g, '');

  return withoutBoilerplate.length === 0;
}

export function parseAsJava(trimmed: string): CstNode | null {
  for (const entryPoint of FRAGMENT_ENTRY_POINTS) {
    try {
      return parse(trimmed, entryPoint);
    } catch {
      // Tenta o próximo nível gramatical
    }
  }
  return null;
}

function hasChildren(element: unknown): element is { children: Record<string, unknown[]> } {
  return typeof element === 'object' && element !== null && 'children' in element;
}

function containsRuleNamed(element: unknown, ruleName: string): boolean {
  if (!hasChildren(element)) return false;
  if (ruleName in element.children) return true;
  return Object.values(element.children).some((childList) =>
    childList.some((child) => containsRuleNamed(child, ruleName)),
  );
}

export function countRuleOccurrences(element: unknown, ruleName: string): number {
  if (!hasChildren(element)) return 0;
  let count = 0;
  if (ruleName in element.children) {
    count += element.children[ruleName].length;
  }
  for (const childList of Object.values(element.children)) {
    for (const child of childList) {
      count += countRuleOccurrences(child, ruleName);
    }
  }
  return count;
}

export function countBlockStatements(cst: CstNode): number {
  return countRuleOccurrences(cst, 'blockStatement');
}

function hasExecutableStatement(cst: CstNode): boolean {
  return containsRuleNamed(cst, 'blockStatement');
}

export function checkExerciseSubstance(
  studentCode: string,
  initialExerciseCode: string
): JavaHeuristicResult {
  const trimmedStudent = studentCode.trim();
  const cstStudent = parseAsJava(trimmedStudent);
  if (!cstStudent) {
    return NOT_JAVA_RESULT;
  }

  const studentStatements = countBlockStatements(cstStudent);

  // Se o aluno tiver menos de 4 instruções executáveis
  if (studentStatements < 4) {
    return {
      isValid: false,
      reason: TRIVIAL_EXERCISE_REASON,
    };
  }

  // Verifica proporção de tamanho de código limpo (sem comentários nem espaços)
  const normStudent = stripComments(trimmedStudent).replace(/\s+/g, '');
  const normInitial = stripComments(initialExerciseCode.trim()).replace(/\s+/g, '');

  if (normInitial.length > 200 && normStudent.length < normInitial.length * 0.15) {
    return {
      isValid: false,
      reason: TRIVIAL_EXERCISE_REASON,
    };
  }

  return VALID_RESULT;
}

export function checkJavaHeuristics(code: string): JavaHeuristicResult {
  const trimmed = code.trim();

  const spamResult = detectSpam(trimmed);
  if (spamResult) return spamResult;

  if (stripComments(trimmed).length === 0) {
    return ONLY_COMMENTS_RESULT;
  }

  // 1ª Camada: Detecta se o código é composto exclusivamente por impressões triviais (ex: System.out.println)
  if (isTrivialPrintOnlyCode(trimmed)) {
    return ONLY_PRINTS_RESULT;
  }

  const cst = parseAsJava(trimmed);
  if (!cst) {
    return NOT_JAVA_RESULT;
  }

  if (!hasExecutableStatement(cst)) {
    return NO_SUBSTANCE_RESULT;
  }

  return VALID_RESULT;
}