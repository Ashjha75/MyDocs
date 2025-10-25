---
title: "Java Lambda Expressions"
---

# ✅ Lambda Expressions in Java 8

## 1. What is a Lambda Expression and why was it introduced in Java 8?
A **Lambda Expression** is a concise way to implement a **Functional Interface** (an interface with a single abstract method).

**Why introduced:**
- Reduces boilerplate code (especially Anonymous Inner Classes)
- Enables functional programming
- Supports the Streams API

---

## 2. How is Lambda Expression related to Functional Interface?
A Lambda Expression can be used **only where a Functional Interface is expected**:
> **Lambda = Implementation of the Functional Interface’s single abstract method**

```java
Runnable r = () -> System.out.println("Running");
```

---

# ✅ Syntax & Usage

## 3. Lambda for a Functional Interface with one parameter
```java
// Functional Interface
interface Greeting { void say(String name); }

// Lambda Implementation
Greeting g = name -> System.out.println("Hello " + name);
```

---

## 4. Lambda for a Functional Interface with no parameters
```java
interface Task { void run(); }

Task t = () -> System.out.println("Task Executed");
```

---

## 5. When can parentheses, braces, and return keyword be omitted in lambda?
| Element         | Can be omitted when                      | Example                |
|-----------------|------------------------------------------|------------------------|
| Parentheses     | Only one parameter, type is inferred     | `name -> ...`          |
| Braces `{}`     | Only one statement in lambda body        | `x -> x * x`           |
| `return`        | Only one expression is returned          | `x -> x * x`           |

---

# ✅ Variable & Scope

## 6. What is an effectively final variable in lambda?
A local variable **not modified after initialization** is considered **effectively final**. Lambdas can only use effectively final variables from the enclosing method.

---

## 7. Why can’t lambda modify local variables from outside scope?
Local variables in methods are stored on the **stack**, while lambdas may execute later in **heap**. To avoid unpredictable behavior, Java allows only reading, not modifying, of externally captured variables.

---

# ✅ Comparison & Reasoning

## 8. Difference between Lambda Expression and Anonymous Inner Class
| Feature         | Lambda Expression         | Anonymous Inner Class         |
|-----------------|--------------------------|------------------------------|
| Target          | Only Functional Interfaces| Any Interface/Abstract Class |
| Syntax          | Short & clean            | Verbose                      |
| Runtime Form    | Uses `invokedynamic`, lightweight | Creates extra class file, heavier |
| Readability     | High                     | Lower                        |

---

## 9. How does lambda improve code readability?
Lambdas remove boilerplate code such as:
```java
new Interface() { public void method() { ... }}
```
And replace it with:
```java
() -> ...
```
This makes code **shorter, cleaner, and intention-focused**.

---

## 10. Benefit of using lambda with Streams API
Lambdas allow Streams to express **what to do**, not **how to do it**, enabling functional, less error-prone processing.

```java
list.stream().filter(x -> x > 10).forEach(System.out::println);
```

- Cleaner code
- No manual loops
- Easy parallelization

---

# ✅ Bonus: Method References (`::`)

## 11. What are Method References and when do we use them?
Method Reference is a shorthand for calling an existing method instead of writing a lambda.

```java
list.forEach(System.out::println);   // instead of: x -> System.out.println(x)
```

**Use when:**
- The lambda only calls a method
- Makes code more readable

---

