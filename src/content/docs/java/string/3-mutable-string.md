---
title: "String Mutable"
---

## What's the difference between StringBuilder and StringBuffer?

Both **StringBuilder** and **StringBuffer** are mutable classes for string manipulation, but **StringBuilder is not synchronized** (faster, single-threaded) while **StringBuffer is synchronized** (thread-safe, multi-threaded).[geeksforgeeks+1](https://www.geeksforgeeks.org/java/stringbuffer-vs-stringbuilder/)​

**Interview Example:**

```java
// StringBuilder - Not thread-safe, faster
StringBuilder sb = new StringBuilder("Java");
sb.append(" Programming");
System.out.println(sb); // "Java Programming"
// StringBuffer - Thread-safe, synchronized
StringBuffer sbf = new StringBuffer("Java");
sbf.append(" Programming");
System.out.println(sbf); // "Java Programming"
// Performance comparison
long start = System.nanoTime();
StringBuilder builder = new StringBuilder();
for (int i = 0; i < 10000; i++) {
	builder.append("test");
}
long builderTime = System.nanoTime() - start;
start = System.nanoTime();
StringBuffer buffer = new StringBuffer();
for (int i = 0; i < 10000; i++) {
	buffer.append("test");
}
long bufferTime = System.nanoTime() - start;
// StringBuilder is typically 2-3x faster
```

**Key Differences:**

-   StringBuilder: Java 1.5+, not synchronized, single-threaded
    
-   StringBuffer: Java 1.0+, synchronized, multi-threaded[shiksha+1](https://www.shiksha.com/online-courses/articles/stringbuilder-vs-string-buffer/)​
    

## Why is StringBuilder faster than String for concatenation?

**StringBuilder is mutable** and modifies the same object in memory, while **String creates new objects** for each concatenation, causing excessive memory allocation and garbage collection overhead.[geeksforgeeks+1](https://www.geeksforgeeks.org/java/string-vs-stringbuilder-vs-stringbuffer-in-java/)​

**Interview Example:**

```java
// String concatenation - creates multiple objects (SLOW)
String str = "Hello";
for (int i = 0; i < 1000; i++) {
	str = str + "World"; // Creates 1000 new String objects
}
// StringBuilder - modifies same object (FAST)
StringBuilder sb = new StringBuilder("Hello");
for (int i = 0; i < 1000; i++) {
	sb.append("World"); // Modifies same object
}
// Performance difference example
long start = System.nanoTime();
String s = "";
for (int i = 0; i < 10000; i++) {
	s += "a"; // O(n²) complexity
}
long stringTime = System.nanoTime() - start;
start = System.nanoTime();
StringBuilder sb2 = new StringBuilder();
for (int i = 0; i < 10000; i++) {
	sb2.append("a"); // O(n) complexity
}
long sbTime = System.nanoTime() - start;
// StringBuilder is 100-1000x faster for large loops
```

## What is the thread-safety difference between StringBuilder and StringBuffer?

**StringBuffer is thread-safe** with synchronized methods, allowing safe concurrent access by multiple threads. **StringBuilder is not thread-safe**, making it unsuitable for multi-threaded environments but faster for single-threaded use.[tutorialspoint+1](https://www.tutorialspoint.com/difference-between-string-buffer-and-string-builder-in-java)​

**Interview Example:**

```java
StringBuffer sbf = new StringBuffer("Shared");
	for (int i = 0; i < 100; i++) {
		sbf.append("A");
	}
});
Thread t2 = new Thread(() -> {
	for (int i = 0; i < 100; i++) {
		sbf.append("B");
	}
});
t1.start();
t2.start();
// Safe: Final length will be exactly "Shared" + 200 characters
// StringBuilder - Not thread-safe (race conditions)
StringBuilder sb = new StringBuilder("Shared");
Thread t3 = new Thread(() -> {
	for (int i = 0; i < 100; i++) {
		sb.append("A");
	}
});
Thread t4 = new Thread(() -> {
	for (int i = 0; i < 100; i++) {
		sb.append("B");
	}
});
t3.start();
t4.start();
// Unsafe: May cause ArrayIndexOutOfBoundsException or data corruption
// Best practice: Use StringBuilder in single-threaded contexts
StringBuilder local = new StringBuilder();
local.append("Fast and safe in single thread");
```

## What are the main methods of StringBuilder (append(), insert(), delete(), reverse())?

**append()** adds to the end, **insert()** adds at specific index, **delete()** removes a range, and **reverse()** reverses the character sequence.[edureka](https://www.edureka.co/blog/string-vs-stringbuffer-vs-stringbuilder/)​

**Interview Example:**

java

`StringBuilder sb =  new  StringBuilder("Java");  
// append() - adds to the end  sb.append(" Programming");  System.out.println(sb);  // "Java Programming"  
sb.append(2025).append(" Edition");  System.out.println(sb);  // "Java Programming2025 Edition"  
// insert() - adds at specific index  sb.insert(4,  " 8");  System.out.println(sb);  // "Java 8 Programming2025 Edition"  
// delete(start, end) - removes characters (start inclusive, end exclusive)  sb.delete(4,  7);  System.out.println(sb);  // "JavaProgramming2025 Edition"  
// deleteCharAt(index) - removes single character  sb.deleteCharAt(0);  System.out.println(sb);  // "avaProgramming2025 Edition"  
// reverse() - reverses the sequence  StringBuilder sb2 =  new  StringBuilder("Interview");  sb2.reverse();  System.out.println(sb2);  // "weivretnI"  
// replace(start, end, str) - replaces substring  StringBuilder sb3 =  new  StringBuilder("Java is good");  sb3.replace(8,  12,  "awesome");  System.out.println(sb3);  // "Java is awesome"  
// setCharAt(index, char) - replaces single character  sb3.setCharAt(0,  'j');  System.out.println(sb3);  // "java is awesome"` 

## How does capacity and ensureCapacity() work in StringBuilder?

**Capacity** is the allocated memory size (default 16 characters), distinct from length (actual characters). **ensureCapacity()** increases capacity to avoid multiple reallocations, improving performance.[edureka](https://www.edureka.co/blog/string-vs-stringbuffer-vs-stringbuilder/)​

**Interview Example:**

java

`// Default capacity is 16  StringBuilder sb1 =  new  StringBuilder();  System.out.println(sb1.capacity());  // 16  System.out.println(sb1.length());  // 0  
// Constructor with initial capacity  StringBuilder sb2 =  new  StringBuilder(50);  System.out.println(sb2.capacity());  // 50  
// Constructor with string - capacity = string.length() + 16  StringBuilder sb3 =  new  StringBuilder("Hello");  System.out.println(sb3.capacity());  // 21 (5 + 16)  System.out.println(sb3.length());  // 5  
// Automatic capacity increase: (oldCapacity * 2) + 2  StringBuilder sb4 =  new  StringBuilder();  // capacity = 16  sb4.append("12345678901234567");  // 17 chars, exceeds capacity  System.out.println(sb4.capacity());  // 34 (16*2 + 2)  
// ensureCapacity() - manually set minimum capacity  StringBuilder sb5 =  new  StringBuilder();  System.out.println(sb5.capacity());  // 16  sb5.ensureCapacity(100);  System.out.println(sb5.capacity());  // 100 (or more)  
// Performance benefit - pre-allocating capacity  long start =  System.nanoTime();  StringBuilder sb6 =  new  StringBuilder();  // Multiple reallocations  for  (int i =  0; i <  10000; i++)  {  sb6.append("a");  }  long time1 =  System.nanoTime()  - start;  
start =  System.nanoTime();  StringBuilder sb7 =  new  StringBuilder(10000);  // Single allocation  for  (int i =  0; i <  10000; i++)  {  sb7.append("a");  }  long time2 =  System.nanoTime()  - start;  // Pre-allocated is 20-30% faster` 

## How to convert StringBuilder back to String?

Use **toString()** method to convert StringBuilder/StringBuffer to an immutable String object.[edureka](https://www.edureka.co/blog/string-vs-stringbuffer-vs-stringbuilder/)​

**Interview Example:**

java

`// toString() - primary method  StringBuilder sb =  new  StringBuilder("Java");  sb.append(" Interview");  String str = sb.toString();  System.out.println(str);  // "Java Interview"  System.out.println(str.getClass());  // class java.lang.String  
// Complete example with modification  StringBuilder builder =  new  StringBuilder();  builder.append("Hello")   .append(" ")   .append("World");  
String result = builder.toString();  System.out.println(result);  // "Hello World"  
// Original StringBuilder remains unchanged  builder.append("!");  System.out.println(builder);  // "Hello World!"  System.out.println(result);  // "Hello World" (immutable)  
// Practical use case - building SQL query  StringBuilder query =  new  StringBuilder();  query.append("SELECT * FROM users WHERE ");  query.append("age > 18 AND ");  query.append("status = 'active'");  
String sqlQuery = query.toString();  System.out.println(sqlQuery);  // Output: "SELECT * FROM users WHERE age > 18 AND status = 'active'"  
// Converting StringBuffer to String  StringBuffer sbf =  new  StringBuffer("Thread Safe");  String converted = sbf.toString();  System.out.println(converted);  // "Thread Safe"` 

