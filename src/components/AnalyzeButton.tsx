import { Loader2, Sparkles, Timer } from 'lucide-react';
import { AppTheme } from '@/types';

interface AnalyzeButtonProps {
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly state: 'idle' | 'loading' | 'retrying' | 'success' | 'error';
  readonly theme: AppTheme;
  readonly retrySeconds?: number;
  readonly cooldownSeconds?: number;
}

export function AnalyzeButton({
  onClick,
  disabled,
  state,
  theme,
  retrySeconds,
  cooldownSeconds = 0,
}: Readonly<AnalyzeButtonProps>) {
  const isDark = theme === 'dark';
  const isBusy = state === 'loading' || state === 'retrying';
  const isCoolingDown = cooldownSeconds > 0;
  const isDisabled = disabled || isBusy || isCoolingDown;

  const getButtonStyles = () => {
    if (isDisabled) {
      return isDark
        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
        : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed';
    }

    return isDark
      ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/10 active:scale-[0.99] font-bold cursor-pointer'
      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-[0.99] font-semibold cursor-pointer';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full py-4 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 select-none font-medium
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
      {!isBusy && isCoolingDown && (
        <>
          <Timer className="w-5 h-5 animate-pulse text-amber-500" />
          <span>Aguarde {cooldownSeconds}s para nova análise</span>
        </>
      )}
      {!isBusy && !isCoolingDown && (
        <>
          <Sparkles className="w-5 h-5" />
          <span>Analisar Clean Code</span>
        </>
      )}
    </button>
  );
}
