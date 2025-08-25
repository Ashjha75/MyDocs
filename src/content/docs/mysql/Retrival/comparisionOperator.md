---
title: Comparision Operators
---
### **Comparative Precision**

This guide provides a detailed examination of MySQL's comparison operators. These are the tools used within a `WHERE` clause to test a column's value against a literal or another column, forming the fundamental building blocks of data filtering.

### **1. Standard Equality and Inequality Operators**

These are the most common operators, used for direct value comparisons.

| Operator | Definition | Example Query & Explanation |
| :--- | :--- | :--- |
| **`=`** | **Equal to** | `SELECT OrderID, CustomerID FROM Orders WHERE Status = 'Shipped';` <br> *Returns orders that have the exact status 'Shipped'.* |
| **`!=` or `<>`** | **Not equal to** | `SELECT ProductName, Price FROM Products WHERE CategoryID != 2;` <br> *Returns all products that are not in the 'Books' category (assuming CategoryID 2 is Books).* |
| **`>`** | **Greater than** | `SELECT ProductName, StockQuantity FROM Products WHERE StockQuantity > 100;` <br> *Returns products with a stock level of 101 or more.* |
| **`>=`** | **Greater than or equal to**| `SELECT ProductName, Price FROM Products WHERE Price >= 49.99;` <br> *Returns products with a price of exactly 49.99 or higher.* |
| **`<`** | **Less than** | `SELECT FirstName, LastName, RegistrationDate FROM Customers WHERE RegistrationDate < '2025-01-01 00:00:00';` <br> *Finds all customers who registered before the year 2025.* |
| **`<=`** | **Less than or equal to** | `SELECT OrderItemID, Quantity FROM Order_Items WHERE Quantity <= 1;` <br> *Finds all order line items where only a single unit was purchased.* |
---
### **2. Range and Set Operators**

These operators are essentially convenient, highly readable shortcuts for more complex combinations of standard operators.

#### **A. $\text{BETWEEN ... AND ...}$**

*   **Core Concept:** Checks if a value falls within an **inclusive** range. It is equivalent to `value >= lower_bound AND value <= upper_bound`.
*   **Syntax:**
    ```sql
    SELECT columns FROM table_name WHERE column_name BETWEEN value1 AND value2;
    ```
*   **Practical Example:** Find all products with a price between $20 and $50, inclusive.
    ```sql
    -- Clean and professional
    SELECT ProductID, ProductName, Price
    FROM Products
    WHERE Price BETWEEN 20.00 AND 50.00;

    -- The verbose equivalent
    SELECT ProductID, ProductName, Price
    FROM Products
    WHERE Price >= 20.00 AND Price <= 50.00;
    ```
    *   **Interview Insight:** Using `BETWEEN` demonstrates fluency and makes the query's intent clearer than using two separate comparisons. It's the preferred method for ranges.

#### **B. $\text{IN (...)}$**

*   **Core Concept:** Checks if a value exists within a specified list of values. It is a highly efficient and readable substitute for multiple `OR` conditions.
*   **Syntax:**
    ```sql
    SELECT columns FROM table_name WHERE column_name IN (value1, value2, value3, ...);
    ```
*   **Practical Example:** Retrieve all orders that are in a final state, either 'Delivered' or 'Cancelled'.
    ```sql
    -- Clean, scalable, and professional
    SELECT OrderID, CustomerID, Status
    FROM Orders
    WHERE Status IN ('Delivered', 'Cancelled');

    -- The verbose, harder-to-maintain equivalent
    SELECT OrderID, CustomerID, Status
    FROM Orders
    WHERE Status = 'Delivered' OR Status = 'Cancelled';
    ```
    *   **Interview Insight:** For checking against a list of static values, `IN` is almost always the correct answer. It is easier to read and the database query optimizer can often handle an `IN` list more efficiently than a long chain of `OR`s.
---
### **3. Pattern Matching with `LIKE`**

*   **Core Concept:** The `LIKE` operator is used for pattern matching within string (`VARCHAR`, `TEXT`, etc.) columns. It is not an exact match but a "looks like" match. Its power comes from two wildcard characters.
    *   **`%` (Percent Sign):** Represents zero, one, or multiple characters.
    *   **`_` (Underscore):** Represents a single character.

*   **Practical Examples:**
    1.  **Starts With:** Find all customers whose last name starts with 'S'.
        ```sql
        SELECT FirstName, LastName FROM Customers WHERE LastName LIKE 'S%';
        ```
    2.  **Ends With:** Find all products ending with the word 'System'.
        ```sql
        SELECT ProductName FROM Products WHERE ProductName LIKE '%System';
        ```
    3.  **Contains:** Find any category that has the word 'book' in its name.
        ```sql
        SELECT CategoryName FROM Categories WHERE CategoryName LIKE '%book%';
        ```
    4.  **Specific Pattern:** Find a five-letter product name that starts with 'C' and ends with 'r'.
        ```sql
        SELECT ProductName FROM Products WHERE ProductName LIKE 'C___r';
        ```

*   **Interview Gold: The `LIKE` Performance Trap**
    **Interviewer:** "Your query `SELECT * FROM Products WHERE ProductName LIKE '%System';` is slow. Why? And how would you address it?"
    **Your Answer:** "The query is slow because it uses a **leading wildcard (`%`)**. A standard B-Tree index on the `ProductName` column is organized alphabetically, like a phone book. When the search pattern starts with a fixed string, like `'S%'`, the database can use the index to jump directly to the 'S' section and scan from there. However, when the pattern starts with a wildcard, the database has no starting point in the index. It is forced to perform a **full table scan**, reading every single row in the table and checking the `ProductName` to see if it matches. To address this, if possible, we should anchor the search to the beginning of the string. If that's not possible and this is a critical search feature, a more advanced solution like a Full-Text Search index would be required."


