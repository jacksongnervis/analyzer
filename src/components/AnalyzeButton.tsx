import { Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  state: 'idle' | 'loading' | 'retrying' | 'success' | 'error';
  retrySeconds?: number;
}

export function AnalyzeButton({ onClick, disabled, state, retrySeconds }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2
        ${
          state === 'loading' || state === 'retrying'
            ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
            : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-[0.98]'
        }
      `}
    >
      {state === 'loading' && (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Analisando o código...
        </>
      )}
      {state === 'retrying' && (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Muitas requisições! Colocando você na fila... Tentando novamente em {retrySeconds} segundos
        </>
      )}
      {(state === 'idle' || state === 'success' || state === 'error') && (
        'Analisar Código'
      )}
    </button>
  );
}
