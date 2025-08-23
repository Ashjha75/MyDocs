
---
title: Spring MVC2
---
---

### **The Definitive Spring MVC Masterclass (Part 2: Advanced Techniques & Applications)**

**Objective:** To expand upon the core REST API knowledge by exploring advanced topics such as media handling, asynchronous processing, and the patterns used in traditional, stateful web applications.

---

### **Module 6: Handling Media Types and File Uploads**

A common requirement is for an application to accept and serve files that are not plain text or JSON, such as images, PDFs, or spreadsheets.

#### **6.1: Handling File Uploads with `MultipartFile`**

When a client needs to upload a file, it sends a request with the `Content-Type` set to `multipart/form-data`. Spring MVC provides a simple and powerful abstraction for this: the `MultipartFile` interface.

**The Mechanism:**
1.  Spring's `MultipartResolver` detects the multipart request.
2.  It wraps the uploaded file data in a `MultipartFile` object.
3.  You can then simply declare `MultipartFile` as a `@RequestParam` in your controller method.

**Production-Grade Code Example:**

```java
@RestController
@RequestMapping("/api/v1/media")
public class FileUploadController {
    
    // Assume we have a service that knows how to store the file
    private final StorageService storageService;

    public FileUploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/upload/profile-picture")
    public ResponseEntity<String> handleProfilePictureUpload(@RequestParam("file") MultipartFile file,
                                                               @RequestParam("userId") Long userId) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File cannot be empty.");
        }
        
        // BEST PRACTICE: The controller's job is to orchestrate, not implement.
        // Delegate the actual storage logic to a dedicated service.
        try {
            String storedFileName = storageService.store(file, userId);
            String successMessage = "File uploaded successfully: " + storedFileName;
            return ResponseEntity.ok(successMessage);

        } catch (IOException e) {
            // Log the exception for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Failed to upload file due to a server error.");
        }
    }
}
```

**Interview Gold:** An advanced developer knows **never to save uploaded files to the project's classpath**. Files should be stored in a configurable external directory, a database (as a LOB), or preferably, a cloud storage service like Amazon S3 or Google Cloud Storage. The `StorageService` would encapsulate this logic.

#### **6.2: Serving Media Content (Images, PDFs, Excel)**

Serving a file for download or display involves sending back a stream of bytes with two critical HTTP headers:

*   **`Content-Type`:** Tells the browser the MIME type of the data so it knows how to render it (e.g., `image/jpeg`, `application/pdf`).
*   **`Content-Disposition`:** Tells the browser what to do with the file.
    *   `inline`: Tries to display the content directly in the browser.
    *   `attachment; filename="..."`: Prompts the user to save the file with a specific name.

**Production-Grade Code Example:**

```java
@RestController
@RequestMapping("/api/v1/media")
public class FileDownloadController {

    private final StorageService storageService; // Our service knows how to retrieve files

    // ... constructor ...

    // Example 1: Serving an image to be displayed in a browser <img src="..."> tag
    @GetMapping(value = "/images/{imageName}", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getProductImage(@PathVariable String imageName) throws IOException {
        byte[] imageBytes = storageService.loadImageAsBytes(imageName);
        if (imageBytes == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(imageBytes);
    }

    // Example 2: Serving an Excel report for download
    @GetMapping("/reports/monthly-sales")
    public ResponseEntity<Resource> downloadMonthlySalesReport() throws IOException {
        // The service layer is responsible for generating the report
        InputStreamResource resource = new InputStreamResource(storageService.generateSalesReport());

        HttpHeaders headers = new HttpHeaders();
        // This header is the key to triggering a download prompt
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=monthly-sales-report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }
}
```

---

### **Module 7: Traditional Web Application Features**

While REST is dominant, understanding server-side rendering is crucial for a complete skill set. These features are typically used in applications where the server generates the full HTML for the browser.

**The Key Distinctions:**

*   **`@Controller` (vs. `@RestController`):** A standard controller. Method return values are typically interpreted as logical view names, not response bodies.
*   **`Model`:** A map-like object used to pass data from your controller to your view template (e.g., Thymeleaf).
*   **`@ModelAttribute`:** Binds incoming request parameters (from a form submission) to a Java object. This is the traditional counterpart to the REST API's `@RequestBody`.

**Code Example: A User Registration Flow**

