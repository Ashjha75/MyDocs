---
title : Limit and Offset
---

### **Precise Result Slicing**

This document provides a detailed, interview-focused guide to the `LIMIT` and `OFFSET` clauses. We will cover their fundamental roles in "Top-N" queries and pagination, and then dive deep into the performance pitfalls of `OFFSET` and the superior, professional alternative: Keyset Pagination.

#### **Core Concept: The Final Step**

It is critical to remember that `LIMIT` and `OFFSET` are the very **last** clauses to be applied in a query's logical execution order. The database does all the work first (`FROM`, `WHERE`, `GROUP BY`, `ORDER BY`, etc.) to prepare a complete, sorted, temporary result set. Only then does it use `LIMIT` and `OFFSET` to carve out the final slice of rows to send back to you.

### **1. `LIMIT`: The Top-N Operator**

*   **Concept:** `LIMIT` restricts the maximum number of rows to be returned by a query.
*   **Use Case:** Its primary use is for "Top-N" queries: "Find the 5 most recent orders," "List the top 10 most expensive products," "Show the 3 newest user accounts."

#### **Interview Scenario 1: The `LIMIT` without `ORDER BY` Trap**

This is the most fundamental test of discipline for a SQL developer.

**Interviewer:** "I need a query to get any 5 products from our `Products` table for a homepage display. What would you write?"

**Candidate 1 (Naive and Incorrect):**

```sql
-- INCORRECT QUERY - Unreliable
SELECT ProductID, ProductName FROM Products LIMIT 5;
```
*   **Why it's wrong:** While this query *will* return 5 products, there is **absolutely no guarantee which 5 products it will be**. Relational databases do not store data in any inherent order. Without an `ORDER BY` clause, the database is free to return the 5 rows in whatever way is most convenient for it at that moment. The results could be different every time you run the query, which is a recipe for bugs.

**Candidate 2 (Professional and Disciplined):**

"To get a consistent and meaningful result, we must first define what 'any 5 products' means. Are they the newest? The most popular? The highest rated? A query should never use `LIMIT` without a corresponding `ORDER BY` clause to ensure the results are deterministic. For example, to get the 5 most recently added products, I would write:"

```sql
-- CORRECT QUERY - Deterministic and reliable
SELECT ProductID, ProductName, DateAdded
FROM Products
ORDER BY DateAdded DESC
LIMIT 5;
```
*   **Why it's right:** This query is **deterministic**. It will always return the same 5 products in the same order, guaranteeing a stable result. This answer shows the candidate understands the fundamental principle that **order is not guaranteed unless explicitly requested**.

### **2. `LIMIT` with `OFFSET`: The Foundation of Pagination**

*   **Concept:** The `OFFSET` clause is used with `LIMIT` to skip a specified number of rows before beginning to return the rows. Its sole purpose is to enable page-by-page browsing of a large result set.
*   **Use Case:** Building a paginated API or web interface. "Show me page 3 of the search results, with 20 items per page."

#### **Interview Scenario 2: Implementing Basic Pagination**

**Interviewer:** "Our application UI needs to display all products, 10 per page. Write the queries that would be needed to fetch Page 1 and then Page 3."

**The Logic:** The formula to calculate the offset is: `offset = (page_number - 1) * page_size`.

**Your Expert Answer:**

"Of course. Assuming a `page_size` of 10 and a stable sort order (e.g., by `ProductName`), here are the queries:"

**For Page 1:**
*   `page_number = 1`, `page_size = 10`
*   `offset = (1 - 1) * 10 = 0`

```sql
-- Page 1: Skip 0 rows, take 10
SELECT ProductID, ProductName, Price
FROM Products
ORDER BY ProductName
LIMIT 10 OFFSET 0;
```

**For Page 3:**
*   `page_number = 3`, `page_size = 10`
*   `offset = (3 - 1) * 10 = 20`

```sql
-- Page 3: Skip 20 rows, take 10
SELECT ProductID, ProductName, Price
FROM Products
ORDER BY ProductName
LIMIT 10 OFFSET 20;
```

### **The Ultimate Interview Topic: The `OFFSET` Performance Trap**

This is where you demonstrate senior-level knowledge of how a database actually works.

**Interviewer:** "The pagination system you just described works fine for the first few pages, but users are reporting that accessing page 5,000 is extremely slow. Why is `LIMIT 10 OFFSET 50000` so inefficient, and what is the superior method to solve this?"

**Your Expert Answer:**

"This is a classic scalability problem caused by how `OFFSET` works internally. `OFFSET` is inefficient for high page numbers because the database cannot simply 'jump' to row 50,001.

**The Problem: How `OFFSET` Really Works**
To fulfill the query `LIMIT 10 OFFSET 50000`, the database must:
1.  Fetch **all 50,010 rows** from the disk (`50000` to skip + `10` to return).
2.  Perform the full `ORDER BY ProductName` sort on all 50,010 of these rows.
3.  Load them into memory.
4.  **Discard the first 50,000 rows**.
5.  Return the final 10.

As the page number gets higher, the amount of wasted work the database does grows linearly. This is why page 5,000 is a disaster while page 5 is fast. It's like asking someone to read the 50,001st word in a book; they still have to scan through the first 50,000 words to find it.

**The Solution: Keyset Pagination (also called the "Seek Method")**
The superior, highly scalable solution is to abandon `OFFSET` entirely and use a `WHERE` clause to 'seek' to the correct starting point. This method uses the value of the last row seen on the previous page as a bookmark.

Here's how it works, assuming we are paginating through products ordered by `ProductID` (which must be unique):

**Page 1:** The first query is normal. We get the first 10 products and note that the `ProductID` of the last product is, for example, `15`.

```sql
-- Page 1 Query
SELECT ProductID, ProductName, Price
FROM Products
ORDER BY ProductID
LIMIT 10;

-- Last ProductID returned is 15
```

**Page 2 (The Keyset Method):** Instead of using `OFFSET`, we tell the database to find the next 10 products *after* the last one we saw.

```sql
-- Page 2 Query (NO OFFSET!)
SELECT ProductID, ProductName, Price
FROM Products
WHERE ProductID > 15 -- The bookmark from the previous page
ORDER BY ProductID
LIMIT 10;
```

**Why It's Faster:**
This new query is extremely fast, even for page 5,000. The condition `WHERE ProductID > 15` allows the database to use the index on `ProductID` to jump *instantly* to the correct starting point. It only needs to read and process the 10 rows it's actually going to return, completely avoiding the need to scan and discard 50,000 rows of data. This method has stable, fast performance regardless of how deep the user paginates."