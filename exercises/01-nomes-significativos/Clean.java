public class Clean {
    public static void main(String[] args) {
        // Variáveis descritivas (2.1.2) e Operadores/Atribuições (2.1.3)
        double horasTrabalhadas = 160.0;
        double valorPorHora = 25.50;
        double taxaDescontoINSS = 0.11; // 11%
        
        // Expressões matemáticas claras seguindo um algoritmo sequencial (2.2.1)
        double salarioBruto = horasTrabalhadas * valorPorHora;
        double valorDescontoINSS = salarioBruto * taxaDescontoINSS;
        double salarioLiquido = salarioBruto - valorDescontoINSS;
        
        System.out.println("Salário Líquido: R$ " + salarioLiquido);
    }
}