import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

abstract class Funcionario {
    private String nome;
    private double salario;

    public Funcionario(String nome, double salario) {
        if (salario < 0) throw new IllegalArgumentException("Salário inválido.");
        this.nome = nome;
        this.salario = salario;
    }

    public String getNome() { return nome; }
    public double getSalario() { return salario; }

    public abstract double calcularBonus();
}

class Gerente extends Funcionario {
    public Gerente(String nome, double salario) { super(nome, salario); }

    @Override
    public double calcularBonus() {
        return (getSalario() * 0.2) + 1000.0;
    }
}

class Desenvolvedor extends Funcionario {
    public Desenvolvedor(String nome, double salario) { super(nome, salario); }

    @Override
    public double calcularBonus() {
        return getSalario() * 0.1;
    }
}

public class Clean {
    private static final int OP_ADD = 1;
    private static final int OP_BONUS = 2;
    private static final int OP_SAIR = 3;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Funcionario> funcionarios = new ArrayList<>();
        boolean executando = true;

        while (executando) {
            System.out.println("\n1 - Adicionar | 2 - Listar Bônus | 3 - Sair");
            int opcao = scanner.nextInt();

            if (opcao == OP_ADD) {
                System.out.print("Nome: ");
                String nome = scanner.next();
                System.out.print("Salário: ");
                double salario = scanner.nextDouble();
                System.out.print("Tipo (1-Gerente, 2-Dev): ");
                int tipo = scanner.nextInt();

                if (tipo == 1) {
                    funcionarios.add(new Gerente(nome, salario));
                } else if (tipo == 2) {
                    funcionarios.add(new Desenvolvedor(nome, salario));
                } else {
                    System.out.println("Tipo inválido!");
                }

            } else if (opcao == OP_BONUS) {
                System.out.println("\n--- FOLHA DE BÔNUS ---");
                for (Funcionario f : funcionarios) {
                    System.out.printf("Funcionario: %s | Bônus: R$ %.2f\n", f.getNome(), f.calcularBonus());
                }
            } else if (opcao == OP_SAIR) {
                executando = false;
            }
        }
        scanner.close();
    }
}