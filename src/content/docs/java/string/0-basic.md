---
title: "String Basic"
---

## What is a String in Java? Is it a class or a data type?

**String is a class** in Java, not a primitive data type. It's defined in the `java.lang` package as `java.lang.String` and represents a sequence of characters. Despite being a class, it can be used like a primitive type due to special language support.

**Interview Example:**

```java
String str1 = "Hello"; // String literal (special support)
String str2 = new String("Hello"); // Using constructor
```

## Why are strings immutable in Java?

Strings are immutable for **security, thread safety, performance, and hashcode caching**. Once created, a String's value cannot be changed; any modification creates a new String object.

**Interview Example:**

```java
String str = "Java";
str.concat(" Programming"); // Creates new object, original unchanged
System.out.println(str); // Output: Java (not "Java Programming")
```

**Benefits:**

	- Thread-safe without synchronization
	- String Pool optimization (memory efficiency)
	- Secure for sensitive data (passwords, network connections)
	- Hashcode caching for HashMap/HashSet performance

## What is the difference between String, StringBuilder, and StringBuffer?

| Feature         | String      | StringBuilder | StringBuffer |
|----------------|------------|--------------|--------------|
| Mutability     | Immutable  | Mutable      | Mutable      |
| Thread Safety  | Yes        | No           | Yes (sync)   |
| Performance    | Slow       | Fast         | Slower       |
| Use Case       | Fixed      | Single-thread| Multi-thread |

**Interview Example:**

```java
// String - creates multiple objects
String s = "Hello";
s = s + " World"; // Creates new object
// StringBuilder - modifies same object (faster)
StringBuilder sb = new StringBuilder("Hello");
sb.append(" World"); // Modifies existing object
// StringBuffer - thread-safe version
StringBuffer sbf = new StringBuffer("Hello");
sbf.append(" World"); // Thread-safe operations
```
## Benefits of String Immutability in Java

1. **String Pool Optimization**  
   String pool is possible only because `String` is immutable in Java.  
   This allows Java Runtime to save a lot of heap space since different `String` variables can refer to the same value in the pool.  
   If `String` were mutable, interning would not be possible because changing one variable’s value would affect all references.

2. **Security**  
   Immutability helps prevent severe security threats.  
   For example, database usernames and passwords are passed as `String` objects.  
   If `String` were mutable, a hacker could alter these values and compromise the application.  
   Similarly, in socket programming, host and port details are passed as `String`, and immutability ensures they cannot be tampered with.

3. **Thread Safety**  
   Since `String` is immutable, it is inherently thread-safe.  
   A single `String` instance can be shared among multiple threads without synchronization, avoiding concurrency issues.

4. **Classloader Safety**  
   Java ClassLoader uses `String` for loading classes.  
   Immutability ensures that the correct class is loaded — for instance, `java.sql.Connection` cannot be maliciously altered to `myhacked.Connection`.

5. **Performance (Hashcode Caching)**  
   The hashcode of a `String` is cached at the time of creation and doesn’t need to be recalculated.  
   This improves performance when `String` objects are used as keys in `HashMap` or other hash-based collections, making `String` the most common choice for map keys.


## How are strings stored in memory (Heap vs String Pool)?

Strings are stored in two locations: **String Pool** (special memory region in Heap) and regular **Heap memory**. String literals go to the String Pool for reuse, while objects created with `new` go to the Heap.

**Interview Example:**

```java
String s1 = "Java"; // Stored in String Pool
String s2 = "Java"; // Reuses same object from Pool
String s3 = new String("Java"); // Creates new object in Heap
System.out.println(s1 == s2); // true (same Pool reference)
System.out.println(s1 == s3); // false (different locations)
```

## What is the String Constant Pool (SCP)?

The **String Constant Pool** (also called String Pool or String Intern Pool) is a special memory region in the Heap where Java stores unique String literals. It uses a memory optimization pattern to save memory by reusing identical string values.

**Interview Example:**

```java
String s1 = "interview"; // Creates in Pool
String s2 = "interview"; // Reuses from Pool
String s3 = "inter" + "view"; // Compile-time constant, goes to Pool
System.out.println(s1 == s2); // true
System.out.println(s1 == s3); // true
```

## What happens when you use the new keyword with a String?

Using `new` keyword creates **two objects** (if the string doesn't exist): one in the **String Pool** and one in the **Heap memory**. The reference points to the Heap object, not the Pool.

**Interview Example:**

```java
String s1 = new String("Hello"); // Creates 2 objects if "Hello" doesn't exist in Pool:
// 1. "Hello" literal in String Pool
// 2. New String object in Heap
String s2 = "Hello"; // References Pool object
System.out.println(s1 == s2); // false (different memory locations)
System.out.println(s1.equals(s2)); // true (same content)
```

## What is the difference between == and .equals() in Java strings?

**==** compares **reference (memory address)**, while **.equals()** compares **content (character sequence)**. For strings, always use `.equals()` for value comparison.

**Interview Example:**

```java
String s1 = "Java";
String s2 = "Java";
String s3 = new String("Java");
System.out.println(s1 == s2); // true (same Pool reference)
System.out.println(s1 == s3); // false (different references)
System.out.println(s1.equals(s3)); // true (same content)
```

## How do you compare two strings lexicographically?

Use **compareTo()** method, which returns: **0** (equal), **negative** (first < second), or **positive** (first > second). It compares based on Unicode values.

**Interview Example:**

```java
String s1 = "apple";
String s2 = "banana";
String s3 = "apple";
System.out.println(s1.compareTo(s2)); // Negative (a < b)
System.out.println(s2.compareTo(s1)); // Positive (b > a)
System.out.println(s1.compareTo(s3)); // 0 (equal)
// Case-insensitive comparison
System.out.println("Apple".compareToIgnoreCase("apple")); // 0
```

## What are interned strings? What does String.intern() do?

**Interned strings** are strings explicitly added to the String Pool. The **intern()** method checks if the string exists in the Pool; if yes, returns the Pool reference; if no, adds it to the Pool and returns the reference.

**Interview Example:**

```java
String s1 = new String("Hello"); // Heap object
String s2 = s1.intern(); // Returns Pool reference
String s3 = "Hello"; // Pool reference
System.out.println(s1 == s2); // false (s1 is Heap, s2 is Pool)
System.out.println(s2 == s3); // true (both reference Pool)
```

**Use Case:** When comparing many strings repeatedly, interning improves `==` comparison performance.

## What is the output of "abc" == new String("abc") and why?

**Output: false**

**Explanation:** The literal `"abc"` is stored in the **String Pool**, while `new String("abc")` creates a new object in the **Heap memory**. The `==` operator compares references, and these two strings have different memory addresses.

**Interview Example:**

```java
String s1 = "abc"; // String Pool
String s2 = new String("abc"); // Heap
System.out.println(s1 == s2); // false (different references)
System.out.println(s1.equals(s2)); // true (same content)
// To make them equal with ==
String s3 = s2.intern(); // Returns Pool reference
System.out.println(s1 == s3); // true (both reference Pool)
```
