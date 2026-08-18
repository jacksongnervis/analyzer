'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { CodeInput } from '@/components/CodeInput';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { AnalysisResult, ApplicationState, AppTheme, Exercise } from '@/types';
import { AlertCircle } from 'lucide-react';
import { sanitizeCode } from '@/lib/sanitizer';
import { checkJavaHeuristics } from '@/lib/heuristics';
import { isTooSimilarToInitialCode } from '@/lib/similarity';

const STORAGE_KEYS = {
  THEME: 'clean_code_analyzer_theme',
  SELECTED_EXERCISE: 'clean_code_analyzer_selected_exercise_id',
  DRAFT_PREFIX: 'clean_code_analyzer_draft_',
  COOLDOWN: 'clean_code_analyzer_cooldown_until',
};

const MIN_CODE_LENGTH = 10;
const MAX_CODE_LENGTH = 5000;
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 2000;
const SUCCESS_COOLDOWN_SECONDS = 60;

interface CodeValidationResult {
  readonly isValid: boolean;
  readonly sanitizedCode: string;
  readonly errorMessage?: string;
}

function validateJavaInput(code: string, initialExerciseCode?: string): CodeValidationResult {
  const sanitizedCode = sanitizeCode(code);

  if (!sanitizedCode) {
    return { isValid: false, sanitizedCode: '', errorMessage: 'Por favor, insira o código Java que deseja analisar.' };
  }

  if (sanitizedCode.length < MIN_CODE_LENGTH) {
    return {
      isValid: false,
      sanitizedCode,
      errorMessage: `O código precisa ter pelo menos ${MIN_CODE_LENGTH} caracteres para ser analisado.`,
    };
  }

  if (sanitizedCode.length > MAX_CODE_LENGTH) {
    return {
      isValid: false,
      sanitizedCode,
      errorMessage: `O código ultrapassou o limite máximo de ${MAX_CODE_LENGTH.toLocaleString('pt-BR')} caracteres.`,
    };
  }

  const heuristic = checkJavaHeuristics(sanitizedCode);
  if (!heuristic.isValid) {
    return {
      isValid: false,
      sanitizedCode,
      errorMessage: heuristic.reason || 'O código fornecido não parece ser Java válido.',
    };
  }

  if (initialExerciseCode && isTooSimilarToInitialCode(sanitizedCode, initialExerciseCode)) {
    return {
      isValid: false,
      sanitizedCode,
      errorMessage: 'O código enviado é praticamente idêntico ao código inicial do exercício. Tente realizar a refatoração antes de solicitar a análise.',
    };
  }

  return { isValid: true, sanitizedCode };
}

async function runRetryCountdown(
  seconds: number,
  onTick: (remainingSeconds: number) => void
): Promise<void> {
  for (let i = seconds; i > 0; i--) {
    onTick(i);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

interface FetchAnalysisAttemptResult {
  readonly status: 'success' | 'client_error' | 'rate_limit' | 'server_error';
  readonly data?: AnalysisResult;
  readonly error?: string;
  readonly retryAfterSeconds?: number;
}

async function requestAnalysis(code: string, exerciseId: string | null): Promise<FetchAnalysisAttemptResult> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        exerciseId: exerciseId || undefined,
      }),
    });

    if (response.ok) {
      const data: AnalysisResult = await response.json();
      return { status: 'success', data };
    }

    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error;

    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
      return { 
        status: 'rate_limit', 
        error: message || 'Limite de requisições excedido. Aguarde alguns instantes e tente novamente.',
        retryAfterSeconds: isNaN(retryAfterSeconds) ? 60 : retryAfterSeconds,
      };
    }

    if (response.status >= 400 && response.status < 500) {
      return { status: 'client_error', error: message || 'Não foi possível analisar o código fornecido.' };
    }

    return { status: 'server_error', error: message || 'Erro ao processar a análise no servidor.' };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao tentar se conectar ao servidor.';
    return { status: 'server_error', error: errMessage };
  }
}

