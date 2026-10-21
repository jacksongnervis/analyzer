public class Clean {
    public static void main(String[] args) {
        // Variáveis descritivas (2.1.2) e Operadores/Atribuições (2.1.3)
        final double HORAS_TRABALHADAS = 160.0;
        final double VALOR_POR_HORA = 25.50;
        final double TAXA_DESCONTO_INSS = 0.11; // 11%
        
        // Expressões matemáticas claras seguindo um algoritmo sequencial (2.2.1)
        double salarioBruto = HORAS_TRABALHADAS * VALOR_POR_HORA;
        double valorDescontoINSS = salarioBruto * TAXA_DESCONTO_INSS;
        double salarioLiquido = salarioBruto - valorDescontoINSS;
        
        System.out.println("Salário Líquido: R$ " + salarioLiquido);
    }
}