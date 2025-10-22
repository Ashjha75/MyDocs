---
title: "Base Exception Handling"
---

### 1. What is the difference between **checked** and **unchecked** exceptions?

**Checked exceptions** are verified at compile-time and must be handled using try-catch or declared with throws keyword. They represent recoverable conditions like IOException or SQLException. **Unchecked exceptions** extend RuntimeException, are checked at runtime, and don't require mandatory handling. They typically indicate programming errors like NullPointerException or ArrayIndexOutOfBoundsException.

```java
// Checked - must handle
public void readFile() throws IOException {
    FileReader fr = new FileReader("file.txt");
}

// Unchecked - no compilation error
public void divide() {
    int result = 10 / 0; // ArithmeticException at runtime
}
```

**Key takeaway:** Checked exceptions are for recoverable external issues; unchecked are for programming bugs.

***

### 2. Explain the **exception hierarchy** in Java.

The root of Java's exception hierarchy is **Throwable**, which has two main branches: **Error** and **Exception**. Error represents serious problems that applications shouldn't catch (like OutOfMemoryError). Exception is divided into checked exceptions (direct subclasses of Exception) and unchecked exceptions (RuntimeException and its subclasses). All checked exceptions must be handled, while RuntimeException subclasses are optional to handle.

```
Throwable
├── Error (OutOfMemoryError, StackOverflowError)
└── Exception
    ├── IOException, SQLException (checked)
    └── RuntimeException
        └── NullPointerException, ArithmeticException (unchecked)
```

