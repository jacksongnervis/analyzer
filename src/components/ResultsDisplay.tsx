import { AnalysisResult } from '../types';
import { AlertTriangle, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score > 7) return 'text-emerald-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score > 7) return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
    if (score >= 5) return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    return <XCircle className="w-8 h-8 text-red-500" />;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Score Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Nota de Clean Code</h2>
          <p className="text-sm text-zinc-400 mt-1">Baseado na legibilidade e manutenibilidade</p>
        </div>
        <div className="flex items-center gap-3">
          {getScoreIcon(result.pontuacao)}
          <span className={`text-4xl font-bold ${getScoreColor(result.pontuacao)}`}>
            {result.pontuacao}
            <span className="text-xl text-zinc-500">/10</span>
          </span>
        </div>
      </div>

      {/* Main Tip */}
      <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-6 flex gap-4">
        <Lightbulb className="w-6 h-6 text-emerald-400 shrink-0" />
        <div>
          <h3 className="font-semibold text-emerald-400 mb-1">Dica Principal</h3>
          <p className="text-emerald-100/90 text-sm leading-relaxed">{result.dica_principal}</p>
        </div>
      </div>

      {/* Bad Smells */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Problemas Encontrados (Bad Smells)
        </h3>
        <ul className="space-y-3">
          {result.problemas_encontrados.map((problema, index) => (
            <li key={index} className="flex gap-3 text-zinc-300 text-sm">
              <span className="text-zinc-600 mt-0.5">•</span>
              {problema}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
