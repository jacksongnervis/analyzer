public class Dirty {
    public static void main(String[] args) {

        for (int i = 1; i <= 100; i++) {

            if (i % 2 == 0) {

                int t = i * 2; 
                
                if (t > 150) {
                    System.out.println("Alerta Crítico no sensor " + i + ". Temp: " + t);
                } else {
                    System.out.println("Sensor " + i + " normal.");
                }
            }
        }
    }
}