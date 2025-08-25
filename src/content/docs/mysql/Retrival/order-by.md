---
title: Order By
---

### **A Systematic Guide to `ORDER BY` Patterns**

#### **1. Single Field Sorting**

This is the most fundamental use of `ORDER BY`. It sorts the entire result set based on the values in a single column.

*   **Concept:** Sorts all rows by one criterion.
*   **Use Case:** The most common sorting requirement. "Show me the newest customers," "List products from cheapest to most expensive."
*   **Syntax & Example:**
    ```sql
    -- List all customers, with the most recently registered appearing first.
    SELECT CustomerID, FirstName, RegistrationDate
    FROM Customers
    ORDER BY RegistrationDate DESC; -- DESC for descending (newest to oldest)
    ```

#### **2. Multiple Field Sorting**

This is used for creating sub-sorts or logical groupings within the result set. The sorting precedence is strictly left-to-right.

*   **Concept:** Sorts by the first column, then for any rows that are identical in the first column, it sorts them by the second column, and so on.
*   **Use Case:** Hierarchical reports. "Group products by category, and *then* sort them by price."
*   **Syntax & Example:**
    ```sql
    -- List all products. First, group them by category (ascending, 1 -> N).
    -- Within each category group, sort the products from highest price to lowest.
    SELECT ProductID, ProductName, CategoryID, Price
    FROM Products
    ORDER BY
        CategoryID ASC,  -- Level 1 Sort
        Price DESC;      -- Level 2 Sort
    ```

#### **3. Sorting by Function or Expression**

You are not limited to sorting by raw column values. You can sort by the result of a function call or a calculated expression. The alias of a calculated column is also valid here.

*   **Concept:** The database first computes the value of the expression or function for each row, and then sorts the rows based on these computed results.
*   **Use Case:** Sorting on derived data that doesn't exist directly in a column. "Sort users by the length of their name," "Sort products by their profit margin."

*   **Example 1: Sorting by a Function (`LENGTH`)**
    ```sql
    -- List all products, ordered by the length of their name (shortest to longest)
    -- This could be used to find products with suspiciously short or long names.
    SELECT ProductID, ProductName, LENGTH(ProductName) AS NameLength
    FROM Products
    ORDER BY LENGTH(ProductName) ASC;
    ```

*   **Example 2: Sorting by an Expression (using an Alias)**
    ```sql
    -- List all products, ordered by their total inventory value (highest to lowest)
    -- This query identifies the most valuable assets in stock.
    SELECT
        ProductID,
        ProductName,
        (Price * StockQuantity) AS InventoryValue
    FROM
        Products
    ORDER BY
        InventoryValue DESC;
    ```
    *   **Interview Note:** As previously discussed, using the alias is cleaner and more maintainable than repeating the expression (`ORDER BY (Price * StockQuantity)`).

#### **4. Conditional Sorting with `CASE`**

This is an advanced and powerful technique. The `CASE` statement allows you to implement custom, conditional sorting logic that doesn't follow a simple alphabetical or numerical order.

*   **Concept:** You create an artificial value for each row based on your conditions, and then sort the rows based on that artificial value.
*   **Use Case:** Enforcing a specific business priority in the results. "I always want to see 'Processing' orders first, then 'Shipped' orders, and I don't care about the rest."

*   **Syntax & Example:**
    ```sql
    -- List all orders, but enforce a custom sort order based on status.
    -- Priority: 1=Processing, 2=Shipped, 3=Pending, 4=Anything else.
    SELECT OrderID, CustomerID, Status
    FROM Orders
    ORDER BY
        CASE
            WHEN Status = 'Processing' THEN 1
            WHEN Status = 'Shipped'    THEN 2
            WHEN Status = 'Pending'    THEN 3
            ELSE 4
        END ASC,  -- Sort by our custom priority list
        OrderDate DESC; -- For orders with the same status, show the newest first
    ```

#### **5. `NULL` Handling in Sorting**

This is a critical edge case. How a database handles the absence of data in a sort is a frequent source of bugs and interview questions.

*   **Concept:** In MySQL, `NULL` is treated as the lowest possible value. It comes before any actual number, string, or date.
*   **The Implication:**
    *   An **`ASC`** sort will place all `NULL` values at the **top**.
    *   A **`DESC`** sort will place all `NULL` values at the **bottom**.
*   **Use Case:** Understanding this is crucial for any report involving nullable columns, like "most recent login date" or "optional manager ID."

*   **Example & Explanation:**
    ```sql
    -- Find customers who haven't logged in recently.
    -- We want the oldest login dates first.
    SELECT CustomerID, FirstName, LastLogin
    FROM Customers
    ORDER BY LastLogin ASC;

    /*
    RESULT:
    - First, you will see all the customers where LastLogin IS NULL (because NULLs are lowest).
    - Then, you will see the customers with the oldest login dates, progressing to the newest.
    This is often the desired behavior for finding inactive users.
    */
    ```