'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { CodeInput } from '@/components/CodeInput';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { AnalysisResult, ApplicationState, AppTheme } from '@/types';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [code, setCode] = useState('');
  const [appState, setAppState] = useState<ApplicationState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCountdown, setRetryCountdown] = useState(0);

  const isSubmittingRef = useRef<boolean>(false);
  const isDark = theme === 'dark';

  // Lógica de atraso (sleep)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const minLength = 10;
  const maxLength = 5000;
  const trimmedCode = code.trim();
  const isTooShort = trimmedCode.length > 0 && trimmedCode.length < minLength;
  const isTooLong = code.length > maxLength;

  const handleAnalyze = async () => {
    // Trava síncrona contra múltiplos cliques rápidos / race conditions
    if (isSubmittingRef.current) return;
    if (!trimmedCode) return;

    if (trimmedCode.length < minLength) {
      setErrorMessage(`O código precisa ter pelo menos ${minLength} caracteres para ser analisado.`);
      setAppState('error');
      return;
    }

    if (code.length > maxLength) {
      setErrorMessage(`O código ultrapassou o limite máximo de ${maxLength.toLocaleString('pt-BR')} caracteres.`);
      setAppState('error');
      return;
    }

    isSubmittingRef.current = true;
    setAppState('loading');
    setErrorMessage('');
    setResult(null);

    let attempt = 0;
    const maxRetries = 3;
    const baseDelayMs = 2000;

    try {
      while (attempt <= maxRetries) {
        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: trimmedCode }),
          });

          if (response.ok) {
            const data: AnalysisResult = await response.json();
            setResult(data);
            setAppState('success');
            return;
          }

          // Se der 429 Too Many Requests, aplica o Exponential Backoff
          if (response.status === 429) {
            if (attempt === maxRetries) {
              throw new Error('Limite de requisições excedido. Tente novamente em instantes.');
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

          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro desconhecido ao processar a análise.');

        } catch (error: any) {
          if (attempt >= maxRetries || error.message.includes('limite') || error.message.includes('caracteres') || error.message.includes('Java') || error.message.includes('comentários') || error.message.includes('spam')) {
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
            Nossa IA avalia a adesão a Clean Code, boas práticas de POO, legibilidade, concisão e aponta bad smells com recomendações de refatoração.
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
