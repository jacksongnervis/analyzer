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
        ? 'bg-bnt-ink border-bnt-cream/20 text-bnt-cream/40 cursor-not-allowed border-dashed'
        : 'bg-bnt-cream border-bnt-ink/20 text-bnt-ink/40 cursor-not-allowed border-dashed';
    }

    return isDark
      ? 'bg-emerald-500 border-bnt-cream text-slate-950 shadow-[5px_5px_0_0_#faf8f4] hover:shadow-[8px_8px_0_0_#faf8f4] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[5px_5px_0_0_#faf8f4]'
      : 'bg-emerald-500 border-bnt-ink text-slate-950 shadow-[5px_5px_0_0_#0f172a] hover:shadow-[8px_8px_0_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[5px_5px_0_0_#0f172a]';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full py-4 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 select-none font-display font-black uppercase tracking-wide border-2
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
          <Timer className="w-5 h-5 animate-pulse text-emerald-400" />
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
