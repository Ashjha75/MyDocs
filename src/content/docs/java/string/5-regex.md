---
title: "Regex Interview Questions"
---
## How to use matches() method with regex?


The **matches()** method checks if the **entire string** matches the given regular expression pattern. It returns **boolean** (true if the entire string matches, false otherwise).

**Interview Example:**

```java
String str1 = "12345";
String str2 = "abc123";
String str3 = "hello";
// Check if string contains only digits
System.out.println(str1.matches("\\d+")); // true
System.out.println(str2.matches("\\d+")); // false (contains letters)
// Check for alphabets only
System.out.println(str3.matches("[a-zA-Z]+")); // true
// Pattern matching with alternation
String animal = "cat";
System.out.println(animal.matches("cat|dog|fish")); // true
System.out.println("doggy".matches("cat|dog|fish")); // false (must match exactly)
// Alphanumeric validation
String username = "User123";
System.out.println(username.matches("[a-zA-Z0-9]+")); // true
// Length constraints (8-15 characters)
String password = "Pass1234";
System.out.println(password.matches(".{8,15}")); // true
// Important: matches() requires FULL string match
String partial = "abc123xyz";
System.out.println(partial.matches("\\d+")); // false (has letters too)
System.out.println(partial.matches(".*\\d+.*")); // true (contains digits)
```

**Key Point:** matches() checks the **entire string**, unlike Pattern.matcher().find() which finds partial matches.

## How to validate an email or phone number using regex?

Use **regex patterns** with matches() or Pattern/Matcher classes. Email validation checks for format like `user@domain.com`, phone validation checks number patterns.


**Interview Example:**

```java
// Email validation
public static boolean isValidEmail(String email) {
  String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@" + "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
  return email.matches(emailRegex);
}
// Simple email validation
public static boolean isValidEmailSimple(String email) {
  return email.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$");
}
// Phone number validation (US format)
public static boolean isValidUSPhone(String phone) {
  // Matches: (123) 456-7890 or 123-456-7890 or 1234567890
  String phoneRegex = "^(\\(\\d{3}\\)\\s?|\\d{3}[-]?)\\d{3}[-]?\\d{4}$";
  return phone.matches(phoneRegex);
}
// Indian phone number (10 digits, optional +91)
public static boolean isValidIndianPhone(String phone) {
  return phone.matches("^(\\+91)?[6-9]\\d{9}$");
}
// Test cases
System.out.println(isValidEmail("user@example.com")); // true
System.out.println(isValidEmail("invalid.email")); // false
System.out.println(isValidEmail("test@domain.co.in")); // true
System.out.println(isValidUSPhone("(123) 456-7890")); // true
System.out.println(isValidUSPhone("123-456-7890")); // true
System.out.println(isValidUSPhone("1234567890")); // true
System.out.println(isValidUSPhone("12345")); // false
System.out.println(isValidIndianPhone("9876543210")); // true
System.out.println(isValidIndianPhone("+919876543210")); // true
System.out.println(isValidIndianPhone("1234567890")); // false (starts with 1)
// Using Pattern and Matcher for detailed validation
Pattern emailPattern = Pattern.compile("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$");
Matcher matcher = emailPattern.matcher("test@example.com");
if (matcher.matches()) {
  System.out.println("Valid email");
}
```

## How to extract digits or specific patterns using regex?


Use **Pattern** and **Matcher** classes with **find()** and **group()** methods to extract matching patterns from strings.

**Interview Example:**

