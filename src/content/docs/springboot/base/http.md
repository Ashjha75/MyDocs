---
title: "HTTP Basics for Interviews"
---

---

## 1. How the Internet Works (High-Level Flow)

**Simple Explanation:**
When you type "google.com" in your browser:
1. Browser asks DNS: "What's the IP address for google.com?"
2. DNS responds: "It's 142.250.190.78"
3. Browser connects to that IP address
4. Server sends back the webpage
5. Browser displays it

**Interview Answer:**
"The internet is a network of networks. When a client requests a resource, it first resolves the domain name to an IP address via DNS, then establishes a TCP connection with the server, sends an HTTP request, receives an HTTP response, and renders the content."

---

## 2. DNS Resolution

**What It Does:**
Converts human-readable domain names (google.com) into IP addresses (142.250.190.78) that computers use.

**The Process:**
1. **Browser Cache** - Checks if it already knows the IP
2. **OS Cache** - Checks operating system's cache
3. **Router Cache** - Checks your home router
4. **ISP DNS Server** - Your internet provider's server
5. **Root Server** - Points to .com server
6. **TLD Server** - Points to google.com's name server
7. **Authoritative Server** - Returns the actual IP address

**Interview Tip:**
Mention that DNS uses **UDP** (not TCP) because it's faster and losing one packet isn't critical.

---

## 3. IP Addressing & Routing

**IP Address:**
A unique identifier for devices on a network.

- **IPv4:** 192.168.1.1 (4 billion addresses)
- **IPv6:** 2001:0db8:85a3::8a2e:0370:7334 (340 undecillion addresses)

