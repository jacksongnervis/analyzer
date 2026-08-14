public class Calc {
    // Calcula o valor final com desconto e taxa de entrega
    public double prc(double p, double d, double t) {
        double dsc = p * (d / 100);
        double vl = p - dsc;
        double tot = vl + t;
        return tot;
    }
}
