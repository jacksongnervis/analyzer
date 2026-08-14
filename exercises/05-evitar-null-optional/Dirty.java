import java.util.List;

public class UserRepository {
    private List<String> users = List.of("Ana", "Bruno", "Carlos");

    // Procura usuário por nome e retorna null se não encontrar
    public String findUserByName(String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return null;
            }

            for (String user : users) {
                if (user.equalsIgnoreCase(name.trim())) {
                    return user;
                }
            }
            return null; // Retorna null se não encontrar
        } catch (Exception e) {
            // Ignora o erro e segue em frente
            return null;
        }
    }
}