export default function Home() {
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [code, setCode] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [appState, setAppState] = useState<ApplicationState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const isSubmittingRef = useRef<boolean>(false);
  const isDark = theme === 'dark';

  // 1. Carrega tema salvo, exercícios públicos e cooldown ativo
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }

      // Restaura cooldown ativo mesmo se o usuário der F5
      const savedCooldownUntil = localStorage.getItem(STORAGE_KEYS.COOLDOWN);
      if (savedCooldownUntil) {
        const until = parseInt(savedCooldownUntil, 10);
        const remaining = Math.ceil((until - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldownSeconds(remaining);
        } else {
          localStorage.removeItem(STORAGE_KEYS.COOLDOWN);
        }
      }
    } catch {
      // Ignora erro de acesso ao localStorage
    }

    fetch('/api/exercises')
      .then((res) => res.json())
      .then((data: Exercise[]) => {
        if (Array.isArray(data)) {
          setExercises(data);

          try {
            const savedExId = localStorage.getItem(STORAGE_KEYS.SELECTED_EXERCISE);
            const targetExercise = savedExId ? data.find((ex) => ex.id === savedExId) : null;

            if (targetExercise) {
              setSelectedExerciseId(targetExercise.id);
              const savedDraft = localStorage.getItem(STORAGE_KEYS.DRAFT_PREFIX + targetExercise.id);
              setCode(savedDraft ?? targetExercise.initialCode);
            } else {
              setSelectedExerciseId(null);
              const freeDraft = localStorage.getItem(STORAGE_KEYS.DRAFT_PREFIX + 'free');
              if (freeDraft !== null) {
                setCode(freeDraft);
              }
            }
          } catch {
            // Ignora erro de acesso ao localStorage
          }
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar exercícios públicos:', err);
      });
  }, []);

  // 2. Temporizador do cooldown no botão
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          try {
            localStorage.removeItem(STORAGE_KEYS.COOLDOWN);
          } catch {
            // Ignora erro
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const startCooldown = (seconds: number = SUCCESS_COOLDOWN_SECONDS) => {
    setCooldownSeconds(seconds);
    try {
      localStorage.setItem(STORAGE_KEYS.COOLDOWN, (Date.now() + seconds * 1000).toString());
    } catch {
      // Ignora erro
    }
  };

  const handleToggleTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch {
      // Ignora erro
    }
  };

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    if (appState === 'error') {
      setAppState('idle');
      setErrorMessage('');
    }

    try {
      const draftKey = selectedExerciseId 
        ? `${STORAGE_KEYS.DRAFT_PREFIX}${selectedExerciseId}` 
        : `${STORAGE_KEYS.DRAFT_PREFIX}free`;
      localStorage.setItem(draftKey, newCode);
    } catch {
      // Ignora erro
    }
  }, [selectedExerciseId, appState]);

  const trimmedCode = code.trim();
  const isTooShort = trimmedCode.length > 0 && trimmedCode.length < MIN_CODE_LENGTH;
  const isTooLong = code.length > MAX_CODE_LENGTH;

  const handleSelectExercise = (exercise: Exercise | null) => {
    if (appState === 'loading' || appState === 'retrying') return;

    if (exercise) {
      setSelectedExerciseId(exercise.id);
      try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_EXERCISE, exercise.id);
        const savedDraft = localStorage.getItem(`${STORAGE_KEYS.DRAFT_PREFIX}${exercise.id}`);
        setCode(savedDraft ?? exercise.initialCode);
      } catch {
        setCode(exercise.initialCode);
      }
    } else {
      setSelectedExerciseId(null);
      try {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_EXERCISE);
        const freeDraft = localStorage.getItem(`${STORAGE_KEYS.DRAFT_PREFIX}free`);
        setCode(freeDraft ?? '');
      } catch {
        setCode('');
      }
    }

    setResult(null);
    setAppState('idle');
    setErrorMessage('');
  };

  const handleResetExerciseCode = () => {
    if (!selectedExerciseId) return;
    const exercise = exercises.find((ex) => ex.id === selectedExerciseId);
    if (exercise) {
      setCode(exercise.initialCode);
      try {
        localStorage.setItem(`${STORAGE_KEYS.DRAFT_PREFIX}${exercise.id}`, exercise.initialCode);
      } catch {
        // Ignora erro
      }
      setResult(null);
      setAppState('idle');
      setErrorMessage('');
    }
  };

  const handleAnalyze = async () => {
    if (isSubmittingRef.current || cooldownSeconds > 0) return;

    const currentExercise = selectedExerciseId ? exercises.find((ex) => ex.id === selectedExerciseId) : undefined;
    const validation = validateJavaInput(code, currentExercise?.initialCode);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Por favor, insira código Java válido.');
      setAppState('error');
      return;
    }

    isSubmittingRef.current = true;
    setAppState('loading');
    setErrorMessage('');
    setResult(null);

    try {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const response = await requestAnalysis(validation.sanitizedCode, selectedExerciseId);

        if (response.status === 'success' && response.data) {
          setResult(response.data);
          setAppState('success');
          startCooldown(SUCCESS_COOLDOWN_SECONDS);
          return;
        }

        if (response.status === 'rate_limit') {
          const waitSeconds = response.retryAfterSeconds || SUCCESS_COOLDOWN_SECONDS;
          startCooldown(waitSeconds);
          setErrorMessage(response.error || `Aguarde ${waitSeconds}s antes de enviar outra análise.`);
          setAppState('error');
          return;
        }

        if (response.status === 'client_error' || attempt >= MAX_RETRIES) {
          setErrorMessage(response.error || 'Erro ao processar a análise no servidor.');
          setAppState('error');
          return;
        }

        const delaySec = (BASE_RETRY_DELAY_MS * Math.pow(2, attempt)) / 1000;
        setAppState('retrying');
        await runRetryCountdown(delaySec, setRetryCountdown);
        setAppState('loading');
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 font-sans ${
        isDark 
          ? 'bg-zinc-950 text-zinc-100 selection:bg-amber-500/30' 
          : 'bg-slate-50 text-slate-900 selection:bg-amber-500/30'
      }`}
    >
      <Header theme={theme} onToggleTheme={handleToggleTheme} />
      
      <main className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
        
        {/* Intro description */}
        <div className="space-y-1">
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            Analise seu código Java
          </h2>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Pratique refatoração com exercícios guiados ou teste seu próprio código. A IA avalia com base em princípios reais de Clean Code.
          </p>
        </div>

        {/* Input Card Container */}
        <div 
          className={`flex flex-col gap-6 p-6 rounded-2xl border transition-all duration-300 ${
            isDark 
              ? 'bg-zinc-900/50 border-zinc-800 shadow-2xl' 
              : 'bg-white border-slate-200 shadow-xl shadow-slate-200/60'
          }`}
        >
          {/* Seletor de Exercícios Guiados */}
          <ExerciseSelector 
            exercises={exercises}
            selectedExerciseId={selectedExerciseId}
            onSelectExercise={handleSelectExercise}
            theme={theme}
            disabled={appState === 'loading' || appState === 'retrying'}
          />

          <CodeInput 
            value={code}
            onChange={handleCodeChange}
            disabled={appState === 'loading' || appState === 'retrying'}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onReset={selectedExerciseId ? handleResetExerciseCode : undefined}
            maxLength={MAX_CODE_LENGTH}
          />

          {isTooShort && (
            <p className="text-xs text-amber-500 font-medium">
              ⚠️ O código deve conter no mínimo {MIN_CODE_LENGTH} caracteres para ser analisado.
            </p>
          )}
          
          <AnalyzeButton 
            onClick={handleAnalyze}
            disabled={!trimmedCode || isTooShort || isTooLong || appState === 'loading' || appState === 'retrying' || cooldownSeconds > 0}
            state={appState}
            theme={theme}
            retrySeconds={retryCountdown}
            cooldownSeconds={cooldownSeconds}
          />

          {appState === 'error' && (
            <div 
              className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 border transition-colors ${
                isDark
                  ? 'bg-red-950/50 border-red-900/50 text-red-200'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span><strong>Atenção:</strong> {errorMessage}</span>
            </div>
          )}
        </div>

        {/* Results Display */}
        {appState === 'success' && result && (
          <ResultsDisplay result={result} theme={theme} />
        )}

      </main>
    </div>
  );
}
