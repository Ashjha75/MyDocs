---
title : Transaction Management
---

### **The Professional's Guide to Spring Data JPA: Transaction Management**

**Objective:** To achieve a deep, architectural understanding of transaction management in Spring, focusing on propagation, isolation, rollback rules, and common pitfalls like `LazyInitializationException`.

---

### **Module : Transaction Management - The ACID Guarantee**

**The Philosophy: Why We Need Transactions**
A transaction is a single, logical unit of work that may consist of multiple operations. In the context of a database, transactions provide the **ACID** guarantees:

*   **A**tomicity: All operations within the transaction succeed, or none of them do. There is no partial success.
*   **C**onsistency: The transaction brings the database from one valid state to another.
*   **I**solation: Concurrent transactions do not interfere with each other's partial results.
*   **D**urability: Once a transaction is successfully committed, its changes are permanent.

Without transactions, your application would be in a constant state of potential data corruption.

#### **The `@Transactional` Annotation: The On-Switch**

In Spring, declarative transaction management is achieved with the `@Transactional` annotation. When you place this on a public method, Spring's AOP framework creates a proxy around that bean. At runtime, the proxy intercepts the method call and wraps it in a database transaction.

**Best Practice:** Place `@Transactional` on methods at the **service layer**. This is the layer that defines the boundaries of a complete business operation.

```java
@Service
public class TransferService {

    @Transactional // This is a transactional boundary
    public void transferMoney(Long from, Long to, BigDecimal amount) {
        // All database operations here are part of the SAME transaction.
        accountRepository.withdraw(from, amount);
        accountRepository.deposit(to, amount);
    } // The transaction commits here, or rolls back if an exception occurred.
}
```

---

#### **Transaction Propagation: How Transactions Interact**

This is a core interview topic. Propagation defines how a transactional method behaves when it is called from *another* transactional method.

| Propagation | Analogy | Technical Behavior | Use Case |
| :--- | :--- | :--- | :--- |
| **`REQUIRED`** | **Join the Club** | **(Default)**. If a transaction already exists, the method joins it. If not, it creates a new one. | The vast majority of use cases. Standard business logic. |
| **`REQUIRES_NEW`**| **Start Your Own Party** | Always suspends the current transaction (if one exists) and starts a brand new, independent one. | For critical, independent sub-operations that must succeed or fail on their own, regardless of the outer transaction. A classic example is **auditing or logging**. You want the audit log record to be saved even if the main business operation fails and rolls back. |
| **`SUPPORTS`** | **Go with the Flow** | If a transaction exists, the method joins it. If not, it runs non-transactionally. | For read-only methods that don't strictly require a transaction but can participate if one is available. |
| **`NOT_SUPPORTED`**| **I Work Alone** | Always suspends the current transaction and runs non-transactionally. | For operations that should not be part of a transaction, like calling an external, non-transactional system. |
| **`MANDATORY`**| **Club Members Only**| Throws an exception if there is no active transaction. | For methods that logically *must* be part of a larger transaction and should never be called directly. |
| **`NESTED`** | **A Save Point** | Creates a nested transaction, which is a save point within the current transaction. It can be rolled back independently, but the final commit is controlled by the outer transaction. | Rarely used. Most databases don't fully support this concept. `REQUIRES_NEW` is often a clearer alternative. |

**Code Example (`REQUIRED` vs. `REQUIRES_NEW`):**
```java
@Service
public class OrderService {
    @Autowired
    private AuditService auditService;

    @Transactional(propagation = Propagation.REQUIRED) // Default
    public void placeOrder(Order order) {
        // Joins the main transaction
        orderRepository.save(order);
        
        try {
            // This will start its own, separate transaction
            auditService.logAttempt(order.getId(), "PLACING");
        } catch (Exception e) {
            // Even if auditing fails, we don't want the main order to fail.
        }

        if (order.isInvalid()) {
            throw new RuntimeException("Invalid order!"); // This will cause a rollback
        }
    }
}

@Service
public class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW) // Critical
    public void logAttempt(Long orderId, String status) {
        // This save call is in its own transaction. It will commit
        // immediately, even if placeOrder() later throws an exception.
        auditRepository.save(new AuditLog(orderId, status));
    }
}
```

---

#### **Read-Only Transactions (`readOnly = true`): A Critical Performance Tune**

**What it does:** It provides a hint to the JPA provider and the database driver that no modifications will be made in this transaction.

**The Performance Benefits:**
1.  **Disables Dirty Checking:** Hibernate knows it doesn't need to waste CPU cycles scanning entities for changes when the transaction commits. This can be a significant performance gain in read-heavy operations.
2.  **Driver-Level Optimizations:** Some JDBC drivers can perform specific optimizations for read-only transactions, like routing the query to a read-replica database.

