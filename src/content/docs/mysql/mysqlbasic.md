
---
title:  Basic Terminology
---
---
### **1. The Language of SQL: Command Categories**

Structured Query Language (SQL) is the universal language used to communicate with relational databases. It is not a single monolithic language but is divided into logical sub-languages, each with a distinct and vital purpose. Understanding this separation is the first step to fluency.

#### **A. DDL (Data Definition Language)**

*   **Definition:** DDL commands are the architectural blueprints of the database. They are used to $\text{CREATE}$, $\text{MODIFY}$, and $\text{DESTROY}$ the actual structure of database objects like tables, indexes, and schemas. A DDL statement is final; its effects are immediate and generally cannot be rolled back easily. Think of this as the construction phase.

*   **Key Commands & Examples:**

    1.  **$\text{CREATE}$**: Builds a new database object. The most common use is `CREATE TABLE`.

        *   **Syntax:**
            ```sql
            CREATE TABLE table_name (
                column1_name data_type [constraints],
                column2_name data_type [constraints],
                ...
            );
            ```

        *   **Example:** Creating a table to store user information.
            ```sql
            CREATE TABLE Users (
                UserID INT PRIMARY KEY AUTO_INCREMENT,
                Username VARCHAR(50) NOT NULL UNIQUE,
                PasswordHash VARCHAR(255) NOT NULL,
                Email VARCHAR(100) NOT NULL UNIQUE,
                DateRegistered DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            ```

    2.  **$\text{ALTER}$**: Modifies the structure of an existing database object. This is used for evolving your schema over time, such as adding a new column to a table.

        *   **Syntax:**
            ```sql
            ALTER TABLE table_name
            ADD COLUMN new_column_name data_type [constraints];
            ```

        *   **Example:** Adding a `LastLogin` column to the `Users` table.
            ```sql
            ALTER TABLE Users
            ADD COLUMN LastLogin DATETIME NULL;
            ```

    3.  **$\text{DROP}$**: Permanently deletes an entire database object and all the data within it. This is an irreversible and highly destructive command.

        *   **Syntax:**
            ```sql
            DROP TABLE table_name;
            ```

        *   **Example:** Deleting the `Users` table.
            ```sql
            DROP TABLE Users;
            ```

#### **B. DML (Data Manipulation Language)**

*   **Definition:** DML commands are used to interact with the *data* inside the structures defined by DDL. This is the language of day-to-day operations: creating, reading, updating, and deleting records. These operations are typically performed within transactions and can be rolled back.

*   **Key Commands & Examples:**

    1.  **$\text{INSERT}$**: Adds new rows (records) of data into a table.

        *   **Syntax:**
            ```sql
            INSERT INTO table_name (column1, column2, ...)
            VALUES (value1, value2, ...);
            ```

        *   **Example:** Adding a new user to the `Users` table.
            ```sql
            INSERT INTO Users (Username, PasswordHash, Email)
            VALUES ('j.doe', 'a1b2c3d4e5f6...', 'j.doe@example.com');
            ```

    2.  **$\text{UPDATE}$**: Modifies existing data within one or more rows of a table. The `WHERE` clause is critical to specify *which* rows to change.

        *   **Syntax:**
            ```sql
            UPDATE table_name
            SET column1 = new_value1, column2 = new_value2
            WHERE condition;
            ```

        *   **Example:** Updating the `LastLogin` time for a specific user.
            ```sql
            UPDATE Users
            SET LastLogin = NOW()
            WHERE Username = 'j.doe';
            ```

    3.  **$\text{DELETE}$**: Removes one or more rows from a table. Like `UPDATE`, the `WHERE` clause is essential to avoid deleting unintended data.

        *   **Syntax:**
            ```sql
            DELETE FROM table_name WHERE condition;
            ```

        *   **Example:** Deleting a user account.
            ```sql
            DELETE FROM Users WHERE Username = 'j.doe';
            ```

#### **C. DCL (Data Control Language)**

*   **Definition:** DCL commands are concerned with security and permissions. They manage who has access to the database and what actions they are allowed to perform (e.g., read-only, write, full admin). This is the gatekeeper of your data.

