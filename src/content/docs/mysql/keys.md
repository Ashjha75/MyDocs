---
title: Keys
---



### **The Architecture of Integrity: Mastering MySQL Keys**

This guide provides a deep, interview-focused analysis of every type of key and constraint used in MySQL. We will cover their theoretical basis and, more importantly, their practical implementation and performance implications within the InnoDB storage engine.

#### **The Philosophy of Keys: Uniqueness and Relationships**

At its core, all data management boils down to two problems:
1.  **Uniqueness:** How can I flawlessly identify one specific piece of information (one row) and distinguish it from all others?
2.  **Relationships:** How can I create a reliable, unbreakable link between two pieces of information (two rows, often in different tables)?

Keys are the SQL standard for solving these problems.

### **1. The Primary Key (`PRIMARY KEY`) - The Ultimate Identifier**

The Primary Key is the most important key in any table. It is the absolute, non-negotiable, unique identifier for each row.

*   **Core Purpose:** To enforce entity integrity. To guarantee that every row can be uniquely and reliably identified.
*   **The Unbreakable Rules:**
    1.  **Must be UNIQUE:** No two rows can ever have the same primary key value.
    2.  **Must be NOT NULL:** A primary key value cannot be missing. An entity without an identifier is a logical impossibility.
    3.  **Only ONE per table:** A table can have only one primary key.

*   **MySQL Internals (The InnoDB Clustered Index):** This is the most critical interview topic. In InnoDB, the `PRIMARY KEY` is not just a logical constraint; it dictates the **physical storage of the table**.
    *   The entire table is physically sorted and stored on disk according to the order of the primary key. This is called a **clustered index** (or an index-organized table).
    *   The primary key is literally attached to every other piece of data in the row.
    *   This makes lookups *by the primary key* (`WHERE CustomerID = 123;`) blindingly fast, as the database can perform a direct seek to the data's physical location on disk.

#### **Interview Gold: The "Natural vs. Surrogate Key" Debate**

**Interviewer:** "We are designing a `Users` table. One developer suggests using the `Email` column as the primary key since it's naturally unique. Another suggests using an `INT AUTO_INCREMENT` column. Which approach do you recommend, and why?"

**Your Expert Answer:**
"This is the classic Natural vs. Surrogate key debate. I would strongly recommend using a **surrogate key** (`INT UNSIGNED AUTO_INCREMENT`) and placing a separate `UNIQUE` constraint on the `Email` column. Here are the reasons:

1.  **Stability:** Natural keys can change. A user might change their email address. If `Email` were the primary key, changing it would trigger a cascading update across every foreign key in the database that references it—a massive and risky operation. A surrogate key like `UserID` **never changes**. It is stable for the lifetime of the row.

2.  **Size and Performance:** An `INT` (4 bytes) is much smaller and more efficient than a `VARCHAR(100)` for a primary key. Since the primary key value is also copied into every secondary index as a pointer, a smaller PK leads to smaller, faster secondary indexes.

3.  **Simplicity:** `AUTO_INCREMENT` is simple, fast, and handled automatically by the database, eliminating the need for application logic to generate a unique identifier.

Using the `Email` as a `PRIMARY KEY` (a natural key) is brittle and inefficient. The best practice is to use a simple, stable, and small surrogate key for identification and use `UNIQUE` keys to enforce business rules like the uniqueness of an email address."

### **2. The Foreign Key (`FOREIGN KEY`) - The Relational Glue**

The Foreign Key is what puts the "Relational" in RDBMS. It creates a link between two tables, enforcing data consistency.

*   **Core Purpose:** To enforce **referential integrity**. This means that a row in one table cannot point to a row in another table that does not exist.
*   **The Rules:**
    1.  A `FOREIGN KEY` in one table (the "child" table) must point to a `PRIMARY KEY` or `UNIQUE KEY` in another table (the "parent" table).
    2.  The data types of the foreign key and the parent key it references must match exactly.

*   **Example:** In our `Orders` table, `CustomerID` is a foreign key.
    ```sql
    CREATE TABLE Orders (
        OrderID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        CustomerID INT UNSIGNED NOT NULL,
        ...
        CONSTRAINT FK_Order_Customer FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
    );
    ```
    This constraint makes it physically impossible for the database to create an order with a `CustomerID` that does not already exist in the `Customers` table.

