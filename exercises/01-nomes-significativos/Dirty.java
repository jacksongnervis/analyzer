import java.util.Scanner;

public class Exercicio {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        double d = 500.0;
        boolean f = true;

        System.out.println("--- BEM VINDO ---");

        while(f == true) {
            System.out.println("Escolha: 1 p/ botar, 2 p/ tirar, 3 p/ olhar, 4 p/ sair");
            int o = sc.nextInt();

            if(o == 1) {
                System.out.print("Qto? ");
                double v = sc.nextDouble();
                if(v > 0) {
                    d = d + v;
                    System.out.println("Ok, feito.");
                } else {
                    System.out.println("Erro.");
                }
            } else {
                if(o == 2) {
                    System.out.print("Qto? ");
                    double v = sc.nextDouble();
                    // Checa se passa do limite do cheque especial que é -300
                    if(d - v < -300) {
                        System.out.println("Nao da, sem limite.");
                    } else {
                        d = d - v;
                        System.out.println("Ok, feito.");
                    }
                } else {
                    if(o == 3) {
                        System.out.println("Vc tem: " + d);
                    } else {
                        if(o == 4) {
                            System.out.println("Tchau");
                            f = false;
                        } else {
                            System.out.println("Opcao invalida");
                        }
                    }
                }
            }
        }
    }
}