*   **Key Commands & Examples:**

    1.  **$\text{GRANT}$**: Gives specific permissions to a database user.

        *   **Syntax:**
            ```sql
            GRANT permission_type ON database_name.table_name TO 'user'@'host';
            ```

        *   **Example:** Giving a new application user read and write permissions on the `Users` table.
            ```sql
            GRANT SELECT, INSERT, UPDATE ON my_app_db.Users TO 'app_user'@'localhost';
            ```

    2.  **$\text{REVOKE}$**: Removes permissions that were previously granted.

        *   **Syntax:**
            ```sql
            REVOKE permission_type ON database_name.table_name FROM 'user'@'host';
            ```

        *   **Example:** Revoking the `UPDATE` permission from the application user.
            ```sql
            REVOKE UPDATE ON my_app_db.Users FROM 'app_user'@'localhost';
            ```

#### **D. TCL (Transaction Control Language)**

*   **Definition:** TCL commands manage transactions. A transaction is a sequence of DML operations that are treated as a single, atomic unit of work. Either all operations within the transaction succeed, or none of them do, ensuring the database remains in a consistent state.

*   **Key Commands & Examples:**

    1.  **$\text{START TRANSACTION}$**: Marks the beginning of a new transaction.
    2.  **$\text{COMMIT}$**: Makes all the changes within the current transaction permanent.
    3.  **$\text{ROLLBACK}$**: Undoes all the changes made within the current transaction.

    *   **Example:** A classic bank transfer, which must be atomic.
        ```sql
        -- Start the transaction block
        START TRANSACTION;

        -- Step 1: Deduct $100 from Account A (user_id = 1)
        UPDATE Accounts SET Balance = Balance - 100.00 WHERE UserID = 1;

        -- Step 2: Add $100 to Account B (user_id = 2)
        UPDATE Accounts SET Balance = Balance + 100.00 WHERE UserID = 2;

        -- If both operations were successful, make the changes permanent
        COMMIT;

        -- If an error occurred anywhere above, a ROLLBACK would be issued
        -- by the application logic to undo both updates.
        ```

### **2. Core Database Concepts & Terminology**

Understanding these terms is non-negotiable. They form the vocabulary of database architecture.

*   **Schema (or Database):**
    *   **Analogy:** Think of a schema as a filing cabinet. It is not the data itself but a container designed to hold and organize related items.
    *   **Technical Definition:** A schema is a named collection of database objects, including tables, views, indexes, and stored procedures. In MySQL, the terms `SCHEMA` and `DATABASE` are synonymous. It provides a namespace to prevent conflicts and logically group related data structures. For example, you might have a `sales_db` schema for sales data and a separate `hr_db` for human resources data.

*   **Table:**
    *   **Analogy:** A table is like a single spreadsheet within the filing cabinet.
    *   **Technical Definition:** It is the primary structure for data storage, organized into a grid of horizontal **rows** (records) and vertical **columns** (attributes or fields). Each row represents a single entity (e.g., a specific user), and each column represents a specific attribute of that entity (e.g., their `Username`).

*   **Index:**
    *   **Analogy:** Exactly like the index at the back of a textbook. Instead of scanning every page to find a topic (a "full table scan"), you look up the topic in the index, which tells you the exact page number (the physical address of the data row), allowing you to jump there directly.
    *   **Technical Definition:** An index is a special on-disk data structure (most commonly a B-Tree in MySQL) that the database server uses to dramatically speed up data retrieval operations. It maps column values to the physical location of their corresponding data rows. While indexes significantly accelerate `SELECT` queries with `WHERE` clauses, they slightly slow down data modification (`INSERT`, `UPDATE`, `DELETE`) because the index must also be updated.

*   **View:**
    *   **Analogy:** A view is like a pre-defined filter or report template for your spreadsheet. It doesn't store any data itself; it just provides a specific way of *looking* at the data from one or more underlying tables.
    *   **Technical Definition:** A view is a stored `SELECT` query that is given a name and treated as a virtual table. It can be used to simplify complex queries, join data from multiple tables, or restrict access to certain columns or rows for security purposes.

