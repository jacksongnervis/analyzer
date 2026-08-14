import { Coffee, Moon, Sun } from 'lucide-react';
import { AppTheme } from '@/types';

interface HeaderProps {
  theme: AppTheme;
  onToggleTheme: (theme: AppTheme) => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header 
      className={`border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-amber-50'}`}>
            <Coffee className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
              Java Clean Code <span className="text-amber-400">Analyzer</span>
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isDark 
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm border border-zinc-700' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tema Escuro"
          >
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Escuro</span>
          </button>
          
          <button
            type="button"
            onClick={() => onToggleTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              !isDark 
                ? 'bg-white text-amber-600 font-semibold shadow-sm border border-slate-200' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Tema Claro"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Claro</span>
          </button>
        </div>
      </div>
    </header>
  );
}
