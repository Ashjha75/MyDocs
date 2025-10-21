---
title: "String Common Methods"
---

## What does length() method return?

The **length()** method returns the **total number of characters** in the string as an integer, including spaces, special characters, and digits. It counts from 1 (not 0-indexed like arrays).

**Interview Example:**

```java
String str = "Hello World";
System.out.println(str.length()); // Output: 11
String empty = "";
System.out.println(empty.length()); // Output: 0
String spaces = "   ";
System.out.println(spaces.length()); // Output: 3
```

## How do charAt(int index) and substring(int begin, int end) work?

**charAt(index)** returns a **single character** at the specified index (0-based). **substring(begin, end)** returns a **new String** from begin index (inclusive) to end index (exclusive).

**Interview Example:**

```java
String str = "Interview";
// charAt() - returns char
char ch = str.charAt(0); // 'I'
char last = str.charAt(str.length() - 1); // 'w'
// substring(begin, end) - returns String
String sub1 = str.substring(0, 5); // "Inter" (0 to 4)
String sub2 = str.substring(5); // "view" (5 to end)
String sub3 = str.substring(2, 7); // "tervi"
// charAt throws StringIndexOutOfBoundsException
// char invalid = str.charAt(20); // Exception
```

## What is the difference between substring() and subSequence()?

Both extract a portion of the string, but **substring()** returns a **String** object, while **subSequence()** returns a **CharSequence** interface. substring() is more commonly used.

**Interview Example:**

```java
String str = "Java Programming";
// substring() returns String
String sub = str.substring(5, 16);
System.out.println(sub); // "Programming"
// subSequence() returns CharSequence
CharSequence seq = str.subSequence(5, 16);
System.out.println(seq); // "Programming"
// substring() can use String methods directly
System.out.println(sub.toUpperCase()); // Works
// subSequence() needs casting for String methods
// System.out.println(seq.toUpperCase()); // Compile error
System.out.println(((String)seq).toUpperCase()); // Needs cast
```

## How to check if a string contains another string?

Use **contains()** method which returns **boolean** (true/false). It checks for exact substring match and is case-sensitive.

**Interview Example:**

java

`String str =  "Java is awesome";  
System.out.println(str.contains("Java"));  // true  System.out.println(str.contains("awesome"));  // true  System.out.println(str.contains("python"));  // false  System.out.println(str.contains("java"));  // false (case-sensitive)  
// Case-insensitive check  System.out.println(str.toLowerCase().contains("java"));  // true  
// Alternative using indexOf  if  (str.indexOf("Java")  !=  -1)  {   System.out.println("Found");  // Found  }` 

## How to find the index of a substring using indexOf() and lastIndexOf()?

**indexOf()** returns the **first occurrence** index of substring/character. **lastIndexOf()** returns the **last occurrence** index. Both return **-1** if not found.

**Interview Example:**

java

`String str =  "Java Programming in Java";  
// indexOf() - first occurrence  System.out.println(str.indexOf("Java"));  // 0  System.out.println(str.indexOf("a"));  // 1  System.out.println(str.indexOf("Python"));  // -1  
// lastIndexOf() - last occurrence  System.out.println(str.lastIndexOf("Java"));  // 20  System.out.println(str.lastIndexOf("a"));  // 23  
// indexOf with start position  System.out.println(str.indexOf("Java",  5));  // 20 (search from index 5)  
// Check if substring exists  if  (str.indexOf("Java")  !=  -1)  {   System.out.println("Java found");  }` 

## How to convert a string to uppercase/lowercase?

Use **toUpperCase()** to convert all characters to uppercase and **toLowerCase()** to convert to lowercase. Both return a **new String** (original unchanged).

**Interview Example:**

java

`String str =  "Java Interview";  
String upper = str.toUpperCase();  System.out.println(upper);  // "JAVA INTERVIEW"  
String lower = str.toLowerCase();  System.out.println(lower);  // "java interview"  
System.out.println(str);  // "Java Interview" (original unchanged)  
// Case-insensitive comparison  String s1 =  "JAVA";  String s2 =  "java";  System.out.println(s1.toLowerCase().equals(s2.toLowerCase()));  // true  // Or use equalsIgnoreCase()  System.out.println(s1.equalsIgnoreCase(s2));  // true` 

