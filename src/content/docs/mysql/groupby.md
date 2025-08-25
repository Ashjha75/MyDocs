---
title : Group By
---



#### **The Philosophy of Aggregation**

The purpose of aggregation is to move from a granular, row-level view of data to a high-level summary. Think of the difference between a raw list of every sale transaction for a day and the final "Total Sales for August 25th" number. Aggregation is the process of creating that summary.

The cornerstone of all aggregation is the `GROUP BY` clause.

#### **1. The Cornerstone: `GROUP BY`**

*   **Core Concept:** The `GROUP BY` clause takes all the rows passed to it by the `WHERE` clause and organizes them into "buckets." Each bucket contains rows that have the same value for the column(s) specified in the `GROUP BY` clause.
*   **The Rule:** Once you use `GROUP BY`, your `SELECT` statement can now only contain two things:
    1.  The columns you used to group by (the "buckets").
    2.  Aggregate functions that calculate a value based on the rows *inside* each bucket.

*   **Example:** Let's conceptually group our `Products` table.
    `... FROM Products GROUP BY CategoryID;`
    This creates a set of buckets: one for `CategoryID = 1` (Electronics), one for `CategoryID = 2` (Books), etc. The `Products` rows are placed into their respective buckets.

    ```
    Bucket: CategoryID 1 (Electronics)
    - Row: Laptop
    - Row: Wireless Mouse
    - Row: Monitor

    Bucket: CategoryID 2 (Books)
    - Row: SQL Mastery
    - Row: The Phoenix Project
    ```
    Now, we can ask questions *about each bucket*.

#### **2. The Essential Aggregate Functions**

These functions operate on the collection of rows within each `GROUP BY` bucket.

| Function | Definition | Interview-Level Insight & Example |
| :--- | :--- | :--- |
| **`COUNT()`** | Counts the number of rows. | **This is the most nuanced and important aggregate function.** Your understanding of its three forms is a key differentiator.<br><br>**1. `COUNT(*)`:** Counts **all rows** within the group, including `NULL`s and duplicates. This is the most common form for answering "How many items are in this group?"<br>   `-- Get the number of products in each category`<br>   `SELECT CategoryID, COUNT(*) AS NumberOfProducts FROM Products GROUP BY CategoryID;`<br><br>**2. `COUNT(column_name)`:** Counts all rows where `column_name` is **NOT NULL**. It ignores `NULL`s.<br>   `-- Count how many customers have provided a phone number`<br>   `SELECT COUNT(PhoneNumber) FROM Customers;`<br><br>**3. `COUNT(DISTINCT column_name)`:** Counts the number of **unique, non-NULL** values in the column.<br>   `-- Count how many unique customers placed orders in a given month`<br>   `SELECT COUNT(DISTINCT CustomerID) FROM Orders WHERE OrderDate BETWEEN '...';` |
| **`SUM()`** | Calculates the sum of a numeric column. | Ignores `NULL` values completely. Crucial for financial reporting.<br>`-- Calculate the total dollar amount of sales for each day`<br>`SELECT DATE(OrderDate), SUM(PriceAtPurchase * Quantity) AS DailySales<br>FROM Order_Items i JOIN Orders o ON i.OrderID = o.OrderID<br>GROUP BY DATE(OrderDate);` |
| **`AVG()`** | Calculates the average of a numeric column. | Also ignores `NULL` values. This can be a "gotcha." If a row has a `NULL` score, it is not treated as a zero; it is excluded entirely from the calculation. <br>`-- Find the average price of products in each category`<br>`SELECT CategoryID, AVG(Price) AS AveragePrice FROM Products GROUP BY CategoryID;` |
| **`MIN()` & `MAX()`** | Finds the minimum/maximum value in a column. | Works on numeric, string, and date types. `NULL`s are ignored.<br>`-- Find the date of the earliest and latest order for each customer`<br>`SELECT CustomerID, MIN(OrderDate) AS FirstOrder, MAX(OrderDate) AS LastOrder<br>FROM Orders GROUP BY CustomerID;` |

#### **3. `WHERE` vs. `HAVING`: The Great Filter Divide**

This is one of the most classic and important SQL interview questions. A candidate's ability to articulate the difference clearly demonstrates their understanding of the query execution pipeline.

*   **The Golden Rule:**
    *   `WHERE` filters **rows** *before* they are grouped.
    *   `HAVING` filters **groups** *after* the aggregate functions have been calculated.

