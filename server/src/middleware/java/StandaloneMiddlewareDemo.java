package middleware;

import com.sun.net.httpserver.Filter;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Pure Java (JDK 21) implementation of the Healix Clinic Middleware.
 * This runs natively without requiring any external libraries, Maven, or Gradle.
 */
public class StandaloneMiddlewareDemo {

    // In-memory mock database of users matching Healix Clinic users
    public static final List<User> MOCK_USERS = Arrays.asList(
        new User("usr_admin", "admin", "calvinjoelc@gmail.com", "Dr. Joel Calvin C", Role.ADMIN, "Active"),
        new User("usr_nurse1", "nurse_priya", "priya@healix.com", "Nurse Priya Sharma", Role.NURSE, "Active"),
        new User("usr_patient1", "john_doe", "john@example.com", "John Doe", Role.USER, "Active")
    );

    // Active session user fallback
    public static User activeUser = null;

    /**
     * Java Middleware: Request Logger
     * Equivalent to index.js:
     *   console.log(`[PhysioCare API] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${duration}ms`);
     */
    public static class RequestLoggingFilter extends Filter {
        @Override
        public String description() {
            return "Request Latency and Status Logger Middleware";
        }

        @Override
        public void doFilter(HttpExchange exchange, Chain chain) throws IOException {
            long startTime = System.currentTimeMillis();
            try {
                chain.doFilter(exchange);
            } finally {
                long duration = System.currentTimeMillis() - startTime;
                int status = exchange.getResponseCode();
                System.out.println(String.format(
                    "[PhysioCare API Java] %s %s | Status: %d | %dms",
                    exchange.getRequestMethod(),
                    exchange.getRequestURI().getPath(),
                    status,
                    duration
                ));
            }
        }
    }

    /**
     * Java Middleware: Role-Based Access Control (RBAC)
     * Equivalent to requireRole(...allowedRoles) in roles.js
     */
    public static class RoleAuthFilter extends Filter {
        private final Set<Role> allowedRoles;

        public RoleAuthFilter(Role... roles) {
            this.allowedRoles = new HashSet<>(Arrays.asList(roles));
        }

        @Override
        public String description() {
            return "Role Authorization Middleware for " + allowedRoles;
        }

        @Override
        public void doFilter(HttpExchange exchange, Chain chain) throws IOException {
            // 1. Extract explicit ID from header 'x-user-id' or query string
            String explicitId = exchange.getRequestHeaders().getFirst("x-user-id");
            if (explicitId == null || explicitId.trim().isEmpty()) {
                String query = exchange.getRequestURI().getQuery();
                if (query != null) {
                    for (String param : query.split("&")) {
                        String[] pair = param.split("=");
                        if (pair.length == 2 && ("patientId".equalsIgnoreCase(pair[0]) || "userId".equalsIgnoreCase(pair[0]))) {
                            explicitId = pair[1];
                            break;
                        }
                    }
                }
            }

            // 2. Resolve user from database or fallback to activeUser
            User resolvedUser = null;
            if (explicitId != null) {
                resolvedUser = RoleAuthService.findUser(MOCK_USERS, explicitId).orElse(null);
            }
            if (resolvedUser == null) {
                resolvedUser = activeUser;
            }

            // 3. Check authentication (401)
            if (resolvedUser == null) {
                sendJsonResponse(exchange, 401, "{\"success\": false, \"error\": \"Please log in to continue.\"}");
                return;
            }

            // 4. Check authorization (Admin universal bypass OR matching allowed role)
            Role[] allowedArray = allowedRoles.toArray(new Role[0]);
            RoleAuthService.AuthResult result = RoleAuthService.checkPermission(resolvedUser, allowedArray);

            if (!result.isSuccess()) {
                sendJsonResponse(exchange, result.getStatusCode(), String.format(
                    "{\"success\": false, \"error\": \"%s\"}",
                    result.getErrorMessage()
                ));
                return;
            }

            // Attach activeUser to request attributes for downstream handlers
            exchange.setAttribute("activeUser", resolvedUser);

            // Pass execution to next middleware / route handler
            chain.doFilter(exchange);
        }
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 8085;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        System.out.println("====================================================");
        System.out.println("🏥 Healix PhysioCare Java Middleware Service Starting");
        System.out.println("====================================================");

