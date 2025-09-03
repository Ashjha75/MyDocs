---
title : Mockito Lec1
---



### **Phase 1, Lesson 2: Unit Testing the Service Layer with Mockito**

#### **The "Why": The Need for Isolation**

Imagine a `UserService` that depends on a `UserRepository` to save a user to the database.

```java
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be blank");
        }
        User user = new User(name);
        return userRepository.save(user); // This talks to the database!
    }
}
```

If we try to unit test the `createUser` method, we have a problem. Calling `userRepository.save(user)` will attempt a real database connection. This is slow, requires configuration, and makes our test an *integration test*. We don't want to test the repository here; we only want to test the logic inside `UserService` (e.g., the validation check).

**The Solution:** We need a fake `UserRepository` that we can control completely. This fake object is called a **mock**.

---

### **Part 1: Mockito Basics (Core Mocking in a Pure Unit Test)**

For this part, we are in a plain JUnit 5 test. There is no Spring Context. We manage the object creation ourselves.

#### **Setting Up the Test**

To enable Mockito's annotation magic (`@Mock`, `@InjectMocks`), you need to tell JUnit 5 to use the Mockito extension.

```java
@ExtendWith(MockitoExtension.class) // This activates Mockito annotations
class UserServiceTest {
    // ... test code
}
```

#### **1. Creating Mocks: `@Mock`**

This annotation tells Mockito to create a mock (a fake object) of the annotated class or interface.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository mockUserRepository; // Mockito creates a fake UserRepository

    // ...
}
```
The `mockUserRepository` is now a "dummy" object. By default, its methods do nothing and return null (or default primitives).

#### **2. Dependency Injection: `@InjectMocks`**

This annotation creates a *real instance* of the annotated class and then attempts to inject any fields annotated with `@Mock` into it. This saves you from having to manually call the constructor.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository mockUserRepository;

    @InjectMocks
    private UserService userService; // Mockito creates a REAL UserService and injects the mockUserRepository into it.
    
    // ...
}
```
Here, Mockito effectively does `userService = new UserService(mockUserRepository);` for you.

#### **3. Stubbing Behavior (The "Arrange" Phase)**

Stubbing is the act of telling your mock how to behave when its methods are called. We use the `when(...).thenReturn(...)` construct.

*   `when(...)`: You specify the mock object and the method call you want to define.
*   `thenReturn(...)`: You specify the value that should be returned when that method is called.

```java
@Test
@DisplayName("When user is created successfully, return the saved user")
void testCreateUser() {
    // Arrange
    User userToSave = new User("John Doe");
    User savedUser = new User(1L, "John Doe"); // The user after being "saved"

    // Stubbing the mock's behavior:
    when(mockUserRepository.save(userToSave)).thenReturn(savedUser);

    // Act
    User result = userService.createUser("John Doe");

    // Assert
    assertEquals(1L, result.getId());
    assertEquals("John Doe", result.getName());
}
```

#### **4. Verifying Behavior (The "Assert" Phase)**

Sometimes, a method doesn't return anything (it's `void`). How do we test that it did the right thing? We verify that it called its dependency correctly. Verification is asking the question: "Did an interaction happen with this mock?"

```java
// In a test for a void method, e.g., deleteUser(Long id)
@Test
void testDeleteUser() {
    // Arrange (nothing to stub for this simple case)

    // Act
    userService.deleteUser(1L);

    // Assert by verifying the interaction
    verify(mockUserRepository).deleteById(1L); // Was deleteById(1L) called ONCE on our mock?
}
```

#### **5. Argument Matchers**

What if we don't know the exact object that will be passed to a mock? In our `createUser` test, we had to create `userToSave` which was an exact replica of what's created inside the method. This is brittle. Argument matchers provide flexibility.

*   `any()`: Matches any object of a given type (`any(User.class)`).
*   `anyLong()`: Matches any `long`.
*   `eq()`: Use this when you need to mix a literal value with a matcher.

**Refactored `createUser` test:**

```java
// ...
// Stubbing with an argument matcher:
// "When save is called with ANY User object, then return the savedUser"
when(mockUserRepository.save(any(User.class))).thenReturn(savedUser);

// Act
User result = userService.createUser("John Doe");

// ...
```
This is much more robust.

---

