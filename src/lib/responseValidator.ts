import { AnalysisResult } from '@/types';

/**
 * Valida e sanitiza estritamente a resposta gerada pela IA, garantindo conformidade
 * absoluta com a interface AnalysisResult e prevenindo comportamentos anômalos ou crashes no Frontend.
 */
export function validateAndSanitizeAnalysisResult(data: unknown): AnalysisResult {
  if (typeof data !== 'object' || data === null) {
    return {
      pontuacao: 0,
      problemas_encontrados: ['Não foi possível interpretar a avaliação gerada pela IA.'],
      dica_principal: 'Por favor, revise seu código e tente submeter novamente.',
    };
  }

  const raw = data as Record<string, unknown>;

  // 1. Validação estrita da pontuação (número inteiro entre 0 e 10)
  let pontuacao = 0;
  if (typeof raw.pontuacao === 'number' && !Number.isNaN(raw.pontuacao)) {
    pontuacao = raw.pontuacao;
  } else if (typeof raw.pontuacao === 'string') {
    const parsed = parseFloat(raw.pontuacao);
    if (!Number.isNaN(parsed)) {
      pontuacao = parsed;
    }
  } else if (typeof raw.score === 'number' && !Number.isNaN(raw.score)) {
    pontuacao = raw.score;
  }
  
  // Limita estritamente ao intervalo de 0 a 10
  pontuacao = Math.max(0, Math.min(10, Math.round(pontuacao)));

  // 2. Validação estrita da lista de problemas encontrados (array de strings não vazias)
  let problemas_encontrados: string[] = [];

  // Se a pontuação for 10 (código limpo perfeito), garante que a lista de bad smells seja rigorosamente vazia
  if (pontuacao < 10) {
    if (Array.isArray(raw.problemas_encontrados)) {
      problemas_encontrados = raw.problemas_encontrados
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
        .map(p => p.trim());
    } else if (Array.isArray(raw.problemas)) {
      problemas_encontrados = raw.problemas
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
        .map(p => p.trim());
    } else if (typeof raw.problemas_encontrados === 'string' && raw.problemas_encontrados.trim().length > 0) {
      problemas_encontrados = [raw.problemas_encontrados.trim()];
    }
  }

  // 3. Validação estrita da dica principal
  let dica_principal = '';
  if (typeof raw.dica_principal === 'string' && raw.dica_principal.trim().length > 0) {
    dica_principal = raw.dica_principal.trim();
  } else if (typeof raw.dica === 'string' && raw.dica.trim().length > 0) {
    dica_principal = raw.dica.trim();
  } else {
    dica_principal = pontuacao >= 9
      ? 'Excelente trabalho! Seu código está muito bem estruturado e segue as boas práticas de Clean Code.'
      : 'Continue praticando a refatoração, focando em nomes significativos e métodos com responsabilidade única.';
  }

  return {
    pontuacao,
    problemas_encontrados,
    dica_principal,
  };
}
