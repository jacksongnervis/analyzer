import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Scanner;

// --- 1. EXCEÇÃO CUSTOMIZADA ---
// Centraliza os erros de regra de negócio
class ReservaException extends RuntimeException {
    public ReservaException(String mensagem) {
        super(mensagem);
    }
}

// --- 2. POLIMORFISMO E ABSTRAÇÃO ---
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

// --- 3. CLASSE DE DOMÍNIO (Com Programação Defensiva) ---
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
            // Lançamento de erro de regra de negócio
            throw new ReservaException("As datas da reserva não podem ser no passado.");
        }
        if (!checkout.isAfter(checkin)) {
            throw new ReservaException("A data de check-out deve ser posterior ao check-in.");
        }
    }

    public double calcularTotal() {
        long dias = ChronoUnit.DAYS.between(checkin, checkout);
        return quarto.calcularDiaria(dias); // Polimorfismo em ação
    }

    @Override
    public String toString() {
        return String.format("Reserva confirmada! Quarto: %d | Total: R$ %.2f",
                quarto.getNumero(), calcularTotal());
    }
}

// --- 4. APLICAÇÃO (UI e Tratamento de Exceções) ---
public class Solucao {
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

            // A classe Reserva faz a própria validação ao ser instanciada
            Reserva reserva = new Reserva(quarto, checkin, checkout);
            System.out.println(reserva);

        } catch (DateTimeParseException e) {
            // Captura erros de digitação de data
            System.out.println("❌ Erro de formatação: Digite a data no formato dd/MM/yyyy.");
        } catch (ReservaException e) {
            // Captura violações das regras de negócio
            System.out.println("⚠️ Erro na Reserva: " + e.getMessage());
        } catch (Exception e) {
            // Captura qualquer erro inesperado (ex: InputMismatchException se digitar letras no número)
            System.out.println("🚨 Erro inesperado: Verifique os dados inseridos.");
        } finally {
            scanner.close(); // Boas práticas: fechando recursos
        }
    }
}