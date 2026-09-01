'use client';

import { useState } from 'react';
import { Exercise, AppTheme } from '@/types';
import { BookOpen, Code2, CheckCircle2, Target, ChevronDown } from 'lucide-react';

interface ExerciseSelectorProps {
  readonly exercises: readonly Exercise[];
  readonly selectedExerciseId: string | null;
  readonly onSelectExercise: (exercise: Exercise) => void;
  readonly theme: AppTheme;
  readonly disabled?: boolean;
}

function getDifficultyBadgeClass(difficulty: string, isDark: boolean): string {
  const base = 'px-2 py-0.5 rounded-md text-[11px] font-bold border-2 transition-transform duration-200';
  switch (difficulty) {
    case 'Iniciante':
      if (isDark) {
        return `${base} bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[2px_2px_0_0_#10b981]`;
      }
      return `${base} bg-emerald-500/10 border-emerald-600 text-emerald-800 shadow-[2px_2px_0_0_#10b981]`;

    case 'Intermediário':
      if (isDark) {
        return `${base} bg-sky-500/20 border-sky-400 text-sky-300 shadow-[2px_2px_0_0_#38bdf8]`;
      }
      return `${base} bg-sky-500/10 border-sky-500 text-sky-800 shadow-[2px_2px_0_0_#0284c7]`;

    case 'Avançado':
      if (isDark) {
        return `${base} bg-purple-500/20 border-purple-400 text-purple-300 shadow-[2px_2px_0_0_#bd93f9]`;
      }
      return `${base} bg-purple-500/10 border-purple-600 text-purple-800 shadow-[2px_2px_0_0_#7c3aed]`;

    case 'Desafio':
      if (isDark) {
        return `${base} bg-rose-500/20 border-rose-400 text-rose-300 shadow-[2px_2px_0_0_#ff79c6]`;
      }
      return `${base} bg-rose-500/10 border-rose-500 text-rose-800 shadow-[2px_2px_0_0_#e11d48]`;

    default:
      if (isDark) {
        return `${base} bg-bnt-ink border-bnt-cream/30 text-bnt-cream`;
      }
      return `${base} bg-white border-bnt-ink text-bnt-ink`;
  }
}

function getPillClasses(isSelected: boolean, isDark: boolean, disabled: boolean): string {
  const baseClasses = 'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all duration-200 border-2 active:scale-95';
  const cursorClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  let themeClasses = '';
  if (isSelected && isDark) {
    themeClasses = 'bg-emerald-500 border-bnt-cream text-slate-950 shadow-[3px_3px_0_0_#faf8f4] -translate-y-0.5 scale-[1.02]';
  } else if (isSelected) {
    themeClasses = 'bg-emerald-500 border-bnt-ink text-slate-950 shadow-[3px_3px_0_0_#0f172a] -translate-y-0.5 scale-[1.02]';
  } else if (isDark) {
    themeClasses = 'bg-bnt-ink border-bnt-cream/20 text-bnt-cream/70 hover:text-bnt-cream hover:border-emerald-400/50 hover:bg-bnt-ink-deep hover:-translate-y-0.5';
  } else {
    themeClasses = 'bg-white border-bnt-ink/20 text-bnt-ink/70 hover:text-bnt-ink hover:border-emerald-500/50 hover:bg-emerald-50/50 hover:-translate-y-0.5';
  }

  return `${baseClasses} ${themeClasses} ${cursorClass}`;
}

function getPillIconClasses(isSelected: boolean, isDark: boolean): string {
  if (!isSelected) {
    return isDark ? 'text-bnt-cream/50' : 'text-bnt-ink/50';
  }
  return isDark ? 'text-slate-950' : 'text-slate-950';
}

