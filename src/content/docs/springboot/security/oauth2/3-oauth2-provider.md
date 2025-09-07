---
title : Build Authorization Server
---

### **Part 3: The Provider Perspective - Building an Authorization Server**

**Objective:** To build a complete, compliant **Authorization Server** using Spring. This server will manage clients and users, issue tokens, and become the single source of security truth for your other applications and APIs.

---

#### **3.1. Core Theory: Becoming the Identity Provider**

When you build an Authorization Server, you are taking on the responsibilities that Google or Okta handled in the previous sections. Your server becomes the brain of your security ecosystem.

*   **Core Responsibilities:**
    1.  **Manage Users:** Authenticate users against your own user database (e.g., using a username and password). This is where you plug in your existing `UserDetailsService`.
    2.  **Manage Clients:** Keep a registry of all applications (`Clients`) that are allowed to use your server. This is a critical security boundary. Not just any application can request tokens; they must be pre-registered.
    3.  **Handle User Consent:** For user-centric flows (like the Authorization Code Grant), the server must ask the user for permission ("Do you allow App XYZ to access your profile?").
    4.  **Issue and Validate Tokens:** Generate secure `access_token`s and `refresh_token`s according to the requested grant type. It must also expose the necessary endpoints for token validation (like the JWK Set URI).
    5.  **Expose Standard OAuth 2.0 Endpoints:** It must provide the standard endpoints that all OAuth 2.0 clients expect, such as `/oauth2/authorize` (for the user-facing part of the flow) and `/oauth2/token` (for the back-channel token exchange).

*   **The Spring Authorization Server Project:**
    This functionality used to be part of an older "Spring Security OAuth" project, which is now deprecated. It has been completely rebuilt as a new, community-driven project called **Spring Authorization Server**. It is designed to be highly compliant with the latest OAuth 2.1, OIDC, and related specifications. It is powerful and flexible but also requires more explicit configuration than the client or resource server setups.

---

#### **3.2. Practical Implementation: Configuring Your Own Auth Server**

Let's build a minimal, functioning Authorization Server.

**1. Dependencies**
Add the dedicated dependency to your `pom.xml`. This is separate from the other security starters.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-authorization-server</artifactId>
</dependency>
```

**2. Core Configuration (`AuthorizationServerConfig.java`)**
Most of the setup happens in a dedicated configuration class.

```java
@Configuration
@EnableWebSecurity
public class AuthorizationServerConfig {

    // First, define the SecurityFilterChain that protects the Authorization Server's own endpoints
    @Bean
    @Order(1) // This filter chain needs to have the highest priority
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        http
            // Enable OIDC protocol
            .getConfigurer(OAuth2AuthorizationServerConfigurer.class).oidc(Customizer.withDefaults());

        // Redirect users to the default login page if they are not authenticated
        http.exceptionHandling(exceptions ->
            exceptions.authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
        );

        return http.build();
    }

    // Second, define the SecurityFilterChain for standard user authentication (login form)
    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated()
            )
            .formLogin(Customizer.withDefaults()); // Standard form-based login

        return http.build();
    }

    // Third, define your user store. We can reuse the one from your JWT project.
    // (You would need a User model, repository, and password encoder bean as before)
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        // You would typically load users from your database
        return new CustomUserDetailsService(userRepository); // Your existing service
    }

    // Fourth, define the clients that are allowed to connect to your server
    @Bean
    public RegisteredClientRepository registeredClientRepository(PasswordEncoder passwordEncoder) {
        // Define a client for a user-facing web application (e.g., a React frontend)
        RegisteredClient oidcClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("my-client-app")
                .clientSecret(passwordEncoder.encode("secret")) // Always encode secrets
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri("http://127.0.0.1:8080/login/oauth2/code/my-client-app")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope("patients:read")
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
                .build();

        // For in-memory storage (simple demo). In production, use a JDBC-backed implementation.
        return new InMemoryRegisteredClientRepository(oidcClient);
    }
    
    // Fifth, provide beans for JWK source and provider settings
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        // Standard setup for generating RSA keys for signing JWTs
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    private static KeyPair generateRsaKey() { /* Helper method to generate keys */ }

    @Bean
    public ProviderSettings providerSettings() {
        // Configure the issuer URL, which will be embedded in the JWTs
        return ProviderSettings.builder().issuer("http://localhost:9000").build();
    }
}
```

*   **`UserDetailsService`:** You simply plug in the same service you built for JWT/RBAC. The Authorization Server will use it to validate the user's password during the login process.
*   **`RegisteredClientRepository`:** This is the most important new concept. It is the **registry of allowed applications**. For each client, you must explicitly define:
    *   `clientId` / `clientSecret`: The application's own credentials.
    *   `clientAuthenticationMethod`: How the client authenticates itself (e.g., `CLIENT_SECRET_BASIC` sends credentials in the HTTP Basic Auth header).
    *   `authorizationGrantType`: Which OAuth 2.0 flows this client is allowed to use. This is a critical security control.
    *   `redirectUri`: A whitelist of URLs where your server is allowed to send the `authorization_code`. Prevents phishing attacks.
    *   `scope`: The list of permissions this client is allowed to request.

---

#### **3.3. Advanced Customization**

With the server running, the next step is to tailor it to your business needs.

*   **Adding Custom Claims to Tokens**
    Your Resource Servers need to know the user's roles to perform RBAC. You must configure the Authorization Server to add these roles to the JWTs it issues. This is done with an `OAuth2TokenCustomizer`.

```java
// Add this bean to your AuthorizationServerConfig
@Bean
public OAuth2TokenCustomizer<JwtEncodingContext> jwtTokenCustomizer() {
    return (context) -> {
        // This lambda is called right before the JWT is created
        if (OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType())) {
            
            // Get the authenticated principal (the user)
            Authentication principal = context.getPrincipal();
            
            // Get the user's authorities (roles)
            Set<String> authorities = principal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());

            // Add the authorities to a custom "roles" claim in the JWT
            context.getClaims().claim("roles", authorities);
        }
    };
}
```
Now, every access token issued by your server will contain a payload like:
```json
{
  "iss": "http://localhost:9000",
  "sub": "user1",
  "exp": 1679932800,
  "roles": [
    "ROLE_DOCTOR",
    "patients:read"
  ]
}
```
Your Resource Server (from Part 2) can then use its `JwtAuthenticationConverter` to read this `roles` claim and perform RBAC.

#### **Building a Complete Ecosystem**

You now have all three components:

1.  **Authorization Server (Your App from Part 3):** Runs on `localhost:9000`. It manages users and clients and issues tokens.
2.  **Resource Server (Your API from Part 2):** Runs on `localhost:8081`. It protects `/api/patients` and is configured with `issuer-uri: http://localhost:9000`.
3.  **Client (A new App based on Part 1):** Runs on `localhost:8080`. It is configured to use your Authorization Server to log users in and, upon success, uses the received access token to call the Resource Server.

This creates a complete, secure, and decoupled microservices architecture where security and identity are centralized, and your APIs can focus on their business logic.

#### **Interview Focus for Part 3**

**Question:** *"Describe the key components required to set up a Spring Authorization Server and how you would register a client to support a standard web application login."*

**Your Answer:**
"To set up a Spring Authorization Server, you need three core configuration beans:
1.  **A `UserDetailsService`**, which integrates our existing user database for authenticating the end-user.
2.  **A `JWKSource`**, which provides the cryptographic keys used to sign the JWTs.
3.  **And most importantly, a `RegisteredClientRepository`**. This is the security registry for all applications.

To register a client for a standard web app, I would create a `RegisteredClient` object with the following critical settings:
*   A unique `clientId` and a securely stored, hashed `clientSecret`.
*   The `authorizationGrantType` would be set to `AUTHORIZATION_CODE` and `REFRESH_TOKEN` to enable the secure, redirect-based login flow.
*   The `redirectUri` would be set to a specific, whitelisted URL on the client application, like `http://my-app.com/login/oauth2/code/my-auth-server`, to prevent token hijacking.
*   Finally, I'd define the `scopes` the client is allowed to request, such as `openid` for authentication and any custom scopes like `patients:read` for API access. This ensures the client only operates within its granted permissions."