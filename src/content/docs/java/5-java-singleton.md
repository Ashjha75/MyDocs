---
title: "Java Singleton Design Pattern"
---

#  Singleton Design Pattern

## Basic

### 1. What is Singleton and where is it used in enterprise systems?
A **Singleton** is a **design pattern** where **only one instance** of a class is created for the entire application, and the same instance is reused everywhere.

This is useful where:
- Object creation is **expensive**, or
- Global consistent state is required.

**Common Enterprise Uses**

| Use Case            | Example                                      |
|---------------------|----------------------------------------------|
| Connection management | Database connection pool, Redis/JDBC connections |
| Config management     | Application config loader, Environment settings |
| Logging              | Centralized logging system (e.g., LogManager) |
| Caching              | Shared cache object (EhCache, Redis client, Guava cache) |

---

### 2. Why is the constructor of a Singleton class private?
To **prevent external object creation using `new`**. This ensures **only one controlled instance** exists, created through a static `getInstance()` method.

---

### 3. Difference between Eager and Lazy initialization.

| Feature           | Eager Initialization                      | Lazy Initialization                  |
|-------------------|-------------------------------------------|--------------------------------------|
| Instance creation | Created **immediately** at class load     | Created **only when needed**         |
| Memory usage      | May waste memory if never used            | Memory efficient                     |
| Thread Safety     | Thread-safe by default                    | Not thread-safe without sync         |
| Common example    | `private static final Singleton s = new Singleton();` | `if(instance == null) instance = new Singleton();` |

---

## Multithreading Concerns

### 4. Explain race condition in lazy initialization with multithreading.
If two threads access `getInstance()` at the same time when `instance` is `null`, both may create **two different instances**, violating Singleton guarantee.

This happens because:
- Both threads see `instance == null`
- Both try to create instance **simultaneously**

---

### 5. Why does synchronized Singleton method slow down performance?
Using:
```java
public synchronized static Singleton getInstance() { ... }
```
Forces **every thread** to wait for lock, even **after instance is created**. This causes **unnecessary blocking** in high concurrency systems → performance degradation.

---

## Double Checked Locking (DCL) & Volatile

### 6. Explain Double-Checked Locking with example.
```java
class Singleton {
    private static volatile Singleton instance;
    public static Singleton getInstance() {
        if (instance == null) {                // First check (no locking)
            synchronized (Singleton.class) {
                if (instance == null) {        // Second check (with lock)
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```
- **Lock is taken only once**, during the first initialization.
- After initialization, **subsequent calls skip lock**, improving performance.

---

### 7. What problem occurs in DCL without `volatile` keyword?
Without `volatile`, **object creation may be partially visible** to other threads.

Object creation is not atomic:
1. Allocate memory
2. Construct object
3. Assign reference

Due to **instruction reordering**, step 3 may happen before step 2 → another thread may see a **half-constructed object**, leading to unpredictable behavior.

`volatile` ensures:
- **No reordering**
- **Visibility across CPU threads**

---

### 8. How does CPU caching cause the memory visibility issue? (Cache vs Heap)
Each CPU core has its own **L1/L2 cache**. When a thread writes to a variable, it first updates CPU cache and later syncs to **main memory (heap)**.

If another thread running on another core reads before sync:
- It sees **old or incomplete data** → memory visibility problem.

`volatile` forces **all reads/writes to go directly to main memory**, avoiding stale values.

---

## Bill Pugh Solution

### 9. Explain Bill Pugh Singleton pattern and why it is preferred.
```java
class Singleton {
    private Singleton() {}
    private static class Holder {
        private static final Singleton INSTANCE = new Singleton();
    }
    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}
```
**Why preferred:**
- No synchronization required
- Thread-safe by JVM class-loading mechanism
- Instance is created **only when requested**
- **Fastest and cleanest implementation**

---

## Enum Singleton

### 10. Why is Enum the most recommended way to create Singleton in Java?
```java
enum Singleton {
    INSTANCE;
}
```
Benefits:
- **Thread-safe**
- **No synchronization needed**
- **Prevents reflection attack**
- **Prevents serialization duplication**

---

### 11. How does Enum handle reflection & serialization safety automatically?
- **Reflection:** Cannot create instance of an enum → JVM prevents it.
- **Serialization:** Enum serialization ensures **same instance** is returned (no new instance created).

Thus, Enum Singleton is **bulletproof**.

---
