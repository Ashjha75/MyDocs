---
title: "Spring Boot Advanced Redis Usage"
slug: spring-boot-advanced-redis-usage
tags: redis, spring-boot, caching, session-management, rate-limiting, pub-sub, distributed-locks
---

### **5.1 Spring Session with Redis (Distributed Login/Session Storage)**

#### **The "What"**

This is a powerful feature that offloads HTTP session management from your individual application servers to a centralized Redis instance. In essence, Redis becomes the single source of truth for all user session data (like login status, shopping cart contents, etc.).

#### **The Problem It Solves: The Stateless Application Imperative**

In modern cloud-native applications, we want to run multiple, identical instances of our application behind a load balancer for scalability and high availability. This creates a problem for session management:

1.  A user logs in. The load balancer sends their request to **Server 1**. Server 1 creates a session in its local memory.
2.  The user clicks another link. The load balancer, for efficiency, sends this new request to **Server 2**.
3.  **Problem:** Server 2 has no knowledge of the session created on Server 1. To Server 2, the user is not logged in.

This forces you to use "sticky sessions," which is an anti-pattern that hurts scalability and resilience. The goal is to make your application **stateless**, meaning any server can handle any request from any user at any time.

#### **The Redis Solution: A Central Session Store**

By using Redis, the flow changes completely:

1.  A user logs in, and the request is handled by **Server 1**.
2.  Server 1 creates the session object but, instead of storing it locally, it saves it to the central **Redis** instance.
3.  The user's browser holds a cookie with a session ID.
4.  The user clicks another link, and the request goes to **Server 2**.
5.  Server 2 gets the session ID from the cookie, looks it up in Redis, finds the session data, and seamlessly continues the user's experience.

**Diagram: Centralized Session Architecture**
```
                  +----------------+
                  | Load Balancer  |
                  +-------+--------+
                          |
            +-------------+-------------+
            |                           |
            v                           v
+-----------+-----------+   +-----------+-----------+
| Spring Boot App (Srv 1)|   | Spring Boot App (Srv 2)|
|     (STATELESS)       |   |      (STATELESS)      |
+-----------+-----------+   +-----------+-----------+
            |       (Read/Write Session to Redis)   |
            +---------------------+-----------------+
                                  |
                                  v
                            +-----------+
                            |   Redis   | (Central Session Store)
                            +-----------+```

#### **The "Spring Boot Way" (It's almost magic)**

Spring Boot makes this incredibly easy.

1.  **Add Dependencies:** Include `spring-boot-starter-data-redis` and `spring-session-data-redis` in your `pom.xml`.
2.  **Configure Connection:** Set up your Redis connection in `application.properties` (host, port, etc.).
3.  **Enable:** Add the `@EnableRedisHttpSession` annotation to a `@Configuration` class.

**Example Configuration:**
```java
import org.springframework.context.annotation.Configuration;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@Configuration
// timeout is in seconds. The session will expire in Redis after 30 minutes of inactivity.
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class SessionConfig {
}
```

That's it. **You do not need to change a single line of your controller or service code.** Spring Session uses AOP (Aspect-Oriented Programming) to intercept calls to the standard `HttpServletRequest.getSession()` and automatically replaces the default Tomcat session implementation with one that reads and writes to Redis.

---

### **5.2 Rate Limiting with Counters + TTL**

#### **The "What"**

Rate limiting is a defensive mechanism to control the frequency of requests a client can make to an API. For example: "Allow API key `XYZ` to make no more than 100 requests per minute."

#### **The Problem It Solves: Preventing Abuse and Ensuring Fair Usage**

*   **Security:** Prevents Denial of Service (DoS) attacks where a malicious actor bombards your API to take it down.
*   **Stability:** Protects your backend services and database from being overwhelmed by traffic spikes.
*   **Business Logic:** Enforces API usage tiers (e.g., Free users get 100 calls/day, Premium users get 10,000).

#### **The Redis Solution: Atomic Counters with an Expiration Window**

Redis is perfect for this due to its atomic `INCR` command and key expiration (TTL). The most common pattern is the **Fixed Window Counter**.

1.  **Create a Key:** Construct a key that uniquely identifies the client and the current time window. E.g., `ratelimit:user123:2025-09-18-06-21` (for a per-minute window).
2.  **On First Request:** When a request arrives, run `INCR` on the key. If the result is `1`, it's the first hit in this window. Immediately set an `EXPIRE` on the key for 60 seconds.
3.  **On Subsequent Requests:** `INCR` the key. If the value is below your limit (e.g., <= 100), allow the request. If it exceeds the limit, reject it with an HTTP 429 "Too Many Requests" error.

This entire check-and-increment operation is incredibly fast and atomic, making it suitable to run on every single request.

#### **The "Spring Boot Way"**

This is typically implemented using a `HandlerInterceptor` to protect your REST controllers.

