package middleware;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation used to protect API endpoints and controllers with Role-Based Access Control.
 * Equivalent to requireRole('ADMIN', 'NURSE') in Node.js Express.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    Role[] value() default {};
}