**Public vs Private:**
- **Private IP:** 192.168.x.x (within your home/office network)
- **Public IP:** Visible to the internet (like your home's street address)

**Routing:**
Routers use routing tables to decide the best path to forward packets from source to destination across multiple networks.

---

## 4. TCP Handshake & Connection Lifecycle

**TCP Three-Way Handshake:**
Before any data is sent, TCP establishes a reliable connection:

1. **SYN** - Client: "I want to connect"
2. **SYN-ACK** - Server: "OK, I'm ready"
3. **ACK** - Client: "Great, let's start"

**Why It Matters:**
- Ensures both sides are ready to communicate
- Establishes sequence numbers for reliable data transfer
- HTTP runs on top of TCP

**Connection Termination (Four-Way):**
1. **FIN** - "I'm done sending"
2. **ACK** - "I acknowledge"
3. **FIN** - "I'm done too"
4. **ACK** - "I acknowledge"

**Interview Gold:**
"TCP is connection-oriented and reliable. UDP is connectionless and faster but less reliable. HTTP uses TCP; DNS uses UDP."

---

## 5. HTTP Request-Response Lifecycle

**Complete Flow:**
```
1. User enters URL or clicks link
2. Browser parses URL (protocol, domain, path)
3. DNS resolution (domain → IP)
4. TCP connection established (3-way handshake)
5. Browser sends HTTP Request
   - Request Line: GET /api/users HTTP/1.1
   - Headers: Host, User-Agent, Accept, etc.
   - Body (if POST/PUT)
6. Server processes request
7. Server sends HTTP Response
   - Status Line: HTTP/1.1 200 OK
   - Headers: Content-Type, Content-Length, etc.
   - Body: The actual data (HTML, JSON, etc.)
8. TCP connection closed (or kept alive)
9. Browser renders the response
```

---

## 6. HTTP Methods

| Method | Purpose | Idempotent? | Has Body? |
|--------|---------|-------------|-----------|
| **GET** | Retrieve data | ✅ Yes | No |
| **POST** | Create new resource | ❌ No | Yes |
| **PUT** | Replace entire resource | ✅ Yes | Yes |
| **PATCH** | Update part of resource | ❌ No | Yes |
| **DELETE** | Remove resource | ✅ Yes | No |
| **HEAD** | Like GET but no body (only headers) | ✅ Yes | No |
| **OPTIONS** | Get allowed methods for a resource | ✅ Yes | No |

**Interview Examples:**

**GET:**
```
GET /api/users/123
Purpose: Retrieve user 123's data
```

**POST:**
```
POST /api/users
Body: {"name": "John", "email": "john@example.com"}
Purpose: Create a new user
```

**PUT:**
```
PUT /api/users/123
Body: {"name": "John Updated", "email": "john@example.com", "age": 30}
Purpose: Replace entire user 123 with new data
```

**PATCH:**
```
PATCH /api/users/123
Body: {"email": "newemail@example.com"}
Purpose: Update only the email field
```

**DELETE:**
```
DELETE /api/users/123
Purpose: Delete user 123
```

**OPTIONS:**
```
OPTIONS /api/users
Response Headers: Allow: GET, POST, OPTIONS
Purpose: Check what methods are allowed (used in CORS preflight)
```

---

## 7. HTTP Status Codes

### **2xx - Success**
- **200 OK**: Request succeeded (GET, PUT, PATCH, DELETE)
- **201 Created**: Resource created successfully (POST)
- **204 No Content**: Success but no body to return (DELETE)

### **3xx - Redirection**
- **301 Moved Permanently**: Resource moved to new URL forever
- **302 Found**: Resource temporarily at different URL
- **304 Not Modified**: Use cached version (nothing changed)

### **4xx - Client Errors**
- **400 Bad Request**: Malformed request, validation failed
- **401 Unauthorized**: "Who are you?" - No valid credentials provided
- **403 Forbidden**: "I know who you are, but you can't do this" - Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Request conflicts with current state (e.g., duplicate email)
- **429 Too Many Requests**: Rate limit exceeded

### **5xx - Server Errors**
- **500 Internal Server Error**: Generic server error
- **502 Bad Gateway**: Server got invalid response from upstream server
- **503 Service Unavailable**: Server temporarily down (maintenance)

**Interview Gold: 401 vs 403**
- **401**: You need to login first (authentication issue)
- **403**: You're logged in, but you don't have permission (authorization issue)

---

## 8. HTTP Headers

### **Request Headers (Client → Server)**

**Common Headers:**
```
GET /api/users HTTP/1.1
Host: api.example.com                    # Which server
User-Agent: Mozilla/5.0...               # What browser/client
Accept: application/json                 # What format I want back
Content-Type: application/json           # What format I'm sending
Authorization: Bearer eyJhbGci...        # Authentication token
Cookie: sessionId=abc123                 # Session identifier
Accept-Language: en-US                   # Preferred language
Accept-Encoding: gzip, deflate           # Compression support
```

### **Response Headers (Server → Client)**

```
HTTP/1.1 200 OK
Content-Type: application/json           # Format of the response body
Content-Length: 1234                     # Size in bytes
Set-Cookie: sessionId=xyz; HttpOnly      # Set a cookie
Location: /api/users/123                 # Where new resource was created (with 201)
Cache-Control: max-age=3600              # How long to cache
ETag: "686897696a7c..."                  # Version identifier for caching
Access-Control-Allow-Origin: *           # CORS settings
```

**Interview Tip:**
"Content-Type tells the server what format you're sending. Accept tells the server what format you want back."

---

## 9. Content Negotiation

**What It Is:**
The process where client and server agree on the format of data to exchange.

**How It Works:**

**Client Request:**
```
GET /api/users/123
Accept: application/json
```

**Server Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{"id": 123, "name": "John"}
```

**Multiple Format Support:**
```
Accept: application/json              → Get JSON
Accept: application/xml               → Get XML
Accept: text/html                     → Get HTML
Accept: application/json, text/xml;q=0.9  → Prefer JSON, but XML is ok
```

**The `q` Parameter:**
Quality values (0 to 1) indicate preference.

---

## 10. Cookies, Sessions, Tokens

### **Cookies**
Small pieces of data stored in the browser and sent with every request.

```
Response (Server → Browser):
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict

Future Requests (Browser → Server):
Cookie: sessionId=abc123
```

**Cookie Attributes:**
- **HttpOnly**: JavaScript cannot access it (prevents XSS attacks)
- **Secure**: Only sent over HTTPS
- **SameSite**: Prevents CSRF attacks

### **Sessions**
Server-side storage of user data. Cookie contains session ID, actual data is on server.

**Flow:**
1. User logs in
2. Server creates session, stores user data
3. Server sends session ID as cookie
4. Browser sends session ID with each request
5. Server looks up session data using ID

### **Tokens (JWT - JSON Web Tokens)**
Self-contained authentication. All user info is in the token itself.

**JWT Structure:**
```
Header.Payload.Signature
eyJhbGci.eyJ1c2VySWQi.SflKxwRJ
```

**Flow:**
1. User logs in
2. Server creates JWT with user info
3. Client stores JWT (localStorage or memory)
4. Client sends JWT in Authorization header
5. Server validates JWT signature (no database lookup needed)

**Interview Comparison:**

| Feature | Sessions | JWT |
|---------|----------|-----|
| Storage | Server-side | Client-side |
| Scalability | Harder (shared state) | Easier (stateless) |
| Revocation | Easy | Hard |
| Size | Small cookie | Large token |

---

## 11. HTTPS & TLS Handshake

**HTTP vs HTTPS:**
- **HTTP**: Plain text, anyone can read it
- **HTTPS**: Encrypted, secure

**TLS Handshake (Simplified):**
1. **Client Hello**: "I want to connect securely. Here are my supported encryption methods"
2. **Server Hello**: "Let's use this encryption method. Here's my SSL certificate"
3. **Certificate Verification**: Client verifies server's identity with Certificate Authority (CA)
4. **Key Exchange**: Both agree on encryption keys
5. **Encrypted Communication**: All data is now encrypted

**Why It Matters:**
- Prevents eavesdropping (man-in-the-middle attacks)
- Verifies server identity
- Data integrity (can't be tampered with)

**Interview Tip:**
"HTTPS uses TLS (Transport Layer Security) to encrypt data. The padlock icon in browsers shows the connection is secure."

---

## 12. CORS (Cross-Origin Resource Sharing)

**The Problem:**
Browser security prevents JavaScript from one domain (frontend.com) from accessing resources on another domain (api.backend.com).

**Example:**
```
Frontend: https://myapp.com
API: https://api.myapp.com

Browser blocks this by default!
```

**The Solution - CORS Headers:**

**Preflight Request (Browser automatically sends this):**
```
OPTIONS /api/users
Origin: https://myapp.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

**Server Response:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

**Spring Boot Configuration:**
```java
@CrossOrigin(origins = "https://myapp.com")
@RestController
public class UserController {
    // ...
}
```

**Interview Gold:**
"CORS is a browser security feature. The server must explicitly allow cross-origin requests by sending proper headers. Not all requests trigger preflight - simple GET requests don't, but POST with custom headers does."

---

## 13. HTTP/1.1 vs HTTP/2 vs HTTP/3

### **HTTP/1.1 (1997)**
**Problems:**
- One request at a time per connection (head-of-line blocking)
- Multiple connections needed for parallel requests
- No header compression
- Plain text headers

**Solution:** Open 6+ connections to load a webpage faster

### **HTTP/2 (2015)**
**Improvements:**
- **Multiplexing**: Multiple requests on single connection
- **Header Compression**: Reduces overhead
- **Server Push**: Server can send resources before client asks
- **Binary Protocol**: Faster parsing

**Result:** Faster page loads, fewer connections

### **HTTP/3 (2020)**
**Key Change:** Uses **QUIC** instead of TCP
- Faster connection setup (0-RTT)
- Better handling of packet loss
- No head-of-line blocking at transport layer
- Built-in encryption

**Interview Comparison:**

| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---------|----------|--------|--------|
| Protocol | TCP | TCP | QUIC (UDP) |
| Multiplexing | ❌ | ✅ | ✅ |
| Header Compression | ❌ | ✅ | ✅ |
| Connection Setup | Slow | Slow | Fast |
| Head-of-line blocking | ✅ Yes | Partial | ❌ No |

---

## 14. CDN Basics (Content Delivery Network)

**What It Is:**
A network of servers distributed globally that cache and serve content from locations closest to users.

**How It Works:**
```
Without CDN:
User in India → Server in USA (500ms latency)

With CDN:
User in India → CDN Server in Mumbai (20ms latency)
```

**Benefits:**
- **Faster Load Times**: Content served from nearby server
- **Reduced Server Load**: CDN handles most traffic
- **Better Availability**: If one server fails, another serves content
- **DDoS Protection**: Distributed architecture absorbs attacks

**What's Cached:**
- Images, CSS, JavaScript
- Videos
- Static API responses
- Entire web pages

**Popular CDNs:**
CloudFlare, AWS CloudFront, Akamai, Fastly

**Interview Example:**
"Netflix uses CDN to cache movies close to users. When you stream a movie in Delhi, it comes from a server in Delhi, not from USA, making it faster and cheaper for Netflix."

---

## 15. Browser Caching vs Server Caching

### **Browser Caching (Client-Side)**

**Purpose:** Store resources locally in browser so they don't need to be downloaded again.

**How It Works:**
```
First Visit:
GET /style.css
Response:
  Cache-Control: max-age=86400  (cache for 24 hours)
  ETag: "abc123"

Second Visit (within 24 hours):
Browser uses cached version, no request sent!

After 24 hours:
GET /style.css
If-None-Match: "abc123"

If unchanged:
  304 Not Modified (use your cached version)
If changed:
  200 OK (here's the new file)
```

**Cache-Control Directives:**
- `max-age=3600`: Cache for 1 hour
- `no-cache`: Check with server before using cached version
- `no-store`: Don't cache at all
- `public`: Can be cached by browsers and CDNs
- `private`: Only browser can cache (not CDN)

### **Server Caching (Server-Side)**

**Purpose:** Store computed results or database queries to avoid repeating expensive operations.

**Types:**

**1. Application Cache (In-Memory)**
```java
// Spring Boot example
@Cacheable("users")
public User getUserById(Long id) {
    return userRepository.findById(id);
}
```
Uses: Redis, Memcached, Ehcache

**2. Database Query Cache**
Store results of expensive SQL queries

**3. CDN Cache**
Cache entire HTTP responses at edge servers

### **Interview Comparison:**

| Feature | Browser Cache | Server Cache |
|---------|---------------|--------------|
| Location | Client device | Server/Redis |
| Controlled by | Server headers | Application code |
| Scope | Single user | All users |
| Use case | Static assets | API responses, DB queries |
| Invalidation | Time-based, ETags | Manual, TTL |

**Cache Invalidation Strategies:**
1. **Time-based (TTL)**: Cache expires after X seconds
2. **Manual**: Explicitly delete from cache when data changes
3. **Event-based**: Delete cache when specific events occur (user updated)

**Interview Gold:**
"There are only two hard things in Computer Science: cache invalidation and naming things. Cache invalidation is hard because you need to balance freshness (showing updated data) with performance (not hitting the database)."

---

## 🎯 Quick Interview Tips

1. **Always mention WHY**: Don't just say what something is, explain why it exists
2. **Use real examples**: "Like when you login to Amazon..." 
3. **Compare and contrast**: "Unlike X, Y does this because..."
4. **Know the tradeoffs**: Every solution has pros and cons
5. **Think in layers**: Application → HTTP → TCP → IP → Physical

---

## 🔥 Common Interview Questions

**Q: Walk me through what happens when you type google.com in a browser.**
A: Start with DNS resolution, then TCP handshake, then HTTP request-response, mention TLS if HTTPS, talk about browser rendering.

**Q: Difference between PUT and PATCH?**
A: PUT replaces entire resource, PATCH updates specific fields. PUT is idempotent, PATCH typically isn't.

**Q: Why use HTTPS?**
A: Three reasons - Confidentiality (encryption), Integrity (can't be tampered), Authentication (verifies server identity).

**Q: How does caching improve performance?**
A: Reduces network round trips, decreases server load, improves response time. Explain browser cache vs CDN vs server cache.

**Q: What's the difference between authentication and authorization?**
A: Authentication is "who are you?" (401 if fails), Authorization is "what can you do?" (403 if fails).

---

## ✅ Must Remember

- **TCP is reliable, UDP is fast**
- **HTTP is stateless** (each request independent)
- **HTTPS = HTTP + TLS** (encryption)
- **REST uses HTTP methods properly**
- **Status codes communicate outcome**
- **Headers carry metadata**
- **Caching happens at multiple levels**
- **CORS protects users, server must allow it**