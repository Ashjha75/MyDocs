
---
title: "2. Practical Use Cases for Redis"
slug: redis-practical-use-cases
tags: redis, spring-boot, caching, session-management, rate-limiting, pub-sub, distributed-locks
---

### **2.1 Caching Expensive DB Queries / API Responses**

#### **What is Caching?**

Caching is the process of storing a copy of data in a temporary, high-speed storage layer (the "cache"). When the same data is needed again, it can be retrieved from the cache instead of the original, slower source. This is the #1 use case for Redis.

#### **The Problem: Slow Responses & Overloaded Databases**

Imagine a popular e-commerce website. The homepage displays a list of "Top 10 Bestselling Products." To get this list, the application has to run a complex and slow SQL query on the database, which might take 200ms.

*   **For the User:** Every visit to the homepage feels slow.
*   **For the System:** If 1,000 users visit the homepage per minute, the application runs that same expensive query 1,000 times. This puts an enormous, repetitive load on your database, slowing down the entire system.

#### **The Redis Solution: A High-Speed Data Layer**

By introducing Redis as a cache, we can store the result of that 200ms query. Subsequent requests can get the same data from Redis in less than 1ms.

#### **Implementation Flow (Cache-Aside Pattern)**

This is the most common caching strategy. The application code is responsible for checking the cache before hitting the database.

1.  The application receives a request for the "Top 10 Bestsellers."
2.  **CHECK CACHE:** It first checks Redis for a key, e.g., `bestsellers:top10`.
3.  **CACHE HIT:** If the key exists in Redis (a "cache hit"), the application retrieves the data from Redis, formats it, and returns it to the user. The process stops here.
4.  **CACHE MISS:** If the key does not exist in Redis (a "cache miss"), the application proceeds to the next step.
5.  **QUERY DATABASE:** It runs the original expensive query against the primary database.
6.  **POPULATE CACHE:** The application takes the result from the database and saves it into Redis using the key `bestsellers:top10`. Crucially, it sets a TTL (Time To Live), for example, 10 minutes (`EXPIRE bestsellers:top10 600`).
7.  The application returns the data to the user.

The *next* user who requests the same data will get a "cache hit" (step 3) and experience a lightning-fast response.

**Diagram: Cache-Aside Flow**
```
            +-----------+      1. Request for Data      +-----------------+
            |   User    | ----------------------------> |  Spring Boot App  |
            +-----------+                               +--------+--------+
                                                                 | 2. Check Cache
                                                                 v
                                                            +----------+
                                                            |  Redis   |
                                                            | (Cache)  |
                                                            +----+-----+
                                                                 |
            +----------------------------------------------------+-------------------------------------------------+
            |                                                                                                      |
      3a. Cache HIT (Data Found)                                                                           3b. Cache MISS (Not Found)
            |                                                                                                      |
            v                                                                                                      v
  +---------+---------+                                                                                    +--------------------+
  | Return data from  |                                                                                    | 4. Query Primary DB|
  |      Redis        |                                                                                    +---------+----------+
  +-------------------+                                                                                              |
            ^                                                                                                        v
            | 7. Return Data to User                                                                         +--------------------+
            +------------------------------------------------------------------------------------------------| 5. Store result in |
                                                                                                             |    Redis w/ TTL    |
                                                                                                             +--------------------+
                                                                                                                       | 6. Return Data
                                                                                                                       v
                                                                                                                (Back to App)
```

#### **Spring Boot Context**
Spring Boot makes this incredibly simple with its caching abstraction. You don't have to write the cache-aside logic manually.
*   Add the dependency `spring-boot-starter-data-redis`.
*   Add `@EnableCaching` to a configuration class.
*   Use the `@Cacheable("bestsellers")` annotation on your method that fetches data from the database. Spring will automatically handle the entire cache-aside flow for you.

---

### **2.2 Session Management (Spring Session)**

#### **What is Session Management?**

