public class ContaJogador {
    // 1.4.1 Modificador private para proteger o dado
    private int quantidadeFichas; 

    // 1.2 Construtor garantindo um estado inicial válido
    public ContaJogador(int fichasIniciais) {
        this.quantidadeFichas = fichasIniciais;
    }

    // 1.3 Métodos com nomes descritivos e responsabilidade única
    public void comprarFichas(int quantidade) {
        if (quantidade > 0) { // 2.2.2 Algoritmo de seleção validando a entrada
            this.quantidadeFichas += quantidade;
        }
    }

    public void jogarPartida(int custoFichas) {
        if (custoFichas > 0 && this.quantidadeFichas >= custoFichas) {
            this.quantidadeFichas -= custoFichas;
        } else {
            System.out.println("Fichas insuficientes!");
        }
    }

    public int getQuantidadeFichas() {
        return this.quantidadeFichas;
    }
}

class Clean {
    public static void main(String[] args) {
        // 1.1 Instanciando objeto via construtor
        ContaJogador jogador = new ContaJogador(10); 
        
        int custoPorPartida = 2; // 2.1.2 Conceito de variáveis

        // 2.2.3 Algoritmo de repetição
        for(int i = 0; i < 3; i++) {
            jogador.jogarPartida(custoPorPartida);
        }
        
        System.out.println("Fichas restantes: " + jogador.getQuantidadeFichas());
    }
}