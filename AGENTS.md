<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ☕ Java Clean Code Analyzer — Diretrizes para Agentes de IA

Documento de referência técnica, arquitetura, padrões de código e diretrizes de desenvolvimento para agentes de IA e desenvolvedores que atuam no repositório.

---

## 1. Visão Geral do Projeto

O **Java Clean Code Analyzer** é uma aplicação web educacional e interativa criada para apoiar oficinas práticas sobre **Clean Code** e boas práticas em Java (destinada a estudantes do curso Técnico em Desenvolvimento de Sistemas / TADS).

### Objetivos Principais:
1. Avaliar trechos de código Java (autorais ou de exercícios guiados) em tempo real com base em **7 pilares essenciais de Clean Code**.
2. Oferecer feedback pedagógico instantâneo: **Nota (0 a 10)**, **Lista de Bad Smells encontrados** e uma **Dica Principal de Refatoração** geradas pelo modelo LLM (`openai/gpt-oss-120b` via Groq Cloud).
3. Proteger a infraestrutura contra abusos e falhas através de validação estática de CST Java (`java-parser`), detecção de spam/similaridade, sanitização de caracteres, cache SHA-256 e Load Balancer com Round-Robin e failover automático entre chaves da API Groq.
4. Manter o gabarito dos exercícios (`Clean.java`) **estritamente confidencial** no servidor.

---

## 2. Stack Tecnológica

