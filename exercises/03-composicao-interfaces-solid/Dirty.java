import java.util.Scanner;

public class Dirty {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int op = 1;

        while (op != 0) {
            System.out.println("1-Nova Venda | 0-Sair");
            op = s.nextInt();

            if (op == 1) {
                System.out.print("Nome: ");
                String n = s.next();
                System.out.print("Valor: ");
                double v = s.nextDouble();
                System.out.print("Tipo (1-Comum, 2-VIP, 3-Funcionario): ");
                int t = s.nextInt();
                System.out.print("Pagamento (1-Pix, 2-Cartao): ");
                int p = s.nextInt();

                double d = 0;
                if (t == 1) {
                    d = 0;
                } else if (t == 2) {
                    d = v * 0.10;
                } else if (t == 3) {
                    d = v * 0.20;
                }

                double vf = v - d;

                if (p == 1) {
                    double dPix = vf * 0.05;
                    vf = vf - dPix;
                    System.out.println("Pix gerado com sucesso. Total: " + vf);
                } else if (p == 2) {
                    System.out.println("Cartao aprovado na maquininha. Total: " + vf);
                } else {
                    System.out.println("Forma de pagamento invalida!");
                }
            }
        }
        s.close();
    }
}