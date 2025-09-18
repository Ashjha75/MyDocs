---
title: "Spring Boot Caching - Intermediate"
description: "Master intermediate caching techniques in Spring Boot, including key generation, eviction strategies, and cache management."
---

**Objective:** To move beyond the basic caching annotations and master the techniques for key generation, eviction strategies, and cache management, enabling you to implement more complex and robust caching solutions.

---

### **1. Cache Key Generation: The Address of Your Data**

The cache key is the unique identifier for a piece of cached data. Getting the key right is critical. If the key is not unique enough, you get **cache collisions** (wrong data is returned). If the key is not consistent, you get **cache misses** (data is not found when it should be).

#### **a. Simple vs. Complex Keys**

*   **Simple Keys (The Default):** When you have a single, simple parameter (like a `Long` or `String`), Spring's default key generator works perfectly. It will use that parameter as the key.
    ```java
    @Cacheable(cacheNames="products", key="#id") // Explicitly using the 'id' parameter is a best practice
    public Product findById(Long id) { ... }
    ```
*   **Complex Keys (The Challenge):** What if your method takes multiple parameters or a complex object?
    ```java
a    @Cacheable(cacheNames="products")
    public Page<Product> search(String query, String category, Pageable pageable) { ... }
    ```
    Here, the default key would be a `SimpleKey` object composed of the `query`, `category`, and `pageable` objects. This works, but it can be hard to predict and debug.

#### **b. Using SpEL (Spring Expression Language) for Full Control**

SpEL is a powerful language that gives you complete, programmatic control over your cache key generation directly within the annotation. This is the **professional standard** for any non-trivial caching method.

**SpEL gives you access to:**
*   Method arguments by name (`#argumentName`) or index (`#a0`, `#p0`).
*   The return value (`#result`), useful for `@CachePut`.
*   The bean itself (`#root.target`) and the method (`#root.methodName`).

**Practical Examples:**

```java
// Good: Combine multiple simple parameters into a clear, readable key
@Cacheable(cacheNames="products", key="#category + '-' + #brand")
public List<Product> findByCategoryAndBrand(String category, String brand) { ... }

// Better: Access properties of a DTO argument
@Cacheable(cacheNames="reports", key="#searchCriteria.getReportName() + '-' + #searchCriteria.getYear()")
public Report generateReport(ReportSearchCriteria searchCriteria) { ... }

// Advanced: Only cache if a condition is met
@Cacheable(cacheNames="users", key="#username", unless="#result == null")
public User findByUsername(String username) { ... } // Don't cache null results

// Conditional Caching
@Cacheable(cacheNames="largeQueries", key="#query", condition="#query.length() > 10")
public List<Result> runComplexQuery(String query) { ... } // Only cache for long queries
```

---

### **2. Cache Eviction Strategies: Keeping Data Fresh**

Eviction is the process of removing data from the cache. A stale cache can be more dangerous than no cache at all.

#### **a. Manual Eviction with `@CacheEvict`**
This is the most common strategy. You explicitly remove a cache entry when you know the underlying data has changed (e.g., after an update or delete operation).
```java
// Evict a single entry after an update
@CachePut(cacheNames="products", key="#id")
public Product updateProduct(Long id, ProductUpdateDTO dto) { ... }

// Evict a single entry after a delete
@CacheEvict(cacheNames="products", key="#id")
public void deleteProduct(Long id) { ... }

// Evict ALL entries from a cache. Useful for bulk updates.
@CacheEvict(cacheNames="products", allEntries = true)
public void importNewProductCatalog() {
    // ... logic that updates many products ...
}
```

#### **b. Conditional Eviction**
Just like `@Cacheable`, `@CacheEvict` supports a `condition` attribute using SpEL.
**Use Case:** You might have a "soft delete" feature where you only want to evict the product from the cache if the deletion was truly successful.

```java
@CacheEvict(cacheNames="products", key="#id", condition="#result == true")
public boolean deleteProduct(Long id) {
    // This method might return 'true' on success and 'false' on failure
    return productService.performDelete(id);
}
```

