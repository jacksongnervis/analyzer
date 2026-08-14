import java.util.List;
import java.util.Optional;

public class UserRepository {
    private final List<String> users = List.of("Ana", "Bruno", "Carlos");

    public Optional<String> findUserByName(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }

        return users.stream()
                .filter(user -> user.equalsIgnoreCase(name.trim()))
                .findFirst();
    }
}
