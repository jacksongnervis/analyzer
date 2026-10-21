public class ContaJogador {

    public int fichas; 

    public void op(int qtd, int t) {
        if (t == 1) {
            fichas = fichas + qtd;
        } else if (t == 2) {
            fichas = fichas - qtd;
        }
    }
}

class Dirty {
    public static void main(String[] args) {
        ContaJogador j1 = new ContaJogador();
        j1.fichas = 10;
        
        for(int i = 0; i < 3; i++) {
            j1.op(2, 2);
        }
        
        System.out.println("Restam: " + j1.fichas);
    }
}