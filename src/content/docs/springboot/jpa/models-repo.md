---
title : Modeling & Repositories

---

### **The Professional's Guide to Spring Data JPA: Modeling & Repositories**

---

### **Module 1: Modeling Your Data - The `@Entity` as a Blueprint**

An `@Entity` is not just a simple Java object; it is a rich blueprint that instructs the JPA provider (Hibernate) on how to map its state to a relational database table.

#### **Anatomy of a Production-Grade Entity**

This is the foundational mapping. Every annotation has a specific purpose.

```java
@Entity
@Table(name = "app_users", uniqueConstraints = { // Always specify table name and constraints
    @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ... other fields ...
}
```
*   `@Entity`: Marks this class as a JPA entity.
*   `@Table(name = "...")`: **Best Practice:** Always explicitly name your database table. The default naming strategy can be unpredictable. This is also where you define database-level constraints like unique keys.
*   `@Id`: Designates this field as the primary key.
*   `@GeneratedValue`: Configures how the primary key is generated. We will explore the `strategy` in detail next.

#### **Primary Key Generation Strategies**

This is a classic interview question that tests your understanding of database interactions.

| Strategy | How it Works | Pros | Cons | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`IDENTITY`**| The database is responsible for generating the ID, typically using an `AUTO_INCREMENT` or `IDENTITY` column. Hibernate waits for the DB to return the ID after the `INSERT`. | Simple, widely supported. | Disables JDBC batch inserts. Hibernate must issue one `INSERT` at a time to get the ID back immediately. | Most common for MySQL and MS SQL Server. Simple and effective for many applications. |
| **`SEQUENCE`**| Hibernate requests the next value from a dedicated database sequence *before* the `INSERT`. It then uses this pre-fetched ID in the `INSERT` statement. | **Enables JDBC batch inserts.** This is a significant performance advantage for bulk data loading. | Requires an extra `SELECT` from the sequence. Can be less intuitive to set up. | **The preferred choice for PostgreSQL and Oracle.** The standard for high-performance, write-heavy applications. |
| **`TABLE`** | Simulates a sequence using a separate table. Hibernate locks the table, reads the next value, increments it, and releases the lock. | Database independent. | **Terrible performance.** The table locking creates a massive bottleneck. **Avoid at all costs.** | Legacy applications. It has no place in modern development. |
| **`AUTO`** | **The default.** Hibernate lets the configured `Dialect` choose the most appropriate strategy (`IDENTITY`, `SEQUENCE`, or `TABLE`). | Simple to configure. | The choice might not be what you expect. It's better to be explicit. | Prototyping or when you are truly database-agnostic. In production, always specify `IDENTITY` or `SEQUENCE`. |

#### **Mapping Basic Column Types**

These annotations give you fine-grained control over the schema.

*   `@Column(name = "user_email", nullable = false, length = 100)`: The most common mapping annotation.
    *   **`name`**: Explicitly set the column name (snake_case is a common convention).
    *   **`nullable = false`**: Generates a `NOT NULL` constraint in the DDL.
    *   **`length`**: Sets the `VARCHAR` length.
*   `@Enumerated(EnumType.STRING)`: Controls how an `enum` is persisted.
    *   **`STRING` (Best Practice):** Saves the enum's name (e.g., "ACTIVE"). This is readable and robust.
    *   **`ORDINAL` (Avoid):** Saves the enum's numeric position (0, 1, 2...). This is brittle; if you reorder the enum constants, you corrupt your data.
*   `@Temporal`: (Legacy) Used for `java.util.Date`. With modern `java.time` types like `LocalDateTime`, this is no longer needed.
*   `@Lob`: Designates a field to be mapped to a Large Object type in the database (`CLOB` for strings, `BLOB` for byte arrays).
*   `@Transient`: **Important:** Marks a field to be **ignored by JPA**. This field will not be mapped to a database column. It exists only in the Java object. Useful for temporary calculations or derived state.

#### **Embeddables: Grouping Related Attributes**

The `@Embeddable` and `@Embedded` annotations are used to model a composition relationship. You can group related fields into a reusable component.

