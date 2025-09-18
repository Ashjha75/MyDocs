---
title: "1. Redis Fundamentals"
---


### **1. What is Redis? (in-memory, key-value, super fast)**

**What it is:**
Redis ( **RE**mote **DI**ctionary **S**erver) is an open-source, in-memory, key-value data store. It can be used as a database, cache, message broker, and streaming engine.

Let's break down those terms:
*   **In-Memory:** Unlike traditional databases that store most data on disk (SSD/HDD), Redis keeps the entire dataset in RAM (Random Access Memory). This is the primary reason for its incredible speed. Accessing data from RAM is orders of magnitude faster than from a disk.
*   **Key-Value Store:** At its heart, Redis is a dictionary. You store data (the "value") and assign it a unique identifier (the "key"). All data retrieval is done by referencing this key. Keys are always strings, but values can be various complex data structures.
*   **Super Fast:** Because it's in-memory and has a highly efficient, single-threaded design, Redis can perform millions of operations per second, with read and write latencies often in the sub-millisecond range.

**Diagram: Redis vs. Traditional Database**

```
      Traditional Database (e.g., PostgreSQL, MySQL)
      +-------------------------------------------------+
      |                 Application                     |
      +-------------------------------------------------+
                          | (Network Latency)
      +-------------------------------------------------+
      | Query Processor | -> |  Storage Engine  | -> |   DISK (SSD/HDD)  |
      +-------------------------------------------------+
                        (Slow Disk I/O)

      Redis
      +-------------------------------------------------+
      |                 Application                     |
      +-------------------------------------------------+
                          | (Network Latency)
      +-------------------------------------------------+
      |                   Redis Server                  |
      |                  (All data in RAM)              |
      +-------------------------------------------------+
                        (Extremely Fast RAM I/O)
   ```

**Why we use it (The Cause):**
We use Redis when the speed of data access is a critical business requirement. Traditional databases are often too slow for use cases like real-time analytics, high-traffic session storage, or caching frequently accessed data, as disk I/O is a major bottleneck.

**Spring Boot Integration Context:**
In a Spring Boot application, you might have a service that fetches product details from a PostgreSQL database. This database call could take 50-100ms. If you cache that product data in Redis, the subsequent fetches could take <1ms. This dramatically improves application responsiveness and reduces the load on your primary database.

### **2. Difference between Redis & a Traditional DB**

| Feature | Redis | Traditional Relational DB (e.g., MySQL, PostgreSQL) |
| :--- | :--- | :--- |
| **Primary Storage** | In-Memory (RAM) | On-Disk (SSD/HDD) |
| **Data Model** | Key-Value (with rich data types) | Structured Tables (Rows & Columns) with a strict schema. |
| **Performance** | Extremely high throughput, low latency. | Performance is limited by disk I/O, indexing, and query complexity. |
| **Querying** | Simple, direct key-based access. No complex joins or aggregations. | Powerful querying with SQL, including complex joins, aggregations, and transactions. |
| **Relationships** | Does not manage data relationships. | Designed to manage and enforce complex relationships (e.g., foreign keys). |
| **Use Cases** | Caching, session management, real-time leaderboards, Pub/Sub, rate limiting. | Primary data persistence (System of Record), complex business logic, data integrity. |

**Why it matters:** You don't choose one *over* the other; you use them *together*. Redis is not a replacement for a database like PostgreSQL. It is a specialized tool used to augment your architecture for performance. The database provides durable, long-term storage, while Redis provides a speed layer.

### **3. Redis Architecture (single-threaded, event loop)**

**What it is:**
Redis, at its core, uses a **single-threaded, event-driven architecture**. This might seem counterintuitive for a high-performance system, but it's a key to its success.

*   **Single-Threaded:** It processes all client commands sequentially using a single main thread.
*   **Event Loop & Non-Blocking I/O:** Redis uses an **event loop** and an I/O multiplexing mechanism (like `epoll` or `kqueue`). It waits for events (like a new client connection or data arriving on a socket) and processes them one by one. Because I/O operations (like reading from a network socket) are non-blocking, the single thread doesn't waste time waiting. While one command's data is being read from the network, the thread can execute another command that is already in memory.

