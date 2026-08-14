export interface AnalysisResult {
  pontuacao: number;
  problemas_encontrados: string[];
  dica_principal: string;
}

export type ApplicationState = 'idle' | 'loading' | 'retrying' | 'success' | 'error';

export type AppTheme = 'dark' | 'light';
