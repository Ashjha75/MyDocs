---
title: "Spring Boot Caching - Interview Questions"
description: "Prepare for your Spring Boot caching interview with these essential questions and answers."
---

#### **1. The Core Annotations: `@Cacheable` vs. `@CachePut` vs. `@CacheEvict`**

**The Question:** "Can you explain the difference between `@Cacheable`, `@CachePut`, and `@CacheEvict` and when you would use each?"

**Your Answer (The Sensi's Script):**

"Certainly. These three annotations are the core of Spring's declarative cache abstraction, and they each serve a very distinct purpose based on the nature of the operation."

*   "**`@Cacheable`** is for **read operations**. Its logic is 'check the cache first, and only execute the method if a value is not found.' I use this on `find...` or `get...` methods that retrieve data. Its entire purpose is to **avoid expensive method executions**, like database calls. The key takeaway is that `@Cacheable` is **conditional**—it might skip the method."

*   "**`@CachePut`** is for **update operations**. Its logic is 'always execute the method, and then place its return value into the cache.' I use this on `update...` or `edit...` methods. You use it when you need to refresh a cache entry with new data after a modification. The key takeaway here is that `@CachePut` is **unconditional**—it *always* runs the method and *always* updates the cache."

*   "**`@CacheEvict`** is for **delete operations**. Its logic is 'execute the method, and then remove a value from the cache.' I use this on `delete...` methods to ensure that deleted data doesn't remain in the cache. It can also be configured with `allEntries=true` to clear an entire cache region, which is useful for bulk update scenarios where fine-grained eviction is impractical."

**In summary:** `@Cacheable` is a gatekeeper for reads, `@CachePut` is a refresh for writes, and `@CacheEvict` is a cleanup for deletes.

---

#### **2. Cache Invalidation Strategies**

**The Question:** "Data in a cache can become stale. What strategies would you use to ensure your cache remains consistent with the source of truth, like your database?"

**Your Answer (The Sensi's Script):**

"Cache invalidation is the hardest problem in caching, and the right strategy depends on the data's volatility and the application's consistency requirements. I would employ a multi-layered approach:"

1.  "**Explicit, Manual Eviction (Primary Strategy):** This is the most common and precise method. For any business operation that modifies data, I use `@CachePut` or `@CacheEvict` to immediately update or remove the relevant cache entry. For example, when an `updateProduct()` method is called, I use `@CachePut` on it to ensure the `products` cache is refreshed with the new state. This provides the strongest consistency for predictable changes."

2.  **Time-To-Live (TTL) Eviction (The Safety Net):** I would configure a TTL on my cache regions in the underlying provider (like Redis or EhCache). This acts as a crucial safety net. It guarantees that even if an explicit eviction is missed, or if data is changed by an external process, a stale entry will be automatically purged after a configured duration (e.g., 30 minutes). This trades a small window of potential staleness for long-term system resilience."

3.  **Event-Driven Invalidation (Advanced Strategy):** In a microservices environment, this becomes more important. If `Service B` updates data that is cached in `Service A`, `Service B` can publish an event (e.g., to a Kafka topic or Redis Pub/Sub) saying 'Product 123 was updated.' `Service A` would have a listener subscribed to this topic, and upon receiving the event, it would programmatically evict the corresponding entry from its local cache. This is more complex but provides near-real-time consistency in a distributed system."

---

#### **3. Cache Stampede (Thundering Herd Problem)**

**The Question:** "Describe what a Cache Stampede is and how you would mitigate it."

**Your Answer (The Sensi's Script):**

"A Cache Stampede, or Thundering Herd problem, is a specific, high-concurrency failure scenario. It happens when a very popular, cached item expires, and simultaneously, a large number of requests (the 'herd') try to access it at the exact same moment."

"Here's the sequence of failure:"
1.  All concurrent requests check the cache for the popular item. They all experience a **cache miss**.
2.  All of them then proceed to execute the underlying expensive method—for example, a complex database query—at the same time.
3.  This flood of identical, expensive operations can overwhelm the database, causing cascading failures throughout the application.

"To mitigate this, I would use several strategies:"

1.  "**Locking (`sync = true`):** The simplest solution is provided by Spring's `@Cacheable` annotation itself. Setting `@Cacheable(sync = true)` ensures that when a cache miss occurs, **only one thread** will be allowed to execute the underlying method. Other threads requesting the same key will be blocked until the first thread finishes, populates the cache, and the value becomes available. This is a powerful, built-in defense."

2.  **Probabilistic Early Expiration:** Instead of a hard TTL, some caching systems can be configured to have a "soft" TTL. For an item with a 60-second TTL, the system might start reporting a cache miss for one thread after 55 seconds, allowing it to regenerate the value in the background *before* the actual expiration, while other threads continue to be served the slightly stale data.

3.  "**Using a Distributed Lock (Advanced):** In a distributed environment, the `sync=true` flag only works for a single application instance. To prevent a stampede from multiple servers, you would need a distributed lock (e.g., using Redis's `SETNX` command). The first service instance to get the lock would be responsible for regenerating the cache, while others would wait or be served stale data."

---

#### **4. Local vs. Distributed Caching & How to Choose**

**The Question:** "Compare local (in-memory) caching with distributed caching. How would you decide which one to use for a new project?"

**Your Answer (The Sensi's Script):**

"The choice between local and distributed caching is a fundamental architectural decision driven by the application's deployment model."

*   "**Local Caching**, like Caffeine or EhCache, stores data directly in the application's JVM heap. It's **extremely fast** due to the absence of network latency. I would choose a local cache for a **single-node, monolithic application**. It's also excellent for caching data that is specific to that instance and doesn't need to be shared, like UI-specific computations."

*   "**Distributed Caching**, like Redis or Hazelcast, uses an external server. The application communicates with it over the network. It's inherently slower than a local cache due to network I/O, but its purpose is different. I would choose a distributed cache for any application that is deployed as a **cluster of multiple nodes or as microservices**."

"The decision comes down to one key question: **Do I need cache consistency across multiple service instances?**"
*   "If the answer is **No** (it's a single monolith), I'll start with **Caffeine** for its simplicity and top-tier performance."
*   "If the answer is **Yes** (it's a clustered or microservices application), **Redis** is the industry standard and my default choice. It provides a shared, consistent view of the cached data for all services, and also serves as a foundation for other distributed features like session management and message queues."

---

#### **5. Common Pitfalls and How to Avoid Them**

**The Question:** "What are some common problems you've seen with caching in production?"

**Your Answer (The Sensi's Script):**

"From my experience, the two most dangerous pitfalls are stale data and memory management."

1.  "**Stale Data:** This is the most common bug. It occurs when the data in the database is updated, but the corresponding cache entry is not evicted. The application then serves outdated information, which can lead to anything from a minor UI glitch to a serious business logic failure. To avoid this, I enforce a strict policy: **every method that writes or deletes data must have a corresponding `@CachePut` or `@CacheEvict` annotation that targets the same cache and key** used by the read methods. Additionally, I always configure a reasonable **TTL as a safety net** to ensure even the most stubborn stale data is eventually purged."

2.  **Memory Leaks & `OutOfMemoryError`:** This is the most catastrophic failure. It's particularly a risk with **in-memory caches**. If the cache is unbounded (no max size) and the keys have high cardinality (e.g., caching user-specific data where there are millions of users), the cache can grow until it consumes the entire JVM heap, crashing the application. To avoid this, I **always define a maximum size or entry count** for my cache regions. I also use monitoring tools like Grafana with Micrometer metrics to watch the cache size over time and set up alerts if it grows unexpectedly."