'use client';

import { useEffect } from 'react';
import { AnalysisResult, AppTheme } from '../types';
import { AlertTriangle, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsDisplayProps {
  result: AnalysisResult;
  theme: AppTheme;
}

export function ResultsDisplay({ result, theme }: ResultsDisplayProps) {
  const isDark = theme === 'dark';
  const score = result.pontuacao;

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

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-500';
    if (score >= 5) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
    if (score >= 5) return <AlertTriangle className="w-8 h-8 text-amber-500" />;
    return <XCircle className="w-8 h-8 text-rose-500" />;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Score Section */}
      <div
        className={`rounded-2xl p-6 flex items-center justify-between border transition-colors ${
          isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-slate-200 shadow-md shadow-slate-200/50'
        }`}
      >
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            Nota de Clean Code
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Baseado na legibilidade, manutenibilidade e convenções Java
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getScoreIcon(result.pontuacao)}
          <span className={`text-4xl font-extrabold ${getScoreColor(result.pontuacao)}`}>
            {result.pontuacao}
            <span className={`text-xl font-medium ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>/10</span>
          </span>
        </div>
      </div>

      {/* Main Tip */}
      <div
        className={`rounded-2xl p-6 flex gap-4 border transition-colors ${
          isDark
            ? 'bg-emerald-950/30 border-emerald-900/50'
            : 'bg-emerald-50 border-emerald-200 shadow-sm'
        }`}
      >
        <Lightbulb className="w-6 h-6 shrink-0 text-emerald-400" />
        <div>
          <h3 className={`font-bold mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-900'}`}>
            Dica Principal
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-emerald-100/90' : 'text-emerald-950'}`}>
            {result.dica_principal}
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

        {result.problemas_encontrados.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Nenhum bad smell significativo encontrado. Excelente trabalho!
          </p>
        ) : (
          <ul className="space-y-3">
            {result.problemas_encontrados.map((problema, index) => (
              <li
                key={index}
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
    </div>
  );
}