```java
import java.util.regex.*;
// Extract all digits from a string
public static List<String> extractDigits(String str) {
  List<String> digits = new ArrayList<>();
  Pattern pattern = Pattern.compile("\\d+");
  Matcher matcher = pattern.matcher(str);
  while (matcher.find()) {
    digits.add(matcher.group());
  }
  return digits;
}
// Extract all words
public static List<String> extractWords(String str) {
  List<String> words = new ArrayList<>();
  Pattern pattern = Pattern.compile("[a-zA-Z]+");
  Matcher matcher = pattern.matcher(str);
  while (matcher.find()) {
    words.add(matcher.group());
  }
  return words;
}
// Extract email addresses
public static List<String> extractEmails(String text) {
  List<String> emails = new ArrayList<>();
  Pattern pattern = Pattern.compile("[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}");
  Matcher matcher = pattern.matcher(text);
  while (matcher.find()) {
    emails.add(matcher.group());
  }
  return emails;
}
// Extract phone numbers
public static List<String> extractPhones(String text) {
  List<String> phones = new ArrayList<>();
  Pattern pattern = Pattern.compile("\\d{3}[-.]?\\d{3}[-.]?\\d{4}");
  Matcher matcher = pattern.matcher(text);
  while (matcher.find()) {
    phones.add(matcher.group());
  }
  return phones;
}
// Extract URLs
public static List<String> extractURLs(String text) {
  List<String> urls = new ArrayList<>();
  Pattern pattern = Pattern.compile("https?://[\\w.-]+(?:\\.[\\w.-]+)+[\\w/_.-]*");
  Matcher matcher = pattern.matcher(text);
  while (matcher.find()) {
    urls.add(matcher.group());
  }
  return urls;
}
// Test cases
String text = "Order 123 costs $45.67 and order 456 costs $89.10";
System.out.println(extractDigits(text)); // [123, 45, 67, 456, 89, 10]
String sentence = "Java123Programming456";
System.out.println(extractWords(sentence)); // [Java, Programming]
System.out.println(extractDigits(sentence)); // [123, 456]
String contact = "Email: john@example.com, Phone: 123-456-7890";
System.out.println(extractEmails(contact)); // [john@example.com]
System.out.println(extractPhones(contact)); // [123-456-7890]
String webpage = "Visit https://example.com or http://test.org";
System.out.println(extractURLs(webpage)); // [https://example.com, http://test.org]
// Using replaceAll to extract only digits
String mixed = "abc123def456";
String onlyDigits = mixed.replaceAll("\\D+", "");
System.out.println(onlyDigits); // "123456"
```

## How to replace multiple spaces or special characters using regex?


Use **replaceAll()** with regex patterns. `\s+` matches multiple whitespaces, character classes `[^a-zA-Z0-9]` match special characters.

**Interview Example:**

```java
// Replace multiple spaces with single space
String str1 = "Java    Programming    Interview";
String result1 = str1.replaceAll("\\s+", " ");
System.out.println(result1); // "Java Programming Interview"
// Remove all spaces
String str2 = "Hello World Java";
String result2 = str2.replaceAll("\\s+", "");
System.out.println(result2); // "HelloWorldJava"
// Replace multiple whitespace characters (space, tab, newline)
String str3 = "Java\t\tProgramming\n\nInterview";
String result3 = str3.replaceAll("\\s+", " ");
System.out.println(result3); // "Java Programming Interview"
// Remove all special characters
String str4 = "Hello@World#2025!";
String result4 = str4.replaceAll("[^a-zA-Z0-9]", "");
System.out.println(result4); // "HelloWorld2025"
// Keep only letters
String str5 = "abc123xyz456";
String result5 = str5.replaceAll("[^a-zA-Z]", "");
System.out.println(result5); // "abcxyz"
// Keep only digits
String str6 = "Price: $123.45";
String result6 = str6.replaceAll("[^0-9]", "");
System.out.println(result6); // "12345"
// Replace specific special characters
String str7 = "user@domain.com";
String result7 = str7.replaceAll("[@.]", "_");
System.out.println(result7); // "user_domain_com"
// Remove punctuation but keep spaces
String str8 = "Hello, World! How are you?";
String result8 = str8.replaceAll("[^a-zA-Z0-9\\s]", "");
System.out.println(result8); // "Hello World How are you"
// Replace consecutive duplicate characters
String str9 = "Hellooo Worlddd";
String result9 = str9.replaceAll("(.)\\1+", "$1");
System.out.println(result9); // "Helo World"
// Normalize whitespace (trim and replace multiple spaces)
String str10 = "  Java   Programming  ";
String result10 = str10.trim().replaceAll("\\s+", " ");
System.out.println(result10); // "Java Programming"
```

## How to split a string using multiple delimiters with regex?


Use **split()** with regex pattern containing **multiple delimiters** in brackets `[,;:]` or using pipe `|` for alternation.

**Interview Example:**

