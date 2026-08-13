'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { CodeInput } from '@/components/CodeInput';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { AnalysisResult, ApplicationState } from '@/types';

export default function Home() {
  const [code, setCode] = useState('');
  const [appState, setAppState] = useState<ApplicationState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Lógica de atraso (sleep)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setAppState('loading');
    setErrorMessage('');
    setResult(null);

    let attempt = 0;
    const maxRetries = 3;
    const baseDelayMs = 2000; // Começa com 2 segundos

    while (attempt <= maxRetries) {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (response.ok) {
          const data: AnalysisResult = await response.json();
          setResult(data);
          setAppState('success');
          return; // Sucesso, sai do loop
        }

        // Se der 429 Too Many Requests, aplica o Exponential Backoff
        if (response.status === 429) {
          if (attempt === maxRetries) {
            throw new Error('Limite de tentativas excedido. Tente novamente mais tarde.');
          }
          
          attempt++;
          // Exponential Backoff: 2s, 4s, 8s
          const currentDelayMs = baseDelayMs * Math.pow(2, attempt - 1);
          const currentDelaySec = currentDelayMs / 1000;
          
          setAppState('retrying');
          setRetryCountdown(currentDelaySec);

          // Um pequeno loop para atualizar a contagem regressiva na UI
          for (let i = currentDelaySec; i > 0; i--) {
            setRetryCountdown(i);
            await delay(1000);
          }
          
          setAppState('loading'); // Volta para loading antes da nova tentativa
          continue; // Tenta de novo
        }

        // Se for outro erro (500, 400), não tenta de novo, lança o erro
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao processar.');

      } catch (error: any) {
        if (attempt >= maxRetries || error.message.includes('limite')) {
          setErrorMessage(error.message || 'Ocorreu um erro ao tentar se conectar ao servidor.');
          setAppState('error');
          return;
        }
        
        // Se for erro de rede (fetch failed), também tenta de novo com backoff
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
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-100">Cole seu código</h2>
          <p className="text-zinc-400">Nossa IA analisará a qualidade e sugerirá melhorias focadas em Clean Code.</p>
        </div>

        <div className="flex flex-col gap-6 bg-zinc-900/50 p-6 border border-zinc-800 rounded-2xl">
          <CodeInput 
            value={code}
            onChange={setCode}
            disabled={appState === 'loading' || appState === 'retrying'}
          />
          
          <AnalyzeButton 
            onClick={handleAnalyze}
            disabled={!code.trim() || appState === 'loading' || appState === 'retrying'}
            state={appState}
            retrySeconds={retryCountdown}
          />

          {appState === 'error' && (
            <div className="bg-red-950/50 border border-red-900/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span className="font-semibold">Erro:</span> {errorMessage}
            </div>
          )}
        </div>

        {appState === 'success' && result && (
          <ResultsDisplay result={result} />
        )}

      </main>
    </div>
  );
}
