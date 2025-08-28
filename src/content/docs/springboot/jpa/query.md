---
title : Querying Techniques
---

### **The Professional's Guide to Spring Data JPA: Advanced Querying Techniques**

**Objective:** To master the full spectrum of querying tools provided by Spring Data JPA, from explicit JPQL to fully dynamic, type-safe specifications, enabling the construction of any query, no matter how complex.

---

### **Module : Advanced Querying Techniques**

While derived query methods (`findBy...`) are excellent for simple queries, real-world applications require more power and flexibility. This module covers the tools you use when derived queries are no longer sufficient.

#### **1. Custom Queries with `@Query` (JPQL and Native SQL)**

**The "What":** The `@Query` annotation allows you to explicitly define a JPQL or native SQL query on a repository method, overriding the derived name convention.

**The "Why":** You use `@Query` when:
*   The query logic is too complex to be expressed in a method name.
*   You need to perform explicit `JOIN`s (especially `JOIN FETCH` to solve N+1 problems).
*   You need more control over the query than a derived name provides.

**JPQL vs. Native SQL:**

*   **JPQL (Jakarta Persistence Query Language) - The Default & Preferred:**
    *   **Mechanism:** An object-oriented query language that works with your **Entity and field names**, not database table and column names.
    *   **Benefit:** **Database Agnostic.** The same JPQL query will be translated by Hibernate's `Dialect` into correct SQL for PostgreSQL, MySQL, etc. This is the professional standard.

    ```java
    @Repository
    public interface ProductRepository extends JpaRepository<Product, Long> {
        
        @Query("SELECT p FROM Product p WHERE p.category = :category AND p.price > :minPrice")
        List<Product> findByCategoryAndPriceGreaterThan(String category, BigDecimal minPrice);
    }
    ```

*   **Native SQL (The "Escape Hatch"):**
    *   **Mechanism:** Lets you write raw, database-specific SQL. You must set `nativeQuery = true`.
    *   **Benefit:** Allows you to use database-specific features that are not supported by JPQL (e.g., window functions, recursive queries with `WITH` clauses, vendor-specific functions).
    *   **Trade-off:** You sacrifice database portability. This query might work on PostgreSQL but fail on H2 for testing.

    ```java
    @Query(value = "SELECT * FROM products p WHERE p.category = :category AND p.price > :minPrice", nativeQuery = true)
    List<Product> findByCategoryAndPriceGreaterThanNative(String category, BigDecimal minPrice);
    ```

**Named Parameters (`:paramName`)**:
**Best Practice:** Always use named parameters (`:paramName`) instead of positional parameters (`?1`). They are more readable, and your method is no longer sensitive to the order of its arguments.

---

#### **2. Modifying Queries with `@Modifying` and `@Transactional`**

**The "What":** The `@Modifying` annotation is required for any `@Query` that is not a `SELECT` statement (i.e., for `UPDATE`, `DELETE`, or `INSERT` operations).

**The "Why" (This is CRITICAL):**
1.  **Signal Intent:** It tells Spring Data JPA to expect an integer return type representing the number of rows affected, not a `ResultSet` to be mapped to entities.
2.  **Transaction Requirement:** All DML (Data Modification Language) operations **must** be executed within a transaction. Therefore, the service method that calls a repository method annotated with `@Modifying` **must also be annotated with `@Transactional`**.

**Interview Gold: The Persistence Context Pitfall**
This is a true senior-level concept. Modifying queries execute directly against the database, bypassing the L1 Cache (Persistence Context). This can cause your cache to become stale *within the same transaction*.

*   **Problem:** You load a `Product` (it's now in the L1 Cache), then run a `@Modifying` query to update its price in the DB. If you access the `Product` object again in the same transaction, it will still have the **old price** from the L1 Cache.
*   **Solution:** Use the `clearAutomatically = true` attribute on the `@Modifying` annotation. This tells Hibernate to automatically clear the entire Persistence Context after the query executes, forcing a reload from the database for any subsequent finds.

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Product p SET p.inStock = false WHERE p.lastUpdated < :date")
    int markOldProductsAsOutOfStock(LocalDate date);
}

