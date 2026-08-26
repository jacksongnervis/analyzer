'use client';

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
      className={`border-b-2 transition-colors duration-300 sticky top-0 z-30 backdrop-blur-md ${
        isDark
          ? 'bg-bnt-ink-deep/95 border-bnt-cream/20'
          : 'bg-bnt-cream/95 border-bnt-ink/10'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 select-none group cursor-default">
          <div
            className={`p-2 sm:p-2.5 rounded-xl border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2 ${
              isDark
                ? 'bg-emerald-500 border-bnt-cream text-slate-950 shadow-[3px_3px_0_0_#faf8f4]'
                : 'bg-emerald-600 border-bnt-ink text-white shadow-[3px_3px_0_0_#0f172a]'
            }`}
          >
            <Code2 className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg sm:text-2xl tracking-tight leading-none">
              <span className={isDark ? 'text-bnt-cream' : 'text-bnt-ink'}>
                Clean Code
              </span>{' '}
              <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                Analyzer
              </span>
            </h1>
          </div>
        </div>

        {/* Global Theme Toggle — Animated Sliding Segmented Pill */}
        <div
          className={`relative flex items-center p-1 rounded-full border-2 text-xs font-bold transition-colors duration-300 ${
            isDark
              ? 'bg-bnt-ink border-bnt-cream/30'
              : 'bg-white border-bnt-ink'
          }`}
          role="radiogroup"
          aria-label="Alternar tema visual"
        >
          {/* Animated Background Slider Indicator */}
          <div
            aria-hidden="true"
            className={`absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-2 ${
              isDark
                ? 'left-1 w-[calc(50%-4px)] bg-emerald-600 border-bnt-cream text-white shadow-[2px_2px_0_0_#faf8f4]'
                : 'left-[calc(50%+2px)] w-[calc(50%-3px)] bg-emerald-500 border-bnt-ink text-slate-950 shadow-[2px_2px_0_0_#0f172a]'
            }`}
          />

          <button
            type="button"
            role="radio"
            aria-checked={isDark}
            onClick={() => onToggleTheme('dark')}
            className={`relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 ${
              isDark
                ? 'text-white'
                : 'text-bnt-ink/70 hover:text-emerald-600'
            }`}
            title="Ativar tema escuro"
            aria-label="Tema Escuro"
          >
            <Moon className={`w-3.5 h-3.5 transition-transform duration-300 ${isDark ? 'rotate-0 scale-100' : '-rotate-45 scale-90'}`} />
            <span className="hidden sm:inline">Escuro</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={!isDark}
            onClick={() => onToggleTheme('light')}
            className={`relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 ${
              !isDark
                ? 'text-slate-950 font-bold'
                : 'text-bnt-cream/70 hover:text-bnt-cream'
            }`}
            title="Ativar tema claro"
            aria-label="Tema Claro"
          >
            <Sun className={`w-3.5 h-3.5 transition-transform duration-300 ${!isDark ? 'rotate-0 scale-100' : 'rotate-45 scale-90'}`} />
            <span className="hidden sm:inline">Claro</span>
          </button>
        </div>
      </div>
    </header>
  );
}
