---
title: "7. Redis Interview Questions"
---
### **1. What is Redis? When to use it?**

#### **What is Redis?**

Redis, which stands for **RE**mote **DI**ctionary **S**erver, is an open-source, in-memory, key-value data store.

Let's break that down:
*   **In-Memory:** Its primary storage is RAM, not disk. This is the main reason for its extremely high performance, allowing for sub-millisecond latency on operations.
*   **Key-Value:** At its core, it's like a dictionary. You store a "value" (which can be a simple string or a complex data structure) and access it with a unique "key".
*   **Data Store:** While often used as a cache, it's more than that. It supports rich data types like Lists, Sets, Hashes, and Sorted Sets, which allows it to function as a database, message broker, or queue.

#### **When to Use It?**

You should use Redis when the speed of data access is a critical requirement. It's not a replacement for a traditional SQL database like PostgreSQL, but rather a high-speed data layer that works alongside it.

The most common use cases are:

1.  **Caching:** Storing the results of expensive database queries or API calls to reduce latency and decrease the load on the primary database.
2.  **Session Management:** In a distributed system with multiple application instances, Redis provides a central place to store user session data, allowing for stateless and easily scalable applications.
3.  **Rate Limiting:** Using its atomic increment operations and TTLs to protect APIs from overuse or abuse.
4.  **Real-Time Analytics & Counters:** Counting things like page views, likes, or online users in real-time is trivial with commands like `INCR` and `SADD`.
5.  **Leaderboards & Rankings:** The Sorted Set data structure is purpose-built for maintaining ordered lists, making leaderboards extremely efficient to implement.
6.  **Messaging:** Its Pub/Sub feature can be used for simple, real-time messaging between different parts of an application or between microservices.

---

### **2. Difference between Redis and DB/cache like EhCache?**

This question is about understanding where Redis fits in your architecture compared to two different tools: a traditional database and an in-process cache.

#### **Redis vs. a Traditional Database (e.g., PostgreSQL, MySQL)**

They serve fundamentally different purposes and are complementary.

| Feature | Redis | Traditional Database |
| :--- | :--- | :--- |
| **Primary Storage** | **In-Memory (RAM)** for speed. | **On-Disk (SSD/HDD)** for durability. |
| **Data Model** | Key-Value, schema-less with rich data structures. | Structured tables with a rigid schema (rows/columns). |
| **Performance** | Extremely high throughput, sub-millisecond latency. | Performance is limited by disk I/O and query complexity. |
| **Querying** | Simple, direct commands (`GET`, `SET`, `HGET`). No complex joins. | Powerful querying via **SQL** for complex joins and aggregations. |
| **Role** | A **speed layer** for caching, session storage, and real-time data. | The **system of record** and the source of truth for your data. |

**In short:** You use the database for permanent, reliable storage and Redis for performance-critical access to a subset of that data.

#### **Redis vs. an In-Process Cache (e.g., EhCache, Caffeine)**

Both are caches, but their architecture is completely different.

| Feature | Redis | In-Process Cache (EhCache) |
| :--- | :--- | :--- |
| **Architecture** | **Out-of-Process (Networked)**. It's a separate server. | **In-Process (In-Heap)**. It's a library within your application. |
| **Data Sharing** | **Shared & Centralized**. All app instances connect to the same Redis server and see the same data. | **Isolated & Duplicated**. Each instance of your application has its own separate cache in its own memory. |
| **Latency** | Very low, but includes network overhead. | Extremely low (nanoseconds), as it's a simple method call. No network. |
| **Scalability** | Excellent for distributed systems. The cache is a shared resource. | Poor for distributed systems. Caches become inconsistent across instances. |
| **Use Case** | Distributed caching, session storage, and any shared data in a microservices or multi-instance environment. | Caching data within a single, monolithic application instance. |

**In short:** Use EhCache for a single-instance monolith. The moment you scale to two or more instances, you need a distributed cache like Redis to ensure all instances share a consistent view of the cached data.

---

### **3. How do you integrate Redis in Spring Boot?**

Integrating Redis into a Spring Boot application is a straightforward, three-step process:

**Step 1: Add Dependencies**
In your `pom.xml` (for Maven), you add the core starter:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```
This pulls in Spring Data Redis and the Lettuce client library. If you need Redis for session management, you would also add `spring-session-data-redis`.

**Step 2: Configure the Connection**
In your `application.properties` or `application.yml` file, you specify the connection details for your Redis server:
```properties
# Redis server host
spring.data.redis.host=localhost
# Redis server port
spring.data.redis.port=6379
# If Redis is password-protected
# spring.data.redis.password=your-secret
```
Spring Boot's auto-configuration will use these properties to create and configure a connection factory bean for you.

**Step 3: Use Redis in Your Code**
You can interact with Redis in two primary ways:

1.  **Directly via `RedisTemplate`:** For custom logic like rate limiting or distributed locks, you can directly inject `RedisTemplate` or `StringRedisTemplate` into your service and use its methods.

    ```java
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public void someMethod() {
        stringRedisTemplate.opsForValue().set("mykey", "myvalue");
    }
    ```

2.  **Abstractly via Caching Annotations:** For caching, you simply enable caching with `@EnableCaching` on a configuration class and then use annotations like `@Cacheable` on your methods. This is the declarative, preferred way for caching.

    ```java
    @Service
    public class MyService {
        @Cacheable("my-cache")
        public String getData(Long id) {
            // ... slow database call
        }
    }
    ```

---

### **4. Explain `@Cacheable`, `@CachePut`, `@CacheEvict`**

These three annotations are the core of Spring's caching abstraction. They control how methods interact with the cache.

#### **`@Cacheable`**

*   **Purpose:** To implement "read-through" caching. It's the primary annotation for speeding up read operations.
*   **Behavior:**
    1.  Before the method is executed, Spring checks the cache for a key derived from the method arguments.
    2.  If the key **exists (a cache hit)**, the method is **skipped entirely**, and the value is returned directly from the cache.
    3.  If the key **does not exist (a cache miss)**, the method is executed, and its return value is automatically stored in the cache before being returned.
*   **Use Case:** On a method like `Product getProductById(Long id)`.

#### **`@CachePut`**

*   **Purpose:** To update the cache with a new value.
*   **Behavior:** This annotation does **not** cause the method to be skipped. The method is **always executed**. After the method completes successfully, its return value is used to update the cache for the corresponding key.
*   **Use Case:** On a method like `Product updateProduct(Product product)`. You want to update the database *and* ensure the cache has the fresh version of the product.

#### **`@CacheEvict`**

*   **Purpose:** To remove an entry (or all entries) from the cache.
*   **Behavior:** The method is **always executed**. After the method completes, the corresponding key is removed from the cache.
*   **Use Case:** On a method like `void deleteProduct(Long id)`. After deleting the product from the database, you must remove it from the cache to prevent serving stale data.

---