---
title : Slicing the Application Context
---
----------

### **Phase 2, Lesson 3: The Art of Slicing the Application Context**

#### **The "Why": Performance and Focus**

Loading the entire Spring ApplicationContext can be slow. A large application might have hundreds or thousands of beans. For a single test of a JPA repository, you do not need the web layer (@Controller), the security filter chain, or any of the MVC infrastructure. Loading them is a waste of time and resources.

Spring Boot's solution is **"Test Slices."** A slice is a focused, limited ApplicationContext that contains only the beans necessary to test a specific "slice" of your application. This gives you the best of both worlds: you are testing the real integration of components within a layer, but you are doing it quickly and efficiently.

Let's compare the main annotations.

----------

### @SpringBootTest vs. @WebMvcTest vs. @DataJpaTest

This is the most critical distinction to master in Spring Boot testing.

#### **1. @SpringBootTest: The Sledgehammer**

-   **What It Does:** This annotation loads the full  ApplicationContext. It starts from your main application class (the one with @SpringBootApplication), performs a component scan, and wires up your entire application just as it would on startup.
    
-   **When to Use It:** Sparingly. Use it for "end-to-end" integration tests where you need to validate a full flow, from the web layer through the service layer to the data layer. It is the most comprehensive test you can write, but also the slowest.
    
-   **Key Feature:** It is highly configurable. You can use it with a webEnvironment property to start a real servlet container on a random port, which is necessary for tests using TestRestTemplate.
    

#### **2. @WebMvcTest: The Web Layer Scalpel**

-   **What It Does:** This is a test slice that focuses only on the web layer. It loads a minimal context containing only the beans required for testing a controller:
    
    -   The MVC infrastructure (DispatcherServlet, HandlerMapping, etc.)
        
    -   @Controller, @RestController, @ControllerAdvice, @JsonComponent
        
    -   Spring Security's filter chain and web-related configuration.
        
-   **What It Does NOT Do:** It does **not** scan for or load @Service, @Repository, or general @Component beans. This is by design. The purpose is to test the controller's logic (request mapping, input validation, serialization, security) in isolation from the business logic.
    
-   **Critical Implication:** Since the service layer is not loaded, you **must** provide any service dependencies as mocks using @MockBean.
    

#### **3. @DataJpaTest: The Data Layer Scalpel**

-   **What It Does:** This slice focuses only on the JPA/data layer. It loads a context containing:
    
    -   The EntityManager, JPA configuration, and Spring Data repositories (@Repository).
        
    -   It also auto-configures a TestEntityManager, a useful utility for test-specific database operations.
        
-   **What It Does NOT Do:** It does not load the service layer or the web layer.
    
-   **Key Features:**
    
    1.  **Transactional Rollback:** By default, every @DataJpaTest is transactional and rolls back at the end of the method. This ensures that each test method runs against a clean, predictable database state.
        
    2.  **In-Memory Database:** By default, it will replace your production database configuration with an in-memory database like H2 for speed and simplicity (though we will later argue for Testcontainers).
        

#### **Visualizing the Slices**

This diagram illustrates the scope of each annotation.

code Mermaid

downloadcontent_copy

expand_less

   ``` mermaid
   ---
config:
  theme: forest
---
graph TD
    subgraph "Full Application Context"
        Controller("Web Layer (@Controller)")
        Service("Service Layer (@Service)")
        Repository("Data Layer (@Repository)")
        DB[("Database")]
        Controller --> Service --> Repository --> DB
    end
    subgraph "Test Scope: @SpringBootTest"
        style SBTest fill:#fce4ec,stroke:#c2185b,stroke-width:2px
        Controller_SB("Web Layer")
        Service_SB("Service Layer")
        Repository_SB("Data Layer")
        DB_SB[("Test DB")]
        Controller_SB --> Service_SB --> Repository_SB --> DB_SB
    end
    subgraph "Test Scope: @WebMvcTest"
        style MVCTest fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
        Controller_MVC("Web Layer (Real)")
        MockService_MVC("Mocked Service (@MockBean)")
        Controller_MVC --> MockService_MVC
    end
    subgraph "Test Scope: @DataJpaTest"
        style JPATest fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
        Repository_JPA("Data Layer (Real)")
        DB_JPA[("In-Memory/Testcontainers DB")]
        Repository_JPA --> DB_JPA
    end
    linkStyle 0 stroke-width:0px;
    linkStyle 1 stroke-width:0px;
    linkStyle 2 stroke-width:0px;

   ```
  

