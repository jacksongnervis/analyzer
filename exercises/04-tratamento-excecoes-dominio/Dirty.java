public class Radar {

    public double calc(double v) {

        if (v > 80) {
            double dif = v - 80;
            return dif * 5.0;
        }
        return 0;
    }
}

class Dirty {
    public static void main(String[] args) {
        Radar r = new Radar();
        double valor = r.calc(95.0);
        
        if (valor > 0) {
            System.out.println("Multado em: " + valor);
        } else {
            System.out.println("Dentro do limite");
        }
    }
}