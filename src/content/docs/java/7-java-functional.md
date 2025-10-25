---
title: "Java Functional Interface"
---

#  Functional Interface in Java

## 1. What is a Functional Interface?
A **Functional Interface** is an interface with **exactly one abstract method**. It represents a single operation and can be used with **Lambda Expressions**.

**Examples:** `Runnable`, `Callable`, `Comparator`, `Predicate`, etc.

---

## 2. What is SAM (Single Abstract Method) and why is it important?
**SAM** stands for **Single Abstract Method**. Lambdas can only be applied to Functional Interfaces, providing the implementation for that one abstract method.

> **Lambda = Implementation of Functional Interface’s SAM method**

---

## 3. Is the `@FunctionalInterface` annotation mandatory? What advantage does it give?
- **Not mandatory**, but recommended.
- Tells the compiler to enforce exactly one abstract method.
- Prevents accidental changes (adding a second abstract method causes a compile error).
- Improves code clarity.

---

#  Allowed Methods in Functional Interface

## 4. Can a Functional Interface have default methods and static methods?
| Type            | Allowed? | Reason                                                      |
|-----------------|----------|-------------------------------------------------------------|
| default methods |  Yes    | They have implementations, so do not add abstract behavior.  |
| static methods  |  Yes    | Belong to the interface itself, not the instance.            |

Only **abstract methods** are counted for Functional Interface validity.

---

## 5. Why are methods from `java.lang.Object` (like `toString()`) not counted as abstract methods?
- Every class implicitly inherits these methods.
- They do **not affect** the count of abstract methods in the interface.
- Declaring `toString()` or `hashCode()` does **not break the SAM rule**.

---

#  Inheritance Case

## 6. What happens if a Functional Interface extends another interface? How do we ensure the SAM property is maintained?
- The **total number of abstract methods across both interfaces must be exactly one**.

```java
interface A { void m(); }
interface B extends A { } // still one abstract method → valid Functional Interface
```

- If the child interface declares an additional abstract method, it is **no longer functional**.

---

#  Built-in Functional Interfaces

## 7. `Predicate<T>` — real use case
- Represents a **boolean test** on a value.
- Signature: `boolean test(T value)`
- **Use case:** Filtering collections

```java
list.stream().filter(x -> x > 10)
```

---

## 8. `Function<T, R>` — real use case
- Represents a **transformation** from input `T` to output `R`.
- Signature: `R apply(T value)`
- **Use case:** Converting objects

```java
list.stream().map(String::length)
```

---

## 9. `Consumer<T>` — real use case
- Performs an action but returns **no result**.
- Signature: `void accept(T value)`
- **Use case:** Printing values

```java
list.forEach(System.out::println);
```

---

## 10. `Supplier<T>` — real use case
- Supplies values without taking any input.
- Signature: `T get()`
- **Use case:** Lazy initialization / generating random values

```java
Supplier<Double> sup = Math::random;
```

---

#  Practical Use

## 11. Where are Functional Interfaces used in Java Streams API?
| Stream Operation | Functional Interface Used |
|------------------|-------------------------|
| `filter()`       | `Predicate<T>`          |
| `map()`          | `Function<T, R>`        |
| `forEach()`      | `Consumer<T>`           |
| `sorted()`       | `Comparator<T>`         |

Functional Interfaces enable **declarative, functional-style coding**.

---

## 12. Example: Custom Functional Interface
```java
@FunctionalInterface
interface Greeting {
    void sayHello(String name);
}

public class Demo {
    public static void main(String[] args) {
        Greeting g = (name) -> System.out.println("Hello " + name);
        g.sayHello("Ashish");
    }
}
```

**Highlights:**
- Custom Functional Interface
- Lambda implementation
- Execution of SAM method

---