#### **Interview Gold: `ON DELETE` and `ON UPDATE` Actions**

**Interviewer:** "What happens if I try to delete a customer who has existing orders? And how can you control that behavior?"

**Your Expert Answer:**
"By default, MySQL uses the `RESTRICT` action, which would prevent you from deleting the customer. The operation would fail with a foreign key constraint violation error. This is the safest behavior. However, we can control this using `ON DELETE` and `ON UPDATE` clauses in the foreign key definition:

*   **`ON DELETE RESTRICT` (Default):** Prevents deletion of the parent row if child rows exist.
*   **`ON DELETE CASCADE`:** If the parent row is deleted, all corresponding child rows are **automatically deleted**. This is powerful but dangerous. It's useful for `Order_Items`—if an `Order` is deleted, its line items should be deleted too. It's very risky for `Customers` and `Orders`.
*   **`ON DELETE SET NULL`:** If the parent row is deleted, the foreign key column in the child rows is set to `NULL`. This requires the foreign key column to be nullable. Useful if you want to keep the order record but anonymize it by removing the customer link.
*   **`ON DELETE NO ACTION`:** A synonym for `RESTRICT` in MySQL."

### **3. The Unique Key (`UNIQUE`) - The Business Rule Enforcer**

The Unique Key ensures that all values in a column (or set of columns) are distinct.

*   **Core Purpose:** To enforce a business rule of uniqueness on a column that is *not* the primary identifier.
*   **The Rules:**
    1.  All values in the column must be unique.
    2.  It allows for **one `NULL` value**. Since `NULL` is "unknown," two `NULL`s are not considered equal to each other, so multiple rows with `NULL` in a unique column are permitted (though this can be surprising).
    3.  A table can have many `UNIQUE` keys.

*   **MySQL Internals:** When you define a `UNIQUE` constraint, MySQL automatically creates a **non-clustered (secondary) index** on that column. This index is used to rapidly check for duplicates before an `INSERT` or `UPDATE` is allowed to proceed.

#### **Interview Gold: `PRIMARY KEY` vs. `UNIQUE KEY`**

| Feature | `PRIMARY KEY` | `UNIQUE KEY` |
| :--- | :--- | :--- |
| **Purpose** | The row's ultimate, unique identifier. | Enforces a business rule of uniqueness. |
| **Nulls Allowed?** | **No.** (`NOT NULL` is implicit) | **Yes.** (One `NULL` is permitted) |
| **Number Per Table** | **Only ONE.** | **Many.** |
| **Index Type (InnoDB)** | Creates the **Clustered Index**. | Creates a **Secondary Index**. |
| **Example** | `CustomerID` in the `Customers` table. | `Email` in the `Customers` table. |

### **4. The Composite Key - The Multi-Column Key**

A composite key (or compound key) is not a different *type* of key, but a key that is composed of **two or more columns**.

*   **Core Purpose:** To uniquely identify a row based on the *combination* of column values.
*   **The Rule:** The combination of values across the specified columns must be unique. Any individual column can have duplicate values.
*   **The Canonical Example:** Our `Order_Items` table. An `OrderID` can appear many times. A `ProductID` can appear many times. But the combination of `(OrderID, ProductID)` must be unique, because you can't add the same product to the same order twice as a separate line item.

```sql
CREATE TABLE Order_Items (
    OrderItemID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    OrderID INT UNSIGNED NOT NULL,
    ProductID INT UNSIGNED NOT NULL,
    ...
    UNIQUE (OrderID, ProductID) -- Composite UNIQUE Key
);
```

### **5. Theoretical Keys - Demonstrating Formal Knowledge**

Mentioning these shows you understand formal database theory beyond just the implementation details.

*   **Superkey:** Any set of one or more columns that can uniquely identify a row. For our `Customers` table, `(CustomerID)`, `(Email)`, `(CustomerID, FirstName)`, and `(Email, FirstName)` are all superkeys.
*   **Candidate Key:** A **minimal** superkey. It's a superkey from which no column can be removed without losing its uniqueness property.
    *   In `Customers`, the candidate keys are `(CustomerID)` and `(Email)`. `(CustomerID, FirstName)` is a superkey but not a candidate key, because you can remove `FirstName` and it's still unique.
    *   **The Primary Key is the candidate key that the database designer *chooses* to be the main identifier.**