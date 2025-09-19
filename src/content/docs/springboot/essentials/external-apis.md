---
title: "Integrating External APIs in Spring Boot"
slug: /docs/springboot/essentials/external-apis/

---

### **The Professional's Guide to Integrating External APIs in Spring Boot**

**Objective:** To master the modern, resilient, and testable patterns for consuming external REST APIs using Spring Boot's latest best practices.

---

### **Module 1: Choosing Your Weapon - `RestTemplate` vs. `WebClient`**

This is the first and most important architectural decision.

*   **`RestTemplate` (The Legacy Tool):**
    *   **What:** Spring's original, synchronous, blocking HTTP client.
    *   **Analogy:** A phone call. When you make the call, your thread is **blocked**—it can do nothing else but wait for the response.
    *   **Status:** Now in **maintenance mode**. It is no longer recommended for new development. You need to know it because you will see it in older codebases.

*   **`WebClient` (The Modern Standard):**
    *   **What:** The modern, asynchronous, non-blocking HTTP client from the Spring WebFlux project.
    *   **Analogy:** Sending a text message. You send the message, and your thread is **free** to do other work. You get a "notification" (a `Mono` or `Flux`) that will contain the response when it arrives.
    *   **Why it's the Best Practice:** Even in a traditional, blocking Spring MVC application, using `WebClient` for I/O-bound tasks (like calling external APIs) is more efficient. It uses fewer system resources by not tying up a thread just for waiting. **This is the tool a professional uses for all new development.**

---

### **Module 2: The Blueprint - Centralized `WebClient` Configuration**

A professional developer does not create `WebClient` instances manually in their services. They define a centralized, configurable `Bean` that can be injected anywhere. This follows the DRY principle and makes the application far easier to manage.

**The Best Practice: The `WebClient.Builder` Bean**
We configure a `Builder` bean, which allows us to create multiple, customized `WebClient` instances from a shared base configuration.

```java
package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder()
                // Set a default base URL for all clients created from this builder
                // .baseUrl("https://api.default.com") 
                
                // Set a default User-Agent header
                .defaultHeader(HttpHeaders.USER_AGENT, "MySpringApp/1.0")
                
                // Set a default Accept header
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                
                // You can also set default timeouts here if needed
                .clientConnector(new ReactorClientHttpConnector(
                    HttpClient.create().responseTimeout(Duration.ofSeconds(10))
                ));
    }
}
```

---

### **Module 3: The Implementation - The Dedicated API Client Service**

Never mix the logic for calling an external API directly with your core business logic. Encapsulate it in its own dedicated service class.

**Scenario:** We need to fetch product data from an external "Product Store API."

**Step 1: Create the DTOs**
Define a DTO that matches the JSON structure of the external API's response.

```java
// DTO to capture the external API's response
public record ExternalProductDTO(
    Long id,
    String title,
    BigDecimal price,
    String category
) {}
```

**Step 2: Create the Client Service**
This service uses the `WebClient.Builder` to create a configured client instance.

```java
package com.example.client;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ProductStoreClient {

    private final WebClient webClient;

    // Inject the builder and create a specific client for this API
    public ProductStoreClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://fakestoreapi.com").build();
    }

    // Method for a GET request
    public Mono<ExternalProductDTO> getProductById(Long productId) {
        return this.webClient.get()
                .uri("/products/{id}", productId)
                .retrieve()
                .bodyToMono(ExternalProductDTO.class);
    }

    // Method for a POST request
    public Mono<ExternalProductDTO> createProduct(NewProductRequestDTO newProduct) {
        return this.webClient.post()
                .uri("/products")
                .body(Mono.just(newProduct), NewProductRequestDTO.class)
                .retrieve()
                .bodyToMono(ExternalProductDTO.class);
    }
}
```

**Step 3: Using the Client in Your Business Service**
Your core business service can now use this clean client. Since we are in a blocking Spring MVC context, we use `.block()` to get the result from the reactive `Mono`.

```java
@Service
public class MyBusinessService {
    private final ProductStoreClient productStoreClient;
    // ... constructor ...

    public ExternalProductDTO processProduct(Long productId) {
        // .block() subscribes to the Mono and waits for the result.
        // This is the bridge between the non-blocking client and our blocking service.
        ExternalProductDTO product = productStoreClient.getProductById(productId).block();
        
        // ... perform your business logic with the fetched product data ...
        return product;
    }
}
```

