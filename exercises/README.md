# Como Adicionar Novos Exercícios de Java ☕

Para criar um novo exercício, basta criar uma nova pasta dentro de `exercises/` seguindo o padrão de numeração (ex: `06-meu-novo-exercicio/`) contendo exatamente 3 arquivos:

## Estrutura da Pasta:
```text
exercises/
  └── 06-meu-novo-exercicio/
      ├── info.json       <- Metadados e objetivos do exercício
      ├── Dirty.java      <- Código Java com bad smells (enviado ao aluno)
      └── Clean.java      <- Código Java limpo de referência (SECRETO - só o backend lê)
```

---

### 1. `info.json`
Contém o título, categoria, dificuldade e lista de objetivos:
```json
{
  "id": "06-meu-novo-exercicio",
  "title": "6. Título do Desafio",
  "category": "POO / Clean Code",
  "difficulty": "Iniciante",
  "description": "Explicação do que está errado e qual o objetivo da refatoração.",
  "objectives": [
    "Primeiro objetivo específico.",
    "Segundo objetivo específico."
  ]
}
```

*Dificuldades aceitas*: `"Iniciante"`, `"Intermediário"`, `"Avançado"`, `"Desafio"`.

---

### 2. `Dirty.java`
Cole aqui o código Java original com os problemas de Clean Code para o aluno refatorar. Este código será carregado automaticamente no editor do front-end.

---

### 3. `Clean.java`
Cole aqui a versão corrigida e ideal do código.
> 🔒 **Segurança**: Este arquivo **NUNCA** é enviado ao front-end ou exposto no navegador. Ele é lido exclusivamente pelo servidor para orientar a inteligência artificial na correção sem exigir over-engineering.

---

Pronto! Ao salvar os arquivos na nova pasta, o sistema detecta e exibe o exercício automaticamente sem precisar alterar nenhuma linha de código em TypeScript.
