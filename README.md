<div align="center">
  <img src="public/java.svg" alt="Java Logo" width="80" height="80" />
  <h1>Java Clean Code Analyzer</h1>
  <p>Aplicação web para avaliação pedagógica de Clean Code e boas práticas em Java com Inteligência Artificial.</p>

  <p>
    <img src="https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white" alt="Java" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Groq_Cloud-F55036?style=flat-square&logo=groq&logoColor=white" alt="Groq" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" />
  </p>
</div>

---

## Sobre o Projeto

Uma aplicação web moderna e interativa desenvolvida para apoiar atividades práticas sobre **Clean Code** e boas práticas em Java. O sistema avalia códigos enviados por alunos ou desenvolvedores com base em legibilidade, manutenibilidade, responsabilidade única (SRP) e detecção de *code smells*, fornecendo pontuação didática (0 a 10), lista de problemas e dicas práticas de refatoração usando Inteligência Artificial de alta velocidade (Groq Cloud).

---

## Funcionalidades

- **Avaliação Pedagógica com IA**:
  - Pontuação de Clean Code de 0 a 10 com feedback visual imediato.
  - Identificação precisa de *bad smells* (nomenclatura confusa, funções longas, números mágicos, aninhamento profundo, duplicação, etc.).
  - Dica principal de refatoração do instrutor personalizada para cada código.
  - Efeito comemorativo de confetes para notas de excelência (9 e 10).

- **Validação Sintática com Parser Java (`java-parser`)**:
  - Utiliza o motor AST oficial do Java para validar o código antes de acionar a IA.
  - Suporta classes completas, métodos isolados e blocos de comandos com lógica real.
  - **Inspeção Semântica da CST**: Bloqueia cascas vazias, classes sem lógica ou meras declarações de imports/campos para evitar desperdício de tokens.

- **Exercícios Práticos Guiados**:
  - Lista de desafios graduais divididos por níveis de dificuldade: **Iniciante**, **Intermediário**, **Avançado** e **Desafio ("O Chefão")**.
  - Comparação contextual com gabaritos de referência do professor em cada exercício.
  - **Modo Livre** para testar qualquer trecho de código Java autoral.

- **Editor de Código com Recursos Avançados**:
  - Destaque de sintaxe (Syntax Highlighting) com PrismJS.
  - Numeração dinâmica de linhas e suporte a indentação automática com tecla `Tab`.
  - Modo Expandido / Modal em tela cheia para edição confortável.
  - Ações rápidas: **Copiar**, **Limpar** e **Restaurar Código Inicial**.

- **Persistência Automática (Local Storage)**:
  - Salva rascunhos em tempo real individualmente por exercício e no modo livre (o código permanece intacto após recarregar a página ou dar F5).
  - Memorização do tema visual escolhido.

- **Proteção e Alta Disponibilidade**:
  - **Load Balancer com Round-Robin e Failover**: Distribui requisições automaticamente entre múltiplas chaves da API Groq configuradas no `.env`.
  - **Cooldown Anti-Spam de 60s**: Contador regressivo visível diretamente no botão de análise com persistência contra F5.
  - **Sistema de Cache SHA-256**: Respostas instantâneas para códigos e exercícios previamente analisados.

- **Design e Acessibilidade**:
  - Temas **Escuro (Dark Mode)** e **Claro (Light Mode)** com transições suaves.
  - Favicon transparente do Instituto Federal e micro-interações elegantes.
  - Aviso de transparência sobre uso de Inteligência Artificial.

---

## Tecnologias

- **[Java](https://www.oracle.com/java/)** (Linguagem foco das análises)
- **[Next.js](https://nextjs.org/)** (App Router & Turbopack)
- **[React](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS](https://tailwindcss.com/)**
- **[java-parser](https://www.npmjs.com/package/java-parser)** (Parser e CST Java)
- **[Groq SDK](https://groq.com/)** (Modelo `openai/gpt-oss-120b`)
- **[PrismJS](https://prismjs.com/)** (Syntax Highlighting)
- **[Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)** (Efeitos visuais)
- **[Lucide React](https://lucide.dev/)** (Ícones)

---

## Como Executar o Projeto

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

### 2. Instalação
Clone o repositório e instale as dependências:

```bash
git clone https://github.com/jacksongnervis/analyzer.git
cd analyzer
npm install
```

### 3. Configuração de Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Você pode informar uma única chave ou múltiplas chaves separadas por vírgula para o Load Balancer
GROQ_API_KEYS=gsk_chave1,gsk_chave2,gsk_chave3
```

> Obtenha suas chaves de API gratuitamente no console da [Groq Cloud](https://console.groq.com/).

### 4. Execução em Desenvolvimento
Inicie o servidor local:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### 5. Build de Produção
Para gerar a versão otimizada de produção:

```bash
npm run build
npm run start
```

---

## Estrutura do Projeto

```text
├── exercises/                  # Definição dos exercícios guiados e gabaritos
│   └── exercises.json
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/        # Endpoint de análise com Rate Limiter e Cache
│   │   │   └── exercises/      # Endpoint que expõe os exercícios públicos
│   │   ├── globals.css         # Estilizações globais e temas
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página principal da aplicação
│   ├── components/
│   │   ├── AnalyzeButton.tsx   # Botão de análise com temporizador de cooldown
│   │   ├── CodeInput.tsx       # Editor de código com Syntax Highlight e modal
│   │   ├── ExerciseSelector.tsx# Seletor de desafios com badges de dificuldade
│   │   ├── Header.tsx          # Cabeçalho com transições e alternância de tema
│   │   └── ResultsDisplay.tsx  # Exibição pedagógica da nota, dicas e smells
│   ├── lib/
│   │   ├── cache.ts            # Gerenciamento de cache em memória (SHA-256)
│   │   ├── exercisesServer.ts  # Leitura e resolução segura dos exercícios
│   │   ├── groqPool.ts         # Pool de clientes Groq, Round-Robin e Failover
│   │   ├── heuristics.ts       # Validação sintática Java via java-parser CST
│   │   ├── rateLimit.ts        # Controle de cooldown por IP
│   │   └── sanitizer.ts        # Sanitização e normalização de código
│   ├── prompts/
│   │   └── analyzerPrompt.ts   # Prompt pedagógico calibrado para Clean Code
│   └── types/
│       └── index.ts            # Tipagens globais em TypeScript
```

---

## Equipe e Criadores

Projeto desenvolvido para a oficina prática sobre **Clean Code em Java** pelos alunos de **Tecnologia em Análise e Desenvolvimento de Sistemas (TADS - Turma 4A)**:

- **Felipe Homem Martins** · [LinkedIn](https://www.linkedin.com/in/felipe-h-martins/)
- **Jackson Gonçalves Nervis** · [LinkedIn](https://www.linkedin.com/in/jacksongnervis/)
- **Nathan de Souza Doile** · [LinkedIn](https://www.linkedin.com/in/nathan-doile/)
- **Ricardo Bitencourt da Silva** · [LinkedIn](https://www.linkedin.com/in/ricardobit/)

---

## Licença

Este projeto está sob a licença [MIT](LICENSE).
