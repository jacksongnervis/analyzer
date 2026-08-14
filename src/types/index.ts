export interface AnalysisResult {
  pontuacao: number;
  problemas_encontrados: string[];
  dica_principal: string;
}

export type ApplicationState = 'idle' | 'loading' | 'retrying' | 'success' | 'error';

export type AppTheme = 'dark' | 'light';

/**
 * Informações públicas do exercício enviadas ao navegador do aluno.
 * NÃO contém a solução corrigida (expectedCleanCode) para evitar vazamento via F12.
 */
export interface PublicExercise {
  id: string;
  title: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  description: string;
  objectives: string[];
  initialCode: string;
}

export type Exercise = PublicExercise;

/**
 * Estrutura completa do exercício mantida com exclusividade no servidor.
 */
export interface ServerExercise extends PublicExercise {
  expectedCleanCode: string;
}
