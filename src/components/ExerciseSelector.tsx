'use client';

import { useState } from 'react';
import { Exercise, AppTheme } from '@/types';
import { BookOpen, Code2, CheckCircle2, Target, Sparkles, ChevronDown } from 'lucide-react';

interface ExerciseSelectorProps {
  readonly exercises: readonly Exercise[];
  readonly selectedExerciseId: string | null;
  readonly onSelectExercise: (exercise: Exercise | null) => void;
  readonly theme: AppTheme;
  readonly disabled?: boolean;
}

function getDifficultyBadgeClass(difficulty: string, isDark: boolean): string {
  switch (difficulty) {
    case 'Iniciante':
      if (isDark) {
        return 'bg-emerald-950/70 border-emerald-800 text-emerald-300';
      }
      return 'bg-emerald-50 border-emerald-200 text-emerald-700';

    case 'Intermediário':
      if (isDark) {
        return 'bg-amber-950/70 border-amber-800 text-amber-300';
      }
      return 'bg-amber-50 border-amber-200 text-amber-700';

    case 'Avançado':
      if (isDark) {
        return 'bg-purple-950/70 border-purple-800 text-purple-300';
      }
      return 'bg-purple-50 border-purple-200 text-purple-700';

    case 'Desafio':
      if (isDark) {
        return 'bg-rose-950/80 border-rose-700 text-rose-300 font-semibold shadow-xs';
      }
      return 'bg-rose-50 border-rose-300 text-rose-700 font-semibold shadow-xs';

    default:
      if (isDark) {
        return 'bg-zinc-800 border-zinc-700 text-zinc-300';
      }
      return 'bg-slate-100 border-slate-300 text-slate-700';
  }
}

function getPillClasses(isSelected: boolean, isDark: boolean, disabled: boolean): string {
  const baseClasses = 'px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all duration-200 border';
  const cursorClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  let themeClasses = '';
  if (isSelected && isDark) {
    themeClasses = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-xs font-semibold';
  } else if (isSelected) {
    themeClasses = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold shadow-xs';
  } else if (isDark) {
    themeClasses = 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80';
  } else {
    themeClasses = 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50';
  }

  return `${baseClasses} ${themeClasses} ${cursorClass}`;
}

function getPillIconClasses(isSelected: boolean, isDark: boolean): string {
  if (!isSelected) {
    return 'text-zinc-400';
  }
  if (isDark) {
    return 'text-emerald-400';
  }
  return 'text-emerald-600';
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

  if (exercises.length === 0) return null;

  const activeExercise = exercises.find((ex) => ex.id === selectedExerciseId);
  const isFreeModeSelected = selectedExerciseId === null;

  let headerBorderClass = 'mb-3 pb-3 border-b border-inherit';
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
      {/* Barra de Seleção de Exercícios com Quebra Fluida (Sem rolagem horizontal) */}
      <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
          isDark ? 'text-zinc-400' : 'text-slate-500'
        }`}>
          <BookOpen className="w-3.5 h-3.5" />
          <span>Exercícios da Oficina</span>
        </label>

        {/* Lista de Exercícios em Pílulas com Quebra Fluida (Wrap) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Botões de cada exercício guiado */}
          {exercises.map((exercise) => {
            const isSelected = selectedExerciseId === exercise.id;
            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onSelectExercise(exercise)}
                disabled={disabled}
                className={getPillClasses(isSelected, isDark, disabled)}
              >
                <Code2 className={`w-3.5 h-3.5 ${getPillIconClasses(isSelected, isDark)}`} />
                <span>{exercise.title}</span>
              </button>
            );
          })}

          {/* 2. Botão Modo Livre posicionado como última opção */}
          <button
            type="button"
            onClick={() => onSelectExercise(null)}
            disabled={disabled}
            className={getPillClasses(isFreeModeSelected, isDark, disabled)}
            title="Voltar ao modo livre para testar qualquer código personalizado"
          >
            <Sparkles className={`w-3.5 h-3.5 ${getPillIconClasses(isFreeModeSelected, isDark)}`} />
            <span>Modo Livre</span>
          </button>
        </div>
      </div>

      {/* Cartão de Detalhes do Exercício Selecionado */}
      {activeExercise && (
        <div
          className={`p-4 rounded-xl border transition-all duration-500 ease-in-out shadow-sm ${
            isDark
              ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
              : 'bg-slate-50/80 border-slate-200 text-slate-700'
          }`}
        >
          {/* Header do Card com Título e Badges */}
          <div className={`flex items-center justify-between gap-3 transition-all duration-500 ease-in-out ${headerBorderClass}`}>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-sm tracking-tight text-inherit">
                {activeExercise.title}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${getDifficultyBadgeClass(activeExercise.difficulty, isDark)}`}>
                {activeExercise.difficulty}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                isDark 
                  ? 'bg-zinc-800/70 border-zinc-700 text-zinc-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {activeExercise.category}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-lg border transition-all duration-300 shrink-0 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-700/70 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
              } cursor-pointer`}
              title={isCollapsed ? 'Expandir descrição e objetivos' : 'Recolher descrição e objetivos'}
              aria-label={isCollapsed ? 'Expandir descrição e objetivos' : 'Recolher descrição e objetivos'}
            >
              <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-500 ease-in-out ${chevronRotationClass}`} />
            </button>
          </div>

          {/* Área Recolhível com Animação Lenta e Suave */}
          <div className={`grid transition-all duration-500 ease-in-out ${collapseContentClass}`}>
            <div className="overflow-hidden space-y-3">
              <p className="text-xs leading-relaxed">
                {activeExercise.description}
              </p>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>Objetivos da Refatoração:</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {activeExercise.objectives.map((obj, i) => (
                    <li key={`${activeExercise.id}-obj-${i}`} className="text-xs flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>{obj}</span>
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