## How to trim spaces from start and end of a string using trim() and strip()?

Both remove whitespace from start and end, but **strip()** (Java 11+) handles **Unicode whitespace** better. **trim()** only removes ASCII spaces (≤ U+0020).

**Interview Example:**

java

`String str =  "   Hello World   ";  
// trim() - removes ASCII whitespace  String trimmed = str.trim();  System.out.println(trimmed);  // "Hello World"  
// strip() - removes Unicode whitespace (Java 11+)  String stripped = str.strip();  System.out.println(stripped);  // "Hello World"  
// stripLeading() - removes from start only  System.out.println(str.stripLeading());  // "Hello World   "  
// stripTrailing() - removes from end only  System.out.println(str.stripTrailing());  // "   Hello World"` 

## What's the difference between trim() and strip()?

**trim()** removes ASCII whitespace (char ≤ 32 or U+0020), while **strip()** removes all Unicode whitespace characters. strip() is more comprehensive and introduced in Java 11.

**Interview Example:**

java

`String str1 =  "  Hello  ";  // Regular spaces  String str2 =  "\u2003Hello\u2003";  // Unicode em-space  
// trim() - handles only ASCII  System.out.println(str1.trim());  // "Hello" ✓  System.out.println(str2.trim());  // "\u2003Hello\u2003" ✗ (unchanged)  
// strip() - handles Unicode (Java 11+)  System.out.println(str1.strip());  // "Hello" ✓  System.out.println(str2.strip());  // "Hello" ✓  
// Use strip() for better Unicode support  // Use trim() for backward compatibility with Java < 11` 

## How to replace a character or substring (replace(), replaceAll(), replaceFirst())?

**replace()** replaces **all exact matches** (literal). **replaceAll()** uses **regex** to replace all matches. **replaceFirst()** uses **regex** to replace only the first match.

**Interview Example:**

java

`String str =  "Java is Java";  
// replace() - literal replacement, all occurrences  String r1 = str.replace("Java",  "Python");  System.out.println(r1);  // "Python is Python"  
String r2 = str.replace('a',  'A');  System.out.println(r2);  // "JAvA is JAvA"  
// replaceAll() - regex replacement, all occurrences  String s =  "Java123Programming456";  String r3 = s.replaceAll("\\d+",  "-");  System.out.println(r3);  // "Java-Programming-"  
// replaceFirst() - regex replacement, first occurrence only  String r4 = s.replaceFirst("\\d+",  "-");  System.out.println(r4);  // "Java-Programming456"` 

## How to split a string into an array (split() method)?

**split(regex)** divides a string into an array based on a delimiter (regex pattern). Returns **String[]** array. Can specify limit for maximum splits.

**Interview Example:**

java

`String str =  "Java,Python,C++,JavaScript";  
// Basic split  String[] langs = str.split(",");  for  (String lang : langs)  {   System.out.println(lang);  // Java, Python, C++, JavaScript  }  
// Split with limit  String[] limited = str.split(",",  2);  System.out.println(limited[0]);  // "Java"  System.out.println(limited[1]);  // "Python,C++,JavaScript"  
// Split by whitespace  String text =  "Hello World from Java";  String[] words = text.split("\\s+");  System.out.println(words.length);  // 4  
// Split by multiple delimiters  String data =  "a,b;c:d";  String[] parts = data.split("[,;:]");  // Output: ["a", "b", "c", "d"]` 

## How to join multiple strings (String.join(), StringJoiner())?

**String.join()** joins strings with a delimiter. **StringJoiner** provides more control with prefix/suffix options for building joined strings.

**Interview Example:**

java

`// String.join() - simple and direct  String[] words =  {"Java",  "Python",  "C++"};  String joined =  String.join(", ", words);  System.out.println(joined);  // "Java, Python, C++"  
// Join with varargs  String result =  String.join("-",  "2025",  "10",  "21");  System.out.println(result);  // "2025-10-21"  
// StringJoiner - with prefix and suffix  StringJoiner joiner =  new  StringJoiner(", ",  "[",  "]");  joiner.add("Java").add("Python").add("C++");  System.out.println(joiner.toString());  // "[Java, Python, C++]"  
// Using Streams  List<String> list =  Arrays.asList("A",  "B",  "C");  String s = list.stream().collect(Collectors.joining(", "));  System.out.println(s);  // "A, B, C"` 

