

---

# 📌 Part 1: Spring Boot Core (Deep Dive)

---

## **1. What happens when you start a Spring Boot app?**

When you run:

```java
@SpringBootApplication
public class PatientServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PatientServiceApplication.class, args);
    }
}
```

``` mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Check config]
```

**Step by step flow:**

1. `SpringApplication.run(...)` creates or loads an **ApplicationContext** (IoC container).
2. **Component Scanning**: Finds all classes annotated with `@Component`, `@Service`, `@Repository`, `@Controller`, etc.
3. **Auto-Configuration**: Based on dependencies (e.g., if `spring-boot-starter-data-jpa` is in classpath, Boot configures JPA + DataSource).
4. Registers the **DispatcherServlet** (front controller in MVC).
5. Runs all beans implementing `CommandLineRunner` or `ApplicationRunner`.
6. Starts **embedded Tomcat/Jetty/Undertow**.

👉 **Interview Q:** *How is Spring Boot different from Spring?*
**A:** Spring Boot adds auto-configuration, opinionated defaults, and an embedded server so you can focus on business logic instead of boilerplate.

---

## **2. IoC (Inversion of Control)**

Traditionally, you write:

```java
PatientRepository repo = new PatientRepository();
PatientService service = new PatientService(repo);
```

With Spring IoC:

* You don’t create objects manually.
* You just **declare beans**, Spring manages lifecycle + wiring.
* IoC Container = `ApplicationContext`.

👉 **Interview Q:** *What is IoC in simple words?*
**A:** Instead of you controlling object creation, you delegate that responsibility to Spring.

---

## **3. Beans**

A **Bean** = Object managed by IoC container.

Ways to create:

1. **Annotation-based (common in Boot)**

   ```java
   @Service
   public class PatientService { }
   ```

2. **Java-based (fine-grained control)**

   ```java
   @Configuration
   public class AppConfig {
       @Bean
       public EmailNotifier emailNotifier() {
           return new EmailNotifier();
       }
   }
   ```

👉 **Interview Q:**

* *When use `@Bean` vs `@Component`?*
  **A:** Use `@Component` for your own classes (auto-detected). Use `@Bean` for third-party libraries or when you need fine control.

---

## **4. Dependency Injection (DI)**

Spring injects required beans into other beans.

### Types of Injection:

1. **Field Injection** ❌ (bad practice)

   ```java
   @Autowired
   private PatientRepository repo;
   ```

2. **Setter Injection** ✅ (okay, but mutable)

   ```java
   @Service
   public class PatientService {
       private PatientRepository repo;
       @Autowired
       public void setRepo(PatientRepository repo) {
           this.repo = repo;
       }
   }
   ```

3. **Constructor Injection** ✅✅ (recommended)

   ```java
   @Service
   public class PatientService {
       private final PatientRepository repo;
       private final EmailNotifier notifier;

       public PatientService(PatientRepository repo, EmailNotifier notifier) {
           this.repo = repo;
           this.notifier = notifier;
       }
   }
   ```

👉 **Why Constructor Injection?**

* Dependencies are **explicit**.
* Promotes **immutability**.
* Helps **unit testing**.
* Prevents **null issues**.

---

## **5. @SpringBootApplication**

It is shorthand for 3 annotations:

* `@Configuration` → marks class as a config provider.
* `@EnableAutoConfiguration` → enables Boot auto-setup (DataSource, MVC, Jackson).
* `@ComponentScan` → scans current + subpackages for beans.

👉 **Interview Q:** *What if your beans are in another package?*
**A:** Use `@ComponentScan(basePackages = "...")`.

---

## **6. Profiles & Configuration Management**

You rarely use one config everywhere (dev DB ≠ prod DB).
Spring Boot supports **profiles**.

Example:

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
---
# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://prod-server/patients
```

Run with:

```bash
java -jar app.jar --spring.profiles.active=prod
```

👉 **Real-world use case:**

* Developers use H2 DB (lightweight).
* Production uses MySQL/Postgres with connection pooling.

---

## **7. Bean Scopes**

Default = **singleton** (one per ApplicationContext).
Other scopes:

* `prototype`: new instance each time requested.
* `request`: one per HTTP request.
* `session`: one per HTTP session.

Example:

```java
@Component
@Scope("prototype")
public class ReportGenerator {
   // new instance every request
}
```

👉 **Interview Q:** *When to use prototype scope?*
**A:** For stateful objects (rare in services, common in utility objects like PDF generators).

---

## **8. Application Events**

Spring supports publish/subscribe style events.
Useful for decoupling.

Example: Send email when patient is registered.

```java
public class PatientRegisteredEvent extends ApplicationEvent {
    private final Patient patient;
    public PatientRegisteredEvent(Patient patient) {
        super(patient);
        this.patient = patient;
    }
}
```

Publisher:

```java
@Service
public class PatientService {
    private final ApplicationEventPublisher publisher;
    private final PatientRepository repo;

    public PatientService(PatientRepository repo, ApplicationEventPublisher publisher) {
        this.repo = repo;
        this.publisher = publisher;
    }

    public Patient createPatient(Patient patient) {
        Patient saved = repo.save(patient);
        publisher.publishEvent(new PatientRegisteredEvent(saved));
        return saved;
    }
}
```

Listener:

```java
@Component
public class PatientEmailListener {
    @EventListener
    public void handle(PatientRegisteredEvent event) {
        System.out.println("Sending email for new patient: " + event.getPatient().getName());
    }
}
```

---

## **9. Startup Hooks (CommandLineRunner)**

Run logic after startup → often used for **data seeding** or **integration checks**.

```java
@Component
public class DataSeeder implements CommandLineRunner {
    private final PatientRepository repo;

    public DataSeeder(PatientRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        repo.save(new Patient("John Doe", 30));
        System.out.println("Sample patient added!");
    }
}
```

---

# ✅ Interview Checklist for Part 1

* IoC = Spring manages object creation & wiring.
* Beans: `@Component`, `@Service`, `@Repository`, `@Bean`.
* DI types (constructor preferred).
* `@SpringBootApplication` = 3 annotations.
* Profiles (`application-dev.yml`, `application-prod.yml`).
* Bean scopes (singleton, prototype, request, session).
* Application events for decoupling.
* `CommandLineRunner` for startup logic.

---

