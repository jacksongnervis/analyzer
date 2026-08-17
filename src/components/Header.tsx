import { Code2, Moon, Sun } from 'lucide-react';
import { AppTheme } from '@/types';

interface HeaderProps {
  readonly theme: AppTheme;
  readonly onToggleTheme: (theme: AppTheme) => void;
}

export function Header({ theme, onToggleTheme }: Readonly<HeaderProps>) {
  const isDark = theme === 'dark';

  return (
    <header 
      className={`border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
        {/* Brand Logo & Title with Gradient Animation and Hover Glow Shift */}
        <div className="flex items-center gap-3 select-none group cursor-default">
          {/* Símbolo de Código </> com micro-interação */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
            isDark 
              ? 'bg-zinc-950 border-zinc-800 text-emerald-400 shadow-inner group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-xs group-hover:border-emerald-400 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]'
          }`}>
            <Code2 className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight transition-all duration-300">
              <span className={`transition-colors duration-300 ${
                isDark 
                  ? 'text-zinc-100 group-hover:text-emerald-200' 
                  : 'text-slate-900 group-hover:text-emerald-800'
              }`}>
                Clean Code
              </span>{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 via-amber-400 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:via-amber-300 dark:to-emerald-400 bg-clip-text text-transparent animate-title-gradient font-black transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(52,211,153,0.4)]">
                Analyzer
              </span>
            </h1>
          </div>
        </div>

        {/* Global Theme Toggle */}
        <div 
          className={`flex items-center p-1 rounded-xl border text-xs font-medium ${
            isDark 
              ? 'bg-zinc-950 border-zinc-800' 
              : 'bg-slate-100 border-slate-300'
          }`}
        >
          <button
            type="button"
            onClick={() => onToggleTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              isDark 
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm border border-zinc-700' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tema Escuro"
            aria-label="Ativar tema escuro"
          >
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Escuro</span>
          </button>
          
          <button
            type="button"
            onClick={() => onToggleTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              !isDark 
                ? 'bg-white text-amber-600 font-semibold shadow-sm border border-slate-200' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Tema Claro"
            aria-label="Ativar tema claro"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Claro</span>
          </button>
        </div>
      </div>
    </header>
  );
}
