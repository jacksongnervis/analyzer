import java.util.Scanner;

public class Clean {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        final int OPCAO_SAIR = 0;
        final int OPCAO_AVALIAR = 1;
        
        final int LIMITE_FALTAS = 15;
        final double MEDIA_APROVACAO = 7.0;
        final double MEDIA_RECUPERACAO = 5.0;
        final double MEDIA_APROVACAO_RECUPERACAO = 6.0;

        int opcao = OPCAO_AVALIAR;

        while (opcao != OPCAO_SAIR) {
            System.out.println("\n1 - Avaliar Aluno | 0 - Sair");
            opcao = scanner.nextInt();

            if (opcao != OPCAO_AVALIAR) {
                continue;
            }

            System.out.print("Nome: ");
            String nome = scanner.next();
            
            System.out.print("Faltas: ");
            int faltas = scanner.nextInt();
            
            System.out.print("Nota 1: ");
            double nota1 = scanner.nextDouble();
            
            System.out.print("Nota 2: ");
            double nota2 = scanner.nextDouble();
            
            System.out.print("Nota 3: ");
            double nota3 = scanner.nextDouble();

            double mediaSemestral = (nota1 + nota2 + nota3) / 3.0;
            
            if (faltas > LIMITE_FALTAS) {
                System.out.println("O aluno " + nome + " reprovou por falta.");
                continue;
            }

            if (mediaSemestral >= MEDIA_APROVACAO) {
                System.out.println("O aluno " + nome + " passou direto! Média: " + mediaSemestral);
                continue;
            }

            if (mediaSemestral < MEDIA_RECUPERACAO) {
                System.out.println("O aluno " + nome + " reprovou direto por nota. Média: " + mediaSemestral);
                continue;
            }

            System.out.println("Aluno em Recuperação. Digite a nota da prova:");
            double notaRecuperacao = scanner.nextDouble();
            
            double mediaFinal = (mediaSemestral + notaRecuperacao) / 2.0;
            
            if (mediaFinal >= MEDIA_APROVACAO_RECUPERACAO) {
                System.out.println("Passou na recuperação! Média final: " + mediaFinal);
            } else {
                System.out.println("Reprovou na recuperação. Média final: " + mediaFinal);
            }
        }
        
        scanner.close();
    }
}