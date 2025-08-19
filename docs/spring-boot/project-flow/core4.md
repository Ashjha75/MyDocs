

-----

##   Validation & DTOs

Data validation ensures that the input to your application is correct before it's processed. DTOs (Data Transfer Objects) are a critical pattern for creating secure, stable, and flexible APIs.



##  Jakarta Bean Validation (formerly JSR-303/380)

This is a standard specification that provides a framework for validating Java objects using annotations. Spring Boot seamlessly integrates this via the `spring-boot-starter-validation` dependency.

**Common Annotations:**

| Annotation    | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `@NotNull`    | Asserts that a field is not `null`.                            |
| `@NotEmpty`   | Asserts that a collection/string is not `null` and its size \> 0. |
| `@NotBlank`   | Asserts that a string is not `null` and contains non-whitespace characters. |
| `@Size`       | Asserts that a string/collection size is within a given range (`min`, `max`). |
| `@Email`      | Asserts that a string is a well-formed email address.          |
| `@Min`/`@Max` | Asserts that a numeric value is above or below a certain value.  |
| `@Pattern`    | Asserts that a string matches a given regular expression.      |

## Triggering Validation: `@Valid` & `@Validated`

Placing validation annotations on a DTO is not enough. You must tell Spring to trigger the validation process.

* **`@Valid`**: When a controller method parameter (typically one annotated with `@RequestBody`) is marked with `@Valid`, Spring automatically validates that object.
* **`@Validated`**: A Spring-specific annotation that is a variant of `@Valid`. It's required when you need to use **validation groups**.

## Validation Groups

Often, validation rules differ based on the context. A common example is Create vs. Update operations:

* **On Create**: The `id` field should be `null`.
* **On Update**: The `id` field must **not** be `null`.

Validation groups allow you to apply a subset of constraints at a time. You define marker interfaces for each group and associate constraints with them.

## DTOs (Data Transfer Objects) vs. Entities

An **Entity** represents a table in your database. A **DTO** is a plain object designed to carry data to and from your API. **Never expose JPA entities directly in your REST APIs.**

**Key Reasons to Use DTOs:**

1.  **API Contract Stability**: Your database schema can change (e.g., renaming a column), but you can keep your API's JSON structure consistent, preventing breaking changes for your clients.
2.  **Security**: Exposing entities can leak sensitive information (like password hashes) or internal database structures. DTOs ensure you only expose the fields you intend to.
3.  **View-Specific Payloads**: Your API might need to return a combination of data from multiple entities or a simplified version of one entity. DTOs are tailored to fit the exact needs of the API endpoint.
4.  **Input Validation**: DTOs provide a dedicated place to define validation rules for incoming data, separating API input concerns from database persistence rules.

## Mapping Strategies

You need a way to convert between DTOs and Entities.

* **Manual Mapper**: A simple class with methods like `toDto(Entity e)` and `toEntity(Dto d)`. It's straightforward but can be tedious.
* **MapStruct/ModelMapper**: Libraries that automate the mapping process through convention over configuration, reducing boilerplate code significantly.

-----

##  💻 Coding Examples

## 1\. PatientDTO with Validation

```java
public class PatientDTO {
    // Validation rules are applied here
    @NotNull(message = "Name cannot be null")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Min(value = 0, message = "Age cannot be negative")
    private int age;

    @Email(message = "Please provide a valid email address")
    @NotEmpty
    private String email;
}
```

## 2\. Validation Groups (`OnCreate`, `OnUpdate`)

First, define the marker interfaces.

```java
public interface OnCreate {}
public interface OnUpdate {}
```

Then, apply them to the DTO.

```java
public class PatientDTO {
    @NotNull(groups = OnUpdate.class, message = "ID is required for updates")
    @Null(groups = OnCreate.class, message = "ID must be null for new patients")
    private Long id;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class}, message = "Name is required")
    private String name;
    // ... other fields
}
```

## 3\. Controller with `@Validated`

To trigger group-based validation, use `@Validated` in the controller.

```java
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @PostMapping
    public ResponseEntity<Patient> createPatient(
        @Validated(OnCreate.class) @RequestBody PatientDTO patientDTO
    ) {
        // ... conversion and saving logic
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(
        @PathVariable Long id, 
        @Validated(OnUpdate.class) @RequestBody PatientDTO patientDTO
    ) {
        // ... conversion and update logic
    }
}
```

## 4\. Custom Validator (`@ValidAge`)

**Step 1: Create the annotation.**

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AgeValidator.class)
public @interface ValidAge {
    String message() default "Patient must be at least 18 years old";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

**Step 2: Create the validator implementation.**

```java
public class AgeValidator implements ConstraintValidator<ValidAge, Integer> {

    @Override
    public boolean isValid(Integer age, ConstraintValidatorContext context) {
        if (age == null) {
            return true; // Let @NotNull handle this
        }
        return age >= 18;
    }
}
```

Now you can use `@ValidAge` on a field in your DTO.

-----

##   🎯 Interview Questions

* **Q: Difference between entity validation vs. DTO validation?**
  They operate at different layers and serve different purposes. It's best practice to use both.

| Aspect         | **DTO Validation** | **Entity Validation (JPA)** |
| -------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Purpose** | To validate **external input** from the client at the API boundary.              | To ensure **data integrity** and enforce business rules at the persistence layer. |
| **Layer** | Controller/Web Layer.                                                            | Persistence Layer (just before a `persist` or `merge` operation).          |
| **Annotations**| Jakarta Bean Validation (`@NotNull`, `@Size`, etc.).                             | Can use both Bean Validation and JPA-specific annotations (`@Column(nullable=false)`). |
| **Use Case** | "Is the incoming JSON well-formed and does it meet the API contract requirements?" | "Does this object meet the business rules required to be stored in the database?" |

* **Q: How are validation errors handled by default?**
  By default, if validation fails on a method argument annotated with `@Valid`, Spring throws a **`MethodArgumentNotValidException`**. This results in a default, often verbose, JSON error response with a `400 Bad Request` status code.

  The **best practice** is to handle this exception globally using a **`@ControllerAdvice`** class. This allows you to intercept the exception and format a clean, consistent, and user-friendly JSON error response across your entire application.

* **Q: How to write a custom validator?**
  There are three main steps:

    1.  **Create an Annotation Interface**: Define a new annotation (e.g., `@ValidAge`). This interface must be annotated with `@Constraint(validatedBy = YourValidatorClass.class)`. It also requires three methods: `message()`, `groups()`, and `payload()`.
    2.  **Create a Validator Class**: This class must implement the `ConstraintValidator<YourAnnotation, TypeToValidate>` interface. For example, `ConstraintValidator<ValidAge, Integer>`.
    3.  **Implement the `isValid()` Method**: This method contains the actual validation logic. It receives the value of the field being validated and must return `true` if the value is valid and `false` otherwise.