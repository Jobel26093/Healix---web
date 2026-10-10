package middleware;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Standard Java Servlet Filter implementation for Jakarta / Java EE / Spring Boot.
 * 
 * In Java web applications (Spring Boot, Tomcat, Jetty), filters represent 
 * the canonical middleware pattern:
 * 
 *   Client Request ---> [Servlet Filter] ---> [Servlet / Controller]
 * 
 * Usage in web.xml or @WebFilter:
 *   @WebFilter(urlPatterns = "/api/*")
 */
public class JakartaServletRoleFilter {

    private final List<Role> allowedRoles;

    public JakartaServletRoleFilter(Role... roles) {
        this.allowedRoles = Arrays.asList(roles);
    }

    /**
     * Conceptual representation of doFilter(ServletRequest, ServletResponse, FilterChain).
     * 
     * In Jakarta Servlet API:
     *   public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
     */
    public boolean execute(
            String headerUserId,
            String queryParamUserId,
            User sessionUser,
            List<User> userDatabase,
            StringBuilder errorOutput
    ) {
        // Step 1: Extract identifier
        String explicitId = (headerUserId != null && !headerUserId.isBlank()) 
                ? headerUserId 
                : queryParamUserId;

        // Step 2: Lookup user
        User user = null;
        if (explicitId != null && !explicitId.isBlank()) {
            user = RoleAuthService.findUser(userDatabase, explicitId).orElse(null);
        }
        if (user == null) {
            user = sessionUser;
        }

        // Step 3: Authenticate
        if (user == null) {
            errorOutput.append("HTTP 401 Unauthorized: Please log in to continue.");
            return false;
        }

        // Step 4: Authorize
        Role[] rolesArray = allowedRoles.toArray(new Role[0]);
        RoleAuthService.AuthResult result = RoleAuthService.checkPermission(user, rolesArray);

        if (!result.isSuccess()) {
            errorOutput.append("HTTP ").append(result.getStatusCode()).append(" Forbidden: ").append(result.getErrorMessage());
            return false;
        }

        // Authorized: pass to next filter / servlet in the chain
        return true;
    }
}
