---
title: Logical Operators
---

### **Logical Precision**

This document provides a deep dive into MySQL's logical operators. These are the conjunctions and negations that allow you to build sophisticated, multi-part filtering conditions in your `WHERE` clause.

### **1. $\text{AND}$: The Operator of Intersection**

*   **Core Concept:** The `AND` operator requires that **all** conditions it connects must be true for a row to be returned. Think of it as a series of gates; a row must pass through every gate to be included in the result.

*   **Syntax:**
    ```sql
    SELECT columns FROM table_name WHERE condition1 AND condition2 AND ... conditionN;
    ```

*   **Practical Example:** Find all products that are in the 'Electronics' category (CategoryID = 1) and have a stock quantity of less than 10.

    ```sql
    SELECT
        ProductID,
        ProductName,
        StockQuantity
    FROM Products
    WHERE
        CategoryID = 1
        AND StockQuantity < 10;
    ```
    *   **Explanation:** A product will only appear in this list if it satisfies *both* the category requirement *and* the low stock requirement simultaneously.

### **2. $\text{OR}$: The Operator of Union**

*   **Core Concept:** The `OR` operator requires that **at least one** of the conditions it connects is true. A row only needs to pass through one of the gates to be included.

*   **Syntax:**
    ```sql
    SELECT columns FROM table_name WHERE condition1 OR condition2 OR ... conditionN;
    ```

*   **Practical Example:** Find all orders that have a status of 'Cancelled' or a status of 'Pending'.

    ```sql
    SELECT
        OrderID,
        OrderDate,
        Status
    FROM Orders
    WHERE
        Status = 'Cancelled'
        OR Status = 'Pending';
    ```
    *   **Explanation:** This retrieves any order that is either cancelled or pending. Using the `IN` operator (`WHERE Status IN ('Cancelled', 'Pending')`) is a more concise way to write this specific query, but `OR` is essential when the conditions involve different columns.

### **3. The Interview Gold Mine: `AND` vs. `OR` Precedence**

This is the most critical concept in this guide and a frequent source of interview questions and real-world bugs.

*   **The Rule:** In SQL, the **$\text{AND}$ operator is always evaluated before the $\text{OR}$ operator**.
*   **The Problem:** Without explicitly telling the database how to group conditions, you will get logical errors.
*   **The Solution:** **Always use parentheses `()` to group your conditions whenever you mix `AND` and `OR` in the same `WHERE` clause.** Treat them as mandatory for clarity and correctness.

#### **Interview Scenario**

**Interviewer:** "Write a query to find all products that meet one of the following criteria:
1.  They are in the 'Electronics' category (ID 1) and cost more than $1000.
2.  They are completely out of stock (StockQuantity = 0), regardless of category."

**Candidate 1 (Incorrect):** This candidate writes the query as they heard it, without considering precedence.

```sql
-- INCORRECT QUERY
SELECT ProductID, ProductName, CategoryID, Price, StockQuantity
FROM Products
WHERE CategoryID = 1 AND Price > 1000.00 OR StockQuantity = 0;
```
*   **Why it's wrong:** Because `AND` is evaluated first, MySQL interprets this query as: "Find a product where (`CategoryID = 1 AND Price > 1000.00`) is true, OR (`StockQuantity = 0`) is true." This is actually the correct logic for the request, but it's a happy accident. The interviewer will press further.

**Interviewer:** "Okay, now modify that. Find all 'Electronics' products that are either over $1000 *or* are out of stock."

**Candidate 1 (Still Incorrect):** The candidate again writes the query without parentheses.

```sql
-- INCORRECT QUERY
SELECT ProductID, ProductName, CategoryID, Price, StockQuantity
FROM Products
WHERE CategoryID = 1 AND Price > 1000.00 OR StockQuantity = 0;
```
*   **The Error:** The query is identical to the one before, but the intent is now different. The candidate *wants* the logic to be: `CategoryID = 1 AND (Price > 1000.00 OR StockQuantity = 0)`. But the database still evaluates it as `(CategoryID = 1 AND Price > 1000.00) OR StockQuantity = 0`. This query would incorrectly include a book that is out of stock, which violates the "Find all 'Electronics' products" part of the request.

**Candidate 2 (Correct):** This candidate demonstrates professional discipline by using parentheses to declare their intent explicitly.