```java
// Split by multiple delimiters using character class
String str1 = "Java,Python;C++;JavaScript";
String[] parts1 = str1.split("[,;+]+");
System.out.println(Arrays.toString(parts1)); // Output: [Java, Python, C, JavaScript]
// Split by comma, semicolon, or colon
String str2 = "apple,banana;orange:grape";
String[] parts2 = str2.split("[,;:]");
System.out.println(Arrays.toString(parts2)); // Output: [apple, banana, orange, grape]
// Split by multiple delimiters using alternation (pipe)
String str3 = "a-b_c.d";
String[] parts3 = str3.split("[-_.]");
System.out.println(Arrays.toString(parts3)); // Output: [a, b, c, d]
// Split by space, comma, or semicolon
String str4 = "Java Python, C++;Ruby;Go";
String[] parts4 = str4.split("[\\s,;]+");
System.out.println(Arrays.toString(parts4)); // Output: [Java, Python, C++, Ruby, Go]
// Split by multiple whitespace characters
String str5 = "Java\tPython\nC++   Ruby";
String[] parts5 = str5.split("\\s+");
System.out.println(Arrays.toString(parts5)); // Output: [Java, Python, C++, Ruby]
// Split by word boundaries (AND, OR, NOT)
String str6 = "Java AND Python OR C++ NOT Ruby";
String[] parts6 = str6.split("\\s+(AND|OR|NOT)\\s+");
System.out.println(Arrays.toString(parts6)); // Output: [Java, Python, C++, Ruby]
// Split CSV with optional spaces
String csv = "apple, banana , orange,grape";
String[] items = csv.split("\\s*,\\s*");
System.out.println(Arrays.toString(items)); // Output: [apple, banana, orange, grape]
// Split by special characters but preserve alphanumeric
String str7 = "user@domain.com:8080/path";
String[] parts7 = str7.split("[^a-zA-Z0-9]+");
System.out.println(Arrays.toString(parts7)); // Output: [user, domain, com, 8080, path]
// Limit splits
String str8 = "a,b,c,d,e";
String[] parts8 = str8.split(",", 3);
System.out.println(Arrays.toString(parts8)); // Output: [a, b, c,d,e] (splits only first 2 delimiters)
```

## What is the difference between replace() and replaceAll() when regex is involved?


**replace()** treats the replacement as **literal text** (no regex), while **replaceAll()** interprets both search and replacement as **regex patterns** with special characters.

**Interview Example:**

```java
String str = "Hello.World.Java";
// replace() - treats pattern as literal text
String r1 = str.replace(".", "-");
System.out.println(r1); // "Hello-World-Java" (replaces literal dots)
// replaceAll() - treats pattern as regex
String r2 = str.replaceAll(".", "-");
System.out.println(r2); // "-----------------" (. matches ANY character in regex)
// Correct regex usage with replaceAll()
String r3 = str.replaceAll("\\.", "-");
System.out.println(r3); // "Hello-World-Java" (escapes dot)
// replace() vs replaceAll() with special characters
String text = "Price: $100";
System.out.println(text.replace("$", "Rs.")); // "Price: Rs.100" (literal)
System.out.println(text.replaceAll("$", "Rs.")); // Error! ($ is regex end anchor)
System.out.println(text.replaceAll("\\$", "Rs.")); // "Price: Rs.100" (escaped)
// replaceAll() with regex patterns
String s1 = "Java123Python456Ruby";
System.out.println(s1.replace("\\d+", "-")); // "Java123Python456Ruby" (no match, literal)
System.out.println(s1.replaceAll("\\d+", "-")); // "Java-Python-Ruby" (regex match)
// replace() can replace char or CharSequence
String s2 = "hello";
System.out.println(s2.replace('l', 'L')); // "heLLo"
System.out.println(s2.replace("ll", "LL")); // "heLLo"
// replaceAll() only accepts String (regex)
// s2.replaceAll('l', 'L'); // Compile error - doesn't accept char
// Performance: replace() is faster for literal replacements
String large = "Java".repeat(1000);
long start = System.nanoTime();
large.replace("Java", "Python");
long replaceTime = System.nanoTime() - start;
start = System.nanoTime();
large.replaceAll("Java", "Python");
long replaceAllTime = System.nanoTime() - start; // replace() is faster (no regex compilation)
// replaceAll() with capturing groups
String date = "2025-10-21";
String formatted = date.replaceAll("(\\d{4})-(\\d{2})-(\\d{2})", "$3/$2/$1");
System.out.println(formatted); // "21/10/2025" // replace() cannot do this
// Summary table
// Method      | Pattern Type | Use Case
// ------------|--------------|------------------
// replace()   | Literal      | Simple text replacement
// replaceAll()| Regex        | Pattern-based replacement
```
