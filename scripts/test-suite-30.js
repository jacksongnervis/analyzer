/**
 * BATERIA DE TESTES AUTOMATIZADOS - CLEAN CODE ANALYZER (32 TESTES)
 *
 * Abrange:
 * 1. Bloqueios Rápidos Pré-IA (1ª e 3ª Camadas - HTTP 400 em ~15ms)
 * 2. Validações de Sintaxe e Spam (HTTP 400)
 * 3. Avaliações Reais com a IA cobrindo todas as faixas de nota:
 *    - Nota 0: Esvaziamento semântico / Fuga de domínio
 *    - Nota 2 a 4: Bad smells severos mantidos
 *    - Nota 5 a 7: Parcialmente refatorado
 *    - Nota 8 a 9: Quase perfeito
 *    - Nota 10: Código limpo exemplar (Gabaritos)
 *
 * Como rodar:
 *   node scripts/test-suite-30.js
 *   ou npm run test:suite
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000/api/analyze';

// Carrega os arquivos de referência da pasta exercises
const EXERCISES_DIR = path.join(__dirname, '../exercises');
const ex1Dirty = fs.readFileSync(path.join(EXERCISES_DIR, '01-nomes-significativos/Dirty.java'), 'utf8');
const ex1Clean = fs.readFileSync(path.join(EXERCISES_DIR, '01-nomes-significativos/Clean.java'), 'utf8');
const ex2Dirty = fs.readFileSync(path.join(EXERCISES_DIR, '02-encapsulamento-polimorfismo/Dirty.java'), 'utf8');
const ex2Clean = fs.readFileSync(path.join(EXERCISES_DIR, '02-encapsulamento-polimorfismo/Clean.java'), 'utf8');
const ex3Dirty = fs.readFileSync(path.join(EXERCISES_DIR, '03-composicao-interfaces-solid/Dirty.java'), 'utf8');
const ex5Dirty = fs.readFileSync(path.join(EXERCISES_DIR, '05-desafio-final-locadora/Dirty.java'), 'utf8');
const ex5Clean = fs.readFileSync(path.join(EXERCISES_DIR, '05-desafio-final-locadora/Clean05.java'), 'utf8');

const testCases = [
  // =========================================================================
  // TIER 1: BLOQUEIOS PRÉ-IA (1ª E 3ª CAMADAS) - HTTP 400
  // =========================================================================
  {
    id: 1,
    tier: 'Bloqueio Pré-IA (1ª Camada)',
    name: 'Print simples isolado em Free Mode',
    exerciseId: 'free-mode',
    expectedStatus: 400,
    expectedErrorSubstring: 'apenas impressões simples',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Olá mundo sem lógica");
    }
}`
  },
  {
    id: 2,
    tier: 'Bloqueio Pré-IA (1ª Camada)',
    name: 'Múltiplos prints sem lógica no Exercício 1',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 400,
    expectedErrorSubstring: 'apenas impressões simples',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Aluno aprovado!");
        System.out.println("Nota 10");
        System.out.println("Fim");
    }
}`
  },
  {
    id: 3,
    tier: 'Bloqueio Pré-IA (1ª Camada)',
    name: 'Fragmento solto de System.out.print',
    exerciseId: 'free-mode',
    expectedStatus: 400,
    expectedErrorSubstring: 'apenas impressões simples',
    code: `System.out.println("Teste fragmento direto");`
  },
  {
    id: 4,
    tier: 'Bloqueio Pré-IA (1ª Camada)',
    name: 'Uso de System.out.printf sem lógica',
    exerciseId: '02-encapsulamento-polimorfismo',
    expectedStatus: 400,
    expectedErrorSubstring: 'apenas impressões simples',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.printf("Bônus: %.2f%n", 1500.0);
    }
}`
  },
  {
    id: 5,
    tier: 'Bloqueio Pré-IA (3ª Camada)',
    name: 'Stub esvaziado (2 comandos) no Exercício 1',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 400,
    expectedErrorSubstring: 'excessivamente reduzido',
    code: `public class Clean {
    public static void main(String[] args) {
        int nota = 10;
        System.out.println(nota);
    }
}`
  },
  {
    id: 6,
    tier: 'Bloqueio Pré-IA (3ª Camada)',
    name: 'Stub esvaziado (2 comandos) no Exercício 2',
    exerciseId: '02-encapsulamento-polimorfismo',
    expectedStatus: 400,
    expectedErrorSubstring: 'excessivamente reduzido',
    code: `public class Clean {
    public static void main(String[] args) {
        double salario = 2000.0;
        System.out.println(salario);
    }
}`
  },
  {
    id: 7,
    tier: 'Bloqueio Pré-IA (3ª Camada)',
    name: 'Stub esvaziado (2 comandos) no Exercício 3',
    exerciseId: '03-composicao-interfaces-solid',
    expectedStatus: 400,
    expectedErrorSubstring: 'excessivamente reduzido',
    code: `public class Clean {
    public static void main(String[] args) {
        String cliente = "João";
        System.out.println(cliente);
    }
}`
  },
  {
    id: 8,
    tier: 'Bloqueio Pré-IA (3ª Camada)',
    name: 'Stub esvaziado (2 comandos) no Exercício 4',
    exerciseId: '04-tratamento-excecoes-dominio',
    expectedStatus: 400,
    expectedErrorSubstring: 'excessivamente reduzido',
    code: `public class Clean {
    public static void main(String[] args) {
        int dias = 5;
        System.out.println(dias);
    }
}`
  },
  {
    id: 9,
    tier: 'Bloqueio Pré-IA (3ª Camada)',
    name: 'Stub esvaziado (2 comandos) no Exercício 5',
    exerciseId: '05-desafio-final-locadora',
    expectedStatus: 400,
    expectedErrorSubstring: 'excessivamente reduzido',
    code: `public class Clean {
    public static void main(String[] args) {
        int idade = 20;
        System.out.println(idade);
    }
}`
  },
  {
    id: 10,
    tier: 'Bloqueio Anti-Cola (Similaridade)',
    name: 'Envio do código Dirty.java intacto no Ex 1',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 400,
    expectedErrorSubstring: 'praticamente idêntico ao código inicial',
    code: ex1Dirty
  },
  {
    id: 11,
    tier: 'Bloqueio Anti-Cola (Similaridade)',
    name: 'Envio do código Dirty.java intacto no Ex 2',
    exerciseId: '02-encapsulamento-polimorfismo',
    expectedStatus: 400,
    expectedErrorSubstring: 'praticamente idêntico ao código inicial',
    code: ex2Dirty
  },
  {
    id: 12,
    tier: 'Bloqueio Anti-Cola (Similaridade)',
    name: 'Envio do código Dirty.java intacto no Ex 3',
    exerciseId: '03-composicao-interfaces-solid',
    expectedStatus: 400,
    expectedErrorSubstring: 'praticamente idêntico ao código inicial',
    code: ex3Dirty
  },
  {
    id: 13,
    tier: 'Bloqueio Anti-Cola (Similaridade)',
    name: 'Envio do código Dirty.java intacto no Ex 5',
    exerciseId: '05-desafio-final-locadora',
    expectedStatus: 400,
    expectedErrorSubstring: 'praticamente idêntico ao código inicial',
    code: ex5Dirty
  },
  {
    id: 14,
    tier: 'Bloqueio de Sintaxe Inválida',
    name: 'Java corrompido (sem fechar chaves/parênteses)',
    exerciseId: 'free-mode',
    expectedStatus: 400,
    code: `public class Erro { public void test( { int a = 10; }`
  },
  {
    id: 15,
    tier: 'Bloqueio de Spam',
    name: 'Spam de caracteres repetidos',
    exerciseId: 'free-mode',
    expectedStatus: 400,
    code: `public class Spam { public static void main(String[] a) { String s = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; } }`
  },

  // =========================================================================
  // TIER 2: AVALIAÇÃO DA IA - NOTA 0 (ESVAZIAMENTO SEMÂNTICO / FUGA DE TEMA)
  // =========================================================================
  {
    id: 16,
    tier: 'IA - Nota 0 (Fuga de Domínio)',
    name: 'Ex 1: Loop de cálculo matemático avulso (sem diário de notas)',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 200,
    expectedScoreRange: [0, 1],
    expectedProblemSubstring: 'Lógica do exercício ausente',
    code: `public class CalculoAvulso {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        int c = a + b;
        for (int i = 0; i < 3; i++) {
            c += i;
        }
        System.out.println("Resultado: " + c);
    }
}`
  },
  {
    id: 17,
    tier: 'IA - Nota 0 (Fuga de Domínio)',
    name: 'Ex 2: Ordenação de vetor avulsa (sem funcionários e bônus)',
    exerciseId: '02-encapsulamento-polimorfismo',
    expectedStatus: 200,
    expectedScoreRange: [0, 1],
    expectedProblemSubstring: 'Lógica do exercício ausente',
    code: `public class OrdenadorNumerico {
    public static void main(String[] args) {
        int[] valores = {5, 2, 8, 1, 9};
        for (int i = 0; i < valores.length; i++) {
            for (int j = i + 1; j < valores.length; j++) {
                if (valores[i] > valores[j]) {
                    int aux = valores[i];
                    valores[i] = valores[j];
                    valores[j] = aux;
                }
            }
        }
        System.out.println("Ordenado com sucesso");
    }
}`
  },
  {
    id: 18,
    tier: 'IA - Nota 0 (Fuga de Domínio)',
    name: 'Ex 5: Conversor de temperatura (sem locadora de veículos)',
    exerciseId: '05-desafio-final-locadora',
    expectedStatus: 200,
    expectedScoreRange: [0, 1],
    expectedProblemSubstring: 'Lógica do exercício ausente',
    code: `public class ConversorTemperatura {
    public static void main(String[] args) {
        double celsius = 25.0;
        double fahrenheit = (celsius * 9.0 / 5.0) + 32.0;
        double kelvin = celsius + 273.15;
        if (celsius > 30) {
            System.out.println("Clima quente");
        } else {
            System.out.println("Clima ameno");
        }
        System.out.println("F: " + fahrenheit + " | K: " + kelvin);
    }
}`
  },

  // =========================================================================
  // TIER 3: AVALIAÇÃO DA IA - NOTA 2 A 4 (BAD SMELLS SEVEROS MANTIDOS)
  // =========================================================================
  {
    id: 19,
    tier: 'IA - Nota Baixa (2 a 4)',
    name: 'Ex 1: Nomes de 1 letra, escada profunda e números mágicos',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 200,
    expectedScoreRange: [2, 4],
    code: `import java.util.Scanner;
public class ExercicioUm {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        System.out.print("N: "); String n = s.next();
        System.out.print("F: "); int f = s.nextInt();
        System.out.print("N1: "); double n1 = s.nextDouble();
        System.out.print("N2: "); double n2 = s.nextDouble();
        System.out.print("N3: "); double n3 = s.nextDouble();
        double res = (n1 + n2 + n3) / 3;
        if (f <= 15) {
            if (res >= 7.0) {
                System.out.println("Passou " + n);
            } else {
                if (res >= 5.0) {
                    double n4 = s.nextDouble();
                    double res2 = (res + n4) / 2;
                    if (res2 >= 6.0) {
                        System.out.println("Rec ok");
                    } else {
                        System.out.println("Rec fail");
                    }
                } else {
                    System.out.println("Reprovado nota");
                }
            }
        } else {
            System.out.println("Reprovado falta");
        }
        s.close();
    }
}`
  },
  {
    id: 20,
    tier: 'IA - Nota Baixa (2 a 4)',
    name: 'Ex 2: Vetores paralelos, variáveis encurtadas e ifs de negócio no main',
    exerciseId: '02-encapsulamento-polimorfismo',
    expectedStatus: 200,
    expectedScoreRange: [2, 4],
    code: `import java.util.Scanner;
public class SistemaBonus {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        String[] n = new String[10];
        double[] sal = new double[10];
        int[] t = new int[10];
        int c = 1;
        n[0] = "Carlos"; sal[0] = 5000.0; t[0] = 1;
        for(int i = 0; i < c; i++) {
            double b = 0;
            if(t[i] == 1) {
                b = (sal[i] * 0.2) + 1000;
            } else if(t[i] == 2) {
                b = sal[i] * 0.1;
            }
            System.out.println(n[i] + " bonus: " + b);
        }
        s.close();
    }
}`
  },
  {
    id: 21,
    tier: 'IA - Nota Baixa (2 a 4)',
    name: 'Ex 5: Arrow code, sem objetos e variáveis crípticas na locadora',
    exerciseId: '05-desafio-final-locadora',
    expectedStatus: 200,
    expectedScoreRange: [2, 4],
    code: `import java.util.Scanner;
public class LocadoraDirtyModificada {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        String n = "Pedro"; int i = 25; int t = 1; int d = 10;
        if (i >= 18) {
            if (d > 0) {
                double v = 0;
                if (t == 1) {
                    v = d * 100.0;
                    if (d > 7) v = v - (v * 0.10);
                } else if (t == 2) {
                    v = d * 50.0;
                    if (d > 5) v = v - (v * 0.05);
                }
                if (v > 0) {
                    System.out.println("Total: " + v);
                }
            }
        }
        s.close();
    }
}`
  },

  // =========================================================================
  // TIER 4: AVALIAÇÃO DA IA - NOTA MÉDIA (5 A 7 - PARCIALMENTE REFATORADOS)
  // =========================================================================
  {
    id: 22,
    tier: 'IA - Nota Média (5 a 8)',
    name: 'Ex 1: Nomes bons, mas números mágicos soltos e comentários óbvios',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 200,
    expectedScoreRange: [6, 8],
    code: `import java.util.Scanner;
public class AvaliacaoAlunoParcial {
    public static void main(String[] args) {
        Scanner entrada = new Scanner(System.in);
        System.out.print("Nome: ");
        String nomeAluno = entrada.next();
        System.out.print("Faltas: ");
        int faltas = entrada.nextInt();
        System.out.print("Notas: ");
        double nota1 = entrada.nextDouble();
        double nota2 = entrada.nextDouble();
        double nota3 = entrada.nextDouble();

        // calcula a media das notas
        double media = (nota1 + nota2 + nota3) / 3;

        // verifica se reprovou por falta
        if (faltas > 15) {
            System.out.println("Reprovado por faltas");
        } else if (media >= 7.0) {
            System.out.println("Aprovado direto com nota: " + media);
        } else if (media >= 5.0) {
            System.out.println("Em recuperacao");
            double notaExame = entrada.nextDouble();
            double mediaRecuperacao = (media + notaExame) / 2;
            if (mediaRecuperacao >= 6.0) {
                System.out.println("Aprovado rec");
            } else {
                System.out.println("Reprovado rec");
            }
        } else {
            System.out.println("Reprovado direto por nota");
        }
        entrada.close();
    }
}`
  },
  {
    id: 23,
    tier: 'IA - Nota Média (5 a 8)',
    name: 'Ex 2: Criou classe Funcionario, mas manteve if/else de bônus no main',
    exerciseId: '02-encapsulamento-polimorfismo',
    expectedStatus: 200,
    expectedScoreRange: [5, 7],
    code: `import java.util.ArrayList;
import java.util.List;

class FuncionarioItem {
    private String nome;
    private double salario;
    private int tipoCargo; // 1-Gerente, 2-Dev

    public FuncionarioItem(String nome, double salario, int tipoCargo) {
        this.nome = nome;
        this.salario = salario;
        this.tipoCargo = tipoCargo;
    }
    public String getNome() { return nome; }
    public double getSalario() { return salario; }
    public int getTipoCargo() { return tipoCargo; }
}

public class GerenciadorFuncionariosParcial {
    public static void main(String[] args) {
        List<FuncionarioItem> lista = new ArrayList<>();
        lista.add(new FuncionarioItem("Maria", 6000.0, 1));
        lista.add(new FuncionarioItem("Lucas", 3500.0, 2));

        for (FuncionarioItem f : lista) {
            double bonus = 0;
            // Cálculo ainda acoplado a condicionais no método principal
            if (f.getTipoCargo() == 1) {
                bonus = (f.getSalario() * 0.20) + 1000.0;
            } else if (f.getTipoCargo() == 2) {
                bonus = f.getSalario() * 0.10;
            }
            System.out.println(f.getNome() + " receberá bônus de: R$ " + bonus);
        }
    }
}`
  },
  {
    id: 24,
    tier: 'IA - Nota Média (5 a 8)',
    name: 'Ex 3: Composição aplicada (Endereco/Cliente), mas manteve pagamento em if/else',
    exerciseId: '03-composicao-interfaces-solid',
    expectedStatus: 200,
    expectedScoreRange: [5, 8],
    code: `import java.util.Scanner;

class Endereco {
    private String rua;
    private String numero;

    public Endereco(String rua, String numero) {
        this.rua = rua;
        this.numero = numero;
    }
    public String getEnderecoCompleto() { return rua + ", " + numero; }
}

class Cliente {
    private String nome;
    private Endereco endereco;

    public Cliente(String nome, Endereco endereco) {
        this.nome = nome;
        this.endereco = endereco;
    }
    public String getNome() { return nome; }
    public Endereco getEndereco() { return endereco; }
}

public class ProcessadorVendasParcial {
    public static void main(String[] args) {
        Scanner entrada = new Scanner(System.in);
        System.out.print("Nome: "); String nome = entrada.nextLine();
        System.out.print("Rua: "); String rua = entrada.nextLine();
        System.out.print("Num: "); String numero = entrada.nextLine();
        System.out.print("Tipo: "); int tipoCliente = entrada.nextInt();
        System.out.print("Valor: "); double valor = entrada.nextDouble();
        System.out.print("Pagamento: "); int tipoPagamento = entrada.nextInt();

        Endereco endereco = new Endereco(rua, numero);
        Cliente cliente = new Cliente(nome, endereco);

        double desconto = 0;
        if (tipoCliente == 2) {
            desconto = valor * 0.10;
        } else if (tipoCliente == 3) {
            desconto = valor * 0.20;
        }

        double total = valor - desconto;
        System.out.println("Cliente: " + cliente.getNome() + " | End: " + cliente.getEndereco().getEnderecoCompleto());
        System.out.println("Total: " + total);

        if (tipoPagamento == 1) {
            System.out.println("PIX gerado: " + total);
        } else if (tipoPagamento == 2) {
            System.out.println("Cartão cobrado: " + total);
        }
        entrada.close();
    }
}`
  },
  {
    id: 25,
    tier: 'IA - Nota Média (5 a 8)',
    name: 'Modo Livre: Método God Method que mistura cálculo, validação e persistência fake',
    exerciseId: 'free-mode',
    expectedStatus: 200,
    expectedScoreRange: [4, 7],
    code: `public class GestorDeVendas {
    public static void main(String[] args) {
        processarTudo("Notebook", 3500.0, 3, "joao@email.com");
    }

    // Método faz coisa demais: validação, cálculo financeiro, regras de negócio e impressão misturados
    public static void processarTudo(String item, double preco, int parcelas, String email) {
        if (preco <= 0) {
            System.out.println("Erro: preco invalido");
            return;
        }
        if (parcelas <= 0 || parcelas > 12) {
            System.out.println("Erro: parcelamento invalido");
            return;
        }
        double juros = 0;
        if (parcelas > 1) {
            juros = preco * (parcelas * 0.02);
        }
        double total = preco + juros;
        double valorParcela = total / parcelas;
        
        // Simulação de regras misturadas de persistência e notificação
        System.out.println("Gravando pedido no banco de dados...");
        System.out.println("Enviando comprovante para " + email);
        System.out.println("Item: " + item + " | Total com juros: " + total + " em " + parcelas + "x de " + valorParcela);
    }
}`
  },

  // =========================================================================
  // TIER 5: AVALIAÇÃO DA IA - NOTA ALTA (8 A 10)
  // =========================================================================
  {
    id: 26,
    tier: 'IA - Nota Alta (8 a 10)',
    name: 'Ex 1: Nomes expressivos, constantes, guard clauses, quase 10',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 200,
    expectedScoreRange: [8, 10],
    code: `import java.util.Scanner;

public class DiarioEscolarRefatorado {
    private static final int LIMITE_MAXIMO_FALTAS = 15;
    private static final double MEDIA_MINIMA_APROVACAO = 7.0;
    private static final double MEDIA_MINIMA_RECUPERACAO = 5.0;
    private static final double MEDIA_APROVACAO_RECUPERACAO = 6.0;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Nome do estudante: ");
        String nomeEstudante = scanner.next();

        System.out.print("Quantidade de faltas: ");
        int totalFaltas = scanner.nextInt();

        System.out.print("Notas (1, 2 e 3): ");
        double primeiraNota = scanner.nextDouble();
        double segundaNota = scanner.nextDouble();
        double terceiraNota = scanner.nextDouble();

        double mediaSemestral = (primeiraNota + segundaNota + terceiraNota) / 3.0;

        // Comentário simples mantido
        if (totalFaltas > LIMITE_MAXIMO_FALTAS) {
            System.out.println("O estudante " + nomeEstudante + " foi reprovado por excesso de faltas.");
            scanner.close();
            return;
        }

        if (mediaSemestral >= MEDIA_MINIMA_APROVACAO) {
            System.out.println("O estudante " + nomeEstudante + " foi aprovado diretamente com média " + mediaSemestral);
            scanner.close();
            return;
        }

        if (mediaSemestral < MEDIA_MINIMA_RECUPERACAO) {
            System.out.println("O estudante " + nomeEstudante + " foi reprovado por rendimento insuficiente.");
            scanner.close();
            return;
        }

        System.out.println("Estudante em recuperação. Informe a nota do exame:");
        double notaExame = scanner.nextDouble();
        double mediaFinal = (mediaSemestral + notaExame) / 2.0;

        if (mediaFinal >= MEDIA_APROVACAO_RECUPERACAO) {
            System.out.println("Aprovado na recuperação! Média final: " + mediaFinal);
        } else {
            System.out.println("Reprovado na recuperação. Média final: " + mediaFinal);
        }

        scanner.close();
    }
}`
  },
  {
    id: 27,
    tier: 'IA - Nota Alta (8 a 10)',
    name: 'Ex 2: Polimorfismo e encapsulamento aplicados com clareza',
    exerciseId: '02-encapsulamento-polimorfismo',
    expectedStatus: 200,
    expectedScoreRange: [8, 10],
    code: `import java.util.ArrayList;
import java.util.List;

abstract class Colaborador {
    private final String nome;
    private final double salarioBase;

    public Colaborador(String nome, double salarioBase) {
        this.nome = nome;
        this.salarioBase = salarioBase;
    }
    public String getNome() { return nome; }
    public double getSalarioBase() { return salarioBase; }
    public abstract double calcularBonus();
}

class GerenteEmpresa extends Colaborador {
    private static final double PERCENTUAL_BONUS = 0.20;
    private static final double ADICIONAL_FIXO = 1000.0;

    public GerenteEmpresa(String nome, double salarioBase) {
        super(nome, salarioBase);
    }
    @Override
    public double calcularBonus() {
        return (getSalarioBase() * PERCENTUAL_BONUS) + ADICIONAL_FIXO;
    }
}

class DesenvolvedorEmpresa extends Colaborador {
    private static final double PERCENTUAL_BONUS = 0.10;

    public DesenvolvedorEmpresa(String nome, double salarioBase) {
        super(nome, salarioBase);
    }
    @Override
    public double calcularBonus() {
        return getSalarioBase() * PERCENTUAL_BONUS;
    }
}

public class FolhaPagamentoBonus {
    public static void main(String[] args) {
        List<Colaborador> colaboradores = new ArrayList<>();
        colaboradores.add(new GerenteEmpresa("Alice", 8000.0));
        colaboradores.add(new DesenvolvedorEmpresa("Bruno", 4500.0));

        for (Colaborador c : colaboradores) {
            System.out.println(c.getNome() + " | Bônus: R$ " + c.calcularBonus());
        }
    }
}`
  },
  {
    id: 28,
    tier: 'IA - Nota Alta (8 a 10)',
    name: 'Ex 3: Composição estrutural e estratégia de pagamento limpa',
    exerciseId: '03-composicao-interfaces-solid',
    expectedStatus: 200,
    expectedScoreRange: [8, 10],
    code: `interface MetodoPagamento {
    void processarPagamento(double valor);
}

class PagamentoPix implements MetodoPagamento {
    @Override
    public void processarPagamento(double valor) {
        System.out.println("Chave PIX gerada com sucesso para o valor: R$ " + valor);
    }
}

class PagamentoCartaoCredito implements MetodoPagamento {
    @Override
    public void processarPagamento(double valor) {
        System.out.println("Transação de cartão aprovada no valor de: R$ " + valor);
    }
}

class ClienteDados {
    private final String nome;
    public ClienteDados(String nome) { this.nome = nome; }
    public String getNome() { return nome; }
}

public class VendaComposicaoLimpa {
    public static void main(String[] args) {
        ClienteDados cliente = new ClienteDados("Roberto Silva");
        double valorCompra = 450.0;
        MetodoPagamento pagamento = new PagamentoPix();

        System.out.println("Cliente: " + cliente.getNome());
        pagamento.processarPagamento(valorCompra);
    }
}`
  },

  // =========================================================================
  // TIER 6: AVALIAÇÃO DA IA - NOTA 10 (SOLUÇÃO EXEMPLAR / CLEAN CODE)
  // =========================================================================
  {
    id: 29,
    tier: 'IA - Nota 10 (Gabarito / Clean Code)',
    name: 'Ex 1: Gabarito Oficial de Nomes Significativos (Clean.java)',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 200,
    expectedScoreRange: [10, 10],
    code: ex1Clean
  },
  {
    id: 30,
    tier: 'IA - Nota 10 (Gabarito / Clean Code)',
    name: 'Ex 2: Gabarito Oficial de Encapsulamento e Polimorfismo (Clean.java)',
    exerciseId: '02-encapsulamento-polimorfismo',
    expectedStatus: 200,
    expectedScoreRange: [10, 10],
    code: ex2Clean
  },
  {
    id: 31,
    tier: 'IA - Nota 10 (Gabarito / Clean Code)',
    name: 'Ex 5: Gabarito Oficial do Desafio da Locadora (Clean05.java)',
    exerciseId: '05-desafio-final-locadora',
    expectedStatus: 200,
    expectedScoreRange: [10, 10],
    code: ex5Clean
  },
  {
    id: 32,
    tier: 'IA - Nota 10 (Clean Code Alternativo)',
    name: 'Ex 1: Solução alternativa elegante de estudante nota 10',
    exerciseId: '01-nomes-significativos',
    expectedStatus: 200,
    expectedScoreRange: [10, 10],
    code: `import java.util.Scanner;

public class AvaliadorEstudantil {
    private static final int OPCAO_SAIR = 0;
    private static final int OPCAO_AVALIAR = 1;
    private static final int LIMITE_FALTAS = 15;
    private static final double NOTA_CORTE_APROVACAO = 7.0;
    private static final double NOTA_CORTE_RECUPERACAO = 5.0;
    private static final double NOTA_CORTE_FINAL = 6.0;

    public static void main(String[] args) {
        Scanner leitor = new Scanner(System.in);
        int opcao = OPCAO_AVALIAR;

        while (opcao != OPCAO_SAIR) {
            System.out.println("1 - Avaliar | 0 - Sair");
            opcao = leitor.nextInt();

            if (opcao != OPCAO_AVALIAR) {
                continue;
            }

            System.out.print("Nome do Aluno: ");
            String nomeAluno = leitor.next();

            System.out.print("Faltas: ");
            int totalFaltas = leitor.nextInt();

            System.out.print("Três notas: ");
            double nota1 = leitor.nextDouble();
            double nota2 = leitor.nextDouble();
            double nota3 = leitor.nextDouble();

            double mediaSemestral = (nota1 + nota2 + nota3) / 3.0;

            if (totalFaltas > LIMITE_FALTAS) {
                System.out.println("O aluno " + nomeAluno + " reprovou por excesso de faltas.");
                continue;
            }

            if (mediaSemestral >= NOTA_CORTE_APROVACAO) {
                System.out.println("O aluno " + nomeAluno + " passou direto com média " + mediaSemestral);
                continue;
            }

            if (mediaSemestral < NOTA_CORTE_RECUPERACAO) {
                System.out.println("O aluno " + nomeAluno + " reprovou direto por nota insuficiente.");
                continue;
            }

            System.out.print("Digite a nota do exame de recuperação: ");
            double notaRecuperacao = leitor.nextDouble();
            double mediaFinal = (mediaSemestral + notaRecuperacao) / 2.0;

            if (mediaFinal >= NOTA_CORTE_FINAL) {
                System.out.println("Aprovado na recuperação! Média final: " + mediaFinal);
            } else {
                System.out.println("Reprovado na recuperação. Média final: " + mediaFinal);
            }
        }

        leitor.close();
    }
}`
  }
];

async function runTest(test, index) {
  const startTime = Date.now();
  // IP e Session únicos para cada teste para simular 32 alunos independentes
  const fakeIp = `192.168.10.${(index % 250) + 1}`;
  const fakeSessionId = `suite30-session-${index}-${Date.now()}`;

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-session-id': fakeSessionId,
        'x-forwarded-for': fakeIp,
      },
      body: JSON.stringify({
        code: test.code,
        exerciseId: test.exerciseId
      })
    });

    const durationMs = Date.now() - startTime;
    const body = await response.json();

    let passed = true;
    const reasons = [];

    // Checagem de status HTTP
    if (response.status !== test.expectedStatus) {
      passed = false;
      reasons.push(`Status esperado: ${test.expectedStatus}, recebido: ${response.status}`);
    }

    // Checagem de mensagem de erro para bloqueios pré-IA (HTTP 400)
    if (test.expectedStatus === 400 && test.expectedErrorSubstring) {
      if (!body.error || !body.error.includes(test.expectedErrorSubstring)) {
        passed = false;
        reasons.push(`Erro não continha texto esperado: "${test.expectedErrorSubstring}". Recebido: "${body.error}"`);
      }
    }

    // Checagem de faixa de nota para análises da IA (HTTP 200)
    if (test.expectedStatus === 200 && test.expectedScoreRange) {
      const [minScore, maxScore] = test.expectedScoreRange;
      if (typeof body.pontuacao !== 'number' || body.pontuacao < minScore || body.pontuacao > maxScore) {
        passed = false;
        reasons.push(`Nota fora da faixa [${minScore}-${maxScore}]. Recebido: ${body.pontuacao}`);
      }
    }

    // Checagem de problema esperado
    if (test.expectedProblemSubstring) {
      const problemsStr = Array.isArray(body.problemas_encontrados) ? body.problemas_encontrados.join(' ') : '';
      if (!problemsStr.includes(test.expectedProblemSubstring)) {
        passed = false;
        reasons.push(`Problemas não continham "${test.expectedProblemSubstring}". Recebido: ${problemsStr}`);
      }
    }

    return {
      test,
      passed,
      status: response.status,
      score: body.pontuacao,
      durationMs,
      errorMsg: body.error,
      problems: body.problemas_encontrados,
      dica: body.dica_principal,
      failureReasons: reasons
    };

  } catch (err) {
    return {
      test,
      passed: false,
      status: 0,
      durationMs: Date.now() - startTime,
      failureReasons: [`Erro de conexão HTTP: ${err.message}`]
    };
  }
}

async function main() {
  console.log('\n========================================================================');
  console.log('🚀 INICIANDO SUÍTE DE 32 TESTES DO CLEAN CODE ANALYZER');
  console.log(`📡 URL Alvo: ${BASE_URL}`);
  console.log('========================================================================\n');

  const results = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    process.stdout.write(`[${i + 1}/${testCases.length}] Testando: ${test.name.padEnd(50, ' ')} `);

    const result = await runTest(test, i);
    results.push(result);

    if (result.passed) {
      passedCount++;
      const extraInfo = result.status === 200
        ? `-> Nota ${result.score}/10 (${result.durationMs}ms)`
        : `-> Bloqueado HTTP ${result.status} (${result.durationMs}ms)`;
      console.log(`✅ [PASS] ${extraInfo}`);
    } else {
      console.log(`❌ [FAIL] (${result.durationMs}ms)`);
      for (const r of result.failureReasons) {
        console.log(`    ↳ ⚠️  ${r}`);
      }
    }
  }

  // Tabela Resumo Final
  console.log('\n========================================================================');
  console.log(`📊 RELATÓRIO FINAL DOS 32 TESTES`);
  console.log(`   Aprovados: ${passedCount}/${testCases.length} (${Math.round((passedCount / testCases.length) * 100)}%)`);
  console.log('========================================================================\n');

  console.log('RESUMO POR FAIXA DE NOTA E TIER:\n');
  const tiers = [...new Set(testCases.map(t => t.tier))];

  for (const tier of tiers) {
    const tierResults = results.filter(r => r.test.tier === tier);
    const tierPassed = tierResults.filter(r => r.passed).length;
    console.log(`📌 ${tier} (${tierPassed}/${tierResults.length} passaram):`);
    for (const r of tierResults) {
      const mark = r.passed ? '✅' : '❌';
      const detail = r.status === 200 ? `Nota: ${r.score}/10` : `Status: ${r.status}`;
      console.log(`   ${mark} #${r.test.id.toString().padStart(2, '0')} - ${r.test.name} -> ${detail}`);
    }
    console.log('');
  }

  if (passedCount === testCases.length) {
    console.log('🎉 SUCESSO TOTAL: Todos os 32 testes foram concluídos e aprovados!\n');
    process.exit(0);
  } else {
    console.log(`⚠️  ATENÇÃO: ${testCases.length - passedCount} testes apresentaram divergências.\n`);
    process.exit(1);
  }
}

main();