**Key takeaway:** Throwable → Error (don't catch) and Exception → Checked (must handle) and RuntimeException (optional).

***

### 3. What is the difference between **`throw`** and **`throws`**?

**throw** is a keyword used to explicitly throw an exception from a method or code block. **throws** is used in method signature to declare that a method might throw certain exceptions, delegating the handling responsibility to the caller. throw is followed by an exception instance, while throws is followed by exception class names.

```java
// throw - actually throws an exception
public void validate(int age) {
    if (age < 18) throw new IllegalArgumentException("Age must be 18+");
}

// throws - declares potential exceptions
public void readFile() throws IOException {
    // method implementation
}
```

**Key takeaway:** throw throws an exception; throws declares possible exceptions in method signature.

***

### 4. What happens if an exception is **not caught** in a method?

If an exception is not caught in a method, it propagates up the call stack to the calling method. This continues until either a handler is found or it reaches the main method. If uncaught in main, the JVM's default exception handler prints the stack trace and terminates the program abnormally. For checked exceptions, you must declare them using throws in the method signature.

```java
public void method1() {
    method2(); // exception propagates here
}

public void method2() throws IOException {
    throw new IOException(); // propagates to caller
}
```

**Key takeaway:** Uncaught exceptions propagate up the call stack until handled or the program terminates.

***

### 5. Can we have **multiple catch blocks** for a single try block?

Yes, you can have multiple catch blocks for a single try block. They are evaluated in order from top to bottom, and the first matching catch block is executed. You must order them from most specific to most general exception types, otherwise you'll get a compilation error. Only one catch block executes per exception thrown.

```java
try {
    // risky code
} catch (FileNotFoundException e) {
    // handle file not found
} catch (IOException e) {
    // handle other IO issues
} catch (Exception e) {
    // handle all other exceptions
}
```

**Key takeaway:** Multiple catch blocks are allowed; order them from specific to general exception types.

***

### 6. What is the purpose of the **finally block**? Will it always execute?

The finally block is used to execute cleanup code that must run regardless of whether an exception occurs or not, such as closing files, database connections, or releasing resources. It executes **almost always**, except in cases like System.exit(), JVM crash, infinite loops, or if the thread is killed. Even if there's a return statement in try or catch, finally executes before returning.

```java
try {
    return "from try";
} catch (Exception e) {
    return "from catch";
} finally {
    System.out.println("Always executes"); // runs before return
}
```

**Key takeaway:** Finally block ensures cleanup code runs, executing even when there's a return statement.

***

### 7. Can a **finally block override** the return value of a try block?

Yes, if the finally block contains a return statement, it will override any return value from the try or catch block. However, this is **strongly discouraged** as it makes code confusing and violates best practices. The finally block's return value takes precedence because finally executes last before the method actually returns.

```java
public int test() {
    try {
        return 10;
    } finally {
        return 20; // This overrides, method returns 20
    }
}
```

**Key takeaway:** Finally can override return values, but you should never do this in production code.

***

### 8. What happens if an **exception is thrown inside a finally block**?

If an exception is thrown inside a finally block, it will propagate up normally and **suppress** any exception that was thrown in the try or catch block. The original exception is lost unless you explicitly handle both. This is dangerous because it can hide the root cause. In try-with-resources, suppressed exceptions are preserved and accessible via getSuppressed() method.

```java
try {
    throw new IOException("Original");
} finally {
    throw new RuntimeException("Finally"); // This propagates, IOException lost
}
```

**Key takeaway:** Exception in finally block overrides the original exception, potentially hiding the root cause.

***

### 9. What's the difference between **Exception** and **Error**?

**Exception** represents conditions that applications should catch and handle, like business logic failures or recoverable external issues (file not found, network timeout). **Error** represents serious problems that applications should not try to catch, such as JVM-level issues like OutOfMemoryError, StackOverflowError, or VirtualMachineError. Errors indicate catastrophic failures that typically require application restart.

```java
// Exception - should handle
try {
    Integer.parseInt("abc");
} catch (NumberFormatException e) { }

// Error - don't handle
OutOfMemoryError // JVM is out of memory
```

**Key takeaway:** Exception is for application-level recoverable issues; Error is for serious JVM-level problems.

***

### 10. Can we **catch Error types** in Java? Should we?

Yes, you **can** technically catch Error types since Error extends Throwable, but you **should not** in most cases. Errors represent serious system-level problems that applications cannot reasonably recover from. Catching them might prevent proper cleanup or hide critical issues. The only exception is when you need logging or cleanup before shutdown, but you should rethrow the Error afterward.

```java
// Can catch but shouldn't
try {
    // code
} catch (OutOfMemoryError e) {
    // Bad practice - can't recover from this
}

// Acceptable only for logging
catch (Error e) {
    log.fatal("Critical error", e);
    throw e; // rethrow
}
```

**Key takeaway:** Technically possible to catch Errors, but practically you shouldn't as they're unrecoverable system failures.

***

### 11. What is a **try-with-resources** statement and how does it work?

Try-with-resources (introduced in Java 7) automatically closes resources that implement AutoCloseable interface. You declare resources in parentheses after try, and they're automatically closed in reverse order of creation when the block exits, whether normally or via exception. This eliminates the need for explicit finally blocks for resource cleanup and prevents resource leaks.

```java
// Old way
FileReader fr = null;
try {
    fr = new FileReader("file.txt");
} finally {
    if (fr != null) fr.close();
}

// Try-with-resources
try (FileReader fr = new FileReader("file.txt")) {
    // automatically closes fr
}
```

**Key takeaway:** Try-with-resources automatically closes AutoCloseable resources, making code cleaner and preventing resource leaks.

***

### 12. What is a **multi-catch block**, and when should you use it?

Multi-catch (introduced in Java 7) allows you to catch multiple exception types in a single catch block using the pipe (|) operator. Use it when you want to handle different exceptions in the same way, reducing code duplication. The exceptions must not have an inheritance relationship. The caught exception is implicitly final and cannot be reassigned.

```java
// Without multi-catch
try {
    // code
} catch (IOException e) {
    log.error(e);
} catch (SQLException e) {
    log.error(e);
}

// With multi-catch - cleaner
try {
    // code
} catch (IOException | SQLException e) {
    log.error(e); // same handling
}
```
