---
title: "Java Functional Interface"
---

### **1. What is a Functional Interface?**

A **Functional Interface** is an interface that has **exactly one abstract method**.  
Because of this, it represents **a single operation** and can be used with **Lambda Expressions**.

Example: `Runnable`, `Callable`, `Comparator`, `Predicate`, etc.

----------

### **2. What is SAM (Single Abstract Method) and why is it important?**

SAM means **Single Abstract Method**.  
It is important because **Lambda expressions can only be applied to Functional Interfaces**, and lambdas provide the implementation of that **one abstract method**.

In short:

> **Lambda = Implementation of Functional Interface’s SAM method**

----------

### **3. Is the `@FunctionalInterface` annotation mandatory? What advantage does it give?**

It is **not mandatory**.  
However, using it is **recommended** because:

-   It tells the compiler to **enforce exactly one abstract method**.
    
-   If someone accidentally adds a second abstract method, the compiler will throw an **error**.
    

So it **prevents accidental changes** and improves code clarity.

----------

## **Allowed Methods in Functional Interface**

### **4. Can a Functional Interface have default methods and static methods? Explain.**

Yes.  
A Functional Interface can have:

Type

Allowed?

Reason

**default methods**

✅ Yes

They have implementations, so they do not add abstract behavior.

**static methods**

✅ Yes

They belong to the interface itself, not the instance.

Only **abstract methods are counted** when determining Functional Interface validity.

----------

### **5. Why are methods from `java.lang.Object` (like `toString()`) not counted as abstract methods?**

Because **every class implicitly inherits these methods**.  
So they **do not affect** the count of abstract methods in the interface.

Therefore, having `toString()` or `hashCode()` declared does **not break the SAM rule**.

----------

## **Inheritance Case**

### **6. What happens if a Functional Interface extends another interface?

How do we ensure the SAM property is maintained?**

If a Functional Interface extends another interface, the **total number of abstract methods across both interfaces must still be exactly one**.

Example:

```java
interface A { void m(); }
interface B extends A { } // still one abstract method → valid Functional Interface

```

But if the child interface declares an additional abstract method, it **no longer remains Functional**.

----------

## **Built-in Functional Interfaces**

### **7. Explain `Predicate<T>` — real use case.**

`Predicate<T>` represents a **boolean test** on a value.

Signature:

```java
boolean test(T value)

```

**Use case:** Filtering collections.

```java
list.stream().filter(x -> x > 10)

```

----------

### **8. Explain `Function<T, R>` — real use case.**

`Function<T, R>` represents a **transformation** from input `T` to output `R`.

Signature:

```java
R apply(T value)

```

**Use case:** Converting objects.

```java
list.stream().map(String::length)

```

----------

### **9. Explain `Consumer<T>` — real use case.**

`Consumer<T>` performs **an action** but returns **no result**.

Signature:

```java
void accept(T value)

```

**Use case:** Printing values.

```java
list.forEach(System.out::println);

```

----------

### **10. Explain `Supplier<T>` — real use case.**

`Supplier<T>` **supplies values** without taking any input.

Signature:

```java
T get()

```

**Use case:** Lazy initialization / generating random values.

```java
Supplier<Double> sup = Math::random;

```

----------

## **Practical Use**

### **11. Where are Functional Interfaces used in Java Streams API?**

Streams heavily use Functional Interfaces:

Stream Operation

Functional Interface Used

`filter()`

`Predicate<T>`

`map()`

`Function<T, R>`

`forEach()`

`Consumer<T>`

`sorted()`

`Comparator<T>`

Functional Interfaces enable **declarative, functional-style coding**.

----------

### **12. Write a small example of a custom Functional Interface.**

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

This shows:

-   Custom Functional Interface
    
-   Lambda implementation
    
-   Execution of SAM method
    

----------