**Why?** It promotes code reuse and a better domain model. Instead of having `street`, `city`, `zipCode` in every entity that needs an address, you create an `Address` class.

```java
@Embeddable // Mark this class as a reusable component
public class Address {
    private String street;
    private String city;
    private String zipCode;
}

@Entity
public class User {
    @Id private Long id;
    
    @Embedded // Embed the fields from the Address class directly into the app_users table
    @AttributeOverrides({ // Optional: override column names if needed
        @AttributeOverride(name = "street", column = @Column(name = "home_street")),
        @AttributeOverride(name = "city", column = @Column(name = "home_city"))
    })
    private Address homeAddress;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "street", column = @Column(name = "work_street")),
        @AttributeOverride(name = "city", column = @Column(name = "work_city"))
    })
    private Address workAddress;
}
```

---

### **Module 2: Defining Clean and Powerful Repositories**

The `JpaRepository` is the heart of Spring Data JPA. It's an abstraction that eliminates boilerplate DAO code.

#### **The Power of the `JpaRepository` Interface**

By simply extending this interface, you instantly get a full suite of CRUD methods (`save`, `findById`, `findAll`, `delete`, etc.), implemented for you at runtime by Spring.

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {}```

#### **Derived Query Methods: The "Magic" of Convention**

This is Spring Data JPA's most famous feature. You can define a query simply by following a strict naming convention in a repository method. Spring parses the method name and generates the JPQL query for you.

*   `findByEmail(String email)` → `SELECT u FROM User u WHERE u.email = ?1`
*   `findByLastNameOrderByFirstNameAsc(String lastName)` → `SELECT u FROM User u WHERE u.lastName = ?1 ORDER BY u.firstName ASC`
*   `findFirst5ByStatus(UserStatus status)` → Returns the top 5 users with a given status.

**Interview Gold:** An advanced developer knows this is powerful but also has limits. For complex queries, it's better to switch to an explicit `@Query` annotation for clarity and maintainability.

#### **Pagination and Sorting**

For any method that returns a collection, you should always provide a paginated version to prevent fetching millions of records at once. You do this by adding a `Pageable` parameter.

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // The Pageable parameter contains page number, size, and sort information
    Page<Product> findByCategory(String category, Pageable pageable);
}

// In the service layer:
public Page<Product> getElectronics(int page, int size) {
    // Pageable.of() is how you create the request. The client provides page/size.
    Pageable pageRequest = Pageable.of(page, size, Sort.by("price").descending());
    return productRepository.findByCategory("ELECTRONICS", pageRequest);
}
```The returned `Page<T>` object is a rich DTO containing the list of products for the current page, plus total pages, total elements, and other pagination metadata.

#### **Null Safety with `Optional<T>`**

**Old way (bad):** `User findById(Long id);` // This would return `null` if not found.
**Modern way (good):** `Optional<User> findById(Long id);`

**Why?** It makes the "not found" case explicit in the type system. The caller is forced to handle the possibility of an empty result using methods like `orElseThrow()`, `ifPresent()`, etc. This prevents `NullPointerException`s and leads to more robust code.

#### **Custom Repositories: Breaking Out of the Interface**

Sometimes you have a complex query that doesn't fit the derived method pattern and is too complex for a simple `@Query`. In this case, you can implement a custom repository method.

**How it works:**
1.  Define a custom interface.
2.  Create a class that implements this interface. Name it with the suffix `Impl`.
3.  Have your main repository extend both `JpaRepository` and your custom interface.

```java
// 1. The custom interface
public interface CustomUserRepository {
    List<User> findUsersByComplexCriteria(String criteria);
}

// 2. The implementation class
public class CustomUserRepositoryImpl implements CustomUserRepository {
    @PersistenceContext
    private EntityManager entityManager; // You can use EntityManager for complex logic

    @Override
    public List<User> findUsersByComplexCriteria(String criteria) {
        // ... build a complex query using Criteria API or native SQL ...
        return ...;
    }
}

// 3. The main repository
@Repository
public interface UserRepository extends JpaRepository<User, Long>, CustomUserRepository {}
```