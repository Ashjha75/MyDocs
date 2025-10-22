---
title: "Advanced Exception Handling"
---

### 13. How do you **create a custom exception** in Java?

To create a custom exception, extend **Exception** (for checked) or **RuntimeException** (for unchecked). Provide at least two constructors: one accepting a String message, and another accepting both message and Throwable cause for exception chaining. Follow naming convention by ending the class name with "Exception". Add Javadoc comments explaining when this exception should be thrown and optionally include custom fields for additional context like error codes.

```java
public class InsufficientFundsException extends Exception {
    private String accountId;
    
    public InsufficientFundsException(String message) {
        super(message);
    }
    
    public InsufficientFundsException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

**Key takeaway:** Extend Exception/RuntimeException, provide constructors for message and cause, and follow naming conventions.

***

### 14. When should you create a **checked** vs **unchecked** custom exception?

Create **checked exceptions** (extend Exception) for **recoverable conditions** that the caller should handle explicitly, like business validation failures or external system issues (InvalidAgeException, PaymentFailedException). Create **unchecked exceptions** (extend RuntimeException) for **programming errors** or conditions that shouldn't be recovered from, like configuration errors or violations of preconditions (InvalidConfigurationException). As a rule of thumb, if the caller can reasonably recover, make it checked.

```java
// Checked - caller should handle
public class InsufficientBalanceException extends Exception {}

// Unchecked - programming error
public class InvalidAccountStateException extends RuntimeException {}
```

**Key takeaway:** Checked for recoverable business logic errors; unchecked for programming errors and unrecoverable conditions.

***

### 15. What is **exception chaining**, and when is it useful?

Exception chaining (or exception wrapping) is the practice of catching a low-level exception and throwing a new higher-level exception while preserving the original exception as the cause. You pass the caught exception to the constructor of your new exception using the cause parameter. This is useful for abstraction layers to hide implementation details while preserving the full stack trace. Use getCause() to retrieve the original exception.

```java
try {
    // database operation
} catch (SQLException e) {
    throw new DataAccessException("Failed to fetch user", e); // e is the cause
}

// Later retrieve: exception.getCause()
```

**Key takeaway:** Exception chaining preserves the original error while throwing a more meaningful higher-level exception.

***

### 16. What are **best practices** for exception handling in enterprise code?

Key best practices include: **1)** Catch specific exceptions, not generic Exception or Throwable. **2)** Never use empty catch blocks; at minimum, log the exception. **3)** Don't use exceptions for control flow. **4)** Log or throw, but don't do both (avoid duplicate logging). **5)** Include meaningful error messages with context. **6)** Clean up resources in finally or use try-with-resources. **7)** Document all checked exceptions in Javadoc with @throws. **8)** Fail fast by validating early and throwing exceptions close to the source.

```java
// Good practice
try {
    processPayment(amount);
} catch (PaymentException e) {
    logger.error("Payment failed for order {}", orderId, e);
    throw new OrderProcessingException("Cannot complete order", e);
}
```

**Key takeaway:** Be specific, never swallow exceptions silently, provide context, and log appropriately.

***

### 17. Why is it **bad practice to catch `Exception` or `Throwable`** directly?

Catching generic Exception or Throwable masks specific problems and hides unexpected errors that you might not be prepared to handle. It can catch RuntimeExceptions that indicate bugs (like NullPointerException) and prevent them from bubbling up. Catching Throwable also catches Errors (like OutOfMemoryError) which shouldn't be handled. This makes debugging harder and can hide critical issues in production. Always catch the most specific exception types you can handle.

```java
// Bad - catches everything, including programming errors
try {
    process();
} catch (Exception e) { 
    log.error("Something failed"); // What failed? Too generic
}