### **Part 2: Mockito Advanced (In the Spring Boot Context)**

Now, let's switch to an **integration test**, for example, a `@WebMvcTest`. Here, Spring is in control of creating beans. We cannot use `@InjectMocks`. We need a way to tell the *Spring Context* to use a mock instead of a real bean.

#### **1. Mocking Spring Beans: `@MockBean` vs. `@SpyBean`**

This is a top-tier interview topic.

*   **`@MockBean`**: This annotation tells Spring: "Create a Mockito mock of this class, add it to the `ApplicationContext`, and if a real bean of this type already exists, **replace it with the mock**." It is a complete fake.
    *   **Use Case:** The most common scenario. In a `@WebMvcTest` for a `UserController`, you don't want the real `UserService`. You use `@MockBean` to provide a fake one.

*   **`@SpyBean`**: This is more advanced. It finds the **real bean** from the `ApplicationContext` and wraps it in a Mockito "spy." A spy, by default, **delegates all method calls to the real object**. However, you have the ability to selectively stub specific methods. It is a partial mock.
    *   **Use Case:** Imagine testing a complex service method that calls two other methods on the *same* service. You want to test the real logic of the main method but mock out one of the internal calls because it's slow or difficult to set up.

#### **2. Handling `void` Methods: The `do...` Family**

The syntax `when(mock.voidMethod())...` doesn't compile because `voidMethod()` returns nothing. Mockito provides a reversed syntax for these cases.

*   `doNothing().when(mock).voidMethod()`: Stubs a void method to do nothing.
*   `doThrow(new RuntimeException()).when(mock).voidMethod()`: Stubs a void method to throw an exception.

This syntax is also the **required way to stub methods on a spy** to avoid accidentally calling the real method during the stubbing process.

#### **3. Capturing Arguments: `ArgumentCaptor`**

This is a powerful verification tool. Argument matchers (`any()`) are great for stubbing, but for verification, we often need to inspect the *actual object* that was passed to the mock.

**The "Why":** In our `createUser` method, a new `User` object is created internally. We might want to assert that this new user was created with the correct name before being saved.

```java
@Test
void testCreateUser_CaptorExample() {
    // Arrange
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    when(mockUserRepository.save(any(User.class))).thenReturn(new User(1L, "John Doe"));

    // Act
    userService.createUser("John Doe");

    // Assert - Step 1: Verify the interaction and CAPTURE the argument
    verify(mockUserRepository).save(userCaptor.capture());

    // Assert - Step 2: Get the captured value and inspect it
    User capturedUser = userCaptor.getValue();
    assertNull(capturedUser.getId()); // The user should be new before saving
    assertEquals("John Doe", capturedUser.getName());
}
```

### **Interview Gold**

*   **Question:** "What is the critical difference between `@Mock` and `@MockBean`? When would you absolutely need to use `@MockBean`?"
    *   **Answer:** "`@Mock` is a pure Mockito annotation used in strict unit tests where you are not loading a Spring `ApplicationContext`. It simply creates a mock object that you must manually inject. `@MockBean`, on the other hand, is a Spring Test annotation. It integrates Mockito with the Spring `ApplicationContext` loaded during an integration test. It not only creates a mock but also registers it as a bean in the context, replacing any existing bean of the same type. You absolutely *must* use `@MockBean` when you are running a test with a sliced context like `@WebMvcTest` or `@DataJpaTest` and need to provide a mock implementation for a bean that isn't part of the slice (like providing a mock `UserService` to a `UserController` test)."

*   **Question:** "Describe a scenario where a `@SpyBean` is more appropriate than a `@MockBean`."
    *   **Answer:** "A `@SpyBean` is ideal when you need to test the real behavior of a bean but need to change or 'stub out' just a small part of its functionality. For example, imagine a `ReportService` with a public `generateReport()` method. Internally, this method calls a private `fetchExternalData()` method which makes a slow, unreliable network call. In my test, I want to execute the real logic of `generateReport()` (data processing, formatting, etc.), but I cannot make the real network call. I would use `@SpyBean` on the `ReportService`. This gives me the real service bean wrapped in a spy. In my test, I would then use `doReturn(fakeData).when(spyReportService).fetchExternalData()` to stub out just that one problematic method call, while the rest of the `generateReport` method executes its actual production code."