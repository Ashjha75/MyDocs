---
title: Documentation Layer
---

### Guiding Philosophy: The Single Source of Truth

Your documentation will live in one place: **the source code**. The Astro site is a *presentation layer* for that truth. Your instructions to the AI must enforce this. We will command the AI to generate structured comments (Javadoc/TSDoc) that tools can later parse and convert into Markdown files for Astro.

---

### 1. Spring Boot Backend Documentation Layer

For Java, the gold standard is **Javadoc**, complemented by **SpringDoc (OpenAPI)** for REST APIs.

#### A. In-Code Javadoc (The Internal "Why" and "How")

This is for developers (including you and the AI) who are reading the code.

**Your Instruction to the AI:** "All public classes, methods, and fields must have comprehensive Javadoc documentation. Follow standard Javadoc syntax with `@param`, `@return`, and `@throws` tags."

**What to Mandate for Each File Type:**

*   **Controllers (`@RestController`):**
    *   **Class Javadoc:** Describe the business resource the controller manages (e.g., "Manages all user-related operations like creation, retrieval, and updates.").
    *   **Method Javadoc:** Explain the specific user-facing action the endpoint performs.
*   **Services (`@Service`):**
    *   **Class Javadoc:** Describe the business logic it encapsulates (e.g., "Handles business logic for user authentication and profile management.").
    *   **Method Javadoc:** Detail the steps in the business logic, its parameters, return values, and any specific exceptions it throws (e.g., `UserNotFoundException`).
*   **Repositories (`@Repository`):**
    *   **Class Javadoc:** Explain what data entity it interfaces with.
    *   **Method Javadoc:** Crucial for custom JPQL queries. Explain what the query does in plain English.
*   **DTOs (Data Transfer Objects):**
    *   **Class Javadoc:** Describe the purpose of the DTO (e.g., "Represents the data sent from the client to create a new user.").
    *   **Field Javadoc:** Add a comment for each field explaining what it is and any validation rules (`@NotNull`, `@Size`, etc.). This is extremely valuable context.

#### B. API Documentation with SpringDoc (The External "What")

This is for API consumers (like your Angular frontend). It generates an `openapi.json` file which can be used to create interactive API documentation.

**Your Instruction to the AI:** "Annotate all REST controller methods with SpringDoc OpenAPI annotations to describe the API operation, parameters, and responses."

**Key Annotations to Command:**
*   `@Operation(summary = "...", description = "...")`: A high-level description of the endpoint.
*   `@ApiResponse(responseCode = "200", description = "...")`: One for each possible HTTP status code (200, 201, 404, 500).
*   `@Parameter(description = "...")`: To describe path variables or request parameters.
*   `@Tag(name = "...")`: To group related endpoints in the Swagger UI.

#### C. The Astro Workflow & AI Prompt Example

Your workflow will be:
1.  **AI Generates:** The AI writes Java code with both Javadoc and SpringDoc annotations.
2.  **You Extract:** You use tools to convert this documentation into Markdown.
    *   For **Javadoc**: A tool like `jdoc2md` or a custom Gradle/Maven script can parse the Javadoc and generate `.md` files.
    *   For **API Docs**: The SpringDoc library generates an `openapi.json`. You can then use a tool like `widdershins` to convert this JSON into Markdown.
3.  **Astro Builds:** You place these generated Markdown files into your Astro project's `src/content/` directory, and Astro builds a beautiful, searchable documentation site.

**Example Prompt for a Spring Boot Controller:**

```markdown
### Business Layer
Create a Spring Boot REST controller endpoint to retrieve a user by their unique ID.

### Technical Layer
- Class: `UserController.java`
- Path: `/api/v1/users/{id}`
- Method: `GET`
- DTO: `UserDto.java` (provide the DTO's code)
- Service: `UserService` (assume it has a `findById` method).

### Documentation Layer
Your response MUST include:
1.  **Class Javadoc:** A block for `UserController` describing its purpose.
2.  **Method Javadoc:** A full Javadoc block for the `getUserById` method, including `@param` for the ID, `@return` for the `UserDto`, and `@throws` for `UserNotFoundException`.
3.  **SpringDoc Annotations:**
    - Use `@Operation` with a clear summary.
    - Use `@ApiResponse` for a 200 (Success) and a 404 (Not Found) response.
    - Use `@Parameter` to describe the `id` path variable.
    - Use `@Tag` to group this under "User Management".
```

---

### 2. Angular Frontend Documentation Layer

For TypeScript/Angular, the standard is **TSDoc**. The goal is the same: create structured comments that a tool can extract.

#### A. In-Code TSDoc (The Internal "Why" and "How")

**Your Instruction to the AI:** "All public properties and methods in components, services, and pipes must be documented using TSDoc format. Pay special attention to component `@Input` and `@Output` properties."

**What to Mandate for Each File Type:**

*   **Components (`@Component`):**
    *   **Class TSDoc:** A high-level description of the component's UI role and functionality.
    *   **Inputs (`@Input`):** This is critical. For each input, document its purpose, type, and default value. Use the `@Input` TSDoc tag.
    *   **Outputs (`@Output`):** Equally critical. For each output, document what user action triggers the event and the shape of the emitted data (`$event`). Use the `@Output` TSDoc tag.
    *   **Public Methods:** Document any public methods that can be called from a parent component (e.g., via `@ViewChild`).
*   **Services (`@Injectable`):**
    *   **Class TSDoc:** Describe the service's responsibility (e.g., "Manages user state and API communication for user data.").
    *   **Public Methods:** Document what each method does, its parameters, and what `Observable` it returns.
    *   **Public Observables/Subjects:** If the service exposes a public `Observable` (e.g., `currentUser$`), document what stream of data it represents.
*   **Interfaces/Types:**
    *   Add TSDoc comments for each property, explaining what it represents. This is your data contract.

#### B. The Astro Workflow & AI Prompt Example

Your workflow is parallel to the backend:
1.  **AI Generates:** The AI writes Angular components and services annotated with rich TSDoc.
2.  **You Extract:** You use a tool like **TypeDoc** with a plugin like `typedoc-plugin-markdown`. This tool parses your entire TypeScript project, reads the TSDoc comments, and exports a set of structured Markdown files.
3.  **Astro Builds:** You place these Markdown files into your Astro project, linking your frontend and backend documentation together.

**Example Prompt for an Angular Component:**

```markdown
### Business Layer
Create an Angular component to display a user's profile card. It should show the user's name and email and have a button to emit a 'delete' event.

### Technical Layer
- Component Name: `UserProfileCardComponent`
- Selector: `app-user-profile-card`
- Use OnPush change detection.
- Data Interface: `User` (provide the TypeScript interface).

### Documentation Layer
Your response MUST include:
1.  **Class TSDoc:** A block above the component class explaining its purpose.
2.  **Input TSDoc:** A full TSDoc block for the `user` @Input property. It must describe the expected object shape.
3.  **Output TSDoc:** A TSDoc block for the `delete` @Output property. It must explain that it emits the user's `id` (number) when the delete button is clicked.
4.  **Method TSDoc:** Add TSDoc to the `onDeleteClick()` method that handles the button click.
```