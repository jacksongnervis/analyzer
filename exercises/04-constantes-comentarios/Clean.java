public class EmployeeBonusCalculator {

    private static final int MIN_MONTHS_FOR_BONUS = 12;
    private static final int HIGH_PERFORMANCE_THRESHOLD = 85;
    private static final int MIN_PERFORMANCE_FOR_BONUS = 60;
    
    private static final double HIGH_BONUS_RATE = 0.15;
    private static final double HIGH_BONUS_FIXED_EXTRA = 500.0;
    private static final double STANDARD_BONUS_RATE = 0.08;

    public double calculateBonus(double salary, int performanceScore, int monthsEmployed) {
        if (monthsEmployed < MIN_MONTHS_FOR_BONUS) {
            return 0.0;
        }

        if (performanceScore > HIGH_PERFORMANCE_THRESHOLD) {
            return (salary * HIGH_BONUS_RATE) + HIGH_BONUS_FIXED_EXTRA;
        }

        if (performanceScore >= MIN_PERFORMANCE_FOR_BONUS) {
            return salary * STANDARD_BONUS_RATE;
        }

        return 0.0;
    }
}
