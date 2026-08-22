import java.util.Scanner;

public class Dirty {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);

        String[] n = new String[100];
        double[] sal = new double[100];
        int[] t = new int[100];
        int c = 0;

        while(true) {
            System.out.println("1-Add 2-Bonus 3-Sair");
            int op = s.nextInt();

            if(op == 1) {
                System.out.print("Nome: "); n[c] = s.next();
                System.out.print("Salario: "); sal[c] = s.nextDouble();
                System.out.print("Tipo (1-Gerente, 2-Dev): "); t[c] = s.nextInt();
                c++;
                System.out.println("Ok");
            } else if(op == 2) {
                for(int i = 0; i < c; i++) {
                    double b = 0;
                    if(t[i] == 1) {
                        b = (sal[i] * 0.2) + 1000;
                    } else if(t[i] == 2) {
                        b = sal[i] * 0.1;
                    }
                    System.out.println(n[i] + " bonus: " + b);
                }
            } else if(op == 3) {
                break;
            }
        }
    }
}