| Camada / Função | Tecnologia / Biblioteca | Versão / Detalhes |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js](https://nextjs.org/) (App Router, Turbopack) | `16.3.1` |
| **UI Library** | [React](https://react.dev/) / React DOM | `19.2.8` |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) | `^5.0.0` (Strict Mode) |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) v4 | `@tailwindcss/postcss ^4` |
| **Java CST Parser** | [`java-parser`](https://www.npmjs.com/package/java-parser) | `^3.0.1` |
| **LLM Provider** | [`groq-sdk`](https://groq.com/) | `^1.5.0` (`openai/gpt-oss-120b`) |
| **Syntax Highlighting** | [`prismjs`](https://prismjs.com/) | `^1.30.0` (Dracula & Light themes) |
| **Efeitos Visuais** | [`canvas-confetti`](https://www.npmjs.com/package/canvas-confetti) | `^1.9.4` |
| **Ícones** | [`lucide-react`](https://lucide.dev/) | `^1.31.0` |

---

## 3. Estrutura do Repositório

```text
├── .env.example                # Exemplo de configuração das chaves da API Groq
├── exercises/                  # Exercícios guiados (carregamento dinâmico pelo servidor)
│   ├── 01-nomes-significativos/
│   │   ├── info.json           # Metadados, categoria, dificuldade e objetivos
│   │   ├── Dirty.java          # Código inicial com bad smells (enviado ao aluno)
│   │   └── Clean.java          # Gabarito de referência (CONFIDENCIAL - apenas servidor)
│   ├── 02-encapsulamento-polimorfismo/
│   ├── 03-composicao-interfaces-solid/
│   ├── 04-tratamento-excecoes-dominio/
│   ├── 05-desafio-final-locadora/
│   └── README.md               # Guia para criação de novos exercícios
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/
│   │   │   │   └── route.ts    # Pipeline de análise: Rate Limit -> Heurística -> Cache -> Groq
│   │   │   └── exercises/
│   │   │       └── route.ts    # Endpoint público de exercícios (omite Clean.java)
│   │   ├── globals.css         # Import Tailwind v4, temas Prism e animações personalizadas
│   │   ├── layout.tsx          # Layout raiz com fontes Geist Sans/Mono e metadados
│   │   └── page.tsx            # Página principal, orquestração de estados e persistência
│   ├── components/
│   │   ├── AnalyzeButton.tsx   # Botão com suporte a cooldown, retentativas e spinner
│   │   ├── CodeInput.tsx       # Editor com Prism, gutter de linhas, auto-indent e modal tela cheia
│   │   ├── ExerciseSelector.tsx# Seletor de desafios com badges e objetivos expansíveis
│   │   ├── Header.tsx          # Cabeçalho com título gradiente e alternância de tema
│   │   └── ResultsDisplay.tsx  # Exibição pedagógica da nota, dica e problemas + confetes
│   ├── lib/
│   │   ├── cache.ts            # Cache LRU em memória com SHA-256 e TTL de 24h
│   │   ├── exercisesServer.ts  # Leitor do filesystem de /exercises (Node.js exclusivo)
│   │   ├── groqPool.ts         # Pool de chaves Groq, Round-Robin e Failover automático
│   │   ├── heuristics.ts       # Validador sintático e semântico de Java via java-parser CST
│   │   ├── rateLimit.ts        # Rate limiter em memória por IP (cooldown de 60s)
│   │   ├── sanitizer.ts        # Sanitização Unicode NFC, controle e anti-prompt injection
│   │   └── similarity.ts       # Comparação de similaridade de código via Sørensen-Dice
│   ├── prompts/
│   │   └── analyzerPrompt.ts   # System prompt calibrado pedagogicamente para Clean Code
│   └── types/
│       └── index.ts            # Interfaces TypeScript centrais (AnalysisResult, Exercise, etc.)
├── package.json
└── tsconfig.json
```

---

## 4. Pipeline de Análise e Fluxo de Dados

Ao submeter um código para análise, o fluxo de execução segue rigorosamente esta sequência:

```mermaid
graph TD
    A[Cliente: CodeInput] --> B[Validação Prévia no Frontend]
    B -->|Sanitização & Heurística Java| C[POST /api/analyze]
    C --> D[1. Rate Limiting por IP (60s)]
    D --> E[2. Sanitização do Código (Unicode NFC, Strip chars)]
    E --> F[3. Validação de Tamanho (10 a 5.000 chars)]
    F --> G[4. Parser CST Java (java-parser) & Anti-Spam]
    G --> H{Exercício Guiado?}
    H -->|Sim| I[5. Checagem de Similaridade com Código Inicial]
    H -->|Não / Passou| J[6. Consulta ao Cache SHA-256]
    I -->|Código idêntico| ERR1[Erro: Código não refatorado]
    J -->|Hit| K[Retorna Resposta em Cache]
    J -->|Miss| L[7. Injeção de Gabarito de Referência (se exercício)]
    L --> M[8. Groq Load Balancer (Round-Robin + Failover)]
    M --> N[9. Validação do JSON retornado]
    N --> O[10. Armazena no Cache e Retorna 200 OK]
```

### Regras de Segurança Críticas do Pipeline:
1. **Confidencialidade de Gabaritos**: O arquivo `Clean.java` **NUNCA** pode ser importado ou retornado por rotas públicas de API (como `/api/exercises`). Ele é lido exclusivamente em `src/lib/exercisesServer.ts` e injetado como texto no prompt de comparação da rota `/api/analyze`.
2. **Proteção Anti-Prompt Injection**: O prompt (`CLEAN_CODE_ANALYZER_PROMPT`) encapsula o código do aluno entre tags `<codigo_do_aluno_para_analise>` e impõe regras inegociáveis de tratamento puramente estático do input.
3. **Bloqueio de Cascas Vazias**: `src/lib/heuristics.ts` usa o parser oficial `java-parser` para verificar a existência de `blockStatement`. Classes vazias, meros imports ou assinaturas sem corpo são rejeitados antes de consumir tokens do LLM.

---

## 5. Calibração Pedagógica da Avaliação (Clean Code)

O sistema foi calibrado com base no conteúdo ministrado na oficina. Ao alterar prompts ou lógicas de validação, **respeite estritamente o escopo**:

### ✅ O que ENTRA na avaliação (Os 7 Pilares):
1. **Nomenclatura**: Nomes significativos e expressivos para classes, métodos e variáveis; respeito às convenções Java (`camelCase`, `PascalCase`, `UPPER_SNAKE_CASE`); ausência de abreviações confusas ou variáveis de uma única letra (`x`, `d`, `temp`).
2. **Responsabilidade Única (SRP)**: Métodos que realizam uma única tarefa bem definida sem misturar validação, cálculo, IO ou persistência.
3. **Comentários Problemáticos**: Comentários redundantes, código morto/comentado ou desatualizado. (A ausência de comentários é encorajada para código autoexplicativo).
4. **Duplicação de Código (DRY)**: Extração de lógica duplicada em métodos auxiliares.
5. **Aninhamento Profundo**: Uso de *Guard Clauses* (retornos antecipados) para evitar escadas de `if/else`.
6. **Números Mágicos**: Substituição de literais literais soltos por constantes nomeadas (`final static`).
7. **God Class**: Classes sobrecarregadas de responsabilidades não correlatas.

### ❌ O que NÃO deve ser penalizado ou cobrado:
- Hierarquias complexas de exceções ou `try/catch` customizados.
- Testes unitários (JUnit, Mockito, TDD).
- Imutabilidade avançada, Records ou Value Objects.
- Design Patterns avançados além de SRP básico.
- JavaDoc obrigatório ou arquitetura em camadas corporativa.

### 🎯 Diretriz de Pontuação:
- **Nota 10**: Deve ser concedida sem hesitação se o código respeitar os 7 pilares acima ou cumprir os objetivos do exercício com boas práticas equivalentes ao gabarito, mesmo que faltem testes ou padrões não ensinados.
- **Dica Principal**: Toda resposta contém uma dica construtiva. **A presença de dica não retira pontos**.

---

## 6. Sistema de Exercícios (`/exercises`)

Para adicionar ou modificar exercícios, basta manipular o sistema de arquivos em `exercises/XX-slug/` sem alterar código TypeScript:

| Arquivo | Descrição |
| :--- | :--- |
| `info.json` | Contém `id`, `title`, `category`, `difficulty` (`"Iniciante"` \| `"Intermediário"` \| `"Avançado"` \| `"Desafio"`), `description` e `objectives` (array de strings). |
| `Dirty.java` | Código Java contendo os problemas/smells a serem refatorados pelo aluno. |
| `Clean.java` | Solução limpa de referência usada internamente pela IA como gabarito. |

---

## 7. Convenções e Padrões de Código

### TypeScript & React
- Utilize **TypeScript Estrito** (`strict: true`). Declare tipos explícitos para props e retornos de funções.
- Tipagens globais e compartilhadas residem em `src/types/index.ts`.
- Componentes cliente devem declarar `'use client';` no topo.
- Use `Readonly<Props>` na declaração das propriedades dos componentes.
- Prefira componentes funcionais com hooks nativos (`useState`, `useRef`, `useCallback`, `useMemo`, `useEffect`).

### Estilização e Temas (Tailwind v4)
- A aplicação possui suporte a **Dark Mode** (`theme === 'dark'`) e **Light Mode** (`theme === 'light'`).
- Mantenha classes dinâmicas legíveis utilizando a condicional `isDark ? '...' : '...'`.
- Mantenha a paleta de cores consistente:
  - Dark: Fundos em `zinc-900`/`zinc-950`, bordas `zinc-800`, textos `zinc-100`/`zinc-400`, destaques `emerald-400`/`amber-400`.
  - Light: Fundos em `white`/`slate-50`, bordas `slate-200`/`slate-300`, textos `slate-900`/`slate-600`, destaques `emerald-600`/`amber-500`.

### Resiliência e Load Balancing da IA
- Toda chamada à API do Groq deve passar obrigatoriamente por `runLoadBalancedAnalysis` em `src/lib/groqPool.ts`.
- Múltiplas chaves podem ser passadas via `.env` em `GROQ_API_KEYS="chave1,chave2,chave3"` para suportar simultaneidade durante oficinas.

---

## 8. Comandos Úteis

```bash
# Instalação de dependências
npm install

# Executar servidor de desenvolvimento (Turbopack)
npm run dev

# Validação estática com ESLint
npm run lint

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start
```
