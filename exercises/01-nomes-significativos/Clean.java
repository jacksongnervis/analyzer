public class OrderPriceCalculator {

    public double calculateFinalPrice(double originalPrice, double discountPercentage, double shippingFee) {
        double discountAmount = originalPrice * (discountPercentage / 100.0);
        double discountedPrice = originalPrice - discountAmount;
        double finalPrice = discountedPrice + shippingFee;
        return finalPrice;
    }
}
