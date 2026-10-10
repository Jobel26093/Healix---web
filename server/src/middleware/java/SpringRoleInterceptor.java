package middleware;

import java.lang.reflect.Method;
import java.util.List;

/**
 * Spring Boot Middleware: HandlerInterceptor implementation.
 * 
 * In Spring Web MVC, HandlerInterceptor represents the controller-level middleware:
 *   preHandle()  -> runs BEFORE the controller method executes (like req, res, next)
 *   postHandle() -> runs AFTER the controller method executes
 *   afterCompletion() -> runs after the view is rendered
 */
public class SpringRoleInterceptor {

    private final List<User> userDatabase;

    public SpringRoleInterceptor(List<User> userDatabase) {
        this.userDatabase = userDatabase;
    }

    /**
     * Equivalent to Spring's HandlerInterceptor.preHandle(HttpServletRequest, HttpServletResponse, Object handler)
     * 
     * @param targetMethod the controller handler method being invoked
     * @param headerUserId value of 'x-user-id' header
     * @param activeSessionUser currently logged-in user in session
     * @return true to continue request execution, false to block and return error
     */
    public boolean preHandle(Method targetMethod, String headerUserId, User activeSessionUser) {
        RequireRole annotation = targetMethod.getAnnotation(RequireRole.class);
        if (annotation == null) {
            // No role constraint on this endpoint -> allow request
            return true;
        }

        // 1. Identify user
        User user = null;
        if (headerUserId != null && !headerUserId.isBlank()) {
            user = RoleAuthService.findUser(this.userDatabase, headerUserId).orElse(null);
        }
        if (user == null) {
            user = activeSessionUser;
        }

        // 2. Authenticate
        if (user == null) {
            System.err.println("Spring Interceptor: 401 Unauthorized - No active user");
            return false;
        }

        // 3. Evaluate roles
        Role[] allowedRoles = annotation.value();
        RoleAuthService.AuthResult result = RoleAuthService.checkPermission(user, allowedRoles);

        if (!result.isSuccess()) {
            System.err.println("Spring Interceptor: " + result.getStatusCode() + " - " + result.getErrorMessage());
            return false;
        }

        return true;
    }
}
