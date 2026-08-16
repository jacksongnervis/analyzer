export interface AnalysisResult {
  pontuacao: number;
  problemas_encontrados: string[];
  dica_principal: string;
}

export type ApplicationState = 'idle' | 'loading' | 'retrying' | 'success' | 'error';

export type AppTheme = 'dark' | 'light';

export type ExerciseDifficulty = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Desafio';

/**
 * Informações públicas do exercício enviadas ao navegador do aluno.
 */
export interface PublicExercise {
  id: string;
  title: string;
  category: string;
  difficulty: ExerciseDifficulty;
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
