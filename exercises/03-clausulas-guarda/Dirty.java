public class UserAccessValidator {

    public boolean canAccessAdminPanel(String userRole, boolean isActive, boolean isEmailVerified, int loginAttempts) {
        boolean hasAccess = false;

        if (isActive) {
            if (isEmailVerified) {
                if (loginAttempts < 5) {
                    if ("ADMIN".equalsIgnoreCase(userRole) || "SUPER_ADMIN".equalsIgnoreCase(userRole)) {
                        hasAccess = true;
                    } else {
                        hasAccess = false;
                    }
                } else {
                    hasAccess = false;
                }
            } else {
                hasAccess = false;
            }
        } else {
            hasAccess = false;
        }

        return hasAccess;
    }
}