**Best Practice:** Apply `readOnly = true` to **every single service method that only reads data**.

```java
@Service
@Transactional(readOnly = true) // Set a class-level default for all methods
public class ProductQueryService {
    
    public Product findById(Long id) {
        // This method inherits the readOnly=true default
        return productRepository.findById(id);
    }
    
    @Transactional // Override the default for a write method
    public void updateProductPrice(Long id, BigDecimal newPrice) {
        // This method is NOT read-only
        Product p = productRepository.findById(id).orElseThrow();
        p.setPrice(newPrice);
    }
}
```

---

#### **Isolation Levels: Protecting Against Concurrency Problems**

Isolation defines the degree to which one transaction is protected from the effects of other, concurrently running transactions. This is an advanced topic that demonstrates a deep understanding of database theory.

| Problem | Explanation |
| :--- | :--- |
| **Dirty Read** | Transaction A reads uncommitted changes made by Transaction B. If B rolls back, A has read "dirty," non-existent data. |
| **Non-Repeatable Read** | Transaction A reads a row. Transaction B updates that same row and commits. If A reads the row again, it gets a different value. |
| **Phantom Read** | Transaction A runs a query (e.g., `SELECT COUNT(*) FROM users WHERE status='ACTIVE'`). Transaction B inserts a new 'ACTIVE' user and commits. If A runs the same query again, it gets a different count. |

**The Levels:**

| Isolation Level | Dirty Reads? | Non-Repeatable Reads? | Phantom Reads? |
| :--- | :--- | :--- | :--- |
| **`READ_UNCOMMITTED`**| Possible | Possible | Possible |
| **`READ_COMMITTED`**| **Prevented** | Possible | Possible |
| **`REPEATABLE_READ`** | **Prevented** | **Prevented** | Possible |
| **`SERIALIZABLE`**| **Prevented** | **Prevented** | **Prevented** |

*   **Spring Default:** Most databases default to `READ_COMMITTED`, which is a good balance of performance and consistency.
*   **How to set it:** `@Transactional(isolation = Isolation.REPEATABLE_READ)`
*   **Interview Gold:** The higher the isolation level, the more database locking is required, which reduces concurrency and hurts performance. `SERIALIZABLE`, while the safest, can effectively make your application single-threaded. You choose an isolation level based on the specific business needs of the operation.

---

#### **`LazyInitializationException`: The Classic JPA Pitfall**

**What it is:** This exception occurs when you try to access a lazily-loaded collection or entity *after* its `Persistence Context` has been closed.

**The Scenario:**
1.  A `@Transactional` service method fetches a `Customer` object. This creates an `EntityManager` and a `Persistence Context`. The `Customer`'s `orders` collection is a lazy proxy.
2.  The service method **returns** the `Customer` object to the controller. The `@Transactional` boundary ends, and the `Persistence Context` is **closed**. The database connection is released.
3.  The controller (or a JSON serializer) tries to access `customer.getOrders()`. The lazy proxy tries to load the orders from the database, but its `Persistence Context` is gone. **BOOM!** `LazyInitializationException`.

**The Solutions (In order of preference):**

1.  **The DTO Pattern (The Professional Solution):** Never return entities from your controllers. Your service method should be responsible for fetching all necessary data and mapping it to a DTO *inside the transactional boundary*. This is the cleanest and most robust solution.
2.  **`JOIN FETCH` Query:** If you know you will always need the related collection, write a custom `@Query` with `JOIN FETCH` to load the data eagerly in a single query.
3.  **`@Transactional` on the Controller:** (Anti-Pattern) You *could* make the controller method transactional, keeping the session open longer. **This is a terrible idea.** It holds database connections for too long and mixes web concerns with transactional concerns.

---

#### **Rollback Rules**

By default, a transaction will **only roll back** on **unchecked exceptions** (`RuntimeException` and its subclasses). It will **NOT** roll back on **checked exceptions** (`Exception`, `IOException`, etc.).

This is because checked exceptions are often considered recoverable business conditions, not unexpected system failures.

You can override this behavior:
```java
// This transaction will now roll back for a specific checked exception
@Transactional(rollbackFor = InvoiceProcessingException.class)
public void processInvoice(Invoice invoice) throws InvoiceProcessingException {
    // ...
}

// This transaction will NOT roll back for a specific runtime exception
@Transactional(noRollbackFor = InsufficientFundsException.class)
public void attemptPurchase(Item item) {
    // ...
}
```