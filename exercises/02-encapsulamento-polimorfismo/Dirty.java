import java.util.Scanner;

public class Dirty {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int op = 1;

        while (op != 0) {
            System.out.println("1-Calcular Bonus | 0-Sair");
            op = s.nextInt();

            if (op == 1) {
                System.out.print("Nome: ");
                String n = s.next();
                System.out.print("Salario: ");
                double sal = s.nextDouble();
                System.out.print("Cargo (1-Gerente, 2-Dev, 3-Estagiario): ");
                int t = s.nextInt();

                double b = 0;
                if (t == 1) {
                    b = (sal * 0.20) + 1000.0;
                } else if (t == 2) {
                    b = (sal * 0.10) + 300.0;
                } else if (t == 3) {
                    b = sal * 0.05;
                } else {
                    System.out.println("Cargo invalido!");
                    continue;
                }

                double tot = sal + b;
                System.out.println("Funcionario: " + n + " | Bonus: " + b + " | Total: " + tot);
            }
        }
        s.close();
    }
}