## How to convert primitive or object values to string (String.valueOf(), toString())?

**String.valueOf()** is a **static method** that converts any type to String (handles null safely). **toString()** is an **instance method** on objects (throws NullPointerException if null).

**Interview Example:**

java

`// String.valueOf() - static method, null-safe  int num =  100;  String s1 =  String.valueOf(num);  System.out.println(s1);  // "100"  
boolean flag =  true;  String s2 =  String.valueOf(flag);  System.out.println(s2);  // "true"  
Object obj =  null;  String s3 =  String.valueOf(obj);  System.out.println(s3);  // "null" (safe)  
// toString() - instance method  Integer i =  100;  String s4 = i.toString();  System.out.println(s4);  // "100"  
Integer nullInt =  null;  // String s5 = nullInt.toString(); // NullPointerException  
// Concatenation (implicit valueOf)  String s6 =  ""  +  100;  System.out.println(s6);  // "100"` 

## How to remove all spaces from a string?

Use **replace()**, **replaceAll()**, or modern **replaceAll()** with regex to remove all spaces (or specific whitespace characters).

**Interview Example:**

java

`String str =  "Java Programming Interview";  
// Method 1: replace() - removes only regular spaces  String noSpaces1 = str.replace(" ",  "");  System.out.println(noSpaces1);  // "JavaProgrammingInterview"  
// Method 2: replaceAll() - removes all whitespace (space, tab, newline)  String text =  "Java \t Programming \n Interview";  String noSpaces2 = text.replaceAll("\\s+",  "");  System.out.println(noSpaces2);  // "JavaProgrammingInterview"  
// Method 3: replaceAll() - removes only spaces  String noSpaces3 = str.replaceAll(" ",  "");  System.out.println(noSpaces3);  // "JavaProgrammingInterview"  
// To replace multiple spaces with single space  String multiSpace =  "Java    Programming";  String single = multiSpace.replaceAll("\\s+",  " ");  System.out.println(single);  // "Java Programming"` 

## How to check if a string starts or ends with a given substring?

Use **startsWith()** to check if string begins with a prefix and **endsWith()** to check if it ends with a suffix. Both return **boolean** and are case-sensitive.

**Interview Example:**

java

`String fileName =  "document.pdf";  
// startsWith()  System.out.println(fileName.startsWith("doc"));  // true  System.out.println(fileName.startsWith("Doc"));  // false (case-sensitive)  System.out.println(fileName.startsWith("pdf"));  // false  
// endsWith()  System.out.println(fileName.endsWith(".pdf"));  // true  System.out.println(fileName.endsWith(".PDF"));  // false  System.out.println(fileName.endsWith("ent.pdf"));  // true  
// startsWith() with offset  String url =  "https://example.com";  System.out.println(url.startsWith("://",  5));  // true (starts at index 5)  
// Practical use case - file validation  if  (fileName.endsWith(".pdf")  || fileName.endsWith(".doc"))  {   System.out.println("Valid document");  }` 

## How to convert a string into a char[] and back?

Use **toCharArray()** to convert String to char array and **String constructor** or **String.valueOf()** to convert char array back to String.

**Interview Example:**

java

`String str =  "Java";  
// String to char[]  char[] charArray = str.toCharArray();  for  (char c : charArray)  {   System.out.print(c +  " ");  // J a v a  }  
// Modify char array  charArray[0]  =  'j';  System.out.println(charArray);  // java  
// char[] to String - Method 1: Constructor  String newStr1 =  new  String(charArray);  System.out.println(newStr1);  // "java"  
// char[] to String - Method 2: valueOf()  String newStr2 =  String.valueOf(charArray);  System.out.println(newStr2);  // "java"  
// Partial char[] to String  char[] arr =  {'H',  'e',  'l',  'l',  'o'};  String partial =  new  String(arr,  0,  3);  // offset=0, count=3  System.out.println(partial);  // "Hel"  
// Reverse a string example  String reverse =  new  String(new  StringBuilder(str).reverse().toString().toCharArray());` 

