---
title: "Java Final Class"
---

#  **Final Class**

## 1. What is a final class? Why would you declare a class final?

A **final class** is a class that **cannot be inherited**. That means **no other class can extend it**.

We declare a class final when:

- We **want to prevent modification or extension** of its behavior.
- The class represents **a complete utility** that doesn’t need polymorphism.
- The class must be **secure and predictable**, such as **core APIs**.

**Examples:**

- `String`
- `Integer`, `Long` (Wrapper Classes)
- `LocalDate`, `BigDecimal`

**Why:**

- Prevent misuse by subclassing.
- Avoid accidental method overriding.
- Preserve **design integrity** of critical components.

---

## 2. Can a final class have mutable fields? What are the implications?

Yes, a final class **can have mutable fields**.

**Example:**

```java
final class Employee {
    private List<String> tasks; // Mutable field
}
```

However, this creates a problem:

| Problem                | Explanation                                                      |
|------------------------|------------------------------------------------------------------|
| **Immutability is broken** | Even though class cannot be extended, its **internal data can still change** |
| **Thread-safety issues**   | Multiple threads may mutate the same object                    |
| **Unexpected behavior**    | External code can modify internal state if getters return direct references |

To avoid this, we usually:

- Use **defensive copying**
- Make fields **final**
- Use **immutable collections**

**So, final class ≠ immutable object.** Immutability requires **final fields + defensive copying + no setters**.

---

## 3. Why is `String` declared final in Java?

`String` is final mainly for **security, performance, and correctness**:

| Reason              | Explanation                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| **Security**        | Strings are used in passwords, URLs, DB credentials. If String could be subclassed and behavior overridden, it could leak or alter data. |
| **String Pooling**  | JVM maintains a **string pool** to reuse String objects. If Strings were mutable, sharing would break. |
| **HashMap Key Stability** | Strings are commonly used as **Map keys**. If a String were modifiable, hashing and bucket lookup would corrupt. |
| **Predictable Behavior**  | Prevent overriding `hashCode()` and `equals()` inconsistently.           |

**In short:**

> Declaring String as final ensures **immutability**, which provides **security and efficient memory usage**.

---

## 4. If a class is final, can we still modify its internal state? How?

Yes — **we can still modify internal state if the fields themselves are mutable.**

**Example:**

```java
final class Person {
    private List<String> hobbies = new ArrayList<>();
    public void addHobby(String hobby) { hobbies.add(hobby); }
}
```

Even though the class is **final**:

- We can still **mutate the list**.
- So internal state is **not protected** unless:
    - Fields are `final`
    - Collections are made **unmodifiable**
    - No setters or exposure of internal references

**Key Interview Line:**

> Declaring a class final only prevents inheritance. It does **not** guarantee immutability.  
> To make a class truly immutable, you must combine:
> - final class
> - final fields
> - no setters
> - defensive copying

---

