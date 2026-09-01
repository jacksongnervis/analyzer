import java.util.Scanner;

public class Dirty {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int opc = 1;

        while (opc != 0) {
            System.out.println("1-Avaliar Aluno | 0-Sair");
            opc = s.nextInt();

            if (opc == 1) {
                System.out.println("Nome:");
                String n = s.next();
                System.out.println("Faltas:");
                int f = s.nextInt();
                
                System.out.println("N1:");
                double n1 = s.nextDouble();
                System.out.println("N2:");
                double n2 = s.nextDouble();
                System.out.println("N3:");
                double n3 = s.nextDouble();

                double res = (n1 + n2 + n3) / 3;

                int x = 0;

                if (f <= 15) {
                    if (res >= 7.0) {
                        System.out.println("O aluno " + n + " passou direto! Nota: " + res);
                    } else {
                        if (res >= 5.0) {
                            System.out.println("Aluno em Recuperação. Digite a nota da prova:");
                            double n4 = s.nextDouble();
                            
                            double res2 = (res + n4) / 2;
                            
                            if (res2 >= 6.0) {
                                System.out.println("Passou na rec.");
                            } else {
                                System.out.println("Reprovou na rec.");
                            }
                        } else {
                            System.out.println("Reprovado direto por nota.");
                        }
                    }
                } else {
                    System.out.println("Reprovado por falta.");
                }
            }
        }
        s.close();
    }
}