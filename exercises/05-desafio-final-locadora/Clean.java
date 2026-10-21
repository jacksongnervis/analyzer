// 1. Extração de responsabilidade usando Composição (OO II - 2.1)
public class ContaBancaria {
    private String banco;
    private String agencia;
    private String numeroConta;

    public ContaBancaria(String banco, String agencia, String numeroConta) {
        this.banco = banco;
        this.agencia = agencia;
        this.numeroConta = numeroConta;
    }
    // Getters omitidos para brevidade
}

// 2. Classe Abstrata (OO II - 2.4)
public abstract class Funcionario {
    private String nome;
    // 1.4.1 protected permite que as classes filhas acessem o salário base
    protected double salarioBase; 
    private ContaBancaria contaBancaria; // Composição: Funcionario "tem uma" conta

    public Funcionario(String nome, double salarioBase, ContaBancaria contaBancaria) {
        this.nome = nome;
        this.salarioBase = salarioBase;
        this.contaBancaria = contaBancaria;
    }

    public String getNome() {
        return nome;
    }

    // 2.3 Polimorfismo: Cada classe filha definirá sua regra
    public abstract double calcularSalarioFinal(); 
}

// 3. Herança (OO II - 2.2) substituindo os IFs/ELSES
public class Gerente extends Funcionario {
    private static final double BONUS_GERENCIA = 0.20; // Substitui o número mágico

    public Gerente(String nome, double salarioBase, ContaBancaria conta) {
        super(nome, salarioBase, conta);
    }

    @Override
    public double calcularSalarioFinal() {
        return this.salarioBase + (this.salarioBase * BONUS_GERENCIA);
    }
}

public class Desenvolvedor extends Funcionario {
    private static final double BONUS_TECNICO = 0.10;

    public Desenvolvedor(String nome, double salarioBase, ContaBancaria conta) {
        super(nome, salarioBase, conta);
    }

    @Override
    public double calcularSalarioFinal() {
        return this.salarioBase + (this.salarioBase * BONUS_TECNICO);
    }
}

class Clean {
    public static void main(String[] args) {
        // Criando as contas de forma independente
        ContaBancaria contaAna = new ContaBancaria("Nubank", "0001", "123-4");
        ContaBancaria contaCarlos = new ContaBancaria("Inter", "0001", "999-9");

        // Instanciando objetos concretos
        Funcionario gerente = new Gerente("Ana", 5000.0, contaAna);
        Funcionario dev = new Desenvolvedor("Carlos", 3000.0, contaCarlos);

        // Algoritmo sequencial de exibição
        System.out.println("Salário Gerente " + gerente.getNome() + ": R$ " + gerente.calcularSalarioFinal());
        System.out.println("Salário Desenvolvedor " + dev.getNome() + ": R$ " + dev.calcularSalarioFinal());
    }
}