**The Logical Query Processing Order (Simplified):**
`FROM` -> **`WHERE`** -> **`GROUP BY`** -> **Aggregate Functions** -> **`HAVING`** -> `SELECT`

**Interview Scenario: The Filtering Test**

**Interviewer:** "I need a list of all product categories that have more than 10 products in them. Which clause would you use to enforce the 'more than 10 products' condition, and why?"

**Candidate 1 (Incorrect, uses `WHERE`):**

```sql
-- THIS QUERY WILL FAIL
SELECT CategoryID, COUNT(*)
FROM Products
WHERE COUNT(*) > 10 -- You cannot use an aggregate function in WHERE
GROUP BY CategoryID;
```
*   **Why it Fails:** The `WHERE` clause is processed *before* `GROUP BY`. At the moment `WHERE` is filtering individual rows, the `COUNT(*)` for a group has not been calculated yet. It doesn't exist. This will result in an "Invalid use of group function" error.

**Candidate 2 (Correct, uses `HAVING`):**

```sql
SELECT
    CategoryID,
    COUNT(*) AS NumberOfProducts
FROM
    Products
GROUP BY
    CategoryID
HAVING
    NumberOfProducts > 10;
```

**Your Expert Explanation:**

"The correct clause to use here is `HAVING`.

1.  First, `FROM Products` gets all the products.
2.  Then, `GROUP BY CategoryID` puts them into their respective category buckets.
3.  For each bucket, the aggregate function `COUNT(*)` is calculated. At this point, we have a temporary result set that looks something like: `(CategoryID=1, Count=25)`, `(CategoryID=2, Count=8)`, `(CategoryID=3, Count=15)`.
4.  Finally, the `HAVING` clause is applied to this new, grouped result set. It checks our calculated alias `NumberOfProducts > 10`. The group for Category 2 (with a count of 8) is discarded.
5.  The final result contains only the groups that passed the `HAVING` condition.

You must use `HAVING` because it operates on the *result* of the aggregation, while `WHERE` operates on the raw data *before* aggregation."

### **Putting It All Together: Advanced Interview Problems**

**Problem 1: Top-Spending Customers**
**Interviewer:** "Write a query to find the `CustomerID` and total amount spent for the top 5 customers who have spent more than $1,000 in total."

**Your Expert Answer:**
"This requires a multi-step aggregation: joining tables, filtering, grouping, filtering the groups, ordering, and finally limiting the result."

```sql
-- (Step 6) Select the final columns
SELECT
    o.CustomerID,
    c.FirstName,
    c.LastName,
    SUM(i.PriceAtPurchase * i.Quantity) AS TotalSpent
-- (Step 1) Start with orders and join to items and customers
FROM
    Orders AS o
JOIN
    Order_Items AS i ON o.OrderID = i.OrderID
JOIN
    Customers AS c ON o.CustomerID = c.CustomerID
-- (Step 2) There is no pre-filtering of rows, so no WHERE clause
-- (Step 3) Group by customer to create a bucket for each one
GROUP BY
    o.CustomerID, c.FirstName, c.LastName
-- (Step 4) Filter the GROUPS, keeping only those who spent over $1000
HAVING
    TotalSpent > 1000.00
-- (Step 5) Order the remaining groups by the total spent to find the top spenders
ORDER BY
    TotalSpent DESC
-- (Step 7) Take only the top 5 from the final, sorted list
LIMIT 5;
```

**Problem 2: Find Products That Have Never Been Sold**
**Interviewer:** "Write a query to find all products that have never appeared in an `Order_Items` record."

**Your Expert Answer:**
"This is a great question that tests relational logic. The most efficient way to solve this is with a `LEFT JOIN` and a `WHERE` clause that looks for `NULL`s."

```sql
SELECT
    p.ProductID,
    p.ProductName
FROM
    Products AS p
LEFT JOIN
    Order_Items AS oi ON p.ProductID = oi.ProductID
WHERE
    oi.ProductID IS NULL;
```
*   **Why it Works:** A `LEFT JOIN` will include all rows from the left table (`Products`), regardless of whether they have a match in the right table (`Order_Items`). If a product has never been sold, the columns from the `Order_Items` side of the join (`oi.ProductID`, etc.) will be `NULL`. The `WHERE oi.ProductID IS NULL` clause then simply filters the result to show only these unmatched products. This is often more performant than using a subquery with `NOT IN`.