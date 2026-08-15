import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Scanner;

public class Exercicio {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        System.out.print("Num quarto: ");
        int num = s.nextInt();
        System.out.print("Tipo (1-Standard, 2-Luxo): ");
        int tipo = s.nextInt();

        try {
            System.out.print("Data check-in (dd/MM/yyyy): ");
            LocalDate d1 = LocalDate.parse(s.next(), fmt);
            System.out.print("Data check-out (dd/MM/yyyy): ");
            LocalDate d2 = LocalDate.parse(s.next(), fmt);

            LocalDate agora = LocalDate.now();

            // Bad smell: Validação de negócio no Main e impressões de erro em vez de Exceções
            if (d1.isBefore(agora) || d2.isBefore(agora)) {
                System.out.println("Erro: A reserva não pode ser no passado.");
            } else {
                if (!d2.isAfter(d1)) {
                    System.out.println("Erro: Checkout deve ser apos o checkin.");
                } else {
                    long dias = ChronoUnit.DAYS.between(d1, d2);
                    double v = 0;

                    // Bad smell: Falta de Polimorfismo
                    if (tipo == 1) {
                        v = dias * 150.0;
                    } else if (tipo == 2) {
                        v = dias * 300.0;
                    } else {
                        System.out.println("Tipo invalido");
                    }

                    System.out.println("Reserva feita! Quarto: " + num + " | Total: R$ " + v);
                }
            }
            // Bad smell: Captura genérica (Exception) e engolimento do erro real
        } catch (Exception e) {
            System.out.println("Deu erro no sistema.");
        }

        s.close();
    }
}