---

### **Module 4: Production Readiness - Resilience & Error Handling**

**This is the most critical module for a senior developer.** What happens when the external API is slow or fails? Your application must not fail with it.

#### **a. Handling API Errors**
When an external API returns a `4xx` (Client Error) or `5xx` (Server Error), `WebClient` will throw a `WebClientResponseException`. You must handle this.

```java
// In your Business Service
public Optional<ExternalProductDTO> processProduct(Long productId) {
    try {
        ExternalProductDTO product = productStoreClient.getProductById(productId).block();
        return Optional.of(product);
    } catch (WebClientResponseException.NotFound ex) {
        // Handle a 404 specifically
        log.warn("Product with ID {} not found in external store.", productId);
        return Optional.empty();
    } catch (WebClientResponseException ex) {
        // Handle other client/server errors
        log.error("Error fetching product {}: Status {}, Body {}", productId, ex.getStatusCode(), ex.getResponseBodyAsString());
        throw new ExternalApiUnavailableException("The product store is currently unavailable.");
    }
}
```

#### **b. The Circuit Breaker Pattern (Resilience4j)**

**The "Why":** If an external API is down and takes 30 seconds to time out, and you get 100 requests per second, you will quickly exhaust all of your application's threads just waiting. This is a **cascading failure**. The Circuit Breaker pattern prevents this.

**Analogy:** A circuit breaker in your house. If there's a fault, it trips and stops the flow of electricity, preventing a fire. After a while, it can be reset.

1.  **Add the dependency:** `spring-cloud-starter-circuitbreaker-resilience4j`
2.  **Annotate your client method:** Use `@CircuitBreaker`.

```java
// In your ProductStoreClient
@Service
public class ProductStoreClient {
    // ...

    @CircuitBreaker(name = "productStoreApi", fallbackMethod = "getProductFallback")
    public Mono<ExternalProductDTO> getProductById(Long productId) {
        return this.webClient.get()
                // ...
    }
    
    // The Fallback Method
    // MUST have the same return type and method signature, plus the Exception parameter.
    public Mono<ExternalProductDTO> getProductFallback(Long productId, Throwable ex) {
        log.warn("Circuit breaker engaged for getProductById({}). Falling back. Error: {}", productId, ex.getMessage());
        // Return a default, cached, or empty response.
        // This prevents your application from failing.
        return Mono.just(new ExternalProductDTO(productId, "Default Product", BigDecimal.ZERO, "N/A"));
    }
}
```
**How it works:**
*   If the `getProductById` method fails a certain number of times (e.g., 50% of the last 10 calls), the circuit "opens."
*   For the next N seconds, all calls to `getProductById` will **not** even attempt to call the external API. They will be **immediately** routed to the `getProductFallback` method.
*   This gives the external API time to recover and protects your application from the cascading failure.

---

### **Module 5: Testing Your API Client**

You must test your API client logic **without making real network calls**. This makes your tests fast, reliable, and independent of external systems. The industry standard tool for this is **`MockWebServer`**.

```java
// In your test class
class ProductStoreClientTest {

    private MockWebServer mockWebServer;
    private ProductStoreClient productStoreClient;

    @BeforeEach
    void setup() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        // Configure the WebClient to point to our mock server
        WebClient.Builder webClientBuilder = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString());
        
        productStoreClient = new ProductStoreClient(webClientBuilder);
    }
    
    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void testGetProductById_Success() {
        // 1. Prepare the mock response from the external API
        String mockJsonResponse = "{\"id\":1,\"title\":\"Test Product\",\"price\":10.0}";
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .setBody(mockJsonResponse));

        // 2. Call the method being tested
        ExternalProductDTO result = productStoreClient.getProductById(1L).block();

        // 3. Assert the result
        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Test Product");
    }

    @Test
    void testGetProductById_NotFound() {
        // Prepare a 404 response
        mockWebServer.enqueue(new MockResponse().setResponseCode(404));

        // Assert that the correct exception is thrown
        assertThrows(WebClientResponseException.NotFound.class, () -> {
            productStoreClient.getProductById(999L).block();
        });
    }
}
```