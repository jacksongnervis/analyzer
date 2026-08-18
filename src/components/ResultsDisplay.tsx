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

  // Validação defensiva local para garantir que nunca ocorram exceções na UI
  const score = typeof result?.pontuacao === 'number' && !Number.isNaN(result.pontuacao)
    ? Math.max(0, Math.min(10, Math.round(result.pontuacao)))
    : 0;

  const problemas = Array.isArray(result?.problemas_encontrados)
    ? result.problemas_encontrados.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    : [];

  const dica = typeof result?.dica_principal === 'string' && result.dica_principal.trim().length > 0
    ? result.dica_principal.trim()
    : 'Continue praticando a refatoração e aplicando os pilares de Clean Code.';

  // Dispara chuva de confetes quando a nota for 9 ou 10
  useEffect(() => {
    if (score >= 9) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
    }
  }, [score]);

  const getScoreTextColor = () => {
    if (score >= 8) return 'text-emerald-500';
    if (score >= 5) return 'text-amber-500';
    return 'text-rose-500';
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
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border gap-4 transition-colors ${
          isDark 
            ? 'bg-zinc-900 border-zinc-800 shadow-xl shadow-black/40' 
            : 'bg-white border-slate-200 shadow-xl shadow-slate-200/60'
        }`}
      >
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            Nota de Clean Code
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Baseado na legibilidade, manutenibilidade e convenções Java
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto select-none">
          <BadgeIcon className={`w-7 h-7 ${scoreColor}`} />
          <div className="flex items-baseline">
            <span className={`text-3xl font-black tracking-tight ${scoreColor}`}>
              {score}
            </span>
            <span className={`text-base font-semibold ml-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              /10
            </span>
          </div>
        </div>
      </div>

      {/* Dica Principal */}
      <div 
        className={`rounded-2xl p-6 border transition-colors ${
          isDark 
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
            : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
        }`}
      >
        <div>
          <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
            <Lightbulb className="w-5 h-5 shrink-0" />
            <span>Dica Principal do Instrutor</span>
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-emerald-100/90' : 'text-emerald-950'}`}>
            {dica}
          </p>
        </div>
      </div>

      {/* Bad Smells */}
      <div
        className={`rounded-2xl p-6 border transition-colors ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-slate-200 shadow-md shadow-slate-200/50'
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Problemas Encontrados (Bad Smells)</span>
        </h3>

        {problemas.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Nenhum bad smell significativo encontrado. Excelente trabalho!
          </p>
        ) : (
          <ul className="space-y-3">
            {problemas.map((problema, index) => (
              <li
                key={`problem-${index}-${problema.slice(0, 20)}`}
                className={`flex gap-3 text-sm leading-relaxed ${
                  isDark ? 'text-zinc-300' : 'text-slate-700'
                }`}
              >
                <span className="mt-0.5 font-bold text-amber-500">•</span>
                <span>{problema}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Aviso de IA com ícone de Informação */}
      <p className={`text-center text-xs transition-colors py-1 flex items-center justify-center gap-1.5 select-none ${
        isDark ? 'text-zinc-500' : 'text-slate-400'
      }`}>
        <Info className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span>O resultado é gerado por IA e pode cometer erros. Verifique informações importantes.</span>
      </p>
    </div>
  );
}
