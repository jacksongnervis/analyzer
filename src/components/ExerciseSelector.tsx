'use client';

import { useState } from 'react';
import { Exercise, AppTheme } from '@/types';
import { BookOpen, Code2, RotateCcw, CheckCircle2, Target, X, Sparkles, ChevronDown } from 'lucide-react';

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedExerciseId: string | null;
  onSelectExercise: (exercise: Exercise | null) => void;
  onResetExerciseCode: () => void;
  theme: AppTheme;
  disabled?: boolean;
}

export function ExerciseSelector({
  exercises,
  selectedExerciseId,
  onSelectExercise,
  onResetExerciseCode,
  theme,
  disabled = false,
}: ExerciseSelectorProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const isDark = theme === 'dark';
  const activeExercise = exercises.find(ex => ex.id === selectedExerciseId);

  const getDifficultyBadge = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'Iniciante':
        return isDark
          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediário':
        return isDark
          ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Avançado':
        return isDark
          ? 'bg-purple-950/70 text-purple-300 border-purple-800/60'
          : 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const handleExerciseChange = (exercise: Exercise | null) => {
    setIsCollapsed(false);
    onSelectExercise(exercise);
  };

  if (exercises.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Seleção de Exercícios */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}>
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Escolha um Exercício de Refatoração:</span>
          </label>

          {selectedExerciseId && (
            <button
              type="button"
              onClick={() => handleExerciseChange(null)}
              disabled={disabled}
              className={`text-xs flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md ${isDark
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
            >
              <X className="w-3 h-3" />
              <span>Voltar ao Modo Livre</span>
            </button>
          )}
        </div>

        {/* Lista de Botões/Pills */}
        <div className="flex flex-wrap gap-2">
          {/* Botão Modo Livre */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleExerciseChange(null)}
            className={`
              px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border
              ${selectedExerciseId === null
                ? isDark
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10 font-semibold'
                  : 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm shadow-amber-500/10 font-semibold'
                : isDark
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Modo Livre</span>
          </button>

          {/* Botões dos Exercícios carregados dinamicamente */}
          {exercises.map((exercise) => {
            const isSelected = selectedExerciseId === exercise.id;
            return (
              <button
                key={exercise.id}
                type="button"
                disabled={disabled}
                onClick={() => handleExerciseChange(exercise)}
                className={`
                  px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 border
                  ${isSelected
                    ? isDark
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/10 font-semibold'
                      : 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm shadow-emerald-500/10 font-semibold'
                    : isDark
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Code2 className={`w-3.5 h-3.5 ${isSelected ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : 'text-zinc-400'}`} />
                <span>{exercise.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartão de Detalhes do Exercício Selecionado com Animação Suave */}
      {activeExercise && (
        <div
          className={`p-4 rounded-xl border transition-all duration-500 ease-in-out shadow-sm ${isDark
              ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
              : 'bg-slate-50/80 border-slate-200 text-slate-700'
            }`}
        >
          {/* Header do Card */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all duration-500 ease-in-out ${isCollapsed ? '' : 'mb-3 pb-3 border-b border-inherit'
            }`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm tracking-tight text-inherit">
                {activeExercise.title}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${getDifficultyBadge(activeExercise.difficulty)}`}>
                {activeExercise.difficulty}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${isDark ? 'bg-zinc-800/70 border-zinc-700 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                {activeExercise.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={onResetExerciseCode}
                disabled={disabled}
                className={`text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-200 active:scale-95 ${isDark
                    ? 'bg-zinc-900 border-zinc-700/70 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Recarrega o código inicial do exercício para recomeçar a refatoração"
              >
                <RotateCcw className="w-3 h-3 text-amber-500" />
                <span>Restaurar Código Inicial</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-1.5 rounded-lg border transition-all duration-300 ${isDark
                    ? 'bg-zinc-900 border-zinc-700/70 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
                  } cursor-pointer`}
                title={isCollapsed ? 'Expandir descrição e objetivos' : 'Recolher descrição e objetivos'}
                aria-label={isCollapsed ? 'Expandir descrição e objetivos' : 'Recolher descrição e objetivos'}
              >
                <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-500 ease-in-out ${isCollapsed ? '-rotate-90' : 'rotate-0'
                  }`} />
              </button>
            </div>
          </div>

          {/* Área Recolhível com Animação Lenta e Suave */}
          <div
            className={`grid transition-all duration-500 ease-in-out ${isCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
              }`}
          >
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
