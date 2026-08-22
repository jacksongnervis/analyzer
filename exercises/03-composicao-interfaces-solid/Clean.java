import java.util.Scanner;

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

interface Pagamento {
    void processar(double valor);
}

class PagamentoPix implements Pagamento {
    public void processar(double valor) {
        System.out.printf("✅ Gerando chave PIX de R$ %.2f...\n", valor);
    }
}

class PagamentoCartao implements Pagamento {
    public void processar(double valor) {
        System.out.printf("✅ Aprovando na operadora do cartão o valor de R$ %.2f...\n", valor);
    }
}

class Pedido {
    private Cliente cliente;
    private double valor;
    private Pagamento metodoPagamento;

    public Pedido(Cliente cliente, double valor, Pagamento metodoPagamento) {
        this.cliente = cliente;
        this.valor = valor;
        this.metodoPagamento = metodoPagamento;
    }

    public double aplicarDesconto(int tipoCliente) {
        switch (tipoCliente) {
            case 2: return this.valor * 0.90;
            case 3: return this.valor * 0.80;
            default: return this.valor;
        }
    }

    public void finalizar(int tipoCliente) {
        double valorFinal = aplicarDesconto(tipoCliente);
        System.out.println("\n--- RESUMO DO PEDIDO ---");
        System.out.println("Cliente: " + cliente.getNome());
        System.out.println("Entrega: " + cliente.getEndereco().getEnderecoCompleto());
        System.out.println("Total a pagar: R$ " + valorFinal);

        metodoPagamento.processar(valorFinal);
    }
}

public class Clean {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        Endereco endereco = new Endereco("Rua das Flores", "123B");
        Cliente cliente = new Cliente("João Silva", endereco);

        System.out.print("Valor da Compra: ");
        double valor = scanner.nextDouble();

        System.out.print("Tipo Cliente (1-Comum, 2-VIP, 3-Func): ");
        int tipoCliente = scanner.nextInt();

        System.out.print("Pagamento (1-Pix, 2-Cartao): ");
        int opPagamento = scanner.nextInt();

        Pagamento pagamento = (opPagamento == 1) ? new PagamentoPix() : new PagamentoCartao();

        Pedido pedido = new Pedido(cliente, valor, pagamento);
        pedido.finalizar(tipoCliente);

        scanner.close();
    }
}