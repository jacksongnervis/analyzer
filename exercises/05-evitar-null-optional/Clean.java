import java.util.Scanner;
import java.util.InputMismatchException;

// 1. EXCEÇÃO CUSTOMIZADA
class LocacaoException extends RuntimeException {
    public LocacaoException(String mensagem) { super(mensagem); }
}

// 2. DOMÍNIO: CLIENTE (Composição)
class Cliente {
    private String nome;
    private int idade;

    public Cliente(String nome, int idade) {
        if (idade < 18) throw new LocacaoException("Cliente deve ser maior de idade para alugar veículos.");
        this.nome = nome;
        this.idade = idade;
    }
    public String getNome() { return nome; }
}

// 3. POLIMORFISMO E ABSTRAÇÃO (Interface/Classes de Veículos)
interface Veiculo {
    double calcularValorAluguel(int dias);
}

class Carro implements Veiculo {
    public double calcularValorAluguel(int dias) {
        double total = dias * 100.0;
        return (dias > 7) ? total * 0.90 : total; // Aplica 10% de desconto
    }
}

class Moto implements Veiculo {
    public double calcularValorAluguel(int dias) {
        double total = dias * 50.0;
        return (dias > 5) ? total * 0.95 : total; // Aplica 5% de desconto
    }
}

// 4. LÓGICA DE NEGÓCIO (Protegendo o estado do objeto)
class Locacao {
    private Cliente cliente;
    private Veiculo veiculo;
    private int dias;

    public Locacao(Cliente cliente, Veiculo veiculo, int dias) {
        if (dias <= 0) throw new LocacaoException("A quantidade de dias deve ser maior que zero.");
        this.cliente = cliente;
        this.veiculo = veiculo;
        this.dias = dias;
    }

    public void emitirRecibo() {
        double valorTotal = veiculo.calcularValorAluguel(dias);
        System.out.println("\n--- RECIBO DE LOCAÇÃO ---");
        System.out.printf("Cliente: %s\n", cliente.getNome());
        System.out.printf("Total a Pagar: R$ %.2f\n", valorTotal);
    }
}

// 5. APLICAÇÃO E TRATAMENTO DE ERROS (UI)
public class Solucao {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        try {
            System.out.print("Nome: ");
            String nome = scanner.next();
            System.out.print("Idade: ");
            int idade = scanner.nextInt();

            Cliente cliente = new Cliente(nome, idade); // Valida idade automaticamente

            System.out.print("Tipo veículo (1-Carro, 2-Moto): ");
            int tipo = scanner.nextInt();

            Veiculo veiculo;
            if (tipo == 1) veiculo = new Carro();
            else if (tipo == 2) veiculo = new Moto();
            else throw new LocacaoException("Tipo de veículo selecionado não existe.");

            System.out.print("Qtd dias: ");
            int dias = scanner.nextInt();

            // Valida dias e junta as peças
            Locacao locacao = new Locacao(cliente, veiculo, dias);
            locacao.emitirRecibo();

        } catch (InputMismatchException e) {
            System.out.println("❌ Erro de Entrada: Você digitou letras onde deveriam ser números.");
        } catch (LocacaoException e) {
            System.out.println("⚠️ Regra de Negócio Violada: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("🚨 Erro Crítico do Sistema: " + e.getMessage());
        } finally {
            scanner.close();
        }
    }
}