import java.util.Scanner;

public class Exercicio {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);

        System.out.print("Nome: "); String n = s.next();
        System.out.print("Idade: "); int i = s.nextInt();
        System.out.print("Tipo veiculo (1-Carro, 2-Moto): "); int t = s.nextInt();
        System.out.print("Qtd dias: "); int d = s.nextInt();

        // Anti-pattern: Arrow Code (Código em formato de flecha)
        if (i < 18) {
            System.out.println("Erro: menor de idade nao pode alugar.");
        } else {
            if (d <= 0) {
                System.out.println("Erro: qtd de dias invalida.");
            } else {
                double v = 0;

                // Falta de Polimorfismo e Números Mágicos (regras misturadas)
                if (t == 1) {
                    v = d * 100.0;
                    if (d > 7) v = v - (v * 0.10); // 10% desconto p/ carros
                } else if (t == 2) {
                    v = d * 50.0;
                    if (d > 5) v = v - (v * 0.05); // 5% desconto p/ motos
                } else {
                    System.out.println("Erro: tipo invalido.");
                }

                if (v > 0) {
                    System.out.println("\nRecibo:");
                    System.out.println("Cliente: " + n + " | Total a pagar: R$ " + v);
                }
            }
        }
    }
}