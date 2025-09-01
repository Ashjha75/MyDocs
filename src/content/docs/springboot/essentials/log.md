---
title: Logging
---

### **A Practical Guide to Logging in Spring Boot**

**Objective:** To master the essential logging practices in Spring Boot, from basic implementation to the critical configurations required for a stable, manageable production environment.

---

### **Module 1: Foundational Concepts (The "Why")**

#### **1.1 The Importance of Logging**

*   **In Development:** Logging is your primary debugging tool. It's how you see what's happening inside your application without having to attach a debugger for every little thing. You use `DEBUG` and `TRACE` levels to see detailed, step-by-step execution.
*   **In Production:** Logging is your **flight data recorder**. When an application crashes or a bug occurs, logs are often the *only* thing you have to diagnose the problem. Here, you focus on `INFO`, `WARN`, and `ERROR` levels to record important business events and critical failures. Good logging is the difference between a 5-minute fix and a 5-day investigation.

#### **1.2 The Logging Landscape**

*   Java has several logging frameworks (`Logback`, `Log4j2`, `java.util.logging`).
*   To avoid being locked into one, developers use a "facade" called **SLF4J (Simple Logging Facade for Java)**.
*   **Spring Boot's Choice:** Spring Boot defaults to using **Logback** as its logging implementation. Logback is modern, fast, and has excellent features, which is why it was chosen. When you use the `spring-boot-starter-logging`, you get SLF4J and Logback automatically.

#### **1.3 Logging Levels**

Logging levels are like a volume knob. They allow you to control how much detail you want to see. The hierarchy is:

`TRACE` -> `DEBUG` -> `INFO` -> `WARN` -> `ERROR`

If you set the level to `INFO`, you will see all `INFO`, `WARN`, and `ERROR` messages, but you will *not* see `TRACE` or `DEBUG` messages.

*   **Spring Boot's Default Level:** `INFO`. This is a sensible default for production, as it's not too "chatty."

---

### **Module 2: Practical Implementation (The Day-to-Day)**

#### **2.1 Using the SLF4J Facade**

You should **never** directly interact with a Logback object in your code. Always code against the SLF4J `Logger` and `LoggerFactory` interfaces. This keeps your code portable.

#### **2.2 Getting a Logger Instance**

*   **The Old Way (Boilerplate):**
    ```java
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;

    @Service
    public class MyService {
        private static final Logger log = LoggerFactory.getLogger(MyService.class);
        // ...
    }
    ```

