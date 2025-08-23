---
title: Spring MVC Request Flow An In-Depth Look
description: Spring Boot Spring MVC Request Flow notes and interview-ready explanations
---




**Client -> Embedded Web Server -> DispatcherServlet -> Handler Mapping -> Controller -> Service -> Repository -> Database (and back)**

Now, let's dive into the details of each step.

### The Journey of an HTTP Request in Spring Boot

#### 1. The Client Sends an HTTP Request
It all starts when a client, such as a web browser or a mobile application, sends an HTTP request to a specific URL of your running Spring Boot application. This request includes the HTTP method (e.g., GET, POST, PUT, DELETE), the URL path, headers, and an optional request body.

#### 2. The Embedded Web Server Receives the Request
Your Spring Boot application runs with an embedded web server (Tomcat by default). This server is constantly listening for incoming network requests on a configured port (usually 8080).

*   The embedded server receives the raw HTTP request.
*   It parses the request to understand its components.
*   It then forwards the request into the Spring application's servlet container.

#### 3. The `DispatcherServlet` (Front Controller) Takes Over
This is the heart of Spring's web framework. The `DispatcherServlet` is a single servlet that intercepts every incoming request to your application. Its primary job is to act as a "front controller" and delegate the request to the appropriate components for processing.

#### 4. The `HandlerMapping` Identifies the Correct Controller
The `DispatcherServlet` consults one or more `HandlerMapping` instances to determine where to send the request next.

*   The `HandlerMapping`'s responsibility is to inspect the request's URL path (e.g., `/api/users/1`) and the HTTP method.
*   It then matches this information against the available controllers in your application that are annotated with `@RestController` or `@Controller`.
*   Specifically, it looks for a method annotated with a request mapping like `@GetMapping("/api/users/{id}")` that matches the incoming request.
*   Once a match is found, the `HandlerMapping` returns the appropriate controller method (known as the handler) to the `DispatcherServlet`.

#### 5. The Request Reaches the Controller
Now, the `DispatcherServlet` dispatches the request to the identified controller method. At this stage, several things happen:

*   **Argument Resolution:** Spring's `HandlerAdapter` processes the method's arguments. For instance, it can automatically deserialize a JSON request body into a Java object (using `@RequestBody`) or extract path variables (using `@PathVariable`).
*   **Business Logic Execution:** You, as the developer, write the code inside the controller method. This is where your application's logic begins. Typically, a controller's responsibility is to orchestrate the request by calling one or more service-layer components.

```java
@RestController
public class UserController {

    private final UserService userService;

    // Constructor injection
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/users/{id}")
    public User getUserById(@PathVariable Long id) {
        // The controller calls the service layer to handle the business logic
        return userService.findUserById(id);
    }
}
```

#### 6. The Service and Repository Layers (Business and Data Access)
Following best practices, the controller does not contain complex business logic itself. Instead, it delegates this to a **Service Layer** (`@Service`).

*   The **Service Layer** contains the core business logic of your application. It might perform calculations, validations, or coordinate with other services.
*   If data needs to be fetched from or saved to a database, the service layer will call a **Repository Layer** (`@Repository`).
*   The **Repository Layer** is responsible for all data access operations. It interacts with the database, often using a technology like Spring Data JPA, to execute SQL queries.

#### 7. The Response Travels Back
Once the controller method has finished its execution, it returns a result (often a simple Java object or a `ResponseEntity` object).

*   **View Resolution (for traditional web apps):** If you are building a traditional web application that returns HTML, Spring would look for a view template (like Thymeleaf or JSP) to render the data into HTML.
*   **Message Conversion (for APIs):** In the case of a REST API (using `@RestController`), Spring uses a list of `HttpMessageConverter`s to serialize the returned Java object into a specific format. By default, if Jackson is on the classpath, the `MappingJackson2HttpMessageConverter` will automatically convert the object into a JSON string.

#### 8. The `DispatcherServlet` and Web Server Send the Response
The `DispatcherServlet` receives the final response (e.g., the JSON string). The embedded web server then takes this response, wraps it in an HTTP response packet (setting the status code, content type header, etc.), and sends it back over the network to the client.

#### 9. The Client Receives the HTTP Response
The client receives the HTTP response, and if it's a browser, it will render the received data, or if it's another application, it will parse the JSON to use the data.

> ⚠️ **Note:**  
> For a detailed explanation of the JSON Serialization and Deserialization, see the [Detailed Spring Boot JSON Serialization and Deserialization Guide](/MyDocs/springboot/Core/json-serialization).