```java
@Controller // Note: Not @RestController
@RequestMapping("/users")
public class UserWebController {

    private final UserService userService;
    // ... constructor ...

    // Step 1: Display the empty form to the user
    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        // Add an empty form-backing object to the model
        model.addAttribute("userForm", new UserRegistrationDTO());
        // Return the name of the view template (e.g., register.html)
        return "register"; 
    }

    // Step 2: Process the submitted form data
    @PostMapping("/register")
    public String processRegistration(@Valid @ModelAttribute("userForm") UserRegistrationDTO userDto,
                                      BindingResult bindingResult,
                                      Model model) {
        // BindingResult must come immediately after the @Valid object
        if (bindingResult.hasErrors()) {
            return "register"; // If validation fails, show the form again with error messages
        }
        
        userService.register(userDto);
        model.addAttribute("successMessage", "Registration Successful!");
        
        return "register-success"; // Show a success page
    }
}
```

*   **Internationalization (i18n):** The process of designing an application to be adapted to various languages and regions. In Spring, this involves configuring a `MessageSource` bean and using message keys in your view templates (e.g., `th:text="#{welcome.message}"`) instead of hardcoded text.
*   **Session Management:** Using `HttpSession` to store user data across multiple requests (e.g., a shopping cart). This is a hallmark of a **stateful** application, in direct contrast to the **stateless** nature of REST APIs.

---

### **Module 8: Advanced Asynchronous Request Processing**

**The Problem:** The default "thread-per-request" model of servlet containers can become a bottleneck. If 100 users make requests that each take 5 seconds of I/O wait (e.g., calling a slow downstream API), 100 threads are tied up doing nothing but waiting.

**The Solution:** Spring MVC allows a controller method to return a `Callable<T>`. When it does this, the main request processing thread is **immediately freed** and returned to the container's thread pool to handle other incoming requests. The long-running task is executed in a separate background thread pool. When the task is complete, a container thread is used again to send the response.

**Code Example:**

```java
@RestController
public class AsyncDataController {

    private static final Logger log = LoggerFactory.getLogger(AsyncDataController.class);

    @GetMapping("/api/slow-data")
    public Callable<String> fetchSlowData() {
        log.info("Request received on thread: {}", Thread.currentThread().getName());

        // This lambda is the task to be executed asynchronously
        Callable<String> asyncTask = () -> {
            log.info("Task executing on thread: {}", Thread.currentThread().getName());
            // Simulate a slow network call
            Thread.sleep(5000); 
            return "Here is your slow data!";
        };

        log.info("Returning Callable, main thread is now free.");
        return asyncTask;
    }
}
```
This pattern dramatically improves application scalability and throughput for I/O-bound workloads.

---

### **Module 9: The MVC Ecosystem: Consuming Services**

Often, your application must act as a client to other REST services.

1.  **`RestTemplate` (Legacy):**
    *   **What:** The original, synchronous, blocking HTTP client provided by Spring.
    *   **When to Use:** You should primarily know how to read and maintain it, as it exists in millions of lines of legacy code. For new development, prefer `WebClient`.
    *   **Example:**
        ```java
        // This call will BLOCK the current thread until the response is received.
        String response = restTemplate.getForObject("http://api.example.com/data", String.class);
        ```

2.  **`WebClient` (Modern & Preferred):**
    *   **What:** The modern, non-blocking, reactive HTTP client. It is the successor to `RestTemplate`.
    *   **When to Use:** **For all new development.** Even if your application is a traditional blocking Spring MVC app, using `WebClient` for outgoing I/O calls can improve efficiency. You can easily use `.block()` on the result if you need to integrate it into a synchronous workflow.
    *   **Example:**
        ```java
        @Service
        public class ExternalApiService {
            private final WebClient webClient;

            // Best Practice: Configure a WebClient.Builder bean once
            // and inject it to create client instances.
            public ExternalApiService(WebClient.Builder webClientBuilder) {
                this.webClient = webClientBuilder.baseUrl("http://api.example.com").build();
            }

            public String fetchData() {
                return this.webClient.get()
                    .uri("/data")
                    .retrieve()
                    .bodyToMono(String.class) // Gets the response body as a reactive Mono
                    .block(); // Blocks to get the result in a synchronous method
            }
        }
        ```