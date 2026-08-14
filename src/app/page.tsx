'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CodeInput } from '@/components/CodeInput';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { AnalysisResult, ApplicationState, AppTheme, Exercise } from '@/types';
import { AlertCircle } from 'lucide-react';
import { sanitizeCode } from '@/lib/sanitizer';
import { checkJavaHeuristics } from '@/lib/heuristics';

export default function Home() {
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [code, setCode] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [appState, setAppState] = useState<ApplicationState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCountdown, setRetryCountdown] = useState(0);

  const isSubmittingRef = useRef<boolean>(false);
  const isDark = theme === 'dark';

  // Busca exercícios públicos do servidor na inicialização
  useEffect(() => {
    fetch('/api/exercises')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setExercises(data);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar exercícios públicos:', err);
      });
  }, []);

  // Lógica de atraso (sleep)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const minLength = 10;
  const maxLength = 5000;
  const trimmedCode = code.trim();
  const isTooShort = trimmedCode.length > 0 && trimmedCode.length < minLength;
  const isTooLong = code.length > maxLength;

  const handleSelectExercise = (exercise: Exercise | null) => {
    if (appState === 'loading' || appState === 'retrying') return;

    if (exercise) {
      setSelectedExerciseId(exercise.id);
      setCode(exercise.initialCode);
    } else {
      setSelectedExerciseId(null);
      setCode('');
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
      setResult(null);
      setAppState('idle');
      setErrorMessage('');
    }
  };

  const handleAnalyze = async () => {
    // Trava síncrona contra múltiplos cliques rápidos / race conditions
    if (isSubmittingRef.current) return;
    
    // 1. Sanitização e verificação prévia no cliente (ANTES de qualquer requisição)
    const sanitizedCode = sanitizeCode(code);

    if (!sanitizedCode) {
      setErrorMessage('Por favor, insira o código Java que deseja analisar.');
      setAppState('error');
      return;
    }

    if (sanitizedCode.length < minLength) {
      setErrorMessage(`O código precisa ter pelo menos ${minLength} caracteres para ser analisado.`);
      setAppState('error');
      return;
    }

    if (sanitizedCode.length > maxLength) {
      setErrorMessage(`O código ultrapassou o limite máximo de ${maxLength.toLocaleString('pt-BR')} caracteres.`);
      setAppState('error');
      return;
    }

    // 2. Validação heurística de Java localmente antes de disparar o fetch
    const heuristic = checkJavaHeuristics(sanitizedCode);
    if (!heuristic.isValid) {
      setErrorMessage(heuristic.reason || 'O código fornecido não parece ser Java válido.');
      setAppState('error');
      return;
    }

    // 3. Inicia o envio para a API
    isSubmittingRef.current = true;
    setAppState('loading');
    setErrorMessage('');
    setResult(null);

    let attempt = 0;
    const maxRetries = 2;
    const baseDelayMs = 2000;

    try {
      while (attempt <= maxRetries) {
        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: sanitizedCode,
              exerciseId: selectedExerciseId || undefined,
            }),
          });

          if (response.ok) {
            const data: AnalysisResult = await response.json();
            setResult(data);
            setAppState('success');
            return;
          }

          // Se for erro do cliente (ex: 400 Bad Request), exibe imediatamente sem retentativa
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            const errorData = await response.json().catch(() => ({}));
            setErrorMessage(errorData.error || 'Não foi possível analisar o código fornecido.');
            setAppState('error');
            return;
          }

          // Se for 429 Too Many Requests (Rate Limit), aplica retry com backoff apenas se houver tentativas
          if (response.status === 429) {
            const errorData = await response.json().catch(() => ({}));
            if (attempt >= maxRetries) {
              setErrorMessage(errorData.error || 'Limite de requisições excedido. Aguarde alguns instantes e tente novamente.');
              setAppState('error');
              return;
            }

            attempt++;
            const currentDelayMs = baseDelayMs * Math.pow(2, attempt - 1);
            const currentDelaySec = currentDelayMs / 1000;

            setAppState('retrying');
            setRetryCountdown(currentDelaySec);

            for (let i = currentDelaySec; i > 0; i--) {
              setRetryCountdown(i);
              await delay(1000);
            }

            setAppState('loading');
            continue;
          }

          // Para 500 ou outros erros inesperados do servidor
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao processar a análise no servidor.');

        } catch (error: any) {
          // Se for a última tentativa, finaliza com erro
          if (attempt >= maxRetries) {
            setErrorMessage(error.message || 'Ocorreu um erro ao tentar se conectar ao servidor.');
            setAppState('error');
            return;
          }

          attempt++;
          const currentDelayMs = baseDelayMs * Math.pow(2, attempt - 1);
          const currentDelaySec = currentDelayMs / 1000;

          setAppState('retrying');
          setRetryCountdown(currentDelaySec);

          for (let i = currentDelaySec; i > 0; i--) {
            setRetryCountdown(i);
            await delay(1000);
          }

          setAppState('loading');
        }
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
      <Header theme={theme} onToggleTheme={setTheme} />
      
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
            onResetExerciseCode={handleResetExerciseCode}
            theme={theme}
            disabled={appState === 'loading' || appState === 'retrying'}
          />

          <CodeInput 
            value={code}
            onChange={(val) => {
              setCode(val);
              if (appState === 'error') {
                setAppState('idle');
                setErrorMessage('');
              }
            }}
            disabled={appState === 'loading' || appState === 'retrying'}
            theme={theme}
            onToggleTheme={setTheme}
            maxLength={maxLength}
          />

          {isTooShort && (
            <p className="text-xs text-amber-500 font-medium">
              ⚠️ O código deve conter no mínimo {minLength} caracteres para ser analisado.
            </p>
          )}
          
          <AnalyzeButton 
            onClick={handleAnalyze}
            disabled={!trimmedCode || isTooShort || isTooLong || appState === 'loading' || appState === 'retrying'}
            state={appState}
            theme={theme}
            retrySeconds={retryCountdown}
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