*   **The Modern Way (Lombok's `@Slf4j`):** This is the **professional standard**. It's clean, concise, and avoids boilerplate. Simply add the Lombok annotation to your class, and it will automatically create a `log` variable for you.

    ```java
    import lombok.extern.slf4j.Slf4j;

    @Service
    @Slf4j // This does the magic!
    public class MyService {
        public void doSomething() {
            log.info("Doing something...");
        }
    }
    ```

#### **2.3 Dynamic Logging (Placeholders & Exceptions)**

This is a critical skill for writing clean and performant logging code.

*   **The WRONG Way (String Concatenation):**
    ```java
    log.debug("Processing user: " + user.getName() + " with ID: " + user.getId());
    ```
    **Why is this bad?** The string `"Processing user..."` is created *every single time*, even if your log level is set to `INFO` and the debug message will be thrown away. This is a waste of CPU cycles and memory.

*   **The RIGHT Way (Placeholders `{}`):**
    ```java
    log.debug("Processing user: {} with ID: {}", user.getName(), user.getId());
    ```
    **Why is this good?** SLF4J is smart. It only constructs the final string message *if* the `DEBUG` level is actually enabled. This is far more efficient.

*   **Logging Exceptions Correctly:** The most common mistake junior developers make is logging only the exception's message.
    *   **WRONG:** `log.error("An error occurred: " + e.getMessage());` // You lose the stack trace!
    *   **RIGHT:** Pass the exception object as the **last argument**. SLF4J knows how to format it correctly, including the full stack trace.
        ```java
        try {
            // ... some code that fails ...
        } catch (IOException e) {
            log.error("Failed to process file for user {}", userId, e); // 'e' is the last argument
        }
        ```

#### **2.4 Basic Configuration (`application.yml`)**

You can easily control log levels for your application's packages without writing a single line of XML.

```yaml
logging:
  level:
    # Set the root logger level to WARN (less chatty)
    root: WARN
    
    # Set our application's code to DEBUG for more detail
    com.example.myapp: DEBUG
    
    # Set a specific, noisy library (like Hibernate) to WARN to quiet it down
    org.hibernate.SQL: WARN
```

---

### **Module 3: Advanced Configuration & Production Practices (The Critical Skills)**

`application.yml` is great for simple level changes, but for real production control (like writing to files), you **must** use a dedicated configuration file.

Spring Boot will automatically find and use a file named `logback-spring.xml` if you place it in your `src/main/resources` directory.

#### **3.1 Custom Configuration with `logback-spring.xml`**

This file gives you full control. It has three main components:

*   **`<appender>`:** **Where** to send logs (e.g., console, a file).
*   **`<encoder>`:** **How** to format a log message (the pattern).
*   **`<logger>`:** **Which** logs to send to which appender, and at what level.

**A Simple `logback-spring.xml` Example:**
```xml
<configuration>

    <!-- 1. Define an Appender for the Console -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <!-- 2. Define the Log Pattern for the console -->
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 3. Configure the Root Logger -->
    <root level="info">
        <appender-ref ref="STDOUT" /> <!-- Send all logs (at INFO level and above) to the console -->
    </root>

</configuration>
```
*   `%d`: Timestamp
*   `%thread`: The thread name (useful for debugging concurrency)
*   `%-5level`: The log level, padded to 5 characters
*   `%logger{36}`: The logger name (usually the class name), truncated to 36 characters
*   `%msg`: The actual log message
*   `%n`: A new line

#### **3.2 Log File Management: The `RollingFileAppender`**

**This is a non-negotiable requirement for any production application.** You cannot let a single log file grow forever. It will consume all your disk space. The `RollingFileAppender` solves this by automatically archiving log files based on rules you define.

**A Production-Grade `logback-spring.xml` Example:**

```xml
<configuration>
    <!-- Include Spring Boot's default configurations -->
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <!-- Define a property for the logging directory -->
    <property name="LOG_PATH" value="logs"/>

    <!-- Appender for the Console (useful for local dev) -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${CONSOLE_LOG_PATTERN}</pattern> <!-- Use Spring's default console pattern -->
        </encoder>
    </appender>

    <!-- ====================================================== -->
    <!--  THIS IS THE CRITICAL PRODUCTION APPENDER             -->
    <!-- ====================================================== -->
    <appender name="FILE_ROLLING" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/application.log</file> <!-- The active log file -->

        <!-- Define the Rolling Policy (HOW and WHEN to roll over) -->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <!--
              fileNamePattern: Where to move the old log files.
              %d{yyyy-MM-dd}: Roll over daily.
              .%i: An index for when files roll over due to size on the same day.
            -->
            <fileNamePattern>${LOG_PATH}/archived/application-%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            
            <!-- maxFileSize: Start a new log file when the active one reaches this size. -->
            <maxFileSize>10MB</maxFileSize>

            <!-- maxHistory: Keep archived log files for this many days. Older ones are deleted. -->
            <maxHistory>30</maxHistory>

            <!-- totalSizeCap: Enforce a total size limit for all archived logs. -->
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>

        <encoder>
            <pattern>%d %p %c{1.} [%t] %m%n</pattern> <!-- A simple pattern for files -->
        </encoder>
    </appender>

    <!-- Configure the Root Logger -->
    <root level="info">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE_ROLLING"/>
    </root>

</configuration>
```

**What this configuration achieves:**
1.  Logs are written to a file named `logs/application.log`.
2.  If that file grows larger than **10 MB**, it will be renamed (e.g., `application-2023-10-27.0.log.gz`) and a new, empty `application.log` will be created.
3.  A new log file is also started every day, regardless of size.
4.  Archived log files older than **30 days** will be automatically deleted.
5.  The total size of all log archives will not exceed **1 GB**.
