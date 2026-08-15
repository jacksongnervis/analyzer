import java.util.Scanner;

public class Solucao {

    // Evitando números mágicos no menu
    private static final int OPCAO_DEPOSITAR = 1;
    private static final int OPCAO_SACAR = 2;
    private static final int OPCAO_VER_SALDO = 3;
    private static final int OPCAO_SAIR = 4;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Inicialização limpa da conta com valores configuráveis
        ContaBancaria conta = new ContaBancaria(500.0, 300.0);
        boolean executando = true;

        System.out.println("--- CAIXA ELETRÔNICO ---");

        while (executando) {
            exibirMenu();
            int opcaoEscolhida = scanner.nextInt();

            try {
                switch (opcaoEscolhida) {
                    case OPCAO_DEPOSITAR:
                        System.out.print("Qual valor deseja depositar? R$ ");
                        double valorDeposito = scanner.nextDouble();
                        conta.depositar(valorDeposito);
                        System.out.println("✅ Depósito realizado com sucesso!");
                        break;

                    case OPCAO_SACAR:
                        System.out.print("Qual valor deseja sacar? R$ ");
                        double valorSaque = scanner.nextDouble();
                        conta.sacar(valorSaque);
                        System.out.println("✅ Saque realizado com sucesso!");
                        break;

                    case OPCAO_VER_SALDO:
                        System.out.printf("💰 Seu saldo atual é: R$ %.2f\n", conta.getSaldo());
                        break;

                    case OPCAO_SAIR:
                        System.out.println("Obrigado por usar nosso banco. Até logo!");
                        executando = false;
                        break;

                    default:
                        System.out.println("⚠️ Opção inválida. Tente novamente.");
                        break;
                }
            } catch (IllegalArgumentException e) {
                // Captura as validações feitas pela classe ContaBancaria e exibe o erro
                System.out.println("❌ Erro: " + e.getMessage());
            }

            System.out.println("------------------------");
        }

        scanner.close();
    }

    private static void exibirMenu() {
        System.out.println("\nEscolha uma opção:");
        System.out.println("1 - Depositar");
        System.out.println("2 - Sacar");
        System.out.println("3 - Ver Saldo");
        System.out.println("4 - Sair");
        System.out.print("Sua opção: ");
    }
}

class ContaBancaria {
    private double saldo;
    private final double limiteChequeEspecial;

    public ContaBancaria(double saldoInicial, double limiteChequeEspecial) {
        if (saldoInicial < 0) {
            throw new IllegalArgumentException("O saldo inicial não pode ser negativo.");
        }
        if (limiteChequeEspecial < 0) {
            throw new IllegalArgumentException("O limite não pode ser negativo.");
        }
        this.saldo = saldoInicial;
        this.limiteChequeEspecial = limiteChequeEspecial;
    }

    public void depositar(double valor) {
        if (valor <= 0) {
            throw new IllegalArgumentException("O valor de depósito deve ser maior que zero.");
        }
        this.saldo += valor;
    }

    public void sacar(double valor) {
        if (valor <= 0) {
            throw new IllegalArgumentException("O valor de saque deve ser maior que zero.");
        }

        double saldoDisponivelTotal = this.saldo + this.limiteChequeEspecial;

        if (valor > saldoDisponivelTotal) {
            throw new IllegalArgumentException("Saldo insuficiente. Limite do cheque especial excedido.");
        }

        this.saldo -= valor;
    }

    public double getSaldo() {
        return this.saldo;
    }
}