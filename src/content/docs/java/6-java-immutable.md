---
title: "Java Immutable & Wrapper Classes"
---

# ✅ Immutable Class

## 1. What makes a class immutable? List all conditions.
A class is considered **immutable** when its **state cannot change after creation**.

To achieve immutability, the class must follow these rules:
1. **Declare the class as `final`**  
   → Prevents subclassing (otherwise a child class could modify behavior).
2. **Make all fields private and final**  
   → Prevents external modification & ensures values never rebind.
3. **Do not provide setters**  
   → State cannot be reassigned after object creation.
4. **Initialize fields only in constructor**  
   → The object’s state is set once.
5. **Perform deep copy of mutable objects**  
   → Prevents clients from modifying internal state by reference.
6. **Return deep copies (not original references) in getters**  
   → Ensures internal fields remain protected.

---

## 2. Why must mutable fields be deeply copied in getters and constructors?
If you store or return mutable objects (e.g., `List`, `Date`, `Map`) **by reference**, callers can modify them, which **breaks immutability**.

```java
this.list = new ArrayList<>(inputList);   // Defensive copy in constructor
return new ArrayList<>(this.list);        // Defensive copy in getter
```

**Deep copying preserves the internal state**, ensuring the object _truly_ remains immutable.

---

## 3. Is `final` keyword enough to make a class immutable? Explain.
❌ **No.**  
`final` only prevents **reassignment of reference**, not modification of the object itself.

**Example:**
```java
final List<String> list = new ArrayList<>();
list.add("X");  // Allowed → internal state changes
```
So, **immutability requires both:**
- `final` reference fields **and**
- No modification to underlying objects (via deep copy).

---

## 4. Why is immutability useful in multi-threading and caching?

| Benefit         | Explanation                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| **Thread-safety** | Immutable objects cannot change, so no need for synchronization. Multiple threads can safely share the same instance. |
| **Safe caching**  | Cached objects cannot be tampered with → predictable reads.                |
| **Memory efficiency** | One shared instance instead of making multiple copies.                 |

This is why `String`, `Integer`, `LocalDate`, and `BigDecimal` are immutable.

---

## 5. Give an example where immutable objects improve system safety.
**Example:** Using `String` for database connection URLs, authentication tokens, etc.

If `String` were mutable:
- Someone could modify password tokens in memory
- `HashMap` keys would become inconsistent
- Logging systems could leak confidential updates

Immutability prevents these critical risks.

---

# ✅ Wrapper Class & Autoboxing

## 1. What are wrapper classes in Java and why do we need them?
Wrapper classes are **object representations of primitive types**, e.g.:

| Primitive | Wrapper  |
|-----------|----------|
| `int`     | Integer  |
| `double`  | Double   |
| `boolean` | Boolean  |

**We need wrappers because:**
- Collections (e.g., `List`, `Map`) **cannot store primitives**
- Frameworks (Spring, Hibernate, JSON) rely on objects, not primitives
- Wrappers provide useful utility methods and constants

---

## 2. Explain autoboxing and unboxing. What performance issues can arise?
- **Autoboxing**: Converting primitive → wrapper automatically  
  Example: `Integer x = 10;`
- **Unboxing**: Converting wrapper → primitive automatically  
  Example: `int y = x;`

**Performance concerns:**
- Autoboxing creates **new wrapper objects**, increasing heap usage.
- Excessive boxing/unboxing in loops can cause **GC overhead** and performance drops.

---

## 3. How does Integer caching work and what values are cached?
Java maintains a **cache for Integer values from `-128` to `+127`**.

```java
Integer a = 100;
Integer b = 100;
a == b  // true (same cached object)
```
Values **outside this range** are **new objects**:
```java
Integer x = 200;
Integer y = 200;
x == y  // false (different objects)
```
This improves memory usage and speeds up frequently-used small integers.

---

## 4. What is the result of comparing two Integers with `==` vs `equals()`? Explain memory impact.

| Comparison | Behavior                | Example                                      | Result                  |
|------------|-------------------------|----------------------------------------------|-------------------------|
| `==`       | Compares **object references** | `Integer a = 128; Integer b = 128; a == b` | `false` (different objects) |
| `.equals()`| Compares **values**     | `a.equals(b)`                                | `true`                  |

**Key point:**
- For values between **-128 to +127**, `==` _may_ be `true` because cached object is reused.
- For values **outside this range**, `==` is **false** because new objects are created.

---