@Service
public class ProductService {
    @Transactional // Absolutely required!
    public void runInventoryUpdate() {
        int updatedCount = productRepository.markOldProductsAsOutOfStock(LocalDate.now().minusMonths(6));
        log.info("Marked {} products as out of stock.", updatedCount);
    }
}
```

---

#### **3. Projections: Returning DTOs Directly from Queries**

**The "What":** A projection is a query that returns only a subset of an entity's attributes, often directly into a DTO.

**The "Why" (PERFORMANCE):** This is one of the most effective ways to optimize your data layer.
*   **Reduces Data Transfer:** You only select and transfer the columns you actually need from the database to the application.
*   **Avoids N+1 Problems:** By explicitly selecting the necessary fields from related entities, you can avoid lazy-loading pitfalls.

**Two Main Types:**

1.  **Interface-Based Projections:** Simple and concise. You define an interface with getter methods matching the entity's property names. Spring Data creates a proxy implementation for you.

    ```java
    // 1. The projection interface
    public interface ProductSummary {
        String getName();
        BigDecimal getPrice();
        String getCategoryName(); // Can even access nested properties!
    }

    // 2. The repository method
    @Repository
    public interface ProductRepository extends JpaRepository<Product, Long> {
        List<ProductSummary> findByCategory_Name(String categoryName);
    }
    ```

2.  **Class-Based Projections (Constructor Expression):** The most powerful and flexible. You use a JPQL `new` expression to call the constructor of your DTO.

    ```java
    // 1. The DTO with a matching constructor
    @Value // Lombok or manual constructor
    public class ProductDTO {
        String name;
        BigDecimal price;
    }
    
    // 2. The repository method using the constructor expression
    @Repository
    public interface ProductRepository extends JpaRepository<Product, Long> {
        @Query("SELECT new com.example.dto.ProductDTO(p.name, p.price) FROM Product p WHERE p.id = :id")
        Optional<ProductDTO> findProductDTOById(Long id);
    }
    ```

---

#### **4. Dynamic Queries with `Specification` and `JpaSpecificationExecutor`**

**The "What":** The `Specification` interface is the Spring Data JPA implementation of the **Criteria API**. It allows you to build a query programmatically using a chain of reusable predicates. This is the ultimate tool for complex search functionality.

**The "Why":** Imagine a product search screen with 5 optional filters (category, min price, max price, brand, in stock). Trying to write a repository method for every combination is impossible. The `Specification` pattern allows you to build the query dynamically based on which filters the user provides.

**Analogy:** Think of `Specification` objects as `LEGO` bricks for your query. Each brick represents a single `WHERE` clause condition. You combine them at runtime with `.and()` or `.or()`.

```java
// 1. Create a Specification factory
public class ProductSpecifications {
    public static Specification<Product> hasCategory(String category) {
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> cb.between(root.get("price"), min, max);
    }

    public static Specification<Product> isInStock() {
        return (root, query, cb) -> cb.isTrue(root.get("inStock"));
    }
}

// 2. Have your repository extend JpaSpecificationExecutor
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {}

// 3. Build the query dynamically in your service
@Service
public class ProductSearchService {
    public List<Product> searchProducts(SearchFilters filters) {
        // Start with a base specification that is always true
        Specification<Product> spec = Specification.where(null);

        if (filters.getCategory() != null) {
            spec = spec.and(ProductSpecifications.hasCategory(filters.getCategory()));
        }
        if (filters.getMinPrice() != null) {
            spec = spec.and(ProductSpecifications.priceBetween(filters.getMinPrice(), filters.getMaxPrice()));
        }
        if (filters.isInStock()) {
            spec = spec.and(ProductSpecifications.isInStock());
        }

        // Pass the dynamically built specification to the repository
        return productRepository.findAll(spec);
    }
}
```

---

#### **5. Criteria API vs. `Specification` vs. Query by Example (QBE)**

| Tool | Abstraction Level | Use Case | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- |
| **Criteria API** | Low | Building complex queries in a programmatic way when not using Spring Data. | Fully type-safe (no strings), powerful. | Extremely verbose, hard to read. |
| **`Specification`** | Medium | **The professional standard** for complex, dynamic search/filter screens. | Combines Criteria API's power with the simplicity of the repository pattern. Reusable and composable. | Has a learning curve. |
| **Query by Example** | High | Simple "query by form" UIs where the user fills out an example object. | Very easy to use, requires almost no code. | Very limited. No support for ranges (`>`, `<`), `OR` conditions, or complex joins. |