---

### **4. The Ultimate Interview Topic: Handling `NULL` with Comparisons**

This concept is the dividing line between a novice and a professional. Misunderstanding how `NULL` behaves with comparison operators is the source of countless subtle, dangerous bugs.

*   **The Core Philosophy:** `NULL` does not represent a value. It represents the **absence of a value**. It is "unknown," "not applicable," or "missing." Because it is not a value, it cannot be compared to any other value, including another `NULL`.

*   **The Three-Valued Logic Trap:** SQL operations don't just result in `TRUE` or `FALSE`. When `NULL` is involved, there is a third result: **`UNKNOWN`**. The `WHERE` clause will only include rows where the condition evaluates to `TRUE`. `FALSE` and `UNKNOWN` are both filtered out.

This leads to the following behavior, which you must commit to memory:
*   `5 = NULL` is **UNKNOWN**
*   `5 != NULL` is **UNKNOWN**
*   `NULL = NULL` is **UNKNOWN**

#### **A. The Correct Operators: `IS NULL` and `IS NOT NULL`**

Because standard operators fail, SQL provides a special set of operators designed *exclusively* for handling the absence of a value.

| Operator | Definition | Example Query & Explanation |
| :--- | :--- | :--- |
| **`IS NULL`** | **Tests if a value is `NULL`** | `SELECT CustomerID, FirstName, Email FROM Customers WHERE PhoneNumber IS NULL;` <br> *This is the **only correct way** to find all customers for whom we have no phone number on record.* |
| **`IS NOT NULL`** | **Tests if a value is not `NULL`** | `SELECT CustomerID, FirstName, PhoneNumber FROM Customers WHERE PhoneNumber IS NOT NULL;` <br> *This is the **only correct way** to find all customers who have provided a phone number.* |

#### **B. Interview Scenario: The `NOT EQUAL` Blind Spot**

This is a classic "gotcha" question designed to test your understanding of three-valued logic.

**Interviewer:** "Write a query to find all orders that are **not** in a 'Shipped' status."

**Candidate 1 (Incorrect):** This is the most common, intuitive, but dangerously wrong answer.

```sql
-- INCORRECT QUERY
SELECT OrderID, Status
FROM Orders
WHERE Status != 'Shipped';
```
*   **Why it's wrong:** Let's imagine a corrupted or incomplete `Orders` record where the `Status` column is accidentally `NULL`.
    *   For a row with `Status = 'Delivered'`, the condition `'Delivered' != 'Shipped'` evaluates to `TRUE`, and the row is correctly returned.
    *   For a row with `Status = 'Shipped'`, the condition `'Shipped' != 'Shipped'` evaluates to `FALSE`, and the row is correctly excluded.
    *   **For a row with `Status = NULL`**, the condition `NULL != 'Shipped'` evaluates to **`UNKNOWN`**. Because the `WHERE` clause only accepts `TRUE`, **this row is incorrectly excluded**. The query fails to return an order that is, by definition, not in a 'Shipped' status.

**Candidate 2 (Correct):** This candidate demonstrates professional paranoia and precision by accounting for `NULL`s.

```sql
-- CORRECT QUERY
SELECT OrderID, Status
FROM Orders
WHERE Status != 'Shipped' OR Status IS NULL;
```
*   **Why it's right:** This query correctly handles all possibilities. It builds a result set from rows that meet one of two criteria:
    1.  The `Status` column has a value, and that value is not 'Shipped'.
    2.  The `Status` column has no value at all (`NULL`).
This logic is robust and correctly fulfills the business request.

#### **C. The Specialist: The `NULL`-Safe Equal To Operator (`<=>`)**

This is an advanced, MySQL-specific operator that demonstrates deep platform knowledge. It is known as the "spaceship operator."

*   **Core Concept:** The `<=>` operator performs an equality comparison like the standard `=` operator but with one crucial difference: **it treats two `NULL` values as equal and returns `TRUE` (1) instead of `UNKNOWN`**. It will never return `UNKNOWN`.

Let's see the difference in practice:

| Comparison | Result with `=` | Result with `<=>` | Explanation |
| :--- | :--- | :--- | :--- |
| `5 = 5` | `TRUE` | `1` (`TRUE`) | Behaves identically for non-null values. |
| `5 = NULL` | `UNKNOWN` | `0` (`FALSE`) | Correctly identifies that a value is not equal to `NULL`. |
| `NULL = NULL`| `UNKNOWN` | `1` (`TRUE`) | **This is the key difference.** It allows you to check if two fields are both `NULL`.|

*   **Practical Use Case:** Imagine you are comparing records between a staging table (`Products_Staging`) and a production table (`Products`) to find changes. You need to check if the `Description` has changed.

    ```sql
    -- Find products where the description has changed, correctly handling cases
    -- where one or both descriptions might be NULL.
    SELECT p.ProductID
    FROM Products p
    JOIN Products_Staging s ON p.ProductID = s.ProductID
    WHERE NOT (p.Description <=> s.Description);
    ```
    *   If you had used `p.Description != s.Description`, you would miss cases where a description went from a value to `NULL` or vice versa. The `<=>` operator handles all `NULL` permutations correctly and elegantly. Using it in an interview shows a very high level of MySQL-specific expertise.

