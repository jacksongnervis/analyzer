public class OrderService {

    public void processOrder(String customerEmail, int quantity, double unitPrice, int stockAvailable) {
        // 1. Validação de estoque
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");
        }
        if (quantity > stockAvailable) {
            throw new IllegalStateException("Estoque insuficiente para o pedido");
        }

        // 2. Cálculo do valor com desconto
        double total = quantity * unitPrice;
        if (quantity > 10) {
            total = total * 0.90; // 10% de desconto para compras no atacado
        }

        // 3. Salvar no banco
        System.out.println("Salvando pedido no banco de dados para " + customerEmail + " com total: R$ " + total);

        // 4. Enviar e-mail de confirmação
        System.out.println("Enviando e-mail de confirmação de compra para: " + customerEmail);
    }
}
