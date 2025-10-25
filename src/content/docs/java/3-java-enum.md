---
title: "Java Enum "
---

### **1. How are values stored internally in an Enum? Explain the concept of _ordinal_.**

Internally, every Enum constant is assigned a **sequential index** starting from `0`.  
This index is known as the **ordinal** value.

Example:

```java
enum Day { MONDAY, TUESDAY, WEDNESDAY }

```


| Constant   | Ordinal |
|------------|---------|
| MONDAY     | 0       |
| TUESDAY    | 1       |
| WEDNESDAY  | 2       |

-   The ordinal is used **only internally** (e.g., in sorting).
    
-   We **should not depend on ordinal values** in business logic because they change if order changes.
    

----------

### **2. Difference between `name()`, `ordinal()`, and `valueOf()` in an Enum?**

| Method         | Returns                        | Notes                        |
|---------------|-------------------------------|------------------------------|
| `name()`      | Constant name as **String**    | Value is fixed & never overridden |
| `ordinal()`   | Index of the constant          | Should avoid using in logic  |
| `valueOf("STRING")` | Returns Enum constant matching the string | Throws exception if not valid |

**Example:**

```java
Day.MONDAY.name();       // "MONDAY"
Day.MONDAY.ordinal();    // 0
Day.valueOf("TUESDAY"); // returns Day.TUESDAY
```

----------

### **3. What does `Enum.values()` return?**

`Enum.values()` returns **an array containing all constants of the enum**, in the order they are declared.

Example:

```java
for (Day d : Day.values()) {
    System.out.println(d);
}
```

This is commonly used for:

-   Displaying dropdown lists
    
-   Iterating through enum constants
    

----------

##  Enum with Custom Fields & Constructor

### **4. Why can enums have constructors, and why must they be private?**

Each enum constant is essentially a **singleton object** of the enum type.  
So, if we want extra data inside each constant, we define fields and initialize them through a constructor.

Constructors in Enums are implicitly **private** because:

-   We **cannot create new enum instances** manually using `new`.
    
-   Only JVM is allowed to create enum instances.
    

----------

### **5. How does adding fields to Enum make each constant behave like an object?**

When we add fields to an Enum:

```java
enum Status {
    SUCCESS(200), ERROR(500);
    int code;
    Status(int code) { this.code = code; }
}

```

Now:

- `SUCCESS` holds code `200`
- `ERROR` holds code `500`

Each Enum constant now behaves like an **object with state**, not just a constant.

This is **powerful** in real-world use cases like:
  - Status codes
  - Error types
  - Business workflow states
    

----------

### **6. Can we create methods in Enum? If yes, when do we make them static?**

Yes, we can define methods inside Enum.

-   **If the method depends on constant-specific values**, keep it **non-static**.
    
-   **If the method is utility-related**, not dependent on instance values, make it **static**.
    

Example:

```java
enum Day {
    MONDAY, TUESDAY;
    public boolean isWeekend() { return false; }
}

```

Static:

```java
public static Day fromCode(int code) { ... }

```

----------

##  Enum Polymorphism

### **7. Explain method overriding inside a specific Enum constant.**

Enums support **constant-specific method implementations**:

```java
enum Day {
    MONDAY {
        @Override
        public String message() { return "Start of week"; }
    },
    SUNDAY {
        @Override
        public String message() { return "Holiday"; }
    };

    public abstract String message();
}

```

Here each Enum constant provides **its own implementation**, similar to polymorphism.

----------

### **8. How can an Enum implement an interface? Give practical usage example.**

Yes, enums can implement interfaces:

```java
interface Printable { void print(); }

enum Color implements Printable {
    RED, GREEN, BLUE;
    public void print() { System.out.println(this.name()); }
}
```

**Use Case Example:**
Payment modes implementing a `processPayment()` method:

```java
enum PaymentMode implements Payable {
    UPI { public void pay() { ... } },
    CARD { public void pay() { ... } }
}
```

This allows strategy-like behavior.

----------

##  Enum vs `public static final` Constants

### **9. Why is Enum better than `public static final` constants?**

| Aspect            | Enum (Recommended)                        | `static final` constants         |
|-------------------|-------------------------------------------|----------------------------------|
| **Type-safety**   | **Strongly typed** (compiler enforces correct usage) | Just primitive/String, can pass wrong data |
| **Readability**   | Self-explanatory grouping                 | Scattered constants              |
| **Control**       | Can add methods, fields, behaviors        | Cannot attach behavior           |
| **Extensibility** | Supports polymorphism                     | No polymorphism                  |
| **Iteration**     | Easy (`values()`)                         | Need manual handling             |
| **Singleton behavior** | Each constant is a singleton object    | No such guarantee                |
| **Comparison**    | Can use `==` safely                       | Risky when using integers/strings|

**In short:**

> Enum provides **type-safety, readable grouping, and controlled allowed values**, making them significantly more robust and maintainable.

----------
