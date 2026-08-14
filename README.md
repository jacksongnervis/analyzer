# Java Clean Code Analyzer

Uma aplicação web moderna para analisar código Java com base nas boas práticas de **Clean Code**, princípios de Programação Orientada a Objetos (POO), legibilidade e detecção de *code smells*, fornecendo sugestões práticas de refatoração usando Inteligência Artificial (Groq / Llama 3.3).

---

## 🚀 Funcionalidades

- **Análise Inteligente**: Avaliação de pontuação de Clean Code (0 a 10), lista de problemas encontrados e a dica principal de melhoria.
- **Validação e Heurística**: Verificação de sintaxe Java e filtros antes do envio para economizar tempo e evitar requisições desnecessárias.
- **Editor com Destaque de Sintaxe**: Suporte a numeração de linhas, realce de código Java e modo expandido.
- **Tema Claro / Escuro**: Interface adaptável com alternância de tema.
- **Sistema de Cache**: Respostas rápidas para análises de códigos já processados.

---

## 🛠️ Tecnologias Utilizadas

- **[Next.js](https://nextjs.org/)** (App Router)
- **[React](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS](https://tailwindcss.com/)**
- **[Groq SDK](https://groq.com/)** (Modelo LLaMA 3.3 70B)
- **[PrismJS](https://prismjs.com/)** (Syntax Highlighting)
- **[Lucide React](https://lucide.dev/)** (Ícones)

---

## 📦 Como Executar o Projeto

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou outro gerenciador de pacotes

### 2. Instalação
Clone o repositório e instale as dependências:

```bash
git clone <url-do-repositorio>
cd analyzer
npm install
```

### 3. Configuração de Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base):

```env
GROQ_API_KEY=sua_chave_da_groq_aqui
```

> Obtenha sua chave gratuita no portal da [Groq Console](https://console.groq.com/).

### 4. Executando a Aplicação
Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📄 Licença

Este projeto está sob a licença MIT.
