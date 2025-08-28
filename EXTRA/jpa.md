


# **Spring Data JPA - Enhanced Syllabus for Interviews**

### **Module 2: Modeling Your Data - The @Entity**

-   Anatomy of an @Entity: `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
    
-   Mapping Basic Column Types: `@Column`, `@Temporal`, `@Enumerated`, `@Lob`
    
-   Controlling Generation Strategies: `IDENTITY`, `SEQUENCE`, `TABLE`, `AUTO`
    
-   Transient Fields: `@Transient`
    
-   The Life Cycle of an Entity: Transient, Managed, Detached, Removed
    
-   Embeddables: `@Embeddable` and `@Embedded`
    
-   Composite Keys: `@EmbeddedId` and `@IdClass`
    

----------

### **Module 3: Defining Repositories**

-   The `JpaRepository` Interface: CRUD operations
    
-   Derived Query Methods: `findByEmail(String email)` and query derivation strategies
    
-   Sorting and Pagination with `Sort` and `Pageable`
    
-   Using `Optional<T>` as a Return Type for Null Safety
    
-   Custom Repositories: Implementing custom methods
    
-   Query Hints: `@QueryHints` for performance tuning
    

----------

### **Module 4: Relational Mapping**

-   One-to-One (`@OneToOne`): Unidirectional and Bidirectional
    
-   One-to-Many (`@OneToMany`) & Many-to-One (`@ManyToOne`): Owning Side
    
-   Many-to-Many (`@ManyToMany`): Best Practices and Join Table
    
-   Cascading Operations (`CascadeType.ALL, PERSIST, MERGE, REMOVE, REFRESH`)
    
-   Fetch Strategies: `FetchType.EAGER` vs. `FetchType.LAZY` (N+1 Problem)
    
-   Orphan Removal: `orphanRemoval = true`
    
-   Join Columns: `@JoinColumn` and `mappedBy`
    
-   Self-referencing relationships (e.g., Hierarchies)
    

----------

### **Module 5: Advanced Querying Techniques**

-   Custom Queries with `@Query` (JPQL and Native SQL)
    
-   Named Parameters in Queries
    
-   Modifying Queries with `@Modifying` and `@Transactional`
    
-   Criteria API: Programmatic, Type-Safe Queries
    
-   Projections: Returning DTOs directly
    
-   Dynamic Queries with `Specification` and `JpaSpecificationExecutor`
    
-   Query by Example (QBE)
    

----------

### **Module 6: Transaction Management**

-   `@Transactional` Annotation (Service & Data Layer)
    
-   Transaction Propagation: `REQUIRED`, `REQUIRES_NEW`, `SUPPORTS`, etc.
    
-   Read-Only Transactions (`readOnly = true`) for Performance
    
-   Isolation Levels: `READ_COMMITTED`, `REPEATABLE_READ`, `SERIALIZABLE`
    
-   LazyInitializationException and its Solutions
    
-   Nested Transactions
    
-   Rollback Rules and Exception Handling
    

----------

### **Module 7: Auditing & Lifecycle Events**

-   JPA Entity Listeners and Callbacks: `@PrePersist`, `@PostPersist`, `@PreUpdate`, `@PostUpdate`, `@PreRemove`, `@PostRemove`, `@PostLoad`
    
-   Implementing Auditing with Spring Data JPA: `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy`
    
-   Using `AuditorAware` interface for tracking users
    

----------

### **Module 8: Performance Tuning & Advanced Concepts**

-   Understanding N+1 Select Problem and Solutions: `JOIN FETCH`, Entity Graphs
    
-   Database Indexing and Query Optimization
    
-   Two Levels of Caching in Hibernate: First-Level (Session), Second-Level (SessionFactory)
    
-   Query Cache
    
-   Batch Processing for Inserts and Updates
    
-   Fetch Profiles and Lazy Loading Optimization
    
-   Optimistic and Pessimistic Locking (`@Version`, `LockModeType`)
    
-   DTO vs Entity Projection Performance Considerations
    

----------

### **Module 9: Optional/Pro-level Topics (Highly Recommended for Interviews)**

-   Native SQL vs JPQL Performance Considerations
    
-   Stored Procedures with `@NamedStoredProcedureQuery`
    
-   Spring Data Auditing with Soft Deletes (`@Where`, `@SQLDelete`)
    
-   Hibernate Interceptors and Event System
    
-   Multi-Tenancy Concepts (if applying to enterprise roles)
    
-   Working with Large Objects (`@Lob` for BLOB/CLOB)
    

-----
**Database Migration Tools** – Flyway, Liquibase