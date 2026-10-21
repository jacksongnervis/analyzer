public class Dirty {
    public static void main(String[] args) {

        double h = 160; 
        double v = 25.50; 
        double b = h * v;
        double d = b * 0.11; 
        double l = b - d;
        
        System.out.println("Resultado: " + l);
    }
}