# Java Scanner Class: Comprehensive Guide

The `Scanner` class in Java (java.util.Scanner) is a powerful utility for reading user input from various sources, including keyboard (System.in), files, and strings. It provides methods to parse and retrieve different data types (int, float, String, etc.) from the input stream.

## 1. Importing Scanner
```java
import java.util.Scanner;
// or import all utility classes
import java.util.*;
```

## 2. Creating a Scanner Object
```java
Scanner scan = new Scanner(System.in); // Reads from standard input (keyboard)
```

## 3. Reading User Input (Text)
```java
System.out.print("Enter your first name: ");
String firstName = scan.nextLine(); // Reads a line of text
System.out.print("Enter your last name: ");
String lastName = scan.nextLine();
System.out.println("Your Name is: " + firstName + " " + lastName);
```

## 4. Common Scanner Methods
| Method         | Description                                      |
|---------------|--------------------------------------------------|
| nextInt()     | Reads an int value                               |
| nextFloat()   | Reads a float value                              |
| nextBoolean() | Reads a boolean value                            |
| nextLine()    | Reads a line of text                             |
| next()        | Reads a word (until whitespace)                  |
| hasNextLine() | Checks if another line is available              |
| hasNextInt()  | Checks if another int is available               |
| reset()       | Resets the scanner                               |
| toString()    | Returns string representation of the scanner     |
| nextByte()    | Reads a byte value                               |
| nextDouble()  | Reads a double value                             |
| nextShort()   | Reads a short value                              |
| nextLong()    | Reads a long value                               |

## 5. Example: Reading Integers
```java
Scanner scan = new Scanner(System.in);
System.out.print("Enter first number: ");
int num1 = scan.nextInt();
System.out.print("Enter second number: ");
int num2 = scan.nextInt();
System.out.println("Sum of entered numbers: " + (num1 + num2));
scan.close();
```

## 6. Example: next() vs nextLine()
- `next()`: Reads input until whitespace (single word).
- `nextLine()`: Reads the entire line (including spaces).

**Example with next():**
```java
Scanner scan = new Scanner(System.in);
System.out.print("Enter your full name: ");
String name = scan.next(); // Only reads first word
System.out.println("Your name: " + name);
scan.close();
```

**Example with nextLine():**
```java
Scanner scan = new Scanner(System.in);
System.out.print("Enter your full name: ");
String name = scan.nextLine(); // Reads the whole line
System.out.println("Your name: " + name);
scan.close();
```

## 7. Using Delimiters with Scanner
The `useDelimiter(String pattern)` method allows you to specify a custom delimiter for input parsing.

**Example:**
```java
Scanner scan = new Scanner("BeginnersBook/Chaitanya/Website");
scan.useDelimiter("/");
while (scan.hasNext()) {
    System.out.println(scan.next());
}
scan.close();
```

## 8. Best Practices
- Always close the Scanner object after use (`scan.close()`).
- Be careful when mixing `nextInt()`/`next()` and `nextLine()`; after reading a number, call `scan.nextLine()` to consume the leftover newline.
- For file input, use: `Scanner scan = new Scanner(new File("filename.txt"));`

## 9. Additional Resources
- [Official Java Documentation: Scanner](https://docs.oracle.com/javase/8/docs/api/java/util/Scanner.html)
- [Scanner Class Tutorial (GeeksforGeeks)](https://www.geeksforgeeks.org/scanner-class-in-java/)

---

**Summary:**
The `Scanner` class is essential for interactive Java programs, supporting robust and flexible input handling for various data types and sources. Use the appropriate method for your data type, and always manage resources by closing the scanner when done.