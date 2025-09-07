---
title : Securing a Resource Server
---

### **Part 2: The API Perspective - Securing a Resource Server**

**Objective:** To build a stateless REST API (a **Resource Server**) protected by OAuth 2.0, capable of validating JWT access tokens issued by an external Authorization Server.

---

#### **2.1. Core Theory: Protecting Your Endpoints**

In Part 1, we built a **Client** application. Its job was to help a user log in. Now, that client application has an `access_token` and wants to use it to call your backend API to fetch or modify data. This backend API is the **Resource Server**.

*   **The Resource Server's Job:** A Resource Server has two simple but critical responsibilities:
    1.  **Protect Resources:** Enforce access control rules on its endpoints (e.g., `/api/patients`).
    2.  **Validate Tokens:** Inspect the `Authorization: Bearer <token>` header on every incoming request and determine if the token is valid.

    Crucially, a Resource Server **does not** manage users, handle passwords, or issue tokens. It is a bouncer, not a registration desk. It trusts the **Authorization Server** to have done that work correctly.

#### **Token Introspection vs. Local Validation (JWT)**

A Resource Server has two primary methods to check if a token is valid. Understanding the trade-offs is key to architectural design.

1.  **Token Introspection (The "Opaque" Token Method)**
    *   **Concept:** The Resource Server receives a token but cannot read it (it's an "opaque" or random string). For *every single request*, it must make a separate, synchronous network call to the Authorization Server's "introspection endpoint" and ask, "Is this token valid?"
    *   **Flow:**
        ```mermaid
        sequenceDiagram
            participant Client
            participant Resource Server
            participant Authorization Server

            Client->>Resource Server: 1. GET /api/data (Authorization: Bearer opaque-token-123)
            Resource Server->>Authorization Server: 2. POST /introspect (token=opaque-token-123)
            Authorization Server-->>Resource Server: 3. { "active": true, "scope": "read" }
            Resource Server-->>Client: 4. 200 OK { data }
        ```
    *   **Pros:**
        *   **Immediate Revocation:** If a token is revoked at the Authorization Server, introspection will fail instantly.
    *   **Cons:**
        *   **Performance Bottleneck:** Every API call requires an extra network hop, adding latency.
        *   **Chatty:** Creates significant traffic between your services.
        *   **Single Point of Failure:** If the Authorization Server is down, your Resource Server cannot validate any tokens and is effectively offline.

2.  **Local JWT Validation (The Modern, Stateless Method)**
    *   **Concept:** The Resource Server receives a JWT. Because a JWT is self-contained and cryptographically signed, the Resource Server can validate it *locally* without talking to the Authorization Server.
    *   **Flow:**
        ```mermaid
        sequenceDiagram
            participant Client
            participant Resource Server
            participant Authorization Server

            Note over Authorization Server: Publishes its Public Keys at a .well-known URI
            Resource Server->>Authorization Server: (On Startup) Fetches & Caches Public Keys
            
            Client->>Resource Server: 1. GET /api/data (Authorization: Bearer signed-jwt.string)
            Resource Server->>Resource Server: 2. Validate JWT locally <br> - Check signature with cached Public Key <br> - Check expiry (`exp`) & issuer (`iss`) claims
            Resource Server-->>Client: 3. 200 OK { data }
        ```
    *   **Pros:**
        *   **Extremely Fast & Performant:** No extra network calls at request time.
        *   **Scalable & Resilient:** The Resource Server has no runtime dependency on the Authorization Server.
    *   **Cons:**
        *   **Delayed Revocation:** A JWT, once issued, is valid until it expires. (This is why we pair it with the Refresh Token pattern and keep JWT lifetimes short, as discussed previously).

For modern, scalable microservices, **Local JWT Validation is the standard and preferred approach**.

#### **The JWK Set URI**

How does the Resource Server get the public keys to validate the JWT signature without a shared secret? It uses a **JSON Web Key Set (JWK Set)**.

*   **JWK:** A standardized JSON object that represents a cryptographic key.
*   **JWK Set:** A JSON object that contains a list (`keys`) of JWKs.
*   **JWK Set URI:** A standardized, public, well-known endpoint hosted by the Authorization Server where it publishes its public signing keys. Spring Security knows to look for this at the Authorization Server's `issuer-uri` by checking its OIDC discovery document (`/.well-known/openid-configuration`).

When your Spring Boot Resource Server starts up, it hits this URI, downloads the public keys, and caches them. When a JWT arrives, it looks at the `kid` (Key ID) in the JWT's header, finds the matching key in its cache, and uses it to perform the cryptographic signature check. This process is both secure and highly efficient.

---

### **2.2. Practical Implementation: `oauth2ResourceServer()`**

Let's build a secure API. We'll assume you have an Authorization Server (like Okta, Auth0, or one you'll build in Part 3) that issues JWTs.

**1. Add Dependencies**
Your `pom.xml` needs the resource server dependency.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

**2. Configuration (`application.yml`)**
This is remarkably simple. You just need to tell Spring where your Authorization Server is.

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          # This is the base URL of your Authorization Server
          # Spring will automatically discover the jwk-set-uri from here
          issuer-uri: https://your-auth-server.com/oauth2/default
```

**3. Configure the `SecurityFilterChain`**
Update your `SecurityConfig` to enable resource server functionality.

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Essential for method-level security like @PreAuthorize
public class SecurityConfig {

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated() // Secure all endpoints by default
            )
            // Enable and configure OAuth2 Resource Server support
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        // Make the session stateless, as we are relying on the Bearer token
        http.sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
```
This configuration adds the `BearerTokenAuthenticationFilter` to your filter chain. This filter is responsible for:
1.  Extracting the JWT from the `Authorization: Bearer <token>` header.
2.  Validating the JWT's signature against the keys from the `jwk-set-uri`.
3.  Validating the `exp` (expiration), `nbf` (not before), and `iss` (issuer) claims.
4.  Creating an `Authentication` object and placing it in the `SecurityContextHolder`.

**4. Scopes vs. Authorities (A Critical Distinction)**

*   **Scope:** A permission granted to the *client application*. Defined in the `scope` claim of the JWT (e.g., `"scope": "patients:read patients:write"`). It answers the question, "What is this *application* allowed to do?"
*   **Authority (Role/Permission):** A permission granted to the *end-user*. Typically found in a custom claim (e.g., `"roles": ["ROLE_DOCTOR"]`). It answers the question, "What is this *user* allowed to do?"

By default, Spring Security maps OAuth 2.0 Scopes to authorities, adding a `SCOPE_` prefix.

```java
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    // This endpoint requires the calling application to have been granted
    // the "patients:read" scope by the Authorization Server.
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_patients:read')")
    public Patient getPatientById(@PathVariable Long id) {
        // ... logic
    }
}
```

**5. Customizing JWT-to-Authority Mapping (The Most Important Real-World Step)**
Checking for scopes is good, but real applications need to check for user roles. You need to tell Spring Security how to find the roles in your JWT and treat them as authorities. This is done with a `JwtAuthenticationConverter`.

Assume your Authorization Server is configured to add a custom claim to the JWT like this: `"roles": ["ROLE_ADMIN", "ROLE_DOCTOR"]`.

First, create the converter bean:

```java
@Configuration
public class JwtConverterConfig {

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        // This converter is responsible for extracting the authorities from the JWT
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        
        // Use a custom claim for authorities. Default is "scope" and "scp".
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles"); 
        
        // Add a prefix to the extracted authorities. Default is "SCOPE_".
        // We set it to empty to use the roles as they are (e.g., "ROLE_ADMIN").
        grantedAuthoritiesConverter.setAuthorityPrefix("");

        // Create the main converter
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtConverter;
    }
}
```

Next, wire this converter into your `SecurityFilterChain`:

```java
// ... In SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationConverter jwtAuthenticationConverter;

    public SecurityConfig(JwtAuthenticationConverter jwtAuthenticationConverter) {
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
    }

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Now you can secure endpoints based on user roles from the JWT
                .requestMatchers("/api/patients/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
            );

        // ... stateless session management
        return http.build();
    }
}
```
Now, your Resource Server is correctly configured to extract user roles from incoming JWTs and use them for fine-grained, role-based access control.