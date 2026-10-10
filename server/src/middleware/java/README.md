# Healix Clinic - Java Middleware Suite

This directory contains the complete Java implementation of the Clinic Middleware layer, translating the Node.js/Express middleware (`roles.js` and `index.js`) into standard Java architectures.

---

## 📁 Architecture & File Mapping

| Node.js / Express Middleware | Java Equivalent File | Description |
| :--- | :--- | :--- |
| `requireRole(...allowedRoles)` in `roles.js` | [`RoleAuthService.java`](file:///c:/Users/jobel/OneDrive/Desktop/FSWD/server/src/middleware/java/RoleAuthService.java) | Core RBAC permission evaluation & user lookup engine |
| Role definitions (`ADMIN`, `NURSE`, `USER`) | [`Role.java`](file:///c:/Users/jobel/OneDrive/Desktop/FSWD/server/src/middleware/java/Role.java) | Strongly-typed Java `enum` for clinic roles |
| User session object (`req.activeUser`) | [`User.java`](file:///c:/Users/jobel/OneDrive/Desktop/FSWD/server/src/middleware/java/User.java) | User POJO/entity model |
| Route RBAC Protection in Express | [`RequireRole.java`](file:///c:/Users/jobel/OneDrive/Desktop/FSWD/server/src/middleware/java/RequireRole.java) | Custom Java annotation (`@RequireRole({Role.ADMIN})`) |
| Request Logger in `index.js` & RBAC Filter | [`StandaloneMiddlewareDemo.java`](file:///c:/Users/jobel/OneDrive/Desktop/FSWD/server/src/middleware/java/StandaloneMiddlewareDemo.java) | **Runnable JDK 21 Filter & Server** (No external dependencies) |
| Java EE / Jakarta Web Filter | [`JakartaServletRoleFilter.java`](file:///c:/Users/jobel/OneDrive/Desktop/FSWD/server/src/middleware/java/JakartaServletRoleFilter.java) | Standard Java Servlet Filter (`Filter.doFilter()`) |
| Spring Boot Controller Interceptor | [`SpringRoleInterceptor.java`](file:///c:/Users/jobel/OneDrive/Desktop/FSWD/server/src/middleware/java/SpringRoleInterceptor.java) | Spring MVC `HandlerInterceptor.preHandle()` |

---

## 🚀 How to Compile and Run (JDK 21)

From the project root or middleware folder:

```powershell
# 1. Compile all Java middleware classes
javac -d "server/src/middleware/java/bin" "server/src/middleware/java/*.java"

# 2. Run the Standalone Middleware Demo with automated test suite
java -cp "server/src/middleware/java/bin" middleware.StandaloneMiddlewareDemo
```

---

## 🔒 Middleware Logic Flow

1. **Extraction**: Reads `x-user-id` from HTTP header, or `patientId` / `userId` from query parameter.
2. **Lookup**: Resolves user from data store matching `id`, `email`, or `username`.
3. **Authentication**: If no user is identified, halts execution and returns `401 Unauthorized` (`Please log in to continue.`).
4. **Authorization (RBAC)**:
   - **`ADMIN` (Doctor)**: Universal bypass across all endpoints.
   - **`allowedRoles`**: If user role matches permitted roles, attaches user to request context and invokes `chain.doFilter()`.
   - **Unauthorized**: Returns `403 Forbidden` with detailed role error.
