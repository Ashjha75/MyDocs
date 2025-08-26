---
title: Technical Layer
---

---

### 1. Angular Frontend Technical Layer

This layer provides the AI with the hard constraints of your Angular project's architecture and coding standards.

#### **A. File Location & Naming Conventions**
This is a non-negotiable starting point. You must tell the AI exactly where to create the file and what to name it, following Angular CLI conventions.

*   **Instruction:** "Generate the code in the file path `src/app/features/users/components/user-profile/user-profile.component.ts`."
*   **Why:** Prevents the AI from guessing the location or using incorrect naming (`UserProfile.ts`, `userprofile.component.ts`, etc.).

#### **B. Component-Specific Instructions**
Every component has a specific signature and configuration.

*   **Selector:** The custom HTML tag for the component (e.g., `app-user-profile`).
*   **Standalone vs. Module-Based:** Specify if it's a `standalone: true` component or if it needs to be declared in a specific NgModule (e.g., `UsersModule`).
*   **Change Detection:** Mandate the use of `OnPush` for performance. "Use `changeDetection: ChangeDetectionStrategy.OnPush`."
*   **Styling:** Specify the stylesheet path and encapsulation (e.g., `styleUrls: ['./user-profile.component.scss']`, `encapsulation: ViewEncapsulation.Emulated`).
*   **Lifecycle Hooks:** Explicitly state which hooks are needed (e.g., "Implement the `ngOnInit` and `ngOnDestroy` lifecycle hooks.").

#### **C. Data Structures (Interfaces & Types)**
**This is the most critical input.** Never let the AI guess the shape of your data. Always provide the exact TypeScript interfaces.

*   **Instruction:** "The component will interact with the `User` data model. Use this exact interface:
    ```typescript
    export interface User {
      id: number;
      name: string;
      email: string;
      isActive: boolean;
    }
    ```
*   **Why:** Guarantees type safety and prevents the AI from hallucinating property names (e.g., `userName` instead of `name`).

#### **D. Service & Dependency Injection**
Tell the AI which services to use and how to inject them.

*   **Instruction:** "Inject the `UserService` and `NotificationService` into the component's constructor. The `UserService` has a method `getUserById(id: number): Observable<User>`."
*   **Why:** Informs the AI about available application logic, preventing it from trying to re-implement `HttpClient` calls inside the component.

#### **E. Key Libraries & UI Components**
If you use a component library like Angular Material or a state management library like NgRx, you must declare it.

*   **Instruction:** "Build the UI using Angular Material components. Use `<mat-card>` for the container and `<mat-spinner>` for the loading state. The component should dispatch an `[Users Page] Load User` action from the NgRx Store."
*   **Why:** Ensures the AI generates code that is consistent with your project's existing UI and state management patterns.

---

### 2. Spring Boot Backend Technical Layer

This layer defines the precise structure of your Java-based backend, from API endpoints down to database interactions.

#### **A. File Location & Naming Conventions**
Just as with Angular, be explicit about the Java package and class name.

*   **Instruction:** "Generate the code in the file `com.myapp.user.UserController.java` within the `com.myapp.user` package."
*   **Why:** Maintains a clean package structure and adheres to Java conventions.

#### **B. Controller / API Endpoint Definition**
Define the exact signature of your RESTful endpoint.

*   **Class-Level Path:** "The controller's base path is `/api/v1/users` using `@RequestMapping`."
*   **Method-Level Path & Verb:** "The method should handle `GET` requests to `/{id}` using `@GetMapping`."
*   **Produces/Consumes:** Specify the content type (e.g., `produces = MediaType.APPLICATION_JSON_VALUE`).
*   **HTTP Status Codes:** Tell the AI what status to return on success (e.g., "Return `HttpStatus.OK` on success and `HttpStatus.NOT_FOUND` if the user does not exist.").

#### **C. Data Structures (DTOs & JPA Entities)**
**This is the Java equivalent of TypeScript interfaces.** Always provide the exact data structures. Emphasize the distinction between DTOs and Entities.

*   **Instruction:** "The API endpoint must accept a `CreateUserRequest` DTO and return a `UserResponse` DTO. Do not expose the `User` JPA entity in the controller. Use these exact Java Records:
    ```java
    // Request DTO
    public record CreateUserRequest(String username, String password) {}

    // Response DTO
    public record UserResponse(Long id, String username) {}
    ```
*   **Why:** Enforces the best practice of separating your API contract (DTOs) from your database schema (Entities), which is critical for security and maintainability.

#### **D. Service & Dependency Injection**
Specify the service layer components and the dependency injection method.

*   **Instruction:** "The controller should use constructor injection to get an instance of `UserService`. Call its `findUserById(Long id)` method."
*   **Why:** Enforces modern Spring best practices and tells the AI where the business logic resides.

#### **E. Key Libraries & Annotations**
Tell the AI what tools are at its disposal.

*   **Lombok:** "Use Lombok annotations (`@RestController`, `@RequiredArgsConstructor`, `@Slf4j`) to reduce boilerplate code."
*   **MapStruct:** "Assume a MapStruct mapper interface `UserMapper` exists to convert between the `User` entity and the `UserResponse` DTO."
*   **JPA / Hibernate:** "The `UserRepository` extends `JpaRepository<User, Long>`. Use standard repository methods."
