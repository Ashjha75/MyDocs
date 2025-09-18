---
title: "4. Spring Boot Redis Caching"
---
### **4.1 Enabling Caching: `@EnableCaching`**

#### **What it is**

`@EnableCaching` is a single annotation that acts as the master switch to turn on Spring's caching capabilities.

#### **How it works**

When you add this annotation to one of your `@Configuration` classes, you are telling the Spring container to perform a crucial task: scan your application for any beans that use caching annotations (`@Cacheable`, `@CacheEvict`, etc.).

For each bean it finds, Spring doesn't inject the bean directly. Instead, it creates a **proxy object** that wraps around your original bean. This proxy intercepts method calls. When a method annotated with `@Cacheable` is called, the proxy intercepts it and executes the caching logic *before* deciding whether to call the actual method on your bean.

**Diagram: The Caching Proxy**
```
                               +-----------------------------+
                               |    Your Service/Controller  |
                               +--------------+--------------+
                                              | Call getProduct(123)
                                              v
+-----------------------------------------------------------------------------------------+
|                                  Spring Caching Proxy                                   |
|                                                                                         |
|  1. Does a cached value exist for key "products::123"?                                  |
|                                                                                         |
|      YES (Cache Hit)                           NO (Cache Miss)                          |
|           |                                         |                                   |
|  2a. Return the value from Redis.        2b. Call the *actual* getProduct(123) method.  |
|      (Do NOT execute the method body)              |                                   |
|                                          3b. Take the result and save it to Redis.      |
|                                          4b. Return the result.                         |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
                                              ^
                                              | (The proxy wraps this bean)
                               +--------------+--------------+
                               |     Your Original Bean      |
                               |  (ProductServiceImpl.class) |
                               +-----------------------------+
```

**Where to put it:**
```java
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching // The master switch
public class AppConfig {
    // Other beans, like your RedisTemplate configuration, go here
}
```

---

### **4.2 Cache Annotations**

These are the tools you use to control the caching behavior of your methods.

#### **`@Cacheable` → Read-Through Cache**

*   **Purpose:** The primary and most-used caching annotation. It implements the "get or compute" logic.
*   **Behavior:**
    1.  **Before method execution:** The proxy checks the cache for an entry corresponding to the method's key.
    2.  **Cache Hit:** If an entry is found, the proxy **skips the execution of the actual method** and returns the value directly from the cache.
    3.  **Cache Miss:** If no entry is found, the proxy executes the method, takes the return value, stores it in the cache, and then returns it to the caller.
*   **Use Case:** Ideal for expensive, read-only operations like fetching data from a database or a slow external API.

**Example:**
```java
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Cacheable("products") // "products" is the name of the cache
    public Product getProductById(Long id) {
        // This code only runs on a cache miss
        System.out.println("--- Hitting the slow database to fetch product " + id + " ---");
        // Simulate a slow DB call
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {}
        return new Product(id, "Sample Product");
    }
}
```
The first time you call `getProductById(123)`, it will print the message and take 2 seconds. Every subsequent call with `123` will return instantly without printing the message.

---

#### **`@CachePut` → Update Cache**

*   **Purpose:** To update the cache with a new value without interfering with the method's execution.
*   **Behavior:** The method is **always executed**. After it completes successfully, its return value is used to update the cache.
*   **Key Difference from `@Cacheable`:** `@Cacheable` avoids running the method on a cache hit, while `@CachePut` **never** avoids running the method.
*   **Use Case:** Perfect for methods that update an entity. You want to update the database *and* ensure the cache is populated with the fresh, updated object.

**Example:**
```java
import org.springframework.cache.annotation.CachePut;

@Service
public class ProductService {
    
    @CachePut(value = "products", key = "#result.id") // Key uses the 'id' from the returned Product
    public Product updateProduct(Product updatedProduct) {
        System.out.println("--- Hitting the database to UPDATE product " + updatedProduct.getId() + " ---");
        // ... logic to save the updatedProduct to the database ...
        return updatedProduct; // This returned object will be put in the cache
    }
}
```

---

#### **`@CacheEvict` → Remove Cache**

*   **Purpose:** To remove (invalidate) an entry from the cache.
*   **Behavior:** The method is always executed. After it completes, the proxy removes the corresponding key from the cache.
*   **Use Case:** Essential for methods that delete an entity. If you delete a product from the database, you must also remove it from the cache to prevent serving stale data.

**Example:**
```java
import org.springframework.cache.annotation.CacheEvict;

@Service
public class ProductService {

    @CacheEvict(value = "products", key = "#id") // The key is based on the 'id' argument
    public void deleteProduct(Long id) {
        System.out.println("--- Hitting the database to DELETE product " + id + " ---");
        // ... logic to delete the product from the database ...
    }

    // You can also evict an entire cache
    @CacheEvict(value = "products", allEntries = true)
    public void refreshAllProducts() {
        // This would clear every entry in the "products" cache
    }
}
```

---