export function ExerciseSelector({
  exercises,
  selectedExerciseId,
  onSelectExercise,
  theme,
  disabled = false,
}: Readonly<ExerciseSelectorProps>) {
  const isDark = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col gap-2 animate-pulse py-2">
        <div className={`h-4 w-40 rounded ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className={`h-8 w-28 rounded-xl border-2 ${
                isDark ? 'bg-zinc-850 border-zinc-800' : 'bg-slate-100 border-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  const activeExercise = exercises.find((ex) => ex.id === selectedExerciseId) || exercises[0];

  let headerBorderClass = 'mb-3 pb-3 border-b border-inherit/15';
  if (isCollapsed) {
    headerBorderClass = '';
  }

  let collapseContentClass = 'grid-rows-[1fr] opacity-100';
  if (isCollapsed) {
    collapseContentClass = 'grid-rows-[0fr] opacity-0';
  }

  let chevronRotationClass = 'rotate-0';
  if (isCollapsed) {
    chevronRotationClass = '-rotate-90';
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Barra de Seleção de Exercícios */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${
            isDark ? 'text-bnt-cream/70' : 'text-bnt-ink/70'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
            <BookOpen className="w-3.5 h-3.5" />
            <span>Exercícios da Oficina ({exercises.length})</span>
          </label>
        </div>

        {/* Lista de Exercícios em Pílulas Responsivas */}
        <div className="flex flex-wrap items-center gap-2">
          {exercises.map((exercise) => {
            const isSelected = activeExercise.id === exercise.id;
            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onSelectExercise(exercise)}
                disabled={disabled}
                className={getPillClasses(isSelected, isDark, disabled)}
                aria-pressed={isSelected}
              >
                <Code2 className={`w-3.5 h-3.5 transition-transform duration-200 ${isSelected ? 'scale-110' : ''} ${getPillIconClasses(isSelected, isDark)}`} />
                <span>{exercise.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartão de Detalhes do Exercício Selecionado */}
      {activeExercise && (
        <div
          className={`p-4 card-brutal transition-all duration-300 ease-in-out ${
            isDark
              ? 'bg-bnt-ink-deep text-bnt-cream/90 border-emerald-500/30'
              : 'bg-emerald-50/40 text-bnt-ink/90 border-emerald-600/30'
          }`}
        >
          {/* Header do Card */}
          <div className={`flex items-center justify-between gap-3 transition-all duration-300 ease-in-out ${headerBorderClass}`}>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-display font-bold text-sm tracking-tight text-inherit">
                {activeExercise.title}
              </span>
              <span className={getDifficultyBadgeClass(activeExercise.difficulty, isDark)}>
                {activeExercise.difficulty}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border-2 ${
                isDark
                  ? 'bg-bnt-ink border-bnt-cream/30 text-bnt-cream/70'
                  : 'bg-white border-bnt-ink text-bnt-ink/70'
              }`}>
                {activeExercise.category}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-lg border-2 transition-all duration-200 shrink-0 ${
                isDark
                  ? 'bg-bnt-ink border-bnt-cream/30 text-bnt-cream hover:bg-bnt-ink-deep hover:text-white hover:scale-105 active:scale-95'
                  : 'bg-white border-bnt-ink text-bnt-ink hover:bg-emerald-50 hover:text-bnt-ink hover:scale-105 active:scale-95'
              } cursor-pointer shadow-[2px_2px_0_0_var(--brutal-border)]`}
              title={isCollapsed ? 'Expandir descrição e objetivos' : 'Recolher descrição e objetivos'}
              aria-label={isCollapsed ? 'Expandir descrição e objetivos' : 'Recolher descrição e objetivos'}
            >
              <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-300 ease-in-out ${chevronRotationClass}`} />
            </button>
          </div>

          {/* Área Recolhível com Transição Suave */}
          <div className={`grid transition-all duration-300 ease-in-out ${collapseContentClass}`}>
            <div className="overflow-hidden space-y-3 pt-1">
              <p className="text-xs sm:text-sm leading-relaxed">
                {activeExercise.description}
              </p>

              <div className="space-y-2">
                <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  <Target className="w-4 h-4" />
                  <span>Objetivos da Refatoração:</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  {activeExercise.objectives.map((obj, i) => (
                    <li key={`${activeExercise.id}-obj-${i}`} className="text-[13px] sm:text-sm flex items-start gap-2 leading-snug">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                      <span className={isDark ? 'text-bnt-cream/80' : 'text-bnt-ink/80'}>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
