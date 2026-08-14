public class EmployeeBonusCalculator {

    // Método que calcula o bônus anual do funcionário
    public double calculateBonus(double salary, int performanceScore, int monthsEmployed) {
        // Verifica se o tempo de empresa é maior ou igual a 12 meses
        if (monthsEmployed < 12) {
            return 0.0;
        }

        // Se o score for maior que 85, bônus é de 15% do salário mais 500 reais
        if (performanceScore > 85) {
            return (salary * 0.15) + 500.0;
        } 
        // Se o score for entre 60 e 85, bônus é de 8% do salário
        else if (performanceScore >= 60) {
            return salary * 0.08;
        } 
        // Se o score for menor que 60, não ganha bônus
        else {
            return 0.0;
        }
    }
}
