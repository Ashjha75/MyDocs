

# 📌 Part 2: Spring MVC Request Flow (Detailed & Interview Ready)

---

## **1. High-Level Flow**

When a request comes in (e.g., `GET /patients/1`):

1. **Client (Browser/Postman/Angular)** sends HTTP request.
2. Request hits **DispatcherServlet** (Front Controller in Spring MVC).
3. **Handler Mapping** finds the correct controller method.
4. **Handler Adapter** invokes the method.
5. **Controller Method** executes business logic (calls Service → Repository).
6. **ResponseBody Advice + MessageConverters** convert Java objects → JSON/XML.
7. Response sent back to client.

👉 **Diagram (simplified flow)**

```
Client → DispatcherServlet → HandlerMapping → Controller → Service → Repository → DB
       ←    JSON Response ←  MessageConverters  ←  Controller
```

---

## **2. DispatcherServlet (Front Controller Pattern)**

* Acts as a single entry point for **all requests**.
* Delegates request to right controller.
* Registered automatically by Spring Boot.

👉 **Interview Q:** *Why DispatcherServlet?*
**A:** It centralizes request handling → better separation of concerns, flexible routing, and consistent handling of exceptions, views, etc.

---

## **3. Controller Layer**

Controllers = entry points for handling HTTP requests.

Example: **PatientController**

```java
@RestController
@RequestMapping("/patients")
public class PatientController {
    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPatientById(id));
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@Valid @RequestBody Patient patient) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createPatient(patient));
    }
}
```

### Key Concepts:

* `@RestController` = `@Controller + @ResponseBody` (returns JSON by default).
* `@RequestMapping` = base path.
* `@GetMapping`, `@PostMapping`, etc. map HTTP verbs.
* `@Valid` = trigger validation (Bean Validation API).
* `ResponseEntity` = flexible HTTP response (status + headers + body).

👉 **Interview Q:** *Difference between `@RestController` and `@Controller`?*
**A:** `@RestController` returns data (JSON/XML). `@Controller` returns views (JSP, Thymeleaf).

---

## **4. Request Parameters & Path Variables**

### Query Params

```java
@GetMapping
public List<Patient> searchPatients(
        @RequestParam(required = false) String name,
        @RequestParam(defaultValue = "0") int page) {
    return service.searchPatients(name, page);
}
```

### Path Variables

```java
@GetMapping("/{id}")
public Patient getById(@PathVariable Long id) {
    return service.getPatientById(id);
}
```

👉 **Interview Q:** *When to use `@PathVariable` vs `@RequestParam`?*
**A:** Path variables = resource identifiers (`/patients/1`). Request params = filtering, pagination (`/patients?name=John&page=2`).

---

## **5. Validation**

Spring integrates **JSR-380 Bean Validation** (`javax.validation`).

Example:

```java
@Entity
public class Patient {
    @Id @GeneratedValue
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @Min(value = 0, message = "Age must be positive")
    private int age;
}
```

Controller:

```java
@PostMapping
public ResponseEntity<Patient> createPatient(@Valid @RequestBody Patient patient) {
    return ResponseEntity.ok(service.createPatient(patient));
}
```

👉 **Interview Q:** *How to handle custom validation?*
**A:** Create `@Constraint` + `ConstraintValidator`.

---

## **6. Service Layer**

Business logic goes here.

```java
@Service
public class PatientService {
    private final PatientRepository repo;

    public PatientService(PatientRepository repo) {
        this.repo = repo;
    }

    public Patient getPatientById(Long id) {
        return repo.findById(id)
                   .orElseThrow(() -> new PatientNotFoundException(id));
    }

    public Patient createPatient(Patient patient) {
        return repo.save(patient);
    }
}
```

👉 **Best Practices**

* Keep **controllers thin, services fat**.
* Service = transactions, validation, business rules.
* Controller = request/response handling.

---

## **7. Repository Layer (with JPA)**

Spring Data JPA abstracts CRUD.

```java
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByNameContainingIgnoreCase(String name);
}
```

* `JpaRepository` already gives `save()`, `findById()`, `delete()`, etc.
* Custom query = method naming conventions or `@Query`.

👉 **Interview Q:** *Why Spring Data JPA instead of plain JDBC?*
**A:** Less boilerplate, transaction management, integrates with Hibernate. But may need fine-tuning for performance.

---

## **8. JSON Conversion**

Spring Boot uses **Jackson** by default.

```java
@RestController
public class InfoController {
    @GetMapping("/info")
    public Map<String, String> info() {
        return Map.of("app", "Patient Service", "version", "1.0");
    }
}
```

Response automatically converted to JSON:

```json
{
  "app": "Patient Service",
  "version": "1.0"
}
```

👉 **Customization:** Use `@JsonProperty`, `@JsonIgnore`, or global config.

---

## **9. Exception Handling (Global)**

Instead of writing `try/catch` everywhere → use **Controller Advice**.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<String> handleNotFound(PatientNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
}
```

👉 **Real-world value:** Centralizes error responses → consistent API.

👉 **Interview Q:** *What’s difference between `@ControllerAdvice` and `@ExceptionHandler`?*
**A:** `@ExceptionHandler` is method-level. `@ControllerAdvice` is global, applies to all controllers.

---

## **10. Pageable & Sorting**

Spring Data makes pagination trivial.

```java
@GetMapping
public Page<Patient> getPatients(Pageable pageable) {
    return repo.findAll(pageable);
}
```

Request:

```
GET /patients?page=0&size=5&sort=name,asc
```

👉 **Interview Q:** *How to handle large datasets efficiently?*
**A:** Use pagination (`Pageable`) or streaming with `Streamable`. Avoid fetching everything in one query.

---

# ✅ Interview Checklist for Part 2

* Explain **DispatcherServlet** role.
* `@RestController` vs `@Controller`.
* `@PathVariable` vs `@RequestParam`.
* Validation (`@Valid`, custom validators).
* Thin Controller, Fat Service.
* JPA Repository methods (`findByName...`).
* Jackson JSON serialization.
* Global Exception Handling with `@ControllerAdvice`.
* Pageable for performance.

---


