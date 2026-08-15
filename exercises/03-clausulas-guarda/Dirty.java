import java.util.Scanner;

public class Exercicio {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);

        System.out.print("Nome: "); String n = s.nextLine();
        System.out.print("Rua: "); String r = s.nextLine();
        System.out.print("Num: "); String nu = s.nextLine();
        System.out.print("Tipo (1-Comum, 2-VIP, 3-Funcionario): "); int tCli = s.nextInt();

        System.out.print("Valor Compra: "); double v = s.nextDouble();
        System.out.print("Pagamento (1-Pix, 2-Cartao): "); int p = s.nextInt();

        double d = 0;
        // Bad smell: Violação do OCP (Aberto/Fechado). Se criar novo tipo, tem que alterar aqui.
        if (tCli == 1) {
            d = 0;
        } else if (tCli == 2) {
            d = v * 0.10;
        } else if (tCli == 3) {
            d = v * 0.20;
        }

        double vf = v - d;
        System.out.println("\nCliente: " + n + " | End: " + r + ", " + nu);
        System.out.println("Total a pagar: " + vf);

        // Bad smell: Falta de Interfaces/Polimorfismo para processar pagamento
        if (p == 1) {
            System.out.println("Gerando chave PIX para o valor de " + vf);
        } else if (p == 2) {
            System.out.println("Comunicando com a operadora do cartao... Valor cobrado: " + vf);
        } else {
            System.out.println("Erro no pagamento");
        }
    }
}