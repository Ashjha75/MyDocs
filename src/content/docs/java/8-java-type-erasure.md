---
title: "Java Type Erasure"
---

# Top Interview Questions on Type Erasure

## 1. What is type erasure?
Type erasure is the process where **generic type information is removed during compilation**. Generics exist only at compile-time, not at runtime.

```java
List<String> list = new ArrayList<>();
```
At runtime, it becomes:
```java
List list; // no generic type information
```

---

## 2. Why does Java use type erasure instead of reified generics?
Java uses type erasure mainly for **backward compatibility** with older Java code (Java 1.4 and earlier), which did not have generics. This allows old libraries to work without rewriting code.

---

## 3. After type erasure, what happens to `T`, `K`, or `V`?
- If a type parameter has **no bounds** → replaced with **Object**
- If a type parameter is **bounded** → replaced with its **first bound**

```java
class Test<T extends Number> { }
```
After erasure:
```java
class Test { Number ... }
```

---

## 4. Why are `List<String>` and `List<Integer>` the same at runtime?
After type erasure:
```java
List<String>  → List
List<Integer> → List
```
Both become **just List**, so they have the **same runtime class**.

---

## 5. Why can’t we create generic arrays like `new T[]`?
Arrays enforce **runtime type checking**, but **generic types don’t exist at runtime** due to erasure. Java cannot know what type the array should enforce, so it's **not allowed**.

---

## 6. Why is `instanceof` not allowed with generic types?
This is invalid:
```java
if(obj instanceof List<String>)
```
Because at runtime `List<String>` becomes just `List`, so it **cannot be checked**.
Only allowed:
```java
if(obj instanceof List) // valid
```

---

## 7. Why can’t we do `T obj = new T()` in a generic class?
After type erasure, `T` is replaced with `Object` or a bound type—the **actual type is unknown at runtime**, so Java cannot determine which constructor to call.

---

## 8. Explain how type erasure impacts method overloading.
This is **not allowed**:
```java
void test(List<String> list) { }
void test(List<Integer> list) { }
```
Because both compile to:
```java
void test(List list)
```
→ **compile-time error** (duplicate methods)

---

## 9. What are bridge methods in Java? How are they related to type erasure?
Bridge methods are **synthetic methods** created by the compiler to **preserve polymorphism** when using generics.

Example:
```java
class Parent<T> { T get() { ... } }
class Child extends Parent<String> {
    String get() { ... }
}
```
The compiler generates a bridge method:
```java
Object get() { return get(); } // calls String get()
```
This ensures method overriding still works **after type erasure**.

---

## 10. How does the compiler ensure type safety before performing type erasure?
- During compilation, the compiler **checks all generic type rules**
- Ensures only correct types are used
- Once verified, the generic type info is **erased**

This prevents runtime `ClassCastException`.

---
