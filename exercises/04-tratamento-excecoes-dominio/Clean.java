public class CalculadoraMultaRadar {
    
    // 1.5 Atributos e constantes de Classe (static final)
    public static final double VELOCIDADE_MAXIMA_PERMITIDA = 80.0;
    public static final double VALOR_MULTA_POR_KM_EXCEDIDO = 5.0;

    // 1.4.2 e 1.5 Método de Classe (static): não exige "new" para ser usado
    public static double calcularValorMulta(double velocidadeRegistrada) {
        // 2.2.2 Algoritmo de Seleção
        if (velocidadeRegistrada > VELOCIDADE_MAXIMA_PERMITIDA) {
            
            // 2.2.1 Algoritmos sequenciais (Operações bem descritas)
            double quilometrosExcedidos = velocidadeRegistrada - VELOCIDADE_MAXIMA_PERMITIDA;
            return quilometrosExcedidos * VALOR_MULTA_POR_KM_EXCEDIDO;
            
        }
        return 0.0; // Sem multa
    }
}

class Clean {
    public static void main(String[] args) {
        // 2.1.2 Variáveis com nomes significativos
        double velocidadeCarro = 95.0;
        
        // 1.6 Reutilização e Baixo Acoplamento: chamando método diretamente da classe
        double valorMulta = CalculadoraMultaRadar.calcularValorMulta(velocidadeCarro);
        
        if (valorMulta > 0) {
            System.out.println("Veículo multado no valor de: R$ " + valorMulta);
        } else {
            System.out.println("Veículo dentro do limite de velocidade.");
        }
    }
}