*   **Constraints:**
    *   **Purpose:** Constraints are the rules that guard the integrity and reliability of your data. They prevent invalid or inconsistent data from ever being entered into the database, enforcing business logic at the lowest possible level.

    1.  **$\text{PRIMARY KEY}$**:
        *   **Rule:** Uniquely identifies each row in a table. It cannot contain `NULL` values, and all values in the column must be unique. A table can have only one primary key.
        *   **Example:** In a `Products` table, `ProductID` would be the primary key because no two products can have the same ID.

    2.  **$\text{FOREIGN KEY}$**:
        *   **Rule:** Creates a link between two tables. It is a column (or set of columns) in one table that refers to the `PRIMARY KEY` of another table. This enforces referential integrity, ensuring that a record in one table cannot point to a non-existent record in another.
        *   **Example:** In an `Orders` table, a `CustomerID` column would be a foreign key referencing the `CustomerID` primary key in the `Customers` table. This makes it impossible to create an order for a customer who does not exist.

    3.  **$\text{UNIQUE}$**:
        *   **Rule:** Ensures that all values in a column (or set of columns) are distinct from one another. Unlike a primary key, a unique constraint allows for one `NULL` value.
        *   **Example:** In a `Users` table, `Email` should have a `UNIQUE` constraint because no two users can register with the same email address.

    4.  **$\text{NOT NULL}$**:
        *   **Rule:** Ensures that a column cannot have a `NULL` (empty) value.
        *   **Example:** In a `Users` table, the `Username` and `PasswordHash` columns must be `NOT NULL` because a user account is meaningless without them.

    5.  **$\text{DEFAULT}$**:
        *   **Rule:** Provides a default value for a column if no value is specified during an `INSERT` operation.
        *   **Example:** In a `Users` table, the `DateRegistered` column can have a `DEFAULT` value of `CURRENT_TIMESTAMP` to automatically record the registration time.

### **3. MySQL Data Types**

Choosing the correct data type is critical for data integrity, performance, and storage efficiency. Selecting an overly large type wastes space, while selecting one that is too small can lead to data truncation or errors.

| Data Type | Use Case & Real-World Scenario | Storage & Range |
| :--- | :--- | :--- |
| **Numeric Types** | | |
| `TINYINT` | For very small integers, often used for boolean flags (0 or 1). **Scenario:** An `IsActive` column in a `Users` table to flag if an account is enabled. | 1 Byte (-128 to 127 or 0 to 255 `UNSIGNED`) |
| `INT` | The standard choice for whole numbers. **Scenario:** The `UserID` in a `Users` table or `ProductID` in a `Products` table. | 4 Bytes (-2.1 billion to 2.1 billion, or 0 to 4.2 billion `UNSIGNED`) |
| `BIGINT` | For extremely large whole numbers, essential for primary keys in tables that could exceed 4 billion rows. **Scenario:** The primary key `EventID` in a high-traffic logging table. | 8 Bytes (A very large range) |
| `DECIMAL(p, s)` | For fixed-point numbers where exact precision is mandatory. **Scenario:** Financial data. A `Price` column in a `Products` table should be `DECIMAL(10, 2)` to store values like `999.99` accurately, avoiding floating-point rounding errors. | Varies based on precision (p) and scale (s). |
| **String Types** | | |
| `VARCHAR(n)` | For variable-length strings where the length is known to be limited. `n` is the *maximum* number of characters. **Scenario:** A `Username` column set to `VARCHAR(50)`. It only uses storage for the actual characters entered, plus 1-2 bytes for length. | `n` characters max. Storage = Length + 1 or 2 bytes. |
| `CHAR(n)` | For fixed-length strings. Always uses `n` characters of storage regardless of content. **Scenario:** A `CountryCode` column set to `CHAR(2)` (e.g., 'US', 'DE'). It's slightly more performant than `VARCHAR` for truly fixed-length data. | `n` characters. Storage = `n` bytes. |
| `TEXT` | For long-form text data where the length is unknown or very large. **Scenario:** The `ProductDescription` in a `Products` table or the `Body` of a blog post. | Up to 65,535 characters. |
| `BLOB` | For binary data, such as images, audio files, or documents. It is generally recommended to store files on a file system or object store and only store the path/URL in the database. | Up to 65,535 bytes. |
| **Date & Time Types** | | |
| `DATE` | Stores a date value ('YYYY-MM-DD'). **Scenario:** A `BirthDate` column in a `Profiles` table. | 3 Bytes |
| `TIME` | Stores a time value ('HH:MM:SS'). **Scenario:** An `OpeningHour` column in a `StoreHours` table. | 3 Bytes |
| `DATETIME` | Stores both date and time ('YYYY-MM-DD HH:MM:SS'). **Scenario:** A `DateRegistered` or `LastLogin` column in a `Users` table. The most common choice for timestamps. | 8 Bytes |
| `TIMESTAMP` | Similar to `DATETIME`, but with a smaller range and automatic properties. It's often used for tracking when a row was last modified. **Scenario:** A `LastModified` column that automatically updates when the row is changed. | 4 Bytes (Range from 1970 to 2038) |

