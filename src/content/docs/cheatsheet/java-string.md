---
title: "Java String Methods Cheat Sheet"
---

Based on the search results and common DSA patterns, here's a complete reference of String methods frequently used in coding interviews and competitive programming.[geeksforgeeks+1](https://www.geeksforgeeks.org/dsa/string-data-structure/)​

## 1. Character Access & Information

Method

Return Type

Description

Example

`charAt(int index)`

char

Get character at index

`"Java".charAt(0)` → 'J'

`length()`

int

Get string length

`"Hello".length()` → 5

`toCharArray()`

char[]

Convert to char array

`"abc".toCharArray()` → ['a','b','c']

`codePointAt(int index)`

int

Get Unicode value

`"A".codePointAt(0)` → 65

`isEmpty()`

boolean

Check if empty

`"".isEmpty()` → true

`isBlank()`

boolean

Check if empty/whitespace (Java 11+)

`" ".isBlank()` → true

**DSA Usage:**

java

`// Character frequency counting  for  (char c : str.toCharArray())  {  freq[c -  'a']++;  }  
// Palindrome check  for  (int i =  0; i < str.length()  /  2; i++)  {   if  (str.charAt(i)  != str.charAt(str.length()  -  1  - i))  {   return  false;   }  }` 

## 2. Search & Index Methods

Method

Return Type

Description

Example

`indexOf(String str)`

int

First occurrence index

`"hello".indexOf("ll")` → 2

`indexOf(char ch)`

int

First char occurrence

`"hello".indexOf('e')` → 1

`indexOf(String str, int from)`

int

Index from position

`"hello".indexOf("l", 3)` → 3

`lastIndexOf(String str)`

int

Last occurrence index

`"hello".lastIndexOf("l")` → 3

`contains(CharSequence s)`

boolean

Check if contains substring

`"hello".contains("ell")` → true

`startsWith(String prefix)`

boolean

Check prefix

`"hello".startsWith("he")` → true

`endsWith(String suffix)`

boolean

Check suffix

`"hello".endsWith("lo")` → true

**DSA Usage:**

java

`// Pattern matching  if  (text.indexOf(pattern)  !=  -1)  {   // Pattern found  }  
// File extension validation  if  (fileName.endsWith(".java"))  {   // Process Java file  }` 

## 3. Comparison Methods

Method

Return Type

Description

Example

`equals(Object obj)`

boolean

Content equality

`"abc".equals("abc")` → true

`equalsIgnoreCase(String str)`

boolean

Case-insensitive equals

`"ABC".equalsIgnoreCase("abc")` → true

`compareTo(String str)`

int

Lexicographic comparison

`"abc".compareTo("abd")` → -1

`compareToIgnoreCase(String str)`

int

Case-insensitive compare

`"ABC".compareToIgnoreCase("abc")` → 0

`contentEquals(CharSequence cs)`

boolean

Compare with CharSequence

`"test".contentEquals("test")` → true

**DSA Usage:**

java

`// Sorting strings  Arrays.sort(strings,  (a, b)  -> a.compareTo(b));  
// Case-insensitive comparison  if  ("Admin".equalsIgnoreCase(userRole))  {   // Grant access  }` 

## 4. Substring & Extraction Methods

Method

Return Type

Description

Example

`substring(int begin)`

String

Substring from begin to end

`"Hello".substring(2)` → "llo"

`substring(int begin, int end)`

String

Substring

**DSA Usage:**

java

`// Generate all substrings  for  (int i =  0; i < str.length(); i++)  {   for  (int j = i +  1; j <= str.length(); j++)  {   String sub = str.substring(i, j);   // Process substring   }  }  
// Sliding window  String window = str.substring(left, right +  1);` 

## 5. Modification Methods (Return New String)

Method

Return Type

Description

Example

`toLowerCase()`

String

Convert to lowercase

`"HELLO".toLowerCase()` → "hello"

`toUpperCase()`

String

Convert to uppercase

`"hello".toUpperCase()` → "HELLO"

`trim()`

String

Remove leading/trailing spaces

`" hi ".trim()` → "hi"

`strip()`

String

Remove Unicode whitespace (Java 11+)

`" hi ".strip()` → "hi"

`stripLeading()`

String

Remove leading whitespace

`" hi".stripLeading()` → "hi"

`stripTrailing()`

String

Remove trailing whitespace

`"hi ".stripTrailing()` → "hi"

`replace(char old, char new)`

String

Replace all chars

`"hello".replace('l', 'L')` → "heLLo"

`replace(CharSequence target, CharSequence replacement)`

String

Replace all occurrences

`"hello".replace("ll", "LL")` → "heLLo"

`replaceAll(String regex, String replacement)`

String

Replace using regex

`"a1b2".replaceAll("\\d", "X")` → "aXbX"

`replaceFirst(String regex, String replacement)`

String

Replace first match

`"a1b2".replaceFirst("\\d", "X")` → "aXb2"

