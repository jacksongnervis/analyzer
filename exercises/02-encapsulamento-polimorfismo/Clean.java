import java.util.Scanner;

public class Clean {
    private static final int OPCAO_SAIR = 0;
    private static final int OPCAO_CALCULAR = 1;

    private static final int CARGO_GERENTE = 1;
    private static final int CARGO_DEV = 2;
    private static final int CARGO_ESTAGIARIO = 3;

    private static final double PERCENTUAL_GERENTE = 0.20;
    private static final double ADICIONAL_GERENTE = 1000.0;

    private static final double PERCENTUAL_DEV = 0.10;
    private static final double ADICIONAL_DEV = 300.0;

    private static final double PERCENTUAL_ESTAGIARIO = 0.05;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int opcao = OPCAO_CALCULAR;

        while (opcao != OPCAO_SAIR) {
            System.out.println("\n1 - Calcular Bônus | 0 - Sair");
            opcao = scanner.nextInt();

            if (opcao != OPCAO_CALCULAR) {
                continue;
            }

            System.out.print("Nome do funcionário: ");
            String nome = scanner.next();

            System.out.print("Salário base (R$): ");
            double salarioBase = scanner.nextDouble();

            if (salarioBase <= 0) {
                System.out.println("Atenção: O salário deve ser maior que zero.");
                continue;
            }

            System.out.print("Cargo (1 - Gerente, 2 - Desenvolvedor, 3 - Estagiário): ");
            int cargo = scanner.nextInt();

            double valorBonus = calcularBonus(cargo, salarioBase);
            if (valorBonus < 0) {
                System.out.println("Erro: Opção de cargo inválida!");
                continue;
            }

            double salarioTotal = salarioBase + valorBonus;
            exibirResumo(nome, salarioBase, valorBonus, salarioTotal);
        }

        scanner.close();
    }

    public static double calcularBonus(int cargo, double salarioBase) {
        switch (cargo) {
            case CARGO_GERENTE:
                return (salarioBase * PERCENTUAL_GERENTE) + ADICIONAL_GERENTE;
            case CARGO_DEV:
                return (salarioBase * PERCENTUAL_DEV) + ADICIONAL_DEV;
            case CARGO_ESTAGIARIO:
                return salarioBase * PERCENTUAL_ESTAGIARIO;
            default:
                return -1.0;
        }
    }

    public static void exibirResumo(String nome, double salarioBase, double valorBonus, double salarioTotal) {
        System.out.printf("Colaborador: %s | Salário: R$ %.2f | Bônus: R$ %.2f | Total: R$ %.2f\n",
                nome, salarioBase, valorBonus, salarioTotal);
    }
}