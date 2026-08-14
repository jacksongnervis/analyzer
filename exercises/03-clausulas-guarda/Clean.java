public class UserAccessValidator {

    private static final int MAX_LOGIN_ATTEMPTS = 5;

    public boolean canAccessAdminPanel(String userRole, boolean isActive, boolean isEmailVerified, int loginAttempts) {
        if (!isActive || !isEmailVerified) {
            return false;
        }

        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            return false;
        }

        return isAdminRole(userRole);
    }

    private boolean isAdminRole(String userRole) {
        return "ADMIN".equalsIgnoreCase(userRole) || "SUPER_ADMIN".equalsIgnoreCase(userRole);
    }
}
