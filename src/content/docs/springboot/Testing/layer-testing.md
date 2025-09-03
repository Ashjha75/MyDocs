---
title : Layered Testing Strategy
---


A robust testing suite mirrors the application's architecture. Each layer of the application has a corresponding type of test designed specifically for it.

```mermaid
graph TD
    subgraph "Application Architecture"
        Controller("Controller Layer") --> Service("Service Layer")
        Service --> Repository("Repository Layer")
        Repository --> DB[(Database)]
    end

    subgraph "Testing Strategy"
        WebTest("`@WebMvcTest` (Slice)") -->|Mocks| ServiceTest("Unit Test `@Mock`")
        ServiceTest -->|Mocks| RepoTest("`@DataJpaTest` (Slice)")
        RepoTest --> TestDB[(Test DB)]
    end

    style WebTest fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style ServiceTest fill:#c9f2c9,stroke:#333,stroke-width:2px
    style RepoTest fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

This diagram shows our strategy:
*   We test the **Repository** with a slice test (`@DataJpaTest`) that hits a real (test) database.
*   We test the **Service** with a pure unit test, completely mocking the repository layer.
*   We test the **Controller** with a slice test (`@WebMvcTest`), mocking the service layer.

---

### **1. Repository Layer Testing (`@DataJpaTest`)**

**The "Why":** The repository layer is where your object-oriented world meets the relational world of SQL. The purpose of these tests is to verify that this translation works correctly. You are testing:
*   Are my `@Entity` mappings (`@OneToMany`, etc.) correct?
*   Do my custom JPQL or native queries (`@Query`) work as expected?
*   Do the derived queries (`findByUsername(...)`) behave as Spring Data JPA promises?

**The Tools:**
*   `@DataJpaTest`: Loads only the JPA components of your application. It's fast and focused. By default, it's transactional and rolls back after each test, ensuring test isolation.
*   `TestEntityManager`: A utility provided by `@DataJpaTest` to help you set up database state specifically for your tests.

**Example: Testing a Custom Query**

```java
// Assume you have a UserRepository with this method:
// Optional<User> findByUsername(String username);

@DataJpaTest // Loads only JPA context, uses an in-memory DB, and makes tests transactional.
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager; // Helper to persist entities without a full repository.

    @Autowired
    private UserRepository userRepository; // The REAL repository bean we want to test.

    @Test
    @DisplayName("findByUsername should return user when user exists")
    void findByUsername_whenUserExists_returnsUser() {
        // Arrange
        User user = new User("testuser", "password");
        entityManager.persistAndFlush(user); // Use TestEntityManager to set up the DB state.

        // Act
        Optional<User> foundUser = userRepository.findByUsername("testuser");

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals("testuser", foundUser.get().getUsername());
    }

    @Test
    @DisplayName("findByUsername should return empty when user does not exist")
    void findByUsername_whenUserDoesNotExist_returnsEmpty() {
        // Arrange (no user is saved)

        // Act
        Optional<User> foundUser = userRepository.findByUsername("nonexistent");

        // Assert
        assertFalse(foundUser.isPresent());
    }
}
```

---

### **2. Service Layer Testing (Pure Unit Test)**

**The "Why":** This is where your core business logic resides. These tests must be the most numerous, the fastest, and the most precise in your entire suite. You are testing algorithms, conditional logic, and collaborations, completely isolated from any external concerns like databases or web requests.

**The Tools:**
*   `@ExtendWith(MockitoExtension.class)`: Enables Mockito annotations.
*   `@Mock`: To create a fake version of the service's dependencies (e.g., the repository).
*   `@InjectMocks`: To create a real instance of the service under test and inject the mocks into it.

**Example: Testing Business Logic and Exceptions**

```java
@ExtendWith(MockitoExtension.class) // No Spring context is loaded! This is a pure Mockito/JUnit test.
class UserServiceTest {

    @Mock
    private UserRepository mockUserRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("getUserById should return user DTO when user exists")
    void getUserById_whenUserExists_returnsUserDto() {
        // Arrange
        User user = new User(1L, "testuser");
        when(mockUserRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        UserDto result = userService.getUserById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(mockUserRepository).findById(1L); // Verify the dependency was called.
    }

    @Test
    @DisplayName("getUserById should throw UserNotFoundException when user does not exist")
    void getUserById_whenUserDoesNotExist_throwsException() {
        // Arrange
        when(mockUserRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            userService.getUserById(99L);
        });
    }
}
```

---

### **3. Controller Layer Testing (`@WebMvcTest`)**

**The "Why":** The controller's job is to handle web concerns. You are testing:
*   Is the endpoint mapped to the correct URL and HTTP method?
*   Does it correctly deserialize the incoming request body (JSON) into a DTO?
*   Does it trigger input validation (`@Valid`) for invalid requests?
*   Does it serialize the response object into JSON correctly?
*   Does it return the correct HTTP status codes?

**The Tools:**
*   `@WebMvcTest(YourController.class)`: A slice test that loads only the Spring MVC infrastructure and the specified controller.
*   `@MockBean`: Used to add a mock of the service dependency to the minimal Spring context.
*   `MockMvc`: The tool to perform "fake" HTTP requests and assert on the results.

**Example: Testing a REST Controller**

```java
@WebMvcTest(UserController.class) // Load web layer context, focused only on UserController.
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean // Add a mock of UserService to the Spring context for this test.
    private UserService mockUserService;

    @Test
    @DisplayName("GET /api/users/1 should return user DTO and HTTP 200")
    void getUserById_whenExists_returnsDtoAndOk() throws Exception {
        // Arrange
        UserDto userDto = new UserDto(1L, "John");
        when(mockUserService.getUserById(1L)).thenReturn(userDto);

        // Act & Assert
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("John")));
    }

    @Test
    @DisplayName("POST /api/users with blank name should return HTTP 400 Bad Request")
    void createUser_whenNameIsBlank_returnsBadRequest() throws Exception {
        // Arrange
        String userJson = "{\"name\":\"\"}"; // Invalid user DTO

        // Act & Assert
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isBadRequest());
    }
}
```

---

### **4. The Grand Strategy: Integrating JUnit & Mockito**

This is the summary of our entire approach. It's not about choosing one tool over another, but about applying the right tool for the right job.

*   **Structure is Everything:**
    *   **Unit Tests (`@ExtendWith(MockitoExtension.class)`):** The foundation. Used for **services, utilities, and components with business logic**. They are completely isolated from Spring. Your goal is to have the most of these.
    *   **Slice Tests (`@DataJpaTest`, `@WebMvcTest`):** The middle layer. Used for **repositories and controllers**. They test the integration of your code with a specific part of the Spring framework (JPA or MVC). They are fast and focused.
    *   **Full Integration Tests (`@SpringBootTest`):** The peak. Used for **critical user pathways** (e.g., a full registration flow). They load the entire application. Use them sparingly as a final sanity check.

*   **`@ExtendWith(MockitoExtension.class)` vs. `@SpringBootTest` - The Core Distinction:**
    *   Think of them as operating at opposite ends of a spectrum.
    *   `@ExtendWith(MockitoExtension.class)` is for tests **OUTSIDE** the Spring context. You are in full control, creating your objects and mocks manually (with `@InjectMocks`). It's for testing pure logic.
    *   `@SpringBootTest` (and its slice variants) is for tests **INSIDE** the Spring context. Spring is in control of creating beans. When you need a mock in this world, you must use `@MockBean` to ask Spring to replace the real bean with a mock.