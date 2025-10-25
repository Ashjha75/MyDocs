---
title: "Java Generics"
---

# ✅ Java Generics

## 1. What are generics in Java and why were they introduced?
Generics allow us to write classes, interfaces, and methods that operate on **specific data types** while still being **reusable**. They were introduced to provide **type safety** and avoid runtime `ClassCastException`.

```java
List<String> names = new ArrayList<>();
```
Now only `String` values can be added.

---

## 2. How do generics provide type safety?
Generics ensure the **type of data is checked at compile time**. This prevents adding the wrong data type into a collection.

```java
List<Integer> list = new ArrayList<>();
list.add("Hello"); // Compile-time error → safe
```

---

## 3. What is the difference between generics in compile-time vs run-time?
- **Compile-time:** Generics **enforce type checking**.
- **Run-time:** Generic type information is **removed** (due to **type erasure**).

```java
List<Integer> a = new ArrayList<>();
List<String> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass()); // true
```

---

## 4. Difference between `List<Object>` and `List<?>`
| Feature                | `List<Object>`         | `List<?>`                |
|------------------------|------------------------|--------------------------|
| Accepts                | Any object             | Any generic list         |
| Add elements           | Yes                    | No (except `null`)       |
| Use case               | Insert values          | Read-only access         |

---

## 5. What are bounded type parameters? Example using `extends` and `super`
Bounded type parameters **restrict the type** that can be used.

```java
<T extends Number>  // Upper bound: T must be Number or its subclass
<? super Integer>   // Lower bound: Type must be Integer or its parent
```

---

## 6. Meaning of `<T extends Number>`
`T` can only be:
- `Number` or its subclasses (`Integer`, `Double`, `Float`, etc.)

```java
public class Test<T extends Number> { }
```

---

## 7. When should you use `? extends` and when `? super`?
| Use           | Meaning            | Purpose         |
|---------------|--------------------|-----------------|
| `? extends T` | Any subclass of T  | Read Only (Producer) |
| `? super T`   | Any superclass of T| Write Allowed (Consumer) |

**Easy rule:** **PECS → Producer Extends, Consumer Super**

---

## 8. What is a generic method? Example
A method that defines its own type parameter.

```java
public static <T> void print(T value) {
    System.out.println(value);
}
```

---

## 9. Can we use primitive types with generics? Why not?
No, because generics work only with **objects**, and primitives are **not objects**. We use **wrapper classes**:

| Primitive | Wrapper  |
|-----------|----------|
| int       | Integer  |
| double    | Double   |

```java
List<int>      // ❌
List<Integer>  // ✅
```

---

## 10. Can a generic class have multiple type parameters? Example `<K, V>`
Yes. Commonly used in `Map` implementations.

```java
class Pair<K, V> {
    K key;
    V value;
}

Pair<String, Integer> p = new Pair<>();
```

---


