---
title : Pattern Matching
---


### **Strategic Pattern Matching**

This document provides an interview-focused dissection of the `LIKE` operator. We will explore how to use it for flexible string searches and, more importantly, how to understand and articulate its profound performance implications.

#### **Core Concept**

`LIKE` is the primary tool for performing pattern matching in string columns. It is used in the `WHERE` clause to find strings that "look like" a pattern, rather than being an exact match. Its power comes from two special wildcard characters:

*   **`%` (Percent Sign):** Represents a sequence of **zero or more** arbitrary characters.
*   **`_` (Underscore):** Represents **exactly one** arbitrary character.

#### **Interview Scenario 1: The Everyday Search (Starts With, Contains)**

**Interviewer:** "We need a query to find all customers whose email address is from the 'example.com' domain."

**Candidate 1 (Correct but Naive):**

```sql
SELECT CustomerID, FirstName, Email
FROM Customers
WHERE Email LIKE '%@example.com';
```
*   **Analysis:** This query is functionally correct. It will return the right data. It's a passing answer for a junior role.

**Candidate 2 (Professional and Aware of Data Quality):**

"Certainly. The most direct query is `WHERE Email LIKE '%@example.com'`. However, in a production environment, I'd be cautious about data cleanliness. For instance, there might be leading or trailing whitespace. A more robust query would be:"

```sql
SELECT CustomerID, FirstName, Email
FROM Customers
WHERE TRIM(Email) LIKE '%@example.com';
```
*   **Analysis:** This answer is much stronger. It demonstrates an understanding of real-world data issues (`TRIM()` to remove whitespace) and a proactive, defensive coding mindset. This candidate is thinking about edge cases.

#### **Interview Scenario 2: The Precise Pattern (`_`)**

**Interviewer:** "Our `Products` table has a `ProductSKU` column. SKUs for a specific supplier are always 8 characters long, start with 'ZN', and end with '4'. Write a query to find all products from this supplier."

**Candidate 1 (Uses `%` - Incorrect):**

```sql
-- INCORRECT QUERY
SELECT ProductID, ProductName, ProductSKU
FROM Products
WHERE ProductSKU LIKE 'ZN%4';
```
*   **Why it's wrong:** The `%` matches *zero or more* characters. This query would incorrectly match 'ZN4' (3 characters) or 'ZN-long-string-4' (16 characters) in addition to the correct 8-character SKUs. It fails to enforce the length constraint.

**Candidate 2 (Uses `_` - Correct and Precise):**

```sql
SELECT ProductID, ProductName, ProductSKU
FROM Products
WHERE ProductSKU LIKE 'ZN_____4';
```
*   **Why it's right:** This is the perfect answer. The five underscores `_____` act as placeholders for *exactly five* characters between 'ZN' and '4', guaranteeing that only 8-character SKUs matching the pattern are returned. It shows the candidate knows the full feature set of `LIKE`.

### **The Ultimate Interview Topic: The `LIKE` Performance Trap**

This is the most important concept. Understanding this separates senior-level developers from the rest.

**Interviewer:** "We have a `Logs` table with millions of rows and an indexed `Message` column. A developer has deployed the following query, and it's causing major performance problems: `SELECT * FROM Logs WHERE Message LIKE '%error%';`. Explain in detail *why* this query is so slow and what you would recommend to fix it."

**Your Expert Answer:**

"This query is slow because it uses a **leading wildcard (`%`)**, which makes the query **non-SARGable**. This is the core of the problem.

Here's the detailed breakdown:

1.  **The 'Phone Book' Analogy:** A standard database index, like a B-Tree index on the `Message` column, is structured like a phone book—it's sorted alphabetically from the beginning of the string.

2.  **Why a *Trailing* Wildcard is Fast:** If the query was `WHERE Message LIKE 'error%'`, the database could use the index efficiently. It would be like looking up 'error' in the phone book; it can jump directly to the 'E' section, then to 'ER', and so on, and scan a very small portion of the index to find all matching entries. This is a fast, efficient **Index Seek** or **Index Range Scan**.

3.  **Why the *Leading* Wildcard is Slow:** When the query is `WHERE Message LIKE '%error%'`, we've told the database that the pattern can start with *anything*. In our phone book analogy, this is like being asked to find every person whose name *contains* the letters 'err'. You have no idea where to start looking—not in the 'E' section, not in the 'A' section, not anywhere specific. Your only option is to read the entire phone book from the first page to the last. This is exactly what the database has to do; it is forced to perform a **Full Table Scan**, ignoring the index, reading every single row from the disk, and checking the `Message` string in each one. On a table with millions of rows, this is disastrous for performance.

**Recommendations for a Fix:**

My recommendation depends on the business requirements for the search:

*   **Solution 1 (If Possible): Anchor the Search.** The first question I'd ask is if we can change the search pattern. If we only need to find logs that *start* with the word 'error', we can change the query to `LIKE 'error%'` and it will become extremely fast by using the index.

*   **Solution 2 (The Professional, Real-World Solution): Use the Right Tool.** For true 'contains' searches on large text fields, a standard B-Tree index is the wrong tool for the job. The correct solution is to implement a **Full-Text Search (FTS)** index on the `Message` column. An FTS index is specifically designed for this use case. It works like the index in a search engine, by breaking down the text into individual words and mapping those words to the rows they appear in. A query using the FTS index would be written differently (e.g., using `MATCH() ... AGAINST()`), but it would be orders of magnitude faster than the `LIKE` query with a leading wildcard."

### **Advanced Topic: Escaping Wildcards**

**Interviewer:** "How would you search for a product that literally has '50%' in its name? For example, '50% Off Sale'."

**The Problem:** The `%` character is a wildcard. A query like `WHERE ProductName LIKE '%50%%'` would not work as intended.

**The Solution: The `ESCAPE` clause.**

You can define an escape character that tells `LIKE` to treat the very next character as a literal. The backslash (`\`) is the conventional choice.

```sql
SELECT ProductName
FROM Products
WHERE ProductName LIKE '%50\%%' ESCAPE '\';
```

*   **Explanation:**
    *   `LIKE '%50` - We are looking for any string that ends with '50'.
    *   `\%` - The `\` is our defined escape character. It tells `LIKE`, "The next character, `%`, is not a wildcard. Treat it as the literal percent sign."
    *   `%'` - The final `%` is a normal wildcard, so this would match a name like "Special Offer 50%".
*   **Why this answer is good:** It demonstrates a deep and complete knowledge of the `LIKE` operator's functionality, covering edge cases that many developers are unaware of.