#### **c. Scheduled Eviction (Time-Based Eviction)**
This is not configured via Spring annotations but in the underlying cache provider's configuration (e.g., `ehcache.xml` or Redis configuration). This is a **Time-To-Live (TTL)** strategy.
*   **What it is:** You configure the cache itself to automatically evict entries after a certain amount of time has passed since they were last written or accessed.
*   **Why it's used:** It's a fantastic fallback mechanism to prevent your cache from growing indefinitely and to ensure that even if you miss a manual eviction, stale data will eventually be purged. It's a safety net.

```xml
<!-- Example from an ehcache.xml file -->
<cache-template name="productCache">
    <expiry>
        <!-- Evict entries 30 minutes after they are created -->
        <ttl unit="minutes">30</ttl>
    </expiry>
</cache>
```

---

### **3. The `CacheManager`: The Conductor of Caches**

*   **What is it?** The `CacheManager` is the central interface in Spring's cache abstraction. Its primary job is to manage a collection of `Cache` instances. When you use `@Cacheable(cacheNames="products")`, Spring asks the `CacheManager` for the `Cache` named "products".
*   **`SimpleCacheManager`:** This is the default implementation that Spring Boot auto-configures if no other cache provider is found. It simply manages a collection of `ConcurrentHashMap` caches.
*   **Customizing Caches:** For a production application using a provider like EhCache or Redis, you will typically configure a `CacheManager` bean yourself to gain full control over the underlying provider.

**Code Example: Programmatic Cache Management**
While annotations are common, you can also interact with the cache programmatically by injecting the `CacheManager`.

```java
@Service
public class CacheControlService {
    
    private final CacheManager cacheManager;

    public CacheControlService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }
    
    public void manuallyEvictProduct(Long productId) {
        Cache productsCache = cacheManager.getCache("products");
        if (productsCache != null) {
            productsCache.evict(productId);
            log.info("Manually evicted product with ID {} from cache.", productId);
        }
    }
    
    public void clearAllProductCaches() {
        Cache productsCache = cacheManager.getCache("products");
        if (productsCache != null) {
            productsCache.clear(); // Evicts all entries
        }
    }
}
```

---

### **4. Exception Handling in Caching: Building a Resilient System**

**Interview Gold:** An interviewer might ask, "What happens if your Redis server goes down? Does your entire application fail?" This is where you prove your seniority.

*   **What Happens on Cache Failures?** By default, if the caching provider throws an exception (e.g., it cannot connect to the Redis server), the exception will propagate and **the entire method call will fail**. The user will get a 500 error, even though the database is perfectly healthy. This is a critical single point of failure.
*   **The Solution (Fallback Mechanisms):** The goal is to treat the cache as an **enhancement, not a dependency**. If the cache fails, the application should gracefully fall back to hitting the database.
    *   **Custom `CacheErrorHandler`:** The professional way to solve this is to implement a custom error handler that logs the cache failure but allows the application to proceed.

    ```java
    // 1. Create a custom error handler that logs but does not re-throw exceptions
    public class LoggingCacheErrorHandler implements CacheErrorHandler {
        private static final Logger log = LoggerFactory.getLogger(LoggingCacheErrorHandler.class);
    
        @Override
        public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
            log.warn("Cache GET error for key {}: {}", key, exception.getMessage());
        }
    
        @Override
        public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
            log.warn("Cache PUT error for key {}: {}", key, exception.getMessage());
        }
    
        // ... implement other handle methods for evict and clear ...
    }
    
    // 2. Configure Spring to use your custom error handler
    @Configuration
    @EnableCaching
    public class CachingConfig extends CachingConfigurerSupport {
        @Override
        public CacheErrorHandler errorHandler() {
            return new LoggingCacheErrorHandler();
        }

        // ... other cache manager bean configurations ...
    }
    ```
    With this configuration in place, if your Redis server goes down:
    1.  A call to a `@Cacheable` method will try to get from the cache.
    2.  The Redis client will throw a connection exception.
    3.  Your `LoggingCacheErrorHandler` will catch it, log a warning, and suppress the exception.
    4.  Spring will interpret this as a cache miss and proceed to execute the actual method.
    5.  The method will fetch the data from the database and return it to the user.

    The application remains **fully functional**, albeit slightly slower, which is a far better outcome than a complete failure.