public class OrderService {

    public void processOrder(String customerEmail, int quantity, double unitPrice, int stockAvailable) {
        validateStock(quantity, stockAvailable);
        double totalPrice = calculateTotalPrice(quantity, unitPrice);
        saveOrder(customerEmail, totalPrice);
        sendConfirmationEmail(customerEmail);
    }

    private void validateStock(int quantity, int stockAvailable) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }
        if (quantity > stockAvailable) {
            throw new IllegalStateException("Estoque insuficiente para o pedido");
        }
    }

    private double calculateTotalPrice(int quantity, double unitPrice) {
        double subtotal = quantity * unitPrice;
        if (quantity > 10) {
            return subtotal * 0.90;
        }
        return subtotal;
    }

    private void saveOrder(String customerEmail, double total) {
        System.out.println("Salvando pedido no banco de dados para " + customerEmail + " com total: R$ " + total);
    }

    private void sendConfirmationEmail(String customerEmail) {
        System.out.println("Enviando e-mail de confirmação de compra para: " + customerEmail);
    }
}
