import java.util.Scanner;

public class Clean {
    private static final int OPCAO_SAIR = 0;
    private static final int OPCAO_NOVA_VENDA = 1;

    // Tipos de Cliente
    private static final int CLIENTE_COMUM = 1;
    private static final int CLIENTE_VIP = 2;
    private static final int CLIENTE_FUNCIONARIO = 3;

    // Percentuais de Desconto de Cliente
    private static final double DESCONTO_VIP = 0.10;
    private static final double DESCONTO_FUNCIONARIO = 0.20;

    // Formas de Pagamento
    private static final int PAGAMENTO_PIX = 1;
    private static final int PAGAMENTO_CARTAO = 2;

    // Desconto extra para pagamento à vista no Pix
    private static final double DESCONTO_PIX = 0.05;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int opcao = OPCAO_NOVA_VENDA;

        while (opcao != OPCAO_SAIR) {
            System.out.println("\n1 - Nova Venda | 0 - Sair");
            opcao = scanner.nextInt();

            if (opcao != OPCAO_NOVA_VENDA) {
                continue;
            }

            System.out.print("Nome do cliente: ");
            String nomeCliente = scanner.next();

            System.out.print("Valor da compra (R$): ");
            double valorBruto = scanner.nextDouble();

            if (valorBruto <= 0) {
                System.out.println("Atenção: O valor da compra deve ser maior que zero!");
                continue;
            }

            System.out.print("Tipo de cliente (1 - Comum, 2 - VIP, 3 - Funcionário): ");
            int tipoCliente = scanner.nextInt();

            System.out.print("Forma de pagamento (1 - Pix, 2 - Cartão): ");
            int formaPagamento = scanner.nextInt();

            if (formaPagamento != PAGAMENTO_PIX && formaPagamento != PAGAMENTO_CARTAO) {
                System.out.println("Erro: Forma de pagamento inválida!");
                continue;
            }

            double valorDescontoCliente = calcularDescontoCliente(valorBruto, tipoCliente);
            double valorSubtotal = valorBruto - valorDescontoCliente;

            double valorDescontoPix = calcularDescontoPix(valorSubtotal, formaPagamento);
            double valorFinal = valorSubtotal - valorDescontoPix;
            double totalDescontos = valorDescontoCliente + valorDescontoPix;

            exibirResumoVenda(nomeCliente, valorBruto, totalDescontos, valorFinal);
            processarMensagemPagamento(formaPagamento, valorFinal);
        }

        scanner.close();
    }

    public static double calcularDescontoCliente(double valor, int tipoCliente) {
        switch (tipoCliente) {
            case CLIENTE_VIP:
                return valor * DESCONTO_VIP;
            case CLIENTE_FUNCIONARIO:
                return valor * DESCONTO_FUNCIONARIO;
            default:
                return 0.0;
        }
    }

    public static double calcularDescontoPix(double subtotal, int formaPagamento) {
        if (formaPagamento == PAGAMENTO_PIX) {
            return subtotal * DESCONTO_PIX;
        }
        return 0.0;
    }

    public static void exibirResumoVenda(String cliente, double valorBruto, double totalDescontos, double valorFinal) {
        System.out.println("\n--- RESUMO DA COMPRA ---");
        System.out.println("Cliente: " + cliente);
        System.out.printf("Valor Bruto: R$ %.2f\n", valorBruto);
        System.out.printf("Total de Descontos: R$ %.2f\n", totalDescontos);
        System.out.printf("Total a Pagar: R$ %.2f\n", valorFinal);
    }

    public static void processarMensagemPagamento(int formaPagamento, double valorFinal) {
        if (formaPagamento == PAGAMENTO_PIX) {
            System.out.printf("Chave PIX gerada com sucesso no valor de R$ %.2f.\n", valorFinal);
        } else if (formaPagamento == PAGAMENTO_CARTAO) {
            System.out.printf("Pagamento de R$ %.2f aprovado com sucesso na maquininha de cartão.\n", valorFinal);
        }
    }
}