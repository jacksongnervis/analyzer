'use client';

import { useEffect } from 'react';
import { AnalysisResult, AppTheme } from '../types';
import { AlertTriangle, CheckCircle2, Lightbulb, XCircle, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsDisplayProps {
  readonly result: AnalysisResult;
  readonly theme: AppTheme;
}

export function ResultsDisplay({ result, theme }: Readonly<ResultsDisplayProps>) {
  const isDark = theme === 'dark';

  const score = typeof result?.pontuacao === 'number' && !Number.isNaN(result.pontuacao)
    ? Math.max(0, Math.min(10, Math.round(result.pontuacao)))
    : 0;

  const problemas = Array.isArray(result?.problemas_encontrados)
    ? result.problemas_encontrados.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    : [];

  const dica = typeof result?.dica_principal === 'string' && result.dica_principal.trim().length > 0
    ? result.dica_principal.trim()
    : 'Continue praticando a refatoração e aplicando as boas práticas de Clean Code.';

  useEffect(() => {
    if (score >= 9) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#8be9fd', '#bd93f9', '#ff79c6', '#34d399'],
      });
    }
  }, [score]);

  const getScoreTextColor = () => {
    if (score >= 8) return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (score >= 5) return isDark ? 'text-sky-400' : 'text-sky-600';
    return isDark ? 'text-rose-400' : 'text-rose-600';
  };

  const getScoreBadge = () => {
    if (score >= 8) return { text: 'Código Limpo', icon: CheckCircle2 };
    if (score >= 5) return { text: 'Precisa de Melhorias', icon: AlertTriangle };
    return { text: 'Refatoração Urgente', icon: XCircle };
  };

  const badge = getScoreBadge();
  const BadgeIcon = badge.icon;
  const scoreColor = getScoreTextColor();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Score Header */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 card-brutal gap-4 transition-colors ${
          isDark ? 'bg-bnt-ink' : 'bg-white'
        }`}
      >
        <div>
          <h2 className={`font-display font-black text-2xl tracking-tight ${isDark ? 'text-bnt-cream' : 'text-bnt-ink'}`}>
            Nota de Clean Code
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-bnt-cream/50' : 'text-bnt-ink/50'}`}>
            Baseado na legibilidade, manutenibilidade e convenções Java
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto select-none">
          <BadgeIcon className={`w-7 h-7 ${scoreColor}`} />
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full border-2 ${
            isDark ? 'border-bnt-cream/30 bg-bnt-ink-deep' : 'border-bnt-ink bg-bnt-cream'
          }`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${scoreColor}`}>
              {badge.text}
            </span>
          </div>
          <div className="flex items-baseline">
            <span className={`font-display text-4xl sm:text-5xl font-black tracking-tight ${scoreColor}`}>
              {score}
            </span>
            <span className={`text-base font-bold ml-0.5 ${isDark ? 'text-bnt-cream/40' : 'text-bnt-ink/40'}`}>
              /10
            </span>
          </div>
        </div>
      </div>

      {/* Dica Principal */}
      <div
        className={`rounded-2xl p-6 border-2 transition-colors ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-500/40 text-bnt-cream'
            : 'bg-emerald-50 border-emerald-600/40 text-bnt-ink'
        }`}
      >
        <div>
          <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${
            isDark ? 'text-emerald-400' : 'text-emerald-800'
          }`}>
            <Lightbulb className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="font-display tracking-tight">Dica Principal do Instrutor</span>
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-bnt-cream/90' : 'text-bnt-ink/90'}`}>
            {dica}
          </p>
        </div>
      </div>

      {/* Bad Smells */}
      <div
        className={`rounded-2xl p-6 border-2 transition-colors ${
          isDark ? 'bg-bnt-ink border-bnt-cream/20' : 'bg-white border-bnt-ink'
        }`}
      >
        <h3 className={`font-display font-bold text-lg mb-4 flex items-center gap-2 ${
          isDark ? 'text-bnt-cream' : 'text-bnt-ink'
        }`}>
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Problemas Encontrados (Bad Smells)</span>
        </h3>

        {problemas.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Nenhum bad smell significativo encontrado. Excelente trabalho!
          </p>
        ) : (
          <ul className="space-y-3">
            {problemas.map((problema, index) => (
              <li
                key={`problem-${index}-${problema.slice(0, 20)}`}
                className={`flex gap-3 text-sm leading-relaxed ${
                  isDark ? 'text-bnt-cream/80' : 'text-bnt-ink/80'
                }`}
              >
                <span className={`mt-0.5 font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>•</span>
                <span>{problema}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Aviso de IA */}
      <p className={`text-center text-xs transition-colors py-1 flex items-center justify-center gap-1.5 select-none ${
        isDark ? 'text-bnt-cream/40' : 'text-bnt-ink/40'
      }`}>
        <Info className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span>O resultado é gerado por IA e pode cometer erros. Verifique informações importantes.</span>
      </p>
    </div>
  );
}