### **4.3 TTL in Cache Entries**

#### **The Problem**

By default, entries added by Spring Cache have **no TTL**. They will stay in Redis forever, consuming memory and eventually becoming stale (out of sync with the database).

#### **The Solution**

You must configure a `RedisCacheManager` bean to define the TTL for your caches. This is done in a `@Configuration` class.

**How to Configure (The Production-Ready Way):**
This configuration sets a default TTL for any cache and allows you to specify different TTLs for specific caches.

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default configuration: JSON serialization and a 10-minute TTL
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeValuesWith(SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config) // Apply the default config
                // Now, customize for specific caches
                .withCacheConfiguration("products",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(5)) // "products" cache TTL is 5 mins
                                .serializeValuesWith(SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())))
                .withCacheConfiguration("users",
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofHours(1)) // "users" cache TTL is 1 hour
                                .serializeValuesWith(SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())))
                .build();
    }
}
```

---

### **4.4 Custom Cache Keys (SpEL Expressions)**

#### **The Problem**

By default, Spring creates a key based on all the method parameters. For `getProductById(123L)`, the key might be simple, like `123`. But for `updateProduct(productObject)`, the default key would be the entire serialized `productObject`, which is not what we want. We need precise control over the key generation.

#### **The Solution: Spring Expression Language (SpEL)**

Spring's caching annotations support SpEL in the `key` attribute, giving you full control. SpEL expressions are denoted by `#`.

**Common SpEL Patterns:**

*   **Referring to a method argument by name:**
    ```java
    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) { ... }
    ```

*   **Accessing a property of an argument object:**
    ```java

    @CachePut(value = "products", key = "#product.id")
    public Product updateProduct(Product product) { ... }
    ```
    This is identical to `@CachePut(value = "products", key = "#result.id")` if the `id` on the input object is the same as the output object.

*   **Concatenating strings and variables:** This is great for namespacing to avoid key collisions.
    ```java
    @Cacheable(value = "products", key = "'product_details::' + #id")
    public Product getDetailedProduct(Long id) { ... }
    ```
    (Note the single quotes around the string literal).

*   **Using root objects for context:**
    ```java
    // Creates a key like "products::getProductById_123"
    @Cacheable(value = "products", key = "#root.methodName + '_' + #id")
    public Product getProductById(Long id) { ... }
    ```

---

### **4.5 Handling Stale Data, Cache Misses**

*   **Stale Data:** This occurs when the data in your database has been updated, but the old version still exists in the cache.
    *   **How to Handle:**
        1.  **TTL:** The most common strategy. You accept that data might be stale for a short period (e.g., up to 5 minutes) before the cache entry expires and is refreshed. This is called *eventual consistency*.
        2.  **Explicit Eviction:** Design your system so that any service that writes to the database also explicitly evicts the relevant cache entry (using `@CacheEvict` or a message queue). This provides stronger consistency but adds complexity.

*   **Cache Misses:** A request for data that is not in the cache.
    *   **Handling:** A cache miss is a normal part of the process; the system fetches from the source and populates the cache. The goal is to *minimize* the miss rate for frequently accessed data.
    *   **Strategies to Reduce Misses:**
        1.  **Sufficient Memory:** Ensure your Redis instance has enough memory to hold the "hot" dataset.
        2.  **Appropriate TTLs:** Don't set TTLs so short that frequently used data is constantly being evicted.
        3.  **Cache Warming:** For critical data, you can pre-populate the cache when the application starts up, so the first user doesn't suffer a cache miss.

---

### **4.6 Avoiding Cache Stampede**

#### **The Problem (also called "Dogpiling")**

A cache stampede is a catastrophic event where a popular cached item expires, and thousands of concurrent requests for that item all miss the cache at the same time, "stampeding" to the database to re-compute the value. This can overload and crash your database.

#### **The Solution 1: Randomized TTL (Jitter)**

Instead of setting a fixed TTL of 300 seconds, configure your TTL to be `300 + random(0 to 30)`. By adding this "jitter," you ensure that the keys for different items, even if created at the same time, will not expire at the exact same moment, spreading the load over time. This is an operational strategy often configured at the cache manager level.

#### **The Solution 2: Locking (`sync=true`)**

Spring provides a simple, powerful solution directly in the `@Cacheable` annotation.

```java
@Cacheable(value = "highly-concurrent-cache", key = "#id", sync = true)
public SomeObject getHighlyPopularItem(String id) {
    // ... very expensive computation ...
}
```

*   **How it works:** When `sync = true` is set:
    1.  Multiple threads request the same key and find a cache miss.
    2.  Spring's caching proxy will **only allow the first thread** to proceed and execute the method.
    3.  All other threads for that **same key** are paused and will wait.
    4.  The first thread completes the method, populates the cache, and gets its result.
    5.  The waiting threads are then un-paused. They will now find the value in the cache (populated by the first thread) and will return it immediately without ever executing the method body.

This effectively synchronizes the cache population for a given key, completely preventing the stampede.