----------

### Tools for Testing the Web Layer

#### **MockMvc and @AutoConfigureMockMvc**

-   **The "Why":** When testing the web layer, you want to verify controller behavior without the overhead of starting a real server and making HTTP requests over the network.
    
-   **What MockMvc Is:** A powerful server-side testing framework. It allows you to execute requests directly against the Spring MVC infrastructure (DispatcherServlet, filters, etc.) in-process. You can then use a fluent API to assert everything about the response (status code, headers, content).
    
-   **How It's Used:**
    
    1.  With @WebMvcTest: This slice annotation **automatically configures MockMvc for you**. You just need to @Autowired it into your test class.
        
    2.  With @SpringBootTest: If you are running a full context test but still want to use MockMvc (to avoid the network overhead), you must add the @AutoConfigureMockMvc annotation to your test class.
        

**Example using @WebMvcTest:**

code Java

downloadcontent_copy

expand_less

IGNORE_WHEN_COPYING_START

IGNORE_WHEN_COPYING_END

   ``` Java
   @WebMvcTest(UserController.class) // Focus only on UserController
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc; // Provided by @WebMvcTest

    @MockBean // Spring Test's version of @Mock. Replaces the real bean in the context.
    private UserService userService; 

    @Test
    @DisplayName("GET /users/1 should return user DTO and HTTP 200")
    void whenGetUserById_withValidId_thenReturnUserDto() throws Exception {
        // Arrange
        UserDto userDto = new UserDto(1L, "John Doe");
        when(userService.findUserById(1L)).thenReturn(userDto);

        // Act & Assert
        mockMvc.perform(get("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("John Doe")));
    }
}
```
  

#### **TestRestTemplate**

-   **The "Why":** Sometimes you need to test the application from the "outside," exactly as a real client would. This includes the full network stack, the running servlet container (like Tomcat), and all configured servlet filters.
    
-   **What It Is:** A special version of Spring's RestTemplate designed for integration tests. It is a **real HTTP client.**
    
-   **How It's Used:**
    
    1.  Annotate your test with @SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT). This starts your application on a real, randomly assigned port.
        
    2.  @Autowired the TestRestTemplate into your test class.
        
    3.  Use it to make actual HTTP requests to your running application.
        

**Example using @SpringBootTest:**



downloadcontent_copy

expand_less

IGNORE_WHEN_COPYING_START

IGNORE_WHEN_COPYING_END
``` Java
 @SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class UserE2ETest {

    @Autowired
    private TestRestTemplate restTemplate;

    // Assuming you have a way to populate data, e.g., using @Sql
    
    @Test
    @DisplayName("GET /users/1 should return a valid user")
    void testFullApplicationFlow() {
        // Act
        ResponseEntity<String> response = restTemplate.getForEntity("/api/users/1", String.class);
        
        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        // You would typically assert the body content as well
    }
}
```
  

----------

### **Interview Gold**

-   **Question:** "What is the fundamental trade-off when choosing between MockMvc and TestRestTemplate for testing a REST controller?"
    
    -   **Answer:** "The trade-off is between **scope and speed**. MockMvc is a server-side, in-process testing tool. It's extremely fast because it doesn't involve a real network connection or servlet container. It tests the Spring MVC stack directly, from filters down to the controller. It's ideal for focused web-layer integration tests. TestRestTemplate, on the other hand, is a real HTTP client. It tests the entire stack from the outside, including the running Tomcat server and network port. This provides higher fidelity as it's closer to how a real client interacts with the application, but it's significantly slower. The best practice is to use @WebMvcTest with MockMvc for the vast majority of controller tests (to cover validation, serialization, security, etc.) and have only a few, critical end-to-end tests using @SpringBootTest with TestRestTemplate as a sanity check for the whole application."
        
-   **Question:** "You write a test for a controller using @WebMvcTest and it fails because a dependency in your service layer is null. What is the most likely cause?"
    
    -   **Answer:** "The most likely cause is that @WebMvcTest only loads the web layer of the ApplicationContext and does not scan for @Service or @Repository beans. Therefore, the UserService that the controller depends on was never created. To fix this, you must explicitly provide a mock implementation of the service for the test context. This is done by annotating the service field in the test class with @MockBean. This tells Spring to create a Mockito mock of that bean and inject it into the controller, allowing me to stub its behavior and test the controller in isolation."