public class Clean {
    public static void main(String[] args) {
        int limiteTemperaturaCritica = 150;

        // Algoritmo de repetição (2.2.3)
        for (int idSensor = 1; idSensor <= 100; idSensor++) {
            
            // Fail Fast / Guard Clause: Se não for um sensor par, ignora e vai para o próximo
            boolean isSensorImpar = (idSensor % 2 != 0);
            if (isSensorImpar) {
                continue; // Pula para a próxima iteração do laço
            }

            int temperaturaAtual = idSensor * 2;
            
            // Algoritmo de seleção (2.2.2) simplificado, sem aninhamento profundo
            if (temperaturaAtual > limiteTemperaturaCritica) {
                System.out.println("Alerta Crítico no sensor " + idSensor + ". Temp: " + temperaturaAtual);
            } else {
                System.out.println("Sensor " + idSensor + " normal.");
            }
        }
    }
}