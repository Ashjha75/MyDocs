---
title: "Common String Interview Questions"
---
## Why is concatenation in a loop inefficient with String?

**String is immutable**, so each concatenation creates a **new String object**, copying all characters from previous strings. In a loop, this results in **O(n²) time complexity** and excessive object creation.[stackoverflow+1](https://stackoverflow.com/questions/7817951/string-concatenation-in-java-when-to-use-stringbuilder-and-concat)​

**Interview Example:**

java

`// INEFFICIENT: Creates n String objects  String result =  "";  for  (int i =  0; i <  1000; i++)  {  result +=  "Hello";  // Creates new String each iteration  }  // Iteration 1: Creates "Hello" (5 chars copied)  // Iteration 2: Creates "HelloHello" (10 chars copied)  // Iteration 3: Creates "HelloHelloHello" (15 chars copied)  // Total: 5 + 10 + 15 + ... = O(n²) character copies  
// EFFICIENT: Uses single mutable StringBuilder  StringBuilder sb =  new  StringBuilder();  for  (int i =  0; i <  1000; i++)  {  sb.append("Hello");  // Modifies same object  }  String result = sb.toString();  // Total: O(n) operations  
// Performance comparison  long start =  System.nanoTime();  String s =  "";  for  (int i =  0; i <  10000; i++)  {  s +=  "a";  }  long stringTime =  System.nanoTime()  - start;  System.out.println("String time: "  + stringTime +  " ns");  
start =  System.nanoTime();  StringBuilder builder =  new  StringBuilder();  for  (int i =  0; i <  10000; i++)  {  builder.append("a");  }  long sbTime =  System.nanoTime()  - start;  System.out.println("StringBuilder time: "  + sbTime +  " ns");  // StringBuilder is 100-1000x faster` 

**Why it's slow:**

-   Each `+=` creates new String object
    
-   Copies all previous characters plus new ones
    
-   Leaves old objects for garbage collection[javahandbook+1](https://www.javahandbook.com/java-strings/performance-comparison-of-stringbuilder-vs-string-concatenation/)​
    

## How does StringBuilder improve performance in loops?

**StringBuilder is mutable** and uses a **resizable char array** internally. It **appends without creating new objects**, achieving **O(1) amortized time** per append and **O(n) total complexity**.[pellegrino+1](https://pellegrino.link/2015/08/22/string-concatenation-with-java-8.html)​

**Interview Example:**

java

`// StringBuilder internal mechanism  public  class  StringBuilderDemo  {   public  static  void  main(String[] args)  {   StringBuilder sb =  new  StringBuilder();  // Initial capacity: 16         
  for  (int i =  0; i <  100; i++)  {  sb.append("X");  // O(1) amortized   }   // When capacity exceeded: array doubles (16 → 34 → 70 → 142)   // Resize happens occasionally, not every time         
  System.out.println(sb.toString());   }  }  
// Performance improvement visualization  public  static  void  demonstratePerformance()  {   int iterations =  50000;     
  // String: O(n²) complexity   long start =  System.currentTimeMillis();   String s =  "";   for  (int i =  0; i < iterations; i++)  {  s +=  "test";   }   long stringTime =  System.currentTimeMillis()  - start;     
  // StringBuilder: O(n) complexity  start =  System.currentTimeMillis();   StringBuilder sb =  new  StringBuilder();   for  (int i =  0; i < iterations; i++)  {  sb.append("test");   }   String result = sb.toString();   long sbTime =  System.currentTimeMillis()  - start;     
  System.out.println("String: "  + stringTime +  " ms");   System.out.println("StringBuilder: "  + sbTime +  " ms");   System.out.println("Speedup: "  +  (stringTime / sbTime)  +  "x");   // Output: StringBuilder is 500-1000x faster  }  
// Pre-sizing for optimal performance  StringBuilder optimized =  new  StringBuilder(5000);  // Pre-allocate  for  (int i =  0; i <  1000; i++)  {  optimized.append("test");  }  // No array resizing needed, even faster` 

**Key advantages:**

-   Single mutable object modified in-place
    
-   Amortized O(1) append operation
    
-   Reduces garbage collection pressure[javahandbook+1](https://www.javahandbook.com/java-strings/performance-comparison-of-stringbuilder-vs-string-concatenation/)​
    

## What is the time complexity of common string operations like substring() or concat()?

Different operations have **different complexities** based on implementation. Modern Java optimizes some operations internally.

**Interview Example:**

java

`String str =  "Hello World";  // Length n  
// 1. length() - O(1)  int len = str.length();  // Returns cached field value  
// 2. charAt(index) - O(1)  char ch = str.charAt(5);  // Direct array access  
// 3. substring(start, end) - O(n) where n = substring length  String sub = str.substring(0,  5);  // Creates new String, copies chars  // In Java 7+: Creates new char array  // In Java 6: Shared array with offset (memory leak risk)  
// 4. concat(String) - O(n + m)  String result = str.concat(" Java");  // n + m chars copied  // Internally: creates new char array of size (n + m)  
// 5. replace(old, new) - O(n)  String replaced = str.replace('o',  'O');  // Scans entire string  
// 6. indexOf(String) - O(n * m) worst case  int index = str.indexOf("World");  // n = text, m = pattern  // Average case: O(n)  
// 7. equals(String) - O(n)  boolean equal = str.equals("Hello World");  // Compares each char  
// 8. toLowerCase() / toUpperCase() - O(n)  String lower = str.toLowerCase();  // Creates new String, converts each char  
// 9. split(regex) - O(n)  String[] parts = str.split(" ");  // Scans string once  
// 10. trim() / strip() - O(n)  String trimmed =  "  Hello  ".trim();  // Scans from both ends  
// Summary table:  // Operation        | Time Complexity | Space Complexity  // -----------------|-----------------|------------------  // length()         | O(1)            | O(1)  // charAt(i)        | O(1)            | O(1)  // substring(i,j)   | O(j-i)          | O(j-i)  // concat(s)        | O(n+m)          | O(n+m)  // indexOf(s)       | O(n*m)          | O(1)  // replace()        | O(n)            | O(n)  // equals()         | O(n)            | O(1)  // toLowerCase()    | O(n)            | O(n)` 

**Important:** substring() in **Java 7+** creates a new char array (safe), while **Java 6** shared the array (faster but memory leak risk).

## Why is + operator allowed with strings in Java? How does it work internally?

The **+ operator** is **syntactic sugar** for String concatenation, provided by Java language design. Compiler converts it to **StringBuilder** calls (Java 8) or **invokedynamic** (Java 9+).[javapapers+2](https://javapapers.com/java/java-string-vs-stringbuilder-vs-stringbuffer-concatenation-performance-micro-benchmark/)​

**Interview Example:**

java

`// Source code:  String result =  "Hello"  +  " "  +  "World"  +  2025;  
// Java 8 bytecode (approx):  String result =  new  StringBuilder()   .append("Hello")   .append(" ")   .append("World")   .append(2025)   .toString();  
// Java 9+ bytecode (invokedynamic):  // Uses invokedynamic instruction for optimization  // Runtime decides best concatenation strategy  
// Compiler optimization for constants  String s1 =  "Hello"  +  "World";  // Compiled to: String s1 = "HelloWorld"; (compile-time constant)  
String s2 =  "Hello"  +  " "  +  "World";  // Compiled to: String s2 = "Hello World";  
// But with variables, no compile-time optimization  String a =  "Hello";  String b =  "World";  String s3 = a + b;  // Uses StringBuilder at runtime  
// Why + is allowed:  // 1. Convenience and readability  String greeting =  "Hello "  + name +  ", welcome!";  
// 2. Overloaded for String only (not user-definable)  // Java doesn't allow operator overloading except for String +  
// 3. Automatic type conversion  String mix =  "Count: "  +  42  +  ", Flag: "  +  true;  // Converts int and boolean to String automatically  
// Under the hood (conceptual):  public  static  String  plus(String a,  String b)  {   return  new  StringBuilder()   .append(a)   .append(b)   .toString();  }` 

**Key Points:**

-   Only built-in operator overloading in Java
    
-   Compiler magic, not available for custom classes
    
-   Optimized differently based on Java version[stackoverflow+1](https://stackoverflow.com/questions/40267601/how-much-does-java-optimize-string-concatenation-with)​
    

## How does the compiler optimize string concatenation?

The compiler performs **compile-time constant folding** for literals and uses **StringBuilder** or **invokedynamic** for runtime concatenation.[baeldung+3](https://www.baeldung.com/java-string-concatenation-invoke-dynamic)​

**Interview Example:**

java

`// 1. Compile-time constant folding  String s1 =  "Hello"  +  " "  +  "World";  // Compiler optimizes to:  String s1 =  "Hello World";  // Single literal in bytecode  
final  String prefix =  "Hello";  String s2 = prefix +  " World";  // Compiler can optimize because prefix is final constant  // Result: "Hello World" (compile-time)  
// 2. Runtime StringBuilder optimization  String name =  "Java";  String s3 =  "Hello "  + name +  " World";  // Java 8: Converted to StringBuilder  // String s3 = new StringBuilder("Hello ").append(name).append(" World").toString();  
// Java 9+: Uses invokedynamic  // More flexible, runtime chooses best strategy:  // - MH_INLINE_SIZED_EXACT (default): Pre-calculates exact size  // - BC_SB_SIZED: Uses StringBuilder with size estimation  // - Others based on -Djava.lang.invoke.stringConcat parameter  
// 3. Single statement optimization  String result = a + b + c + d;  // Optimized to single StringBuilder:  String result =  new  StringBuilder()   .append(a).append(b).append(c).append(d)   .toString();  
// 4. NO optimization across statements  String result =  "";  result = result +  "a";  // Creates new StringBuilder  result = result +  "b";  // Creates another StringBuilder  result = result +  "c";  // Creates yet another StringBuilder  // Each line creates new StringBuilder! (inefficient)  
// 5. Loop concatenation NOT optimized  for  (int i =  0; i <  100; i++)  {  result +=  "X";  // New StringBuilder each iteration (BAD)  }  // Must manually use StringBuilder for loops  
// Example: Compiler optimization levels  public  static  void  demonstrateOptimization()  {   // Optimized (compile-time):   String opt1 =  "A"  +  "B"  +  "C";     
  // Optimized (single expression):   String s =  "Hello";   String opt2 =  "Prefix "  + s +  " Suffix";     
  // NOT optimized (separate statements):   String notOpt =  "Start";  notOpt = notOpt +  " Middle";  // New object  notOpt = notOpt +  " End";  // New object     
  // NOT optimized (loop):   String loop =  "";   for  (int i =  0; i <  10; i++)  {  loop += i;  // Very inefficient   }  }` 

**Java 9+ invokedynamic optimization:**

-   Calculates exact required size upfront
    
-   Uses package-private String constructor (fastest)
    
-   Avoids intermediate String objects[guardsquare+2](https://www.guardsquare.com/blog/string-concatenation-java-9-untangling-invokedynamic)​
    

## What happens when you concatenate null with a string?

**null is converted to the string "null"** (not NullPointerException). This is handled by String.valueOf() internally.

**Interview Example:**

java

`// null concatenation behavior  String s1 =  null;  String result1 =  "Hello "  + s1;  System.out.println(result1);  // "Hello null"  
// Equivalent to:  String result1 =  "Hello "  +  String.valueOf(s1);  // String.valueOf(null) returns "null"  
// More examples  String s2 =  null;  String result2 = s2 +  " World";  System.out.println(result2);  // "null World"  
Object obj =  null;  String result3 =  "Object: "  + obj;  System.out.println(result3);  // "Object: null"  
// Both null  String a =  null;  String b =  null;  String result4 = a + b;  System.out.println(result4);  // "nullnull"  
// With StringBuilder  StringBuilder sb =  new  StringBuilder();  sb.append(null);  System.out.println(sb.toString());  // "null"  
// String.valueOf() implementation (conceptual):  public  static  String  valueOf(Object obj)  {   return  (obj ==  null)  ?  "null"  : obj.toString();  }  
// Practical example - avoiding "null" in output  String name =  null;  String message =  "Hello "  +  (name !=  null  ? name :  "Guest");  System.out.println(message);  // "Hello Guest"  
// Or use Objects.toString() (Java 7+)  String safe =  "User: "  +  Objects.toString(name,  "Anonymous");  System.out.println(safe);  // "User: Anonymous"  
// CAUTION: Direct method calls on null throw exception  String s =  null;  // int len = s.length(); // NullPointerException  // But concatenation works:  String concat =  "Value: "  + s;  // "Value: null" (OK)` 

**Key Point:** Concatenation converts null to "null" string, but method calls on null throw NullPointerException.

## How to safely compare strings to avoid NullPointerException?

Use **constant-first comparison**, **Objects.equals()**, or **null checks** before comparison.

**Interview Example:**

java

`// 1. Constant-first comparison (Yoda conditions)  String userInput =  getUserInput();  // May return null  
// SAFE: Constant on left  if  ("admin".equals(userInput))  {   System.out.println("Admin user");  }  
// UNSAFE: May throw NullPointerException  // if (userInput.equals("admin")) { // NPE if userInput is null  // }  
// 2. Using Objects.equals() (Java 7+)  String s1 =  null;  String s2 =  "test";  
System.out.println(Objects.equals(s1, s2));  // false (null-safe)  System.out.println(Objects.equals(s1,  null));  // true  System.out.println(Objects.equals(s2, s2));  // true  
// 3. Explicit null check  String username =  getUsername();  if  (username !=  null  && username.equals("admin"))  {   System.out.println("Admin access");  }  
// 4. Using Optional (Java 8+)  Optional<String> optName =  Optional.ofNullable(getName());  optName.filter(name -> name.equals("admin"))   .ifPresent(name ->  System.out.println("Admin"));  
// 5. Case-insensitive safe comparison  String input =  getUserInput();  if  ("ADMIN".equalsIgnoreCase(input))  {  // Safe even if input is null   System.out.println("Admin");  }  
// 6. Multiple null-safe comparisons  String a =  null;  String b =  "test";  String c =  null;  
// Traditional  if  ((a ==  null  && b ==  null)  ||  (a !=  null  && a.equals(b)))  {   // ...  }  
// Using Objects.equals()  if  (Objects.equals(a, b))  {  // Much cleaner   // ...  }  
// 7. String comparison best practices  public  static  boolean  safeEquals(String s1,  String s2)  {   if  (s1 == s2)  return  true;  // Same reference or both null   if  (s1 ==  null  || s2 ==  null)  return  false;   return s1.equals(s2);  }  
// Test cases  System.out.println(safeEquals(null,  null));  // true  System.out.println(safeEquals("test",  null));  // false  System.out.println(safeEquals(null,  "test"));  // false  System.out.println(safeEquals("test",  "test"));  // true  
// 8. Using Apache Commons Lang (if available)  // StringUtils.equals(s1, s2); // Null-safe` 

**Best Practices:**

1.  **Constant first:** `"constant".equals(variable)`
    
2.  **Objects.equals():** For null-safe comparison
    
3.  **Null check first:** `if (s != null && s.equals(...))`
    

## What's the difference between String.format(), concatenation, and StringBuilder?

Each has **different use cases**: **String.format()** for templates, **concatenation** for simple cases, **StringBuilder** for loops and complex building.[baeldung](https://www.baeldung.com/java-string-concatenation-methods)​

**Interview Example:**

java

`String name =  "Java";  int version =  21;  double price =  99.99;  
// 1. String.format() - Template-based, readable  String formatted =  String.format(   "Language: %s, Version: %d, Price: $%.2f",  name, version, price );  System.out.println(formatted);  // Output: "Language: Java, Version: 21, Price: $99.99"  
// Pros: Readable, localization support, formatting control  // Cons: Slower, overhead of parsing format string  
// 2. + Concatenation - Simple and quick  String concat =  "Language: "  + name +  ", Version: "  +  version +  ", Price: $"  + price;  // Pros: Simple, compiler-optimized for single expressions  // Cons: Inefficient in loops, less control over formatting  
// 3. StringBuilder - Manual but efficient  StringBuilder sb =  new  StringBuilder();  sb.append("Language: ").append(name)   .append(", Version: ").append(version)   .append(", Price: $").append(price);  String built = sb.toString();  // Pros: Fast, efficient for loops, no intermediate objects  // Cons: More verbose, manual formatting  
// Performance comparison  public  static  void  comparePerformance()  {   int iterations =  10000;     
  // Test 1: String.format()   long start =  System.nanoTime();   for  (int i =  0; i < iterations; i++)  {   String s =  String.format("Number: %d", i);   }   long formatTime =  System.nanoTime()  - start;     
  // Test 2: Concatenation  start =  System.nanoTime();   for  (int i =  0; i < iterations; i++)  {   String s =  "Number: "  + i;   }   long concatTime =  System.nanoTime()  - start;     
  // Test 3: StringBuilder  start =  System.nanoTime();   StringBuilder sb =  new  StringBuilder();   for  (int i =  0; i < iterations; i++)  {  sb.setLength(0);  // Clear  sb.append("Number: ").append(i);   String s = sb.toString();   }   long sbTime =  System.nanoTime()  - start;     
  System.out.println("String.format(): "  + formatTime +  " ns");   System.out.println("Concatenation: "  + concatTime +  " ns");   System.out.println("StringBuilder: "  + sbTime +  " ns");   // Typical results: StringBuilder < Concat < String.format()  }  
// Use cases:  
// Use String.format() for:  String log =  String.format("[%s] %s: %s",  timestamp, level, message);  
String table =  String.format("%-10s | %5d | %8.2f",  name, count, amount);  
// Use + concatenation for:  String simple =  "Hello "  + name;  String error =  "Error: "  + errorCode +  " - "  + errorMsg;  
// Use StringBuilder for:  StringBuilder html =  new  StringBuilder();  html.append("<ul>");  for  (String item : items)  {  html.append("<li>").append(item).append("</li>");  }  html.append("</ul>");  
// Comparison table:  // Method           | Speed    | Readability | Use Case  // -----------------|----------|-------------|-------------------------  // String.format()  | Slowest  | Best        | Templates, formatting  // + Concatenation  | Medium   | Good        | Simple cases, few ops  // StringBuilder    | Fastest  | Fair        | Loops, complex building  
// Advanced: String.format() with arguments  String.format("Name: %s, Age: %d, Score: %.2f%%",   "Alice",  25,  95.5);  // Output: "Name: Alice, Age: 25, Score: 95.50%"  
// StringBuilder with capacity  StringBuilder optimized =  new  StringBuilder(1000);  // Pre-allocate to avoid resizing` 
