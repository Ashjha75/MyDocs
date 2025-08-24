---
title: DDL commands
---
---
### **Schema Architecture**

This guide covers the DDL commands ($\text{CREATE}$, $\text{ALTER}$, $\text{DROP}$) and the foundational DML command ($\text{INSERT}$) to build and populate our database schema.

### **1. $\text{CREATE TABLE}$: The Blueprint of Data**

The $\text{CREATE TABLE}$ command constructs a new table. The following examples build our entire e-commerce schema, demonstrating not just the basics but also advanced options that ensure data integrity and efficiency.

#### **Table 1: `Customers`**

This table stores user information.

```sql
CREATE TABLE Customers (
    CustomerID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    RegistrationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastModified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Dissection of Advanced Features:**

*   **$\text{INT UNSIGNED}$**: Since a `CustomerID` will never be negative, `UNSIGNED` effectively doubles the positive range of the `INT` data type (from 2.1 billion to 4.2 billion). This is a good practice for IDs.
*   **$\text{AUTO\_INCREMENT}$**: This is a special property for numeric primary keys. It tells MySQL to automatically generate a new, unique number (starting from 1 and incrementing by 1) for this column whenever a new row is inserted. This saves you from having to manually assign unique IDs.
*   **$\text{PRIMARY KEY}$**: This constraint designates `CustomerID` as the unique, non-null identifier for each row.
*   **$\text{NOT NULL}$**: This constraint ensures that columns like `FirstName`, `LastName`, and `Email` must have a value; they cannot be left empty.
*   **$\text{UNIQUE}$**: Applied to the `Email` column, this constraint ensures no two customers can register with the same email address. It's a key business rule enforced by the database.
*   **$\text{DEFAULT CURRENT\_TIMESTAMP}$**: For the `RegistrationDate` column, if no date is provided during an `INSERT`, MySQL will automatically use the current date and time. This is perfect for tracking when a record was created.
*   **$\text{ON UPDATE CURRENT\_TIMESTAMP}$**: This is a powerful feature for the `LastModified` column. It automatically updates the column to the current timestamp whenever any other value in that specific row is modified. It provides a built-in audit trail for changes.

#### **Table 2: `Categories`**
A simple table to classify products.
```sql
CREATE TABLE Categories (
    CategoryID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT NULL
);
```
*No new advanced concepts here, just a clean and simple implementation.*

#### **Table 3: `Products`**
This table holds the items for sale and links to a category.
```sql
CREATE TABLE Products (
    ProductID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    Description TEXT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    StockQuantity INT UNSIGNED NOT NULL DEFAULT 0,
    CategoryID INT UNSIGNED NOT NULL,
    
    CONSTRAINT FK_Product_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    CONSTRAINT CHK_Price CHECK (Price > 0),
    CONSTRAINT CHK_StockQuantity CHECK (StockQuantity >= 0)
);
```
**Dissection of Advanced Features:**

*   **$\text{CONSTRAINT}$ name**: Naming your constraints (e.g., `FK_Product_Category`) is a best practice. It makes error messages clearer and altering or dropping the constraint later much easier.
*   **$\text{FOREIGN KEY (...) REFERENCES ...}$**: This is the core of relational integrity. The `FK_Product_Category` constraint ensures that every `CategoryID` in the `Products` table *must* exist in the `Categories` table's `CategoryID` column. It makes it impossible to assign a product to a non-existent category.
*   **$\text{CHECK}$**: This constraint enforces a business rule at the database level. `CHK_Price` ensures that a product cannot be inserted with a price of zero or less. `CHK_StockQuantity` ensures stock cannot be negative.

#### **Table 4: `Orders`**
The master record for a customer's purchase.
```sql
CREATE TABLE Orders (
    OrderID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT UNSIGNED NOT NULL,
    OrderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',

    CONSTRAINT FK_Order_Customer FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE RESTRICT
);
```
**Dissection of Advanced Features:**

*   **$\text{ENUM}$**: This data type is a string object with a predefined list of allowed values. It's perfect for a `Status` column, ensuring data consistency by preventing typos or invalid states. It's also very efficient in storage.
*   **$\text{ON DELETE RESTRICT}$**: This is part of the foreign key definition and is a critical interview topic. It defines what happens to this `Order` record if the `Customer` it refers to is deleted.
    *   **$\text{RESTRICT}$** (the default): Prevents the deletion of a customer if they have any existing orders. This is the safest option.
    *   **$\text{CASCADE}$**: If the customer is deleted, all their orders are automatically deleted as well. Use with extreme caution.
    *   **$\text{SET NULL}$**: If the customer is deleted, the `CustomerID` in their orders is set to `NULL`. This requires the `CustomerID` column to allow `NULL` values.

#### **Table 5: `Order_Items`**
The linking table that details the contents of each order.
```sql
CREATE TABLE Order_Items (
    OrderItemID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    OrderID INT UNSIGNED NOT NULL,
    ProductID INT UNSIGNED NOT NULL,
    Quantity INT UNSIGNED NOT NULL,
    PriceAtPurchase DECIMAL(10, 2) NOT NULL,

    CONSTRAINT FK_OrderItem_Order FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItem_Product FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE RESTRICT,
    UNIQUE (OrderID, ProductID)
);
```
**Dissection of Advanced Features:**
*   **`PriceAtPurchase`**: Storing the price here is crucial. The price of a product in the `Products` table might change later, but the order record must preserve the price as it was *at the time of the sale*.
*   **`ON DELETE CASCADE`**: Here, using `CASCADE` makes business sense. If an entire order is deleted from the `Orders` table, all the line items associated with that order should be deleted automatically.
*   **Composite `UNIQUE` Key**: The `UNIQUE (OrderID, ProductID)` constraint prevents the same product from being accidentally added twice to the same order. It ensures each product appears only once per order, and its quantity is managed by the `Quantity` field.


### **2. $\text{ALTER TABLE}$: Evolving the Schema**

The `ALTER TABLE` command is used to modify an existing table's structure. This is a common task in software development as requirements change.

| Operation | Syntax | Real-World Example |
| :--- | :--- | :--- |
| **Add a Column** | `ALTER TABLE table_name ADD COLUMN col_name data_type [constraints];` | The business now wants to track a customer's phone number. <br> `ALTER TABLE Customers ADD COLUMN PhoneNumber VARCHAR(20) NULL;` |
| **Drop a Column** | `ALTER TABLE table_name DROP COLUMN col_name;` | The `Description` column in `Categories` is no longer needed. <br> `ALTER TABLE Categories DROP COLUMN Description;` |
| **Modify a Column** | `ALTER TABLE table_name MODIFY COLUMN col_name new_data_type;` | We realize `ProductName` could be longer than 255 characters. <br> `ALTER TABLE Products MODIFY COLUMN ProductName VARCHAR(500) NOT NULL;` |
| **Add a Constraint**| `ALTER TABLE table_name ADD CONSTRAINT name type (column);` | We decide `PhoneNumber` should also be unique. <br> `ALTER TABLE Customers ADD CONSTRAINT UQ_PhoneNumber UNIQUE (PhoneNumber);` |
| **Drop a Constraint**| `ALTER TABLE table_name DROP CONSTRAINT name;` | To drop a foreign key, you need its name. <br> `ALTER TABLE Orders DROP CONSTRAINT FK_Order_Customer;` |

### **3. $\text{DROP}$ vs. $\text{TRUNCATE}$: The Art of Destruction**

This is a classic interview question. Both remove data, but they are fundamentally different.

| Feature | `DROP TABLE Users;` | `TRUNCATE TABLE Users;` | `DELETE FROM Users;` (DML for Comparison) |
| :--- | :--- | :--- | :--- |
| **What it Does** | Removes the data **and** the table structure. | Removes all data, but the table structure **remains**. | Removes rows one by one. |
| **Category** | DDL | DDL | DML |
| **Rollback?** | Cannot be rolled back. | Cannot be rolled back. | Can be rolled back (if inside a transaction).|
| **`AUTO_INCREMENT`** | The value is reset because the table is gone. | The value is reset to the starting value. | The value is **not** reset. |
| **Speed** | Very Fast | **Extremely Fast** (doesn't log individual row deletions) | Can be very slow on large tables. |
| **Triggers?** | `ON DROP` triggers are not fired. | `ON DELETE` triggers are not fired. | `ON DELETE` triggers **are fired** for each row.|
| **`WHERE` Clause?**| Not applicable. | Cannot be used. | Can be used to delete specific rows. |
| **Use Case**| You want to permanently remove a table and its data. | You want to quickly empty a table (e.g., a logging or temp table) and reuse it.| You want to remove specific rows from a table. |


### **4. $\text{INSERT INTO}$: Populating the Schema**

The `INSERT INTO` command adds new rows of data into a table.

#### **Syntax 1: Best Practice (Explicit Columns)**
This method is preferred because it's immune to changes in table column order.
*   **Syntax:**
    ```sql
    INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...);
    ```
*   **Example:**
    ```sql
    INSERT INTO Customers (FirstName, LastName, Email) 
    VALUES ('John', 'Smith', 'john.smith@example.com');
    ```

#### **Syntax 2: Multiple Row Inserts**
This is the most efficient way to insert multiple records at once, as it reduces network overhead and database load.
*   **Syntax:**
    ```sql
    INSERT INTO table_name (column1, column2) VALUES (value1a, value2a), (value1b, value2b), ...;
    ```
*   **Example:** Populating our `Categories` table.
    ```sql
    INSERT INTO Categories (CategoryName, Description) VALUES
    ('Electronics', 'Gadgets, computers, and entertainment systems.'),
    ('Books', 'Physical books and e-books across all genres.'),
    ('Home & Garden', 'Items for home improvement, decor, and gardening.');
    ```