### **4. MySQL User Management**

Proper user management is a cornerstone of database security. The principle of least privilege dictates that users should only have the exact permissions they need to perform their duties.

*   **Creating Users:**
    *   The `CREATE USER` statement defines a new account with a username, the host from which they can connect, and a password.
    *   **Syntax:**
        ```sql
        CREATE USER 'username'@'host' IDENTIFIED BY 'a_strong_password';
        ```
    *   **Example:** Create a user `app_user` that can only connect from the local machine (the database server itself).
        ```sql
        CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'P@ssw0rd321!';
        ```

*   **Granting Privileges:**
    *   The `GRANT` command assigns specific rights to a user on a specific scope (a whole database, a single table, or even specific columns).
    *   **Syntax:**
        ```sql
        GRANT privilege1, privilege2 ON database_name.table_name TO 'username'@'host';
        ```
    *   **Example:** Grant the `app_user` the ability to `SELECT`, `INSERT`, and `UPDATE` records on the `Products` table within the `e_commerce_db` database.
        ```sql
        GRANT SELECT, INSERT, UPDATE ON e_commerce_db.Products TO 'app_user'@'localhost';
        ```
    *   **To grant all permissions on a database:**
        ```sql
        GRANT ALL PRIVILEGES ON e_commerce_db.* TO 'admin_user'@'localhost';
        ```

*   **Revoking Privileges:**
    *   The `REVOKE` command removes previously granted permissions.
    *   **Syntax:**
        ```sql
        REVOKE privilege1 ON database_name.table_name FROM 'username'@'host';
        ```
    *   **Example:** Remove the `UPDATE` permission from the `app_user`.
        ```sql
        REVOKE UPDATE ON e_commerce_db.Products FROM 'app_user'@'localhost';
        ```

*   **Best Practices for User Security:**
    *   **Never use the `root` user for your application.** The `root` user is for administration only.
    *   **Create dedicated users for each application** with the minimum permissions required.
    *   **Use specific hosts** (e.g., `app_user@'192.168.1.100'`) instead of the wildcard (`%`) whenever possible to restrict connection locations.
    *   **Always use strong, complex passwords** and change them regularly.
    *   **Periodically audit user privileges** to ensure they are still appropriate.

### **5. Practical Command-Line Usage**

The MySQL command-line client is an essential tool for any developer or administrator.

*   **Connecting to the Server:**
    *   The command `mysql` is used, with flags to specify the user (`-u`), password (`-p`), and optionally the host (`-h`).
    *   **Command:**
        ```bash
        mysql -u <username> -p
        ```
    *   The shell will then prompt you to enter the password securely.
    *   **Example:** Logging in as the `root` user.
        ```bash
        mysql -u root -p
        ```

*   **Essential "Day-to-Day" Commands:**
    *   Once you are logged into the `mysql>` prompt, these commands are your primary tools for navigation and inspection. *Note: All commands inside the MySQL client must end with a semicolon (;).*

    1.  **$\text{SHOW DATABASES;}$**
        *   **Purpose:** Lists all the databases (schemas) that are present on the server and that you have permission to see.
        *   **Usage:**
            ```sql
            SHOW DATABASES;
            ```

    2.  **$\text{USE database\_name;}$**
        *   **Purpose:** Selects a specific database to be your current "working" context. All subsequent commands (like `SHOW TABLES`) will be executed against this database.
        *   **Usage:**
            ```sql
            USE e_commerce_db;
            ```

    3.  **$\text{SHOW TABLES;}$**
        *   **Purpose:** Lists all the tables within the currently selected database.
        *   **Usage:**
            ```sql
            SHOW TABLES;
            ```

    4.  **$\text{DESCRIBE table\_name;}$ (or $\text{DESC table\_name;}$)**
        *   **Purpose:** Shows the structure of a table, including column names, data types, constraints (`KEY`), default values, and whether `NULL` is allowed. This is incredibly useful for understanding a table's schema at a glance.
        *   **Usage:**
            ```sql
            DESCRIBE Users;
            ```

    5.  **$\text{SOURCE /path/to/script.sql;}$**
        *   **Purpose:** Executes a series of SQL commands from an external file. This is extremely useful for setting up a database, loading large amounts of data, or running complex reports without typing or pasting into the console.
        *   **Usage:**
            ```sql
            SOURCE /home/user/sql_scripts/setup_database.sql;
            ```