**Diagram: Redis Event Loop**

```
                            +-----------------+
                            |   Event Queue   | (e.g., new command, client connected)
                            +-------+---------+
                                    |
+-----------------------------------v-----------------------------------+
|                            Redis Event Loop (Single Thread)           |
|                                                                       |
|  1. Get Event -> 2. Process Command -> 3. Send Response -> 1. Repeat  |
|      (e.g., GET user:123)    (Find in RAM)     (Write to socket)      |
|                                                                       |
+-----------------------------------------------------------------------+
```

**Why this architecture?**
*   **No Context Switching Overhead:** Multi-threaded systems spend CPU cycles switching between threads, which can be expensive. Redis avoids this completely.
*   **No Lock Contention:** There's no need for complex locking mechanisms to protect data from race conditions, because only one command is ever executing at a time. This massively simplifies the design and eliminates a common source of bugs and performance degradation.
*   **Atomicity:** As a consequence, individual Redis commands are **atomic**. When you run `INCR my_counter`, you are guaranteed that no other command will interrupt it.

**The Main Trade-off:** A single long-running command (e.g., `KEYS *` on a huge database, or a complex Lua script) can block the entire server, making all other clients wait. This is why it's critical to avoid slow commands in production.

### **4. Core Data Types & Use Cases**

Redis is powerful because its "values" are not just simple strings. They are advanced data structures.

#### **String**
*   **What it is:** The most basic Redis data type, storing a sequence of bytes up to 512 MB. It can be text, a number, or even serialized binary data like a JPEG.
*   **Why we use it:** For simple key-value caching and for its atomic numeric operations.
*   **Use Cases & Examples:**
    *   **Caching API Responses:** Store the entire JSON response of a slow API call.
        *   `SET api:products:123 '{"id":123, "name":"Super Widget"}'`
    *   **Counters:** Atomic increment operations are perfect for counting things like page views or likes.
        *   `INCR page_views:article:456`
    *   **Session Tokens:** Store a user's session ID with their user ID as the value.
        *   `SET session:bA3fG_8hZ1 "user:101"`

#### **Hash**
*   **What it is:** A collection of field-value pairs, essentially a map within a key. It's ideal for representing objects.
*   **Why we use it:** It's more memory-efficient than storing the same object as multiple separate String keys. It also allows you to update or retrieve individual fields of an object without fetching the entire thing.
*   **Use Cases & Examples:**
    *   **Storing User Profiles:** A single `user:101` key holds all the user's attributes.
        *   `HSET user:101 name "Alice" email "alice@example.com" posts 42`
    *   **Spring Boot `CrudRepository`:** When using Spring Data Redis, your `@RedisHash` annotated objects are often stored as Redis Hashes.

#### **List**
*   **What it is:** A collection of strings sorted by insertion order. It's essentially a doubly-linked list.
*   **Why we use it:** For its fast head/tail push and pop operations, making it perfect for queue-like structures.
*   **Use Cases & Examples:**
    *   **Simple Message Queues:** One service can `LPUSH` (left push) a task onto a list, and a worker service can `RPOP` (right pop) it off to process.
        *   `LPUSH task_queue '{"userId": 101, "job": "send_welcome_email"}'`
    *   **Activity Feeds:** Storing the last 100 actions a user took.
        *   `LPUSH user:101:actions "Logged In"`
        *   `LTRIM user:101:actions 0 99` (Keep only the latest 100)

#### **Set**
*   **What it is:** An unordered collection of unique strings. You can add, remove, and check for the existence of an item in constant time, O(1).
*   **Why we use it:** For tracking uniqueness and performing set-based operations like unions and intersections.
*   **Use Cases & Examples:**
    *   **Tracking Online Users:** Each user ID is added to a set when they log in. Since it's a set, duplicates are ignored automatically.
        *   `SADD online_users "user:101"`
        *   `SADD online_users "user:205"`
        *   `SMEMBERS online_users` -> `{"user:101", "user:205"}`
    *   **Tagging Systems:** Finding items that have multiple tags in common.
        *   `SINTER tags:tech tags:java` -> Returns items tagged with both "tech" and "java".