```sql
-- CORRECT QUERY for the second request
SELECT ProductID, ProductName, CategoryID, Price, StockQuantity
FROM Products
WHERE CategoryID = 1 AND (Price > 1000.00 OR StockQuantity = 0);
```
*   **Why it's right:** The parentheses force the `OR` condition to be evaluated first. The database will first find all products that are either over $1000 or out of stock. From that temporary result set, it will then keep only the ones that *also* belong to Category 1. This query is unambiguous and correct.

### **4. $\text{NOT}$: The Operator of Negation**

*   **Core Concept:** The `NOT` operator inverts the result of any boolean expression. It's used to find rows that *do not* match a condition. It can be used directly or through shorthand operators (`!=`, `<>`, `NOT IN`, `NOT LIKE`, etc.).

*   **Syntax:**
    ```sql
    SELECT columns FROM table_name WHERE NOT (condition);
    ```

*   **Practical Example:** Find all orders that are not 'Delivered'.
    ```sql
    -- Using NOT IN (cleanest approach)
    SELECT OrderID, Status FROM Orders WHERE Status NOT IN ('Delivered');

    -- Using NOT directly
    SELECT OrderID, Status FROM Orders WHERE NOT (Status = 'Delivered');

    -- Using the inequality operator
    SELECT OrderID, Status FROM Orders WHERE Status != 'Delivered';
    ```

#### **Interview Gold Mine #2: The `NULL` Trap with `NOT`**

This is a subtle but critical concept that separates intermediate from advanced SQL users.

*   **The Rule:** A condition involving `NULL` (e.g., `PhoneNumber = '+1'`) does not evaluate to `TRUE` or `FALSE`; it evaluates to **`UNKNOWN`**. The `WHERE` clause only returns rows that evaluate to `TRUE`.
*   **The Implication:** The `NOT` operator on `UNKNOWN` also results in `UNKNOWN`. `NOT (UNKNOWN)` is still `UNKNOWN`. Therefore, rows with `NULL` in the column you are negating will **not be returned**.

**Interview Scenario**

**Interviewer:** "We added a nullable `PhoneNumber` column to the `Customers` table. Write a query to find all customers who are **not** located in the United States. Assume US phone numbers start with `+1`."

**Candidate 1 (Incorrect):** This candidate writes a seemingly logical query.

```sql
-- INCORRECT QUERY
SELECT CustomerID, FirstName, PhoneNumber
FROM Customers
WHERE PhoneNumber NOT LIKE '+1%';
```
*   **Why it's wrong:** This query will check every `PhoneNumber`.
    *   If the number is `+44...` (UK), `NOT LIKE '+1%'` is `TRUE`, and the row is returned.
    *   If the number is `+1...` (US), `NOT LIKE '+1%'` is `FALSE`, and the row is excluded.
    *   **If the `PhoneNumber` is `NULL`**, the condition `PhoneNumber LIKE '+1%'` evaluates to `UNKNOWN`. Therefore, `NOT (UNKNOWN)` also evaluates to `UNKNOWN`, and **the row is excluded**.
*   **The Error:** This query fails to identify customers for whom we have no location data (`NULL`) as being "not in the US".

**Candidate 2 (Correct):** This candidate understands how `NULL` behaves and explicitly handles it.

```sql
-- CORRECT QUERY
SELECT CustomerID, FirstName, PhoneNumber
FROM Customers
WHERE
    PhoneNumber NOT LIKE '+1%'
    OR PhoneNumber IS NULL;
```
*   **Why it's right:** This query correctly retrieves rows that meet either of two conditions:
    1.  The phone number is present and does not start with '+1'.
    2.  The phone number is `NULL` (missing entirely).
This perfectly matches the business requirement.
### **Summary of Logical Operators**

| Operator | Purpose | Key Takeaway / Interview Tip |
| :--- | :--- | :--- |
| **`AND`** | Intersects conditions. All must be true. | Straightforward, but its high precedence is the key. |
| **`OR`** | Unites conditions. At least one must be true. | Its lower precedence is a common source of bugs. |
| **Precedence** | `()` -> `NOT` -> `AND` -> `OR` | **Never rely on default precedence.** Always use parentheses `()` when mixing `AND` and `OR` to make your logic explicit and correct. |
| **`NOT`** | Negates a condition. | Beware the `NULL` trap. A `NOT` condition on a `NULL`able column will exclude the `NULL`s. You must explicitly check for them with `OR ... IS NULL`. |