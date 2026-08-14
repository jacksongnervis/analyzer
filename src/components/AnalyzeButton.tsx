import { Loader2, Sparkles } from 'lucide-react';
import { AppTheme } from '@/types';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  state: 'idle' | 'loading' | 'retrying' | 'success' | 'error';
  theme: AppTheme;
  retrySeconds?: number;
}

export function AnalyzeButton({ onClick, disabled, state, theme, retrySeconds }: AnalyzeButtonProps) {
  const isDark = theme === 'dark';
  const isBusy = state === 'loading' || state === 'retrying';

  const getButtonStyles = () => {
    if (disabled || isBusy) {
      return isDark 
        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed' 
        : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed';
    }

    return isDark
      ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/10 active:scale-[0.99] font-bold'
      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-[0.99] font-semibold';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isBusy}
      className={`
        w-full py-4 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 select-none
        ${getButtonStyles()}
      `}
    >
      {state === 'loading' && (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analisando código Java...</span>
        </>
      )}
      {state === 'retrying' && (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Muitas requisições! Tentando novamente em {retrySeconds}s...</span>
        </>
      )}
      {(state === 'idle' || state === 'success' || state === 'error') && (
        <>
          <Sparkles className="w-5 h-5" />
          <span>Analisar Clean Code</span>
        </>
      )}
    </button>
  );
}