`concat(String str)`

String

Concatenate strings

`"Hello".concat(" World")` → "Hello World"

**DSA Usage:**

java

`// Remove non-alphanumeric  String cleaned = str.replaceAll("[^a-zA-Z0-9]",  "");  
// Case-insensitive operations  String lower = str.toLowerCase();  
// Remove all spaces  String noSpaces = str.replaceAll("\\s+",  "");` 

## 6. Split & Join Methods

Method

Return Type

Description

Example

`split(String regex)`

String[]

Split by delimiter

`"a,b,c".split(",")` → ["a","b","c"]

`split(String regex, int limit)`

String[]

Split with limit

`"a,b,c".split(",", 2)` → ["a","b,c"]

`String.join(CharSequence delimiter, CharSequence... elements)`

String

Join with delimiter

`String.join(",", "a", "b")` → "a,b"

**DSA Usage:**

java

`// Reverse words  String[] words = str.split("\\s+");  Collections.reverse(Arrays.asList(words));  String reversed =  String.join(" ", words);  
// CSV parsing  String[] fields = line.split(",");` 

## 7. Pattern Matching Methods

Method

Return Type

Description

Example

`matches(String regex)`

boolean

Match entire string

`"123".matches("\\d+")` → true

`regionMatches(int toffset, String other, int ooffset, int len)`

boolean

Compare regions

Check if regions match

**DSA Usage:**

java

`// Validation  if  (email.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$"))  {   // Valid email  }  
// Pattern checking  if  (str.matches("[a-zA-Z]+"))  {   // Only letters  }` 

## 8. Conversion Methods

Method

Return Type

Description

Example

`String.valueOf(int i)`

String

Convert to String

`String.valueOf(123)` → "123"

`String.valueOf(char[] data)`

String

Array to String

`String.valueOf(new char[]{'a','b'})` → "ab"

`String.valueOf(Object obj)`

String

Object to String

Handles null safely

`Integer.parseInt(String s)`

int

String to int

`Integer.parseInt("123")` → 123

`toString()`

String

Return string itself

`"hello".toString()` → "hello"

`getBytes()`

byte[]

Convert to bytes

Get byte array

**DSA Usage:**

java

`// Number to string  String numStr =  String.valueOf(number);  
// String to number (atoi)  int num =  Integer.parseInt(str);  
// Character array to string  String s =  String.valueOf(charArray);` 

## 9. Format & Builder Methods

Method

Return Type

Description

Example

`String.format(String format, Object... args)`

String

Formatted string

`String.format("Age: %d", 25)` → "Age: 25"

`formatted(Object... args)`

String

Format (Java 15+)

`"Name: %s".formatted("John")`

`repeat(int count)`

String

Repeat string (Java 11+)

`"ab".repeat(3)` → "ababab"

**DSA Usage:**

java

`// Formatted output  String result =  String.format("Result: %d/%d = %.2f", a, b,  (double)a/b);  
// String repetition  String pattern =  "01".repeat(5);  // "0101010101"` 

## 10. Advanced Methods

Method

Return Type

Description

Example

`intern()`

String

Canonical string

Get from String Pool

`hashCode()`

int

Hash code

For hashing

`lines()`

Stream<String>

Stream of lines (Java 11+)

Process lines

`chars()`

IntStream

Character stream

`str.chars().forEach(...)`

`codePoints()`

IntStream

Code point stream

Unicode processing

**DSA Usage:**

java

`// String interning for comparison optimization  String s1 =  new  String("test").intern();  String s2 =  "test";  // s1 == s2 → true  
// Stream processing  long count = str.chars()   .filter(c -> c ==  'a')   .count();` 

## Quick Reference: Most Used in DSA

**Top 15 for Interviews:**

1.  `length()` - Almost every problem
    
2.  `charAt(i)` - Array-like access
    
3.  `substring(i, j)` - Subproblems
    
4.  `toCharArray()` - Manipulation
    
5.  `indexOf()/lastIndexOf()` - Pattern search
    
6.  `equals()/equalsIgnoreCase()` - Comparison
    
7.  `compareTo()` - Sorting
    
8.  `toLowerCase()/toUpperCase()` - Normalization
    
9.  `trim()/strip()` - Cleanup
    
10.  `split()` - Tokenization
    
11.  `replace()/replaceAll()` - Modification
    
12.  `String.valueOf()` - Conversion
    
13.  `contains()` - Substring check
    
14.  `startsWith()/endsWith()` - Prefix/suffix
    
15.  `String.join()` - Concatenation
    

**Time Complexity Reference:**

-   charAt(), length(), isEmpty(): **O(1)**
    
-   indexOf(), contains(): **O(n)**
    
-   substring(): **O(n)** where n = substring length
    
-   replace(), replaceAll(): **O(n)**
    
-   split(): **O(n)**
    
-   toLowerCase(), toUpperCase(): **O(n)**
    
-   compareTo(), equals(): **O(n)**
    
