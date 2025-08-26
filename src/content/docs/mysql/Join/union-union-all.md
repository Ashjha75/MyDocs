---
title : Union and Union All
---

### **Mastering `UNION`: The Logic of Consolidation**

#### **1. The "Why": The Philosophy of `UNION`**

The `UNION` operator exists to solve one primary problem: **"How do I combine rows from two or more separate queries that share a similar structure into a single, unified result set?"**

Think of it this way:
*   **`JOIN` makes your data set *wider* by adding columns.**
*   **`UNION` makes your data set *taller* by adding rows.**

This is used when you have data of a similar *type* stored in different tables, or when you need to combine different queries on the same table.

**Business Question:** "I need a single, clean mailing list of all our `Customers` and all of our `Leads`. A person might be in both lists, but I only want to see them once."

You cannot solve this with a `JOIN`. The `Customers` table and the `Leads` table are separate entities. `UNION` is the tool for this job.

#### **2. The Unbreakable Rules of `UNION`**

Before you can combine two `SELECT` statements, they must be compatible. `UNION` has three strict rules:

1.  **Equal Number of Columns:** The `SELECT` statement on the left of the `UNION` and the one on the right must have the exact same number of columns.
2.  **Compatible Data Types:** The data types of the columns in the corresponding positions must be compatible. You can `UNION` an `INT` with a `VARCHAR` (MySQL will implicitly cast them to strings), but you cannot `UNION` a `DATE` with a `BLOB`. It's best practice to ensure the types match as closely as possible.
3.  **Column Names from the First Query:** The final result set will **always** take its column names or aliases from the *first* `SELECT` statement. Column names in subsequent `SELECT` statements are ignored.

#### **3. Visualizing the Mechanics: `UNION` vs. `UNION ALL`**

This is the most critical concept and the source of all interview questions on the topic. The only difference between them is **how they handle duplicate rows.**

Let's imagine two tables:

**`Regular_Customers`**
| Name | Email |
| :--- | :--- |
| John Smith | john@a.com |
| Jane Doe | jane@b.com |

**`Premium_Customers`**
| Name | Email |
| :--- | :--- |
| John Smith | john@a.com |
| Peter Jones | peter@c.com|

---
**`UNION`: The "Distinct" Operator**

A `UNION` operation works in two conceptual steps:
1.  It fetches all rows from the first query and all rows from the second query.
2.  It then performs a costly "distinct" operation, scanning the combined set, finding any duplicate rows (where *every* column is identical), and **discarding them.**

```sql
SELECT Name, Email FROM Regular_Customers
UNION
SELECT Name, Email FROM Premium_Customers;
```

**Final `UNION` Result (Duplicates Removed):**
| Name | Email |
| :--- | :--- |
| John Smith | john@a.com |
| Jane Doe | jane@b.com |
| Peter Jones | peter@c.com|

Notice, John Smith appears only once.

---
**`UNION ALL`: The "All-Inclusive" Operator**

A `UNION ALL` operation is much simpler and faster:
1.  It fetches all rows from the first query.
2.  It fetches all rows from the second query.
3.  It simply appends the second set to the end of the first. **No check for duplicates is ever performed.**

```sql
SELECT Name, Email FROM Regular_Customers
UNION ALL
SELECT Name, Email FROM Premium_Customers;
```

**Final `UNION ALL` Result (Duplicates Included):**
| Name | Email |
| :--- | :--- |
| John Smith | john@a.com |
| Jane Doe | jane@b.com |
| John Smith | john@a.com |
| Peter Jones | peter@c.com|

Notice, John Smith appears twice.

#### **4. Interview Gold: Performance, Use Cases, and Advanced Emulation**

**Q1: What is the primary difference between `UNION` and `UNION ALL`, and which is faster?**

**Your Expert Answer:** "The primary difference is that `UNION` removes duplicate rows from the final result set, while `UNION ALL` includes all rows from all queries.

Because of this, **`UNION ALL` is significantly faster** than `UNION`. The `UNION` operator must perform an expensive sort or hashing operation on the entire combined data set to find and eliminate the duplicates. `UNION ALL` simply appends the data, avoiding this entire step. As a best practice, you should always use `UNION ALL` unless you have a specific business requirement to remove duplicates."

**Q2: Give me a practical business scenario for using `UNION` and another for `UNION ALL`.**

**Your Expert Answer:**
*   **"Scenario for `UNION`:** Creating a master, unique list of contacts for a marketing email campaign. You would `UNION` the `Customers` table, the `Leads` table, and the `Partners` table. You need `UNION` because you don't want to send the same person three emails just because they exist in all three tables. Correctness and uniqueness are the goal.

*   **"Scenario for `UNION ALL`:** Generating a comprehensive audit log. Imagine you have an `Audit_Log_Q1` table and an `Audit_Log_Q2` table. To get a full history, you would use `UNION ALL`. Here, every single event is important, and duplicates might represent a user performing the same action twice, so removing them would destroy information. Performance is also key, and `UNION ALL` is the fastest way to combine these logs."

**Q3: We've discussed that MySQL does not have a native `FULL OUTER JOIN`. How can you emulate one?**

This is an advanced question that combines `JOIN`s and `UNION` to test deep SQL knowledge.

**Your Expert Answer:**
"You can perfectly emulate a `FULL OUTER JOIN` by combining a `LEFT JOIN` and a `RIGHT JOIN` with a `UNION` operator.

The logic is as follows:
1.  The `LEFT JOIN` will get all rows from Table A, plus any matching rows from Table B.
2.  The `RIGHT JOIN` will get all rows from Table B, plus any matching rows from Table A.
3.  The rows that exist in *both* tables (the intersection) are present in both the left and right join results. Using `UNION` (not `UNION ALL`) on these two results will combine them and, crucially, **automatically de-duplicate the intersection**, giving you the clean result of a `FULL OUTER JOIN`.

Here is the pattern:"

```sql
-- Select all customers and any orders they have
SELECT c.FirstName, o.OrderID
FROM Customers AS c
LEFT JOIN Orders AS o ON c.CustomerID = o.CustomerID

UNION -- The key operation that combines and de-duplicates

-- Select all orders and any customers they have
SELECT c.FirstName, o.OrderID
FROM Customers AS c
RIGHT JOIN Orders AS o ON c.CustomerID = o.CustomerID;
```

**Q4: How do you sort the result of a `UNION`?**

**Your Expert Answer:** "An `ORDER BY` clause can only be placed at the very end of the entire `UNION` statement. It operates on the final, combined result set. It's also important to remember that it must refer to the column names or aliases defined in the *first* `SELECT` statement."

```sql
-- Get all customer and lead names, then sort the combined list alphabetically.
SELECT
    Name AS ContactName,
    'Customer' AS Source
FROM Regular_Customers

UNION ALL

SELECT
    Name AS LeadName, -- This alias is ignored
    'Lead' AS Origin -- This alias is ignored
FROM Leads

ORDER BY ContactName ASC; -- Must use the alias from the FIRST select.
```