// Good - specific handling
catch (IOException e) { /* handle I/O issues */ }
catch (ValidationException e) { /* handle validation */ }
```

**Key takeaway:** Generic catches hide bugs and make debugging difficult; always catch specific exception types.

***

## 🚀 Spring Boot–Specific Exception Handling - Interview Answers

### 18. How does **Spring Boot handle exceptions** by default?

Spring Boot uses **BasicErrorController** to handle exceptions by default. For web applications, it returns a standard error response with timestamp, status, error, message, and path. For REST APIs, it returns JSON; for browser requests, it shows the Whitelabel Error Page. Uncaught exceptions result in 500 status codes. Common exceptions like 404 (NoHandlerFoundException) and 405 (MethodNotAllowed) are automatically mapped to appropriate HTTP status codes.

```java
// Default JSON error response
{
    "timestamp": "2025-10-22T22:10:00.000+00:00",
    "status": 500,
    "error": "Internal Server Error",
    "message": "Something went wrong",
    "path": "/api/users"
}
```

**Key takeaway:** Spring Boot provides BasicErrorController for default exception handling with JSON/HTML error responses.

***

### 19. What is the role of **`@ControllerAdvice`** and **`@ExceptionHandler`**?

**@ControllerAdvice** is a global exception handler that applies to all controllers in your application. **@ExceptionHandler** is a method-level annotation that specifies which exception types a method handles. Together they provide centralized exception handling, allowing you to intercept exceptions thrown by any controller and return custom responses. You can have multiple @ExceptionHandler methods in one @ControllerAdvice class to handle different exception types.

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(404, ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

**Key takeaway:** @ControllerAdvice provides centralized exception handling using @ExceptionHandler methods for specific exception types.

***

### 20. How can you return **custom JSON error responses** in REST APIs?

Create a custom error response DTO class with fields like status, message, timestamp, and path. In your @ControllerAdvice class, use @ExceptionHandler methods to catch specific exceptions and return ResponseEntity with your custom error object. You can also use @ResponseStatus to set HTTP status codes. For standardized responses, consider implementing RFC 7807 Problem Details format with ProblemDetail class.

```java
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    
    // constructors, getters, setters
}

@ExceptionHandler(ValidationException.class)
public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
    ErrorResponse error = new ErrorResponse(
        400, 
        ex.getMessage(), 
        LocalDateTime.now()
    );
    return ResponseEntity.badRequest().body(error);
}
```

**Key takeaway:** Use custom DTOs in @ExceptionHandler methods to return structured JSON error responses.

***

### 21. What is **`ResponseStatusException`**, and how do you use it?

**ResponseStatusException** is a Spring 5+ convenience class that allows you to throw HTTP exceptions without creating custom exception classes. It takes an HTTP status code, reason message, and optional cause. This is useful for simple cases where you don't need a custom exception class. However, for complex applications with many exception types, custom exceptions with @ControllerAdvice provide better organization and reusability.

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, 
            "User not found with id: " + id
        ));
}
```

**Key takeaway:** ResponseStatusException is a quick way to throw HTTP exceptions without creating custom exception classes.

***

### 22. What's the difference between **global exception handling** and **per-controller handling**?

**Global exception handling** uses @ControllerAdvice to handle exceptions across all controllers in the application, promoting code reuse and consistency. **Per-controller handling** uses @ExceptionHandler methods within a specific @Controller or @RestController, which only handle exceptions from that controller. Use global handling for common exceptions (validation, authentication) and per-controller handling for controller-specific exceptions. Global handlers execute only if the controller doesn't have a matching local handler.

```java
// Global - applies to all controllers
@ControllerAdvice
public class GlobalExceptionHandler { }

// Per-controller - only for this controller
@RestController
public class UserController {
    @ExceptionHandler(UserException.class)
    public ResponseEntity<?> handleUserError(UserException ex) { }
}
```

**Key takeaway:** Global handlers provide centralized exception management; local handlers address controller-specific concerns.

***

### 23. How does Spring Boot's **default error response** (`BasicErrorController`) work?

**BasicErrorController** is Spring Boot's default error controller that maps to `/error` path. When an unhandled exception occurs, the servlet container forwards the request to this controller. It checks the Accept header: if it's `application/json`, it returns JSON error response; otherwise, it returns HTML (Whitelabel Error Page). It extracts error attributes like status, message, path, and timestamp from the request. You can customize it by extending BasicErrorController or implementing ErrorController interface.

```java
// Customize error attributes
@Component
public class CustomErrorAttributes extends DefaultErrorAttributes {
    @Override
    public Map<String, Object> getErrorAttributes(WebRequest request, 
                                                   ErrorAttributeOptions options) {
        Map<String, Object> errorAttributes = super.getErrorAttributes(request, options);
        errorAttributes.put("customField", "customValue");
        return errorAttributes;
    }
}
```