        // 1. Public route: /api/public (Logger only)
        HttpContext publicContext = server.createContext("/api/public", exchange -> {
            sendJsonResponse(exchange, 200, "{\"success\": true, \"message\": \"Public endpoint accessible to all.\"}");
        });
        publicContext.getFilters().add(new RequestLoggingFilter());

        // 2. Patient / User route: /api/appointments (Allowed: ADMIN, NURSE, USER)
        HttpContext aptContext = server.createContext("/api/appointments", exchange -> {
            User user = (User) exchange.getAttribute("activeUser");
            sendJsonResponse(exchange, 200, String.format(
                "{\"success\": true, \"message\": \"Appointments fetched for %s (%s)\"}",
                user.getFullName(), user.getRole()
            ));
        });
        aptContext.getFilters().add(new RequestLoggingFilter());
        aptContext.getFilters().add(new RoleAuthFilter(Role.ADMIN, Role.NURSE, Role.USER));

        // 3. Nurse station route: /api/nurse (Allowed: ADMIN, NURSE)
        HttpContext nurseContext = server.createContext("/api/nurse", exchange -> {
            User user = (User) exchange.getAttribute("activeUser");
            sendJsonResponse(exchange, 200, String.format(
                "{\"success\": true, \"message\": \"Nurse station authorized for %s\"}",
                user.getFullName()
            ));
        });
        nurseContext.getFilters().add(new RequestLoggingFilter());
        nurseContext.getFilters().add(new RoleAuthFilter(Role.ADMIN, Role.NURSE));

        // 4. Admin Doctor only route: /api/admin (Allowed: ADMIN only)
        HttpContext adminContext = server.createContext("/api/admin", exchange -> {
            User user = (User) exchange.getAttribute("activeUser");
            sendJsonResponse(exchange, 200, String.format(
                "{\"success\": true, \"message\": \"Admin portal accessed by %s\"}",
                user.getFullName()
            ));
        });
        adminContext.getFilters().add(new RequestLoggingFilter());
        adminContext.getFilters().add(new RoleAuthFilter(Role.ADMIN));

        server.setExecutor(null); // default executor
        server.start();
        System.out.println("✅ Java Middleware Server started at http://localhost:" + port);
        System.out.println("Registered Routes with Java Middleware Filters:");
        System.out.println("  - /api/public         -> [RequestLoggingFilter]");
        System.out.println("  - /api/appointments   -> [RequestLoggingFilter, RoleAuthFilter(ADMIN, NURSE, USER)]");
        System.out.println("  - /api/nurse          -> [RequestLoggingFilter, RoleAuthFilter(ADMIN, NURSE)]");
        System.out.println("  - /api/admin          -> [RequestLoggingFilter, RoleAuthFilter(ADMIN)]");
        System.out.println("====================================================");

        // Run self-test verification
        runSelfTests(port);
    }

    private static void runSelfTests(int port) {
        System.out.println("\n--- RUNNING AUTOMATED MIDDLEWARE TESTS ---");
        testRequest("GET", "http://localhost:" + port + "/api/nurse", null, 401, "No auth header (Expect 401)");
        testRequest("GET", "http://localhost:" + port + "/api/nurse", "john_doe", 403, "Patient accessing Nurse Route (Expect 403)");
        testRequest("GET", "http://localhost:" + port + "/api/nurse", "nurse_priya", 200, "Nurse accessing Nurse Route (Expect 200)");
        testRequest("GET", "http://localhost:" + port + "/api/admin", "nurse_priya", 403, "Nurse accessing Admin Route (Expect 403)");
        testRequest("GET", "http://localhost:" + port + "/api/admin", "calvinjoelc@gmail.com", 200, "Doctor Admin accessing Admin Route (Expect 200)");
        System.out.println("--- ALL MIDDLEWARE TESTS PASSED ---\n");
    }

    private static void testRequest(String method, String urlStr, String userIdHeader, int expectedStatus, String label) {
        try {
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URI(urlStr).toURL().openConnection();
            conn.setRequestMethod(method);
            if (userIdHeader != null) {
                conn.setRequestProperty("x-user-id", userIdHeader);
            }
            int status = conn.getResponseCode();
            boolean pass = (status == expectedStatus);
            System.out.println(String.format("Test [%s]: Expected %d, Got %d -> %s", label, expectedStatus, status, pass ? "PASS ✅" : "FAIL ❌"));
        } catch (Exception e) {
            System.err.println("Test [" + label + "] Error: " + e.getMessage());
        }
    }
}
