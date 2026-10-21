public class Funcionario {
    public String nome;
    public int tipo;
    public double salarioBase;
    
    public String banco;
    public String agencia;
    public String conta;

    public Funcionario(String n, int t, double s, String b, String ag, String c) {
        nome = n; tipo = t; salarioBase = s; banco = b; agencia = ag; conta = c;
    }

    public double calcular() {
        if (tipo == 1) {
            return salarioBase + (salarioBase * 0.20);
        } else if (tipo == 2) {
            return salarioBase + (salarioBase * 0.10);
        }
        return salarioBase;
    }
}

class Dirty {
    public static void main(String[] args) {
        Funcionario f1 = new Funcionario("Ana", 1, 5000, "Nubank", "0001", "123-4");
        Funcionario f2 = new Funcionario("Carlos", 2, 3000, "Inter", "0001", "999-9");
        
        System.out.println("Salário Ana: " + f1.calcular());
        System.out.println("Salário Carlos: " + f2.calcular());
    }
}