**Conceptual Code for an Interceptor:**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private static final int RATE_LIMIT = 100; // 100 requests
    private static final int WINDOW_SECONDS = 60; // per minute

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String userId = request.getHeader("X-User-ID"); // Or get from JWT, etc.
        if (userId == null) {
            // Allow requests without user id or handle as needed
            return true;
        }

        String key = "ratelimit:" + userId;

        // INCR returns the new value after incrementing
        Long count = redisTemplate.opsForValue().increment(key);

        if (count != null && count == 1) {
            // First request in this window, set the expiration
            redisTemplate.expire(key, WINDOW_SECONDS, TimeUnit.SECONDS);
        }

        if (count != null && count > RATE_LIMIT) {
            response.setStatus(HttpServletResponse.SC_TOO_MANY_REQUESTS); // 429
            response.getWriter().write("Rate limit exceeded.");
            return false; // Block the request
        }

        return true; // Allow the request
    }
}
```
*Note: For more advanced rate-limiting algorithms like the Token Bucket, consider using a library like **Bucket4j**, which integrates seamlessly with Redis.*

---

### **5.3 Pub/Sub with Redis in Spring Boot**

#### **The "What"**

Publish/Subscribe (Pub/Sub) is a messaging pattern where message senders (**Publishers**) are decoupled from message receivers (**Subscribers**). Publishers send messages to a named **channel**, and Redis broadcasts that message to all subscribers currently listening on that channel.

#### **The Problem It Solves: Service Decoupling**

Imagine an `OrderService` that needs to notify several other services when a new order is placed. Without Pub/Sub, it would need to make direct, synchronous API calls to the `NotificationService`, `InventoryService`, and `AnalyticsService`. This is brittle—if the `AnalyticsService` is down, the entire order process could fail.

#### **The Redis Solution: Fire-and-Forget Messaging**

The `OrderService` simply `PUBLISH`es a message to the `new-orders` channel. It doesn't know or care who is listening. The other services `SUBSCRIBE` to this channel and react to the message independently.

**Crucial Caveat:** Redis Pub/Sub is **not durable**. If a subscriber is offline when a message is published, it will miss that message forever. It's best for non-critical, real-time events like "a user just commented, update live counters" or cache invalidation notices. For guaranteed delivery, use a message queue like RabbitMQ or Kafka.

#### **The "Spring Boot Way"**

Spring Data Redis provides a `RedisMessageListenerContainer` to handle the subscription logic.

**1. Publisher (Sends the Message):**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderPublisher {

    @Autowired
    private StringRedisTemplate redisTemplate;

    public void publishOrder(String orderJson) {
        // "new-orders" is the channel name
        redisTemplate.convertAndSend("new-orders", orderJson);
    }
}
```

**2. Subscriber (Receives the Message):**
```java
import org.springframework.stereotype.Component;

@Component
public class AnalyticsSubscriber {

    // This method will be invoked when a message arrives
    public void handleMessage(String message) {
        System.out.println("ANALYTICS: Received new order -> " + message);
        // ... logic to process the order for analytics ...
    }
}
```

**3. Configuration (Wires it all together):**
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class PubSubConfig {

    @Bean
    MessageListenerAdapter messageListener(AnalyticsSubscriber subscriber) {
        // Tells the adapter to call the "handleMessage" method on our subscriber bean
        return new MessageListenerAdapter(subscriber, "handleMessage");
    }

    @Bean
    RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory, MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        // Subscribe the listener to the "new-orders" channel
        container.addMessageListener(listenerAdapter, new ChannelTopic("new-orders"));
        return container;
    }
}
```

---

### **5.4 Distributed Locks (Conceptual, Basic Usage)**

#### **The "What"**

A distributed lock is a tool for ensuring that in a system with multiple servers, only one server can execute a critical section of code at a time. It provides mutual exclusion across a distributed environment.

#### **The Problem It Solves: Distributed Race Conditions**

Imagine a process that awards a unique, daily coupon to the first person who requests it.
1.  At 10:00:00.050 AM, a request from User A hits **Server 1**. Server 1 checks the database and sees no coupon has been awarded.
2.  At 10:00:00.060 AM, a request from User B hits **Server 2**. Server 2 also checks the database and sees no coupon awarded.
3.  Both servers proceed to award the coupon. You've now given out two "unique" coupons, violating your business rule.

#### **The Redis Solution: Atomic `SETNX`**

The foundation of a Redis distributed lock is the `SET` command with the `NX` (if **N**ot e**X**ists) option.

The logic is:
1.  **Acquire Lock:** All servers try to create a key, e.g., `SET lock:daily_coupon "some-server-id" NX PX 10000`.
    *   `NX`: This makes the operation atomic. Only the first server to execute this command will succeed in creating the key. All others will fail.
    *   `PX 10000`: **This is critical.** It sets a TTL of 10 seconds. If the server holding the lock crashes, the lock is automatically released after 10 seconds, preventing the entire system from getting stuck (a deadlock).
2.  **Execute Critical Section:** The server that successfully created the key has "acquired the lock" and can now safely run the code to award the coupon.
3.  **Release Lock:** After the work is done, the server must explicitly `DEL lock:daily_coupon` to release the lock for others.

#### **The "Spring Boot Way"**

You can implement this with `RedisTemplate`, ensuring you release the lock in a `finally` block.

**Conceptual Code:**
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class CouponService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String LOCK_KEY = "lock:daily_coupon";
    private static final Duration LOCK_TIMEOUT = Duration.ofSeconds(10);

    public boolean awardDailyCoupon() {
        // Try to acquire the lock. setIfAbsent is the Spring equivalent of SETNX.
        Boolean lockAcquired = redisTemplate.opsForValue()
                .setIfAbsent(LOCK_KEY, "locked", LOCK_TIMEOUT);

        if (Boolean.TRUE.equals(lockAcquired)) {
            try {
                // --- CRITICAL SECTION START ---
                // Check if coupon already awarded in DB
                // If not, award it and save to DB
                System.out.println("Lock acquired. Awarding coupon...");
                return true;
                // --- CRITICAL SECTION END ---
            } finally {
                // Always release the lock!
                redisTemplate.delete(LOCK_KEY);
                System.out.println("Lock released.");
            }
        } else {
            System.out.println("Could not acquire lock. Another process is running.");
            return false;
        }
    }
}
```
**Production Recommendation:** While it's vital to understand this concept, implementing a fully robust distributed lock is complex (e.g., handling lock-renewal for long-running tasks). For production use, it is highly recommended to use a library like **Redisson**, which provides a simple `RLock` interface that handles all the edge cases for you.