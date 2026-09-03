/**
 * SCRIPT DE TESTE DE CARGA (LOAD TEST) - CLEAN CODE ANALYZER
 *
 * Simula uma turma de até 50 alunos submetendo códigos simultaneamente para o endpoint /api/analyze.
 * Testa:
 * - Semáforo de concorrência e fila em memória
 * - Throughput da API (Groq / OpenRouter DeepSeek)
 * - Rate limiting por sessão e proteção anti-burst
 * - Sistema de Cache SHA-256
 * - Métricas de latência: Mínima, Média, Mediana (p50), p90, Máxima
 *
 * Como rodar:
 * npx tsx scripts/loadTest.ts
 */

// Permite passar a URL por argumento de linha de comando ou variável TARGET_URL
const argUrl = process.argv.find(arg => arg.startsWith('http://') || arg.startsWith('https://'));
let rawTarget = process.env.TARGET_URL || argUrl || 'http://localhost:3000/api/analyze';
if (!rawTarget.includes('/api/analyze')) {
  rawTarget = rawTarget.replace(/\/$/, '') + '/api/analyze';
}
const TARGET_URL = rawTarget;

const TOTAL_REQUESTS = 50;
const CONCURRENCY_BURST = 50; // Dispara as 50 requisições simultaneamente

interface RequestResult {
  index: number;
  status: number;
  durationMs: number;
  isCacheHit: boolean;
  score?: number;
  error?: string;
}

const sampleCodes = [
  // Variação 1: Exercício Nomes Significativos
  (id: number) => `
import java.util.Scanner;
public class Aluno${id} {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int x = s.nextInt(); // id: ${id}
        int y = s.nextInt();
        System.out.println("Resultado: " + (x + y));
    }
}`,
  // Variação 2: Código refatorado com nomes melhores
  (id: number) => `
import java.util.Scanner;
public class CalculadoraSoma${id} {
    public static void main(String[] args) {
        Scanner leitor = new Scanner(System.in);
        // Aluno ${id}
        int primeiroNumero = leitor.nextInt();
        int segundoNumero = leitor.nextInt();
        int resultadoSoma = primeiroNumero + segundoNumero;
        System.out.println("Resultado: " + resultadoSoma);
    }
}`,
  // Variação 3: Validação com ifs aninhados
  (id: number) => `
public class Validador${id} {
    public static boolean validarIdade(int idade) {
        // Submissao ${id}
        if (idade >= 0) {
            if (idade < 18) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }
}`,
];

async function sendSubmission(index: number): Promise<RequestResult> {
  const start = Date.now();

  // Simula alunos diferentes na mesma rede (IPs locais diferentes, sessões únicas)
  const studentIp = `192.168.1.${10 + (index % 25)}`;
  const sessionId = `aluno_test_sess_${index}_${Math.random().toString(36).substring(2, 8)}`;
  const codeGenerator = sampleCodes[index % sampleCodes.length];
  const code = codeGenerator(index);

  try {
    const response = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': studentIp,
        'x-client-session-id': sessionId,
      },
      body: JSON.stringify({
        code,
        exerciseId: 'free-mode',
      }),
    });

    const durationMs = Date.now() - start;
    const isCacheHit = response.headers.get('X-Cache') === 'HIT';

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        index,
        status: response.status,
        durationMs,
        isCacheHit: false,
        error: errText.slice(0, 100),
      };
    }

    const data = await response.json().catch(() => null);
    return {
      index,
      status: response.status,
      durationMs,
      isCacheHit,
      score: data?.pontuacao,
    };
  } catch (err: any) {
    return {
      index,
      status: 0,
      durationMs: Date.now() - start,
      isCacheHit: false,
      error: err.message,
    };
  }
}

function calculatePercentile(numbers: number[], percentile: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function runLoadTest() {
  console.log(`================================================================`);
  console.log(`🚀 INICIANDO TESTE DE CARGA: ${TOTAL_REQUESTS} REQUISIÇÕES CONCORRENTES`);
  console.log(`🎯 Destino: ${TARGET_URL}`);
  console.log(`================================================================\n`);

  // Verifica se o servidor está de pé (local ou na Vercel)
  try {
    await fetch(TARGET_URL.replace('/api/analyze', '/api/exercises'));
  } catch {
    console.error(`❌ ERRO: Não foi possível conectar ao servidor em ${TARGET_URL}.`);
    console.error(`Verifique se a URL da Vercel está correta ou se o 'npm run dev' está rodando.\n`);
    process.exit(1);
  }

  const startTime = Date.now();
  const promises: Promise<RequestResult>[] = [];

  console.log(`[${new Date().toLocaleTimeString()}] Disparando ${TOTAL_REQUESTS} submissões em lote...`);

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    promises.push(
      sendSubmission(i).then(res => {
        const icon = res.status === 200 ? (res.isCacheHit ? '⚡' : '✅') : '❌';
        const info = res.status === 200
          ? `Status: 200 | Nota: ${res.score}/10 ${res.isCacheHit ? '[CACHE]' : '[AI]'}`
          : `Status: ${res.status} | Erro: ${res.error}`;
        console.log(` ${icon} [Req #${String(res.index).padStart(2, '0')}] ${(res.durationMs / 1000).toFixed(2)}s | ${info}`);
        return res;
      })
    );
  }

  const results = await Promise.all(promises);
  const totalElapsedMs = Date.now() - startTime;

  // Análise estatística
  const successful = results.filter(r => r.status === 200);
  const failed = results.filter(r => r.status !== 200);
  const cacheHits = results.filter(r => r.isCacheHit);
  const aiProcessed = successful.filter(r => !r.isCacheHit);

  const latencies = results.map(r => r.durationMs);
  const aiLatencies = aiProcessed.map(r => r.durationMs);

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const p50 = calculatePercentile(latencies, 50);
  const p90 = calculatePercentile(latencies, 90);
  const p99 = calculatePercentile(latencies, 99);

  const throughputRps = (TOTAL_REQUESTS / (totalElapsedMs / 1000)).toFixed(2);

  console.log(`\n================================================================`);
  console.log(`📊 RELATÓRIO DO TESTE DE CARGA (${TOTAL_REQUESTS} SUBMISSÕES)`);
  console.log(`================================================================`);
  console.log(`⏱️  Tempo total de execução : ${(totalElapsedMs / 1000).toFixed(2)} segundos`);
  console.log(`⚡ Vazão (Throughput)       : ${throughputRps} requisições/segundo`);
  console.log(`✅ Sucesso (200 OK)         : ${successful.length}/${TOTAL_REQUESTS} (${((successful.length / TOTAL_REQUESTS) * 100).toFixed(1)}%)`);
  console.log(`   - Processadas pela IA    : ${aiProcessed.length}`);
  console.log(`   - Atendidas pelo Cache   : ${cacheHits.length}`);
  console.log(`❌ Falhas / Erros           : ${failed.length}/${TOTAL_REQUESTS}`);

  if (failed.length > 0) {
    console.log(`\n⚠️  Detalhes das falhas:`);
    const errorMap = new Map<string, number>();
    for (const f of failed) {
      const key = `HTTP ${f.status}: ${f.error || 'Desconhecido'}`;
      errorMap.set(key, (errorMap.get(key) || 0) + 1);
    }
    for (const [err, count] of errorMap.entries()) {
      console.log(`   - ${count}x -> ${err}`);
    }
  }

  console.log(`\n📈 Métricas de Latência (Tempo de Resposta do Aluno):`);
  console.log(`   - Mínima   : ${(minLatency / 1000).toFixed(2)}s`);
  console.log(`   - Média    : ${(avgLatency / 1000).toFixed(2)}s`);
  console.log(`   - Mediana  (p50): ${(p50 / 1000).toFixed(2)}s`);
  console.log(`   - 90% (p90): ${(p90 / 1000).toFixed(2)}s`);
  console.log(`   - Máxima   (p99): ${(maxLatency / 1000).toFixed(2)}s`);
  console.log(`================================================================\n`);
}

runLoadTest();