#### **Sorted Set (ZSET)**
*   **What it is:** Similar to a Set, but each member is associated with a floating-point **score**. The members are unique, but scores can be repeated. The collection is kept sorted by this score.
*   **Why we use it:** Whenever you need to maintain an ordered collection and retrieve items by their rank or score.
*   **Use Cases & Examples:**
    *   **Leaderboards:** The score is the player's points. Adding a new score is extremely fast, and the leaderboard is always sorted.
        *   `ZADD leaderboard 15500 "user:101"`
        *   `ZADD leaderboard 18200 "user:304"`
        *   `ZREVRANGE leaderboard 0 9 WITHSCORES` -> Returns the top 10 players and their scores.
    *   **Priority Queues:** The score can represent a task's priority.

### **5. TTL & Expiration (`EXPIRE`, `TTL`)**

*   **What it is:** Time To Live (TTL) is a feature that allows you to set an automatic deletion timeout on a key.
*   **Why we use it:** It is the fundamental mechanism for managing cache data. It prevents old, stale data from living in your cache forever and automatically frees up memory.
*   **Core Commands:**
    *   `EXPIRE key_name seconds`: Sets a timeout on a key.
    *   `TTL key_name`: Checks the remaining time to live for a key in seconds. Returns -1 if the key has no expiry, and -2 if the key doesn't exist.
*   **Example (Rate Limiting):** A simple way to limit an API to 100 requests per hour per user.
    1.  A user makes a request.
    2.  Run `INCR rate_limit:user:101`.
    3.  If the result is `1`, it's the first request in the window, so run `EXPIRE rate_limit:user:101 3600` (set to expire in 1 hour).
    4.  If the result is > 100, reject the request.

### **6. Persistence Options: RDB vs. AOF**

Since Redis is in-memory, what happens if the server crashes? All your data is lost. Persistence is the process of saving the in-memory data to disk to ensure durability. Redis offers two main strategies:

| Feature | RDB (Redis Database) | AOF (Append Only File) |
| :--- | :--- | :--- |
| **How it Works** | Takes point-in-time snapshots of your entire dataset at specified intervals. | Logs every single write operation received by the server to a file. On restart, Redis replays these commands to rebuild the state. |
| **Pros** | Compact file, great for backups. Faster restarts with large datasets compared to AOF. Minimal performance impact as a child process does the work. | Higher durability; you can configure it to log every command, losing at most one second of data. More fine-grained recovery. |
| **Cons** | Potential for data loss between snapshots. A `fork()` system call can cause a momentary pause on large datasets. | AOF files are typically larger than RDB files. Can be slower to restart as it has to replay all commands. Potentially lower performance due to disk I/O for every write. |
| **Best For** | Caching scenarios where some data loss is acceptable, backups, and disaster recovery. | Situations where data durability is critical and you can't afford to lose any writes (e.g., using Redis as a primary database). |

**Hybrid Mode:** Many production setups enable both. On restart, Redis will use the AOF file for recovery as it is guaranteed to be the most complete.

### **7. Eviction Policies: LRU, LFU, noeviction**

*   **What it is:** When Redis reaches its configured `maxmemory` limit, it needs to make room for new data. An eviction policy is the algorithm it uses to decide which keys to delete.
*   **Why we need it:** To prevent Redis from running out of memory and crashing. It's essential for any caching implementation.
*   **Common Policies:**
    *   **`noeviction`**: The default policy. Don't evict anything. Redis will return an error on write commands if it's out of memory.
    *   **`allkeys-lru`**: **L**east **R**ecently **U**sed. Evicts the keys that haven't been accessed for the longest time. A great general-purpose choice.
    *   **`allkeys-lfu`**: **L**east **F**requently **U**sed. Evicts the keys that are accessed the fewest times. Good for when you have some items that are hit constantly and others that are accessed rarely.
    *   **`volatile-lru / volatile-lfu`**: Same as above, but only considers keys that have an expiration (TTL) set.
    *   **`allkeys-random`**: Evicts a random key. Use this if you have uniform access patterns.

**Important Note:** Redis's LRU and LFU are not exact; they are **approximated** algorithms. Redis samples a small number of keys to find a candidate for eviction, which is much more memory-efficient than tracking every single access.