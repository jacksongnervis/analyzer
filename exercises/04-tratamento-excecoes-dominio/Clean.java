import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Scanner;

class ReservaException extends RuntimeException {
    public ReservaException(String mensagem) {
        super(mensagem);
    }
}

interface Quarto {
    int getNumero();
    double calcularDiaria(long dias);
}

class QuartoStandard implements Quarto {
    private int numero;
    public QuartoStandard(int numero) { this.numero = numero; }

    public int getNumero() { return numero; }
    public double calcularDiaria(long dias) { return dias * 150.0; }
}

class QuartoLuxo implements Quarto {
    private int numero;
    public QuartoLuxo(int numero) { this.numero = numero; }

    public int getNumero() { return numero; }
    public double calcularDiaria(long dias) { return dias * 300.0; }
}

class Reserva {
    private Quarto quarto;
    private LocalDate checkin;
    private LocalDate checkout;

    public Reserva(Quarto quarto, LocalDate checkin, LocalDate checkout) {
        validarDatas(checkin, checkout);
        this.quarto = quarto;
        this.checkin = checkin;
        this.checkout = checkout;
    }

    private void validarDatas(LocalDate checkin, LocalDate checkout) {
        LocalDate agora = LocalDate.now();
        if (checkin.isBefore(agora) || checkout.isBefore(agora)) {
            throw new ReservaException("As datas da reserva não podem ser no passado.");
        }
        if (!checkout.isAfter(checkin)) {
            throw new ReservaException("A data de check-out deve ser posterior ao check-in.");
        }
    }

    public double calcularTotal() {
        long dias = ChronoUnit.DAYS.between(checkin, checkout);
        return quarto.calcularDiaria(dias);
    }

    @Override
    public String toString() {
        return String.format("Reserva confirmada! Quarto: %d | Total: R$ %.2f",
                quarto.getNumero(), calcularTotal());
    }
}

public class Clean {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try {
            System.out.print("Num quarto: ");
            int numero = scanner.nextInt();
            System.out.print("Tipo (1-Standard, 2-Luxo): ");
            int tipo = scanner.nextInt();

            Quarto quarto;
            if (tipo == 1) quarto = new QuartoStandard(numero);
            else if (tipo == 2) quarto = new QuartoLuxo(numero);
            else throw new ReservaException("Tipo de quarto inválido.");

            System.out.print("Data check-in (dd/MM/yyyy): ");
            LocalDate checkin = LocalDate.parse(scanner.next(), fmt);

            System.out.print("Data check-out (dd/MM/yyyy): ");
            LocalDate checkout = LocalDate.parse(scanner.next(), fmt);

            Reserva reserva = new Reserva(quarto, checkin, checkout);
            System.out.println(reserva);

        } catch (DateTimeParseException e) {
            System.out.println("❌ Erro de formatação: Digite a data no formato dd/MM/yyyy.");
        } catch (ReservaException e) {
            System.out.println("⚠️ Erro na Reserva: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("🚨 Erro inesperado: Verifique os dados inseridos.");
        } finally {
            scanner.close();
        }
    }
}