---
title: Authorization & Web Security
---

### **The Professional's Guide to Spring Security: Authorization & Web Security**

---

### **Module 3: Authorization & Access Control**

#### **1. Role-Based Access Control (RBAC)**

*   **What is it?** The most common authorization model. Access rights are granted to **roles**, not directly to individual users. Users are then assigned to one or more roles.
*   **Analogy:** Instead of giving keys to every employee, you give keys to "Managers" and "Cashiers." An employee's access is determined by which group they belong to.
*   **Usage:**
    *   **In Spring:** Typically implemented using roles like `ROLE_ADMIN`, `ROLE_USER`.
    *   **Configuration:** You define rules like "only users with `ROLE_ADMIN` can access `/admin/**`."
*   **Limitations (Interview Gold):** RBAC can become rigid. What if you need a rule like "A user can only edit their *own* profile"? This isn't about a role; it's about the *attributes* of the user and the resource. This limitation leads us to more powerful models like ABAC.

#### **2. Method-Level Security (The Professional Standard)**

*   **What is it?** Securing your application at the **service layer** by placing authorization annotations directly on your business methods.
*   **Why is it used?** It's a finer-grained and more robust approach than URL-based security alone. It protects your business logic directly, regardless of how it's called (e.g., from a REST controller, a message listener, etc.).
*   **How does it work?**
    1.  Enable it with the `@EnableMethodSecurity` annotation on a `@Configuration` class.
    2.  Use annotations on your service methods.

    | Annotation | Description | When to Use |
    | :--- | :--- | :--- |
    | **`@PreAuthorize`**| **The most powerful and recommended.** Runs *before* the method is executed. Uses Spring Expression Language (SpEL) for complex rules. | Almost always. It's flexible and can prevent a method from even starting if the user lacks permission. |
    | **`@PostAuthorize`**| Runs *after* the method has executed but *before* the result is returned. Allows you to write rules based on the returned object. | Rare. Useful for rules like "A user can view an order only if they are the owner of that order." Can be inefficient as the method runs first. |
    | **`@Secured`** | The original Spring Security annotation. Simple role-checking. No SpEL support. | Legacy applications or simple cases. `@PreAuthorize("hasRole('ADMIN')")` is generally preferred. |
    | **`@RolesAllowed`** | A standard JSR-250 annotation. Same functionality as `@Secured`. | When you need to adhere to standard Java EE annotations. |

*   **Code Examples:**
    ```java
    @Service
    public class OrderService {
        
        @PreAuthorize("hasRole('ADMIN')")
        public void deleteAllOrders() { /* ... */ }

        // ABAC using SpEL: Check a method argument
        @PreAuthorize("#order.ownerUsername == authentication.principal.username or hasRole('ADMIN')")
        public void updateOrder(Order order) { /* ... */ }

        // Post-authorization check on the returned object
        @PostAuthorize("returnObject.ownerUsername == authentication.principal.username")
        public Order findOrderById(Long id) { /* ... returns an Order object ... */ }
    }
    ```
*   **`@EnableGlobalMethodSecurity` vs. `@EnableMethodSecurity`:** `@EnableGlobalMethodSecurity` is the older annotation from Spring Security 5. **`@EnableMethodSecurity` is the modern, preferred annotation for Spring Security 6+**. It is more flexible and is the current standard.

#### **3. URL-based Security (The Coarse-Grained Gate)**

*   **What is it?** Defining access rules based on the request's URL pattern within the `SecurityFilterChain`.
*   **`antMatchers` vs. `mvcMatchers` vs. `requestMatchers` (Interview Gold):**
    *   **`antMatchers` (Legacy):** The original matcher. Uses Ant-style path patterns (`/users/**`). It does **not** take the servlet context path into account.
    *   **`mvcMatchers` (Legacy):** A Spring MVC-aware matcher. It respects servlet context paths and path-matching configurations defined in Spring MVC.
    *   **`requestMatchers` (Modern Standard):** The **recommended** matcher for Spring Security 6+. It is the successor to both and provides the most flexible and consistent matching behavior. Always use this in new configurations.

    ```java
    // Modern Spring Security 6+ Configuration
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authz -> authz
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/users/me").authenticated()
            .requestMatchers("/", "/login").permitAll()
            .anyRequest().authenticated()
        );
        return http.build();
    }
    ```

#### **4. `AccessDecisionManager` & `Voter` (The Internals)**
*   **How does it work?** When an authorization check is needed, the `AccessDecisionManager` is called. It doesn't make the decision itself; it polls a list of `AccessDecisionVoter`s. Each `Voter` can vote: **GRANT**, **DENY**, or **ABSTAIN**.
*   **The Default `AccessDecisionManager` is `AffirmativeBased`:** It grants access if **at least one** voter returns GRANT.
*   **Other types:** `ConsensusBased` (grants if there are more GRANT votes than DENY votes) and `UnanimousBased` (grants only if every voter abstains or grants).

---

### **Module 4: Securing Stateful Web Applications**

This module focuses on the security mechanisms typically used in traditional, session-based web applications (as opposed to stateless REST APIs).

#### **1. Authentication Mechanisms**
*   **HTTP Basic:** Transmits username and password as a Base64 encoded string in the `Authorization` header. It is **stateless but insecure** over plain HTTP. Should only be used over HTTPS for simple machine-to-machine communication.
*   **Form-based Authentication:** The most common for user-facing web applications.
    *   **How it works:**
        1.  An unauthenticated user requests a protected page.
        2.  Spring's `ExceptionTranslationFilter` intercepts the `AccessDeniedException` and redirects the user to a login page.
        3.  The user submits their username and password via an HTML form.
        4.  The `UsernamePasswordAuthenticationFilter` processes the form submission, authenticates the user, and establishes a session.
    *   **Configuration:**
        ```java
        // In the SecurityFilterChain
        http.formLogin(form -> form
            .loginPage("/login") // Use our custom login page
            .permitAll()
        );
        http.logout(logout -> logout.logoutUrl("/logout").permitAll());
        ```

#### **2. CSRF Protection (A Critical Concept)**
*   **Why it exists:** To prevent the CSRF attack where an attacker tricks a logged-in user's browser into making a malicious request to your application.
*   **How CSRF tokens work:**
    1.  When the user visits a page with a form, the server generates a unique, unpredictable token and embeds it as a hidden field in the form. It also stores this token in the user's session.
    2.  When the user submits the form, the token is sent back with the request.
    3.  The server's `CsrfFilter` intercepts the request and checks if the token from the form matches the token in the session. If they match, the request is valid. If not, it's rejected.
    4.  An attacker's website cannot guess this token, so any forged request they trick the user's browser into making will fail this check.
*   **When to disable for APIs:** CSRF protection is **essential for stateful, session-based applications** where the browser automatically sends cookies. For **stateless REST APIs** that use tokens (like JWT) in the `Authorization` header, CSRF is not needed and **should be disabled** (`http.csrf(csrf -> csrf.disable())`).

#### **3. Session Management**
*   **What is it?** Controlling the lifecycle and behavior of the `HttpSession`.
*   **Key Features:**
    *   **Session Concurrency Control:** Limiting how many active sessions a single user can have.
        ```java
        // In the SecurityFilterChain
        http.sessionManagement(session -> session
            .maximumSessions(1) // Allow only one login at a time
            .expiredUrl("/login?expired")
        );
        ```
    *   **Session Fixation Protection:** A crucial, **default-enabled** feature. After a user logs in, Spring Security invalidates their old session and creates a new one, preventing an attacker from hijacking a pre-login session.

#### **4. Security Headers**
*   **What are they?** HTTP response headers that instruct the browser to enable certain security features.
*   **Default Headers in Spring Security:** Spring Security adds a set of secure-by-default headers to every response, including:
    *   **`Cache-Control`, `Pragma`:** To prevent client-side caching of sensitive pages.
    *   **`X-Content-Type-Options`:** To prevent MIME-sniffing attacks.
    *   **`X-Frame-Options`:** To prevent clickjacking attacks by blocking your site from being rendered in an `<iframe>`.
*   You can customize or disable them using `http.headers(...)`.

#### **5. CORS (Cross-Origin Resource Sharing)**
*   **What is it?** A browser security feature (Same-Origin Policy) prevents a frontend at `https://my-cool-site.com` from making an AJAX call to your API at `https://api.my-app.com`. CORS is the mechanism for your API server to tell the browser, "I trust that origin; please allow the request."
*   **Configuration:** You configure CORS within the `SecurityFilterChain`.
    ```java
    // In the SecurityFilterChain
    http.cors(cors -> cors.configurationSource(request -> {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://my-cool-site.com")); // Whitelist your frontend
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("*"));
        return config;
    }));
    ```
*   **CORS vs. CSRF (Interview Gold):**
    *   **CORS** is a mechanism to **relax** a browser security policy (Same-Origin). It's about allowing legitimate cross-domain requests.
    *   **CSRF** is an **attack**. CSRF Protection is a mechanism to **enforce** a security policy to prevent malicious cross-domain requests.