In a web application, an HTTP session is a way to store information about a user across multiple requests (e.g., who is logged in, what's in their shopping cart).

#### **The Problem: "Sticky Sessions" in a Scalable App**

Imagine your application is popular and you are running it on two servers (Server A and Server B) behind a load balancer.

1.  A user logs in. The load balancer sends them to **Server A**. Server A creates a session in its own memory and stores the user's login information.
2.  The user clicks to view their shopping cart. The load balancer, trying to distribute traffic evenly, now sends this request to **Server B**.
3.  Server B has no idea who this user is. Its memory doesn't contain the session created on Server A. From the user's perspective, they have been logged out.

The traditional, problematic solution is "sticky sessions," where the load balancer is configured to always send a specific user back to the same server. This creates an availability risk (if Server A goes down, all its users are logged out) and makes scaling difficult.

#### **The Redis Solution: A Centralized Session Store**

Instead of each server storing sessions in its own local memory, all servers store session data in a central Redis instance.

1.  A user logs in, and the request goes to **Server A**.
2.  Server A creates the session but saves it in **Redis**, not its local memory.
3.  The user clicks to view their cart, and the request goes to **Server B**.
4.  Server B receives the user's session cookie, looks up the session ID in **Redis**, finds the session data, and seamlessly continues the user's experience.

**Diagram: Centralized Session Management**
```
                  +----------------+
                  | Load Balancer  |
                  +-------+--------+
                          |
            +-------------+-------------+
            |                           |
            v                           v
+-----------+-----------+   +-----------+-----------+
|    Spring Boot App    |   |    Spring Boot App    |
|       (Server A)      |   |       (Server B)      |
+-----------+-----------+   +-----------+-----------+
            |                           |
            |  Read/Write Session Data  |
            +-------------+-------------+
                          |
                          v
                    +-----------+
                    |   Redis   | (Shared Session Store)
                    +-----------+
```

#### **Spring Boot Context**
This is another area where Spring shines.
*   Add the `spring-session-data-redis` dependency.
*   Add `@EnableRedisHttpSession` to a configuration class.
*   That's it! Spring Session automatically replaces the default in-memory `HttpSession` with a Redis-backed implementation. No changes are needed in your controller/service logic.

---

### **2.3 Rate Limiting (API Protection)**

#### **What is Rate Limiting?**

Rate limiting is a technique used to control the amount of incoming traffic to an API or service. For example, "Allow a user to call the `/api/v1/search` endpoint a maximum of 100 times per minute."

#### **The Problem: Abuse and Overload**

Without rate limiting, a single user or a malicious script could bombard your API with thousands of requests per second. This can:
*   Overload your server and database, causing a denial-of-service (DoS) for legitimate users.
*   Incur high costs if the API calls a paid third-party service (e.g., a mapping or translation API).

#### **The Redis Solution: Atomic Counters with a TTL**

Redis is perfect for rate limiting because of its atomic operations and support for key expiration. A common approach is the **Fixed Window Counter**.

1.  Define a key that represents the user and the time window. Example: `ratelimit:user123:search:2025-09-18T05-54`.
2.  When a request comes in, use the `INCR` command on this key. `INCR` is atomic, meaning there are no race conditions even if the user sends multiple requests at the exact same time.
3.  If this is the first request in this time window (i.e., `INCR` returns 1), set an `EXPIRE` on the key for 60 seconds.
4.  Check the counter's value. If it's greater than your limit (e.g., 100), reject the request with an HTTP 429 "Too Many Requests" status code.
5.  If it's below the limit, allow the request to proceed.

Because `INCR` and `EXPIRE` are so fast, you can perform this check on every single API call with negligible performance overhead.

#### **Spring Boot Context**
While Spring doesn't have a built-in rate limiter like it does for caching, you can easily implement this logic using `RedisTemplate`. You would typically implement this inside a Spring `HandlerInterceptor` or a Spring Cloud Gateway filter to protect your endpoints. Libraries like Resilience4j or Bucket4j also offer sophisticated rate-limiting patterns that can use Redis as a backend.

---

### **2.4 Pub/Sub Messaging**

#### **What is Pub/Sub?**

Publish/Subscribe (Pub/Sub) is a messaging pattern where senders of messages (Publishers) do not send messages directly to specific receivers (Subscribers). Instead, publishers send messages to named "channels," and any number of subscribers can listen to those channels to receive the messages.

#### **The Problem: Tightly Coupled Services**

Imagine in your e-commerce app, after a user places an order (`OrderService`), you need to:
1.  Send a confirmation email (`NotificationService`).
2.  Update the inventory (`InventoryService`).
3.  Notify the shipping department (`ShippingService`).

Without a messaging system, the `OrderService` would have to make direct API calls to the other three services. If the `NotificationService` is down, the entire order placement process might fail. This is called tight coupling.

#### **The Redis Solution: Decoupled Fire-and-Forget Messaging**

Redis provides basic `PUBLISH` and `SUBSCRIBE` commands.

1.  The `NotificationService`, `InventoryService`, and `ShippingService` all `SUBSCRIBE` to a channel named `orders:new`.
2.  When a new order is created, the `OrderService` simply executes `PUBLISH orders:new '{"orderId": "xyz-123", "userId": "abc-456"}'`.
3.  Redis instantly delivers this message to all three subscribed services.

The `OrderService` doesn't know or care who is listening. It just fires off the message and moves on. This decouples the services.

**Important Note for a 2 YOE Developer:** Redis Pub/Sub is **fire-and-forget**. If a subscriber is offline when a message is published, it will **miss that message forever**. It's great for simple, non-critical notifications (like "update a real-time dashboard"). For critical tasks where you need guaranteed delivery (like processing payments), you should use a more robust message broker like **RabbitMQ** or **Apache Kafka**.

#### **Spring Boot Context**
Spring Data Redis provides a `RedisMessageListenerContainer` and a `@MessageMapping` annotation to make it easy to implement publishers and subscribers in a Spring-native way.

---

### **2.5 Distributed Locks**

#### **What is a Distributed Lock?**

A distributed lock is a mechanism to ensure that, in a distributed system with multiple servers, only one server can access a specific shared resource or execute a critical piece of code at any given time.

#### **The Problem: Race Conditions in a Distributed System**

Imagine a feature that gives a "daily bonus" to the first user who logs in after midnight. You have two servers running your app.

1.  At 12:00:00.100 AM, User A's login request hits **Server 1**.
2.  At 12:00:00.101 AM, User B's login request hits **Server 2**.
3.  Server 1 checks the database, sees no bonus has been given, and starts the process of awarding the bonus to User A.
4.  Simultaneously, Server 2 checks the database, also sees no bonus has been given, and starts awarding it to User B.
5.  Result: You've given out two bonuses instead of one, and your data is inconsistent.

#### **The Redis Solution: Atomic `SETNX`**

A simple distributed lock can be implemented using the `SETNX` (SET if Not eXists) command.

1.  Before a server attempts to run the critical code, it tries to create a key in Redis: `SET lock:daily_bonus "server1" NX PX 30000`.
    *   `lock:daily_bonus`: The name of our lock for the shared resource.
    *   `"server1"`: A value to identify who holds the lock.
    *   `NX`: This is the crucial part. It means "only set this key if it does **N**ot e**X**ist." This operation is atomic.
    *   `PX 30000`: Set an expiration time of 30,000 milliseconds (30 seconds). **This is absolutely critical.** It ensures that if the server holding the lock crashes, the lock is automatically released after the timeout, preventing a permanent deadlock.
2.  **Lock Acquired:** If the `SET` command succeeds, the server has acquired the lock and can safely run the critical code.
3.  **Lock Not Acquired:** If the `SET` command fails (because another server already set the key), this server must wait and retry later.
4.  **Release Lock:** After the server finishes the critical task, it must delete the key using `DEL lock:daily_bonus` to release the lock for other servers.

**What a 2 YOE Developer Should Know:** This simple implementation has potential issues (e.g., the lock might expire before the task is done). More robust distributed lock algorithms like Redlock exist, and libraries like Redisson provide production-ready implementations that handle these edge cases for you. However, understanding the `SETNX` + TTL foundation is the most important part.

#### **Spring Boot Context**
You can implement this logic using `RedisTemplate`. The `execute` method with a `RedisCallback` can be used to run the `SET` command with the NX/PX options. For production use, it is highly recommended to use a library like **Redisson**, which integrates with Spring Boot and provides a simple `RLock` interface: `lock.lock()` and `lock.unlock()`.