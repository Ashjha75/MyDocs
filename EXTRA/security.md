
----------

# **Spring Security Syllabus for Interviews**

### **Module 1: Introduction to Spring Security**

-   What is Spring Security and why it is needed
    
-   Authentication vs Authorization
    
-   Security architecture in Spring: Filters, SecurityContext, AuthenticationManager
    
-   Security Filters Chain
    

----------

### **Module 2: Authentication Basics**

-   In-memory Authentication
    
-   JDBC Authentication
    
-   Custom UserDetailsService & UserDetails
    
-   Password Encoding: `BCryptPasswordEncoder`, `NoOpPasswordEncoder`, `DelegatingPasswordEncoder`
    
-   AuthenticationManager & AuthenticationProvider
    
-   SecurityContext & SecurityContextHolder
    

----------

### **Module 3: Authorization & Access Control**

-   Role-based Access Control (RBAC)
    
-   Method-level Security: `@PreAuthorize`, `@PostAuthorize`, `@Secured`, `@RolesAllowed`
    
-   URL-based Security: `antMatchers()`, `mvcMatchers()`, `requestMatchers()`
    
-   AccessDecisionManager & Voter concepts
    
-   Denying Access & Handling Exceptions: `AccessDeniedHandler`
    

----------

### **Module 4: Securing Web Applications**

-   HTTP Basic & Form-based Authentication
    
-   Custom Login Page & Logout Configuration
    
-   CSRF Protection: Why and how it works
    
-   Session Management: Concurrency control, invalid sessions
    
-   Remember-me functionality
    

----------

### **Module 5: JWT (JSON Web Tokens)**

-   Understanding JWT structure: Header, Payload, Signature
    
-   Stateless Authentication with JWT
    
-   Creating and Validating JWT in Spring Boot
    
-   Integrating JWT with Spring Security Filters
    
-   Refresh Tokens & Expiration Strategies
    

----------

### **Module 6: OAuth2 & OpenID Connect**

-   Basics of OAuth2 Authorization Flow: Resource Owner, Client, Authorization Server, Resource Server
    
-   Spring Security OAuth2 Client & Server setup
    
-   Social login (Google, GitHub, Facebook)
    
-   JWT in OAuth2 Resource Server
    
-   Roles & Scopes mapping in OAuth2
    

----------

### **Module 7: Advanced Security Topics**

-   Method-level security with SpEL expressions
    
-   Custom Authentication & Authorization Filters
    
-   Security Events & Listeners: `AuthenticationSuccessEvent`, `AbstractAuthenticationEvent`
    
-   Password Policy & Account Locking
    
-   Brute-force Attack Prevention
    

----------

### **Module 8: Integrations**

-   Securing REST APIs with Spring Security
    
-   CORS (Cross-Origin Resource Sharing) configuration
    
-   Integrating Spring Security with Spring Session (distributed session)
    
-   Security Testing: `@WithMockUser`, `@WithUserDetails`, MockMvc security tests
    
-   Logging security events and audit
    

----------

### **Module 9: Performance & Best Practices**

-   Stateless vs Stateful Security
    
-   Token expiration and refresh strategy
    
-   Best practices for storing passwords and secrets
    
-   Security headers: `X-Frame-Options`, `X-XSS-Protection`, `Content-Security-Policy`
    

----------

### **Module 10: Optional/Pro-Level Topics**

-   Multi-factor Authentication (MFA)
    
-   LDAP Authentication
    
-   SSO (Single Sign-On) Integration
    
-   OAuth2 JWT Claims Mapping
    
-   Spring Security + GraphQL Security
    

----------



    


