---
title: Normalization
---


### **The Architecture of Sanity: Database Normalization**

This guide provides a detailed, beginner-friendly, and interview-focused explanation of the first three normal forms. We will start with *why* we need normalization before explaining *how* to do it.

#### **The Philosophy: Why We Normalize**

Imagine you are running a small business and you track everything in a single spreadsheet, like this:

**Un-normalized `Orders` Spreadsheet:**

| OrderID | CustomerID | CustomerName | CustomerEmail | ProductID | ProductName | ProductPrice | Quantity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 101 | 55 | John Smith | john@a.com | P-12 | Laptop | 1200.00 | 1 |
| 101 | 55 | John Smith | john@a.com | P-34 | Mouse | 25.00 | 1 |
| 102 | 82 | Jane Doe | jane@b.com | P-12 | Laptop | 1200.00 | 1 |
| 103 | 55 | John Smith | john@a.com | P-56 | Keyboard | 75.00 | 1 |

This spreadsheet is a disaster waiting to happen. It suffers from three critical problems called **Data Anomalies**:

1.  **Update Anomaly:** John Smith changes his email address. How many rows do you have to update? You have to find every single order he's ever placed and change the email in each one. If you miss one, your data is now inconsistent and unreliable.
2.  **Insertion Anomaly:** A new customer, "Peter Jones," wants to register an account, but hasn't placed an order yet. Where do you store his information? You can't. You can't add him to this table because you don't have an `OrderID`. The structure of the table prevents you from storing valid data.
3.  **Deletion Anomaly:** Jane Doe (`OrderID` 102) decides to cancel her only order. You delete her row. What happens? You have just deleted the only record of Jane Doe's existence from your database. Her name and email are gone forever.

**The Goal of Normalization:** To eliminate these anomalies by structuring our tables in a way that **each piece of information is stored in exactly one place.**

To do this, we need to understand a core concept:

#### **Core Concept: Functional Dependency**

This is the theoretical foundation of normalization. It sounds academic, but it's simple:

> A column `B` has a functional dependency on column `A` if, for any given value of `A`, you can uniquely determine the value of `B`. We write this as **`A -> B`**.

*   **Example:** In our spreadsheet, `CustomerID -> CustomerName`. If I tell you the `CustomerID` is `55`, you know the `CustomerName` must be "John Smith".
*   **Example:** `ProductID -> ProductName`. If I tell you the `ProductID` is `P-12`, you know the `ProductName` must be "Laptop".
*   **Non-example:** `CustomerName -> CustomerID` is *not* a functional dependency, because there could be two customers named "John Smith".

Now, let's begin the step-by-step process of cleaning our data.

### **First Normal Form (1NF): The Rule of Atomicity**

*   **The Rule:** Each column in a table must hold a single, **atomic** value. There can be no repeating groups or multivalued columns.
*   **The Problem it Solves:** It makes data queryable. You cannot easily search for a single value within a column that contains a list of values.

**Violation of 1NF ("Before"):**
Imagine a table where you store a customer's phone numbers in a single field.

| CustomerID | CustomerName | PhoneNumbers |
| :--- | :--- | :--- |
| 55 | John Smith | "555-1234, 555-9876" |
| 82 | Jane Doe | "555-4567" |

This violates 1NF. How would you write a `WHERE` clause to find a specific phone number? It would require messy string parsing (`LIKE '%555-9876%'`).

**Compliance with 1NF ("After"):**
The solution is to ensure each cell has only one value. There are two common ways to achieve this:

**Option 1: Add More Rows**
| CustomerID | CustomerName | PhoneNumber |
| :--- | :--- | :--- |
| 55 | John Smith | "555-1234" |
| 55 | John Smith | "555-9876" |
| 82 | Jane Doe | "555-4567" |

**Option 2 (Better): Create a Separate Table**
This is the more standard approach, which we'll see leads to higher normal forms.
`Customers` Table:
| CustomerID | CustomerName |
| :--- | :--- |
| 55 | John Smith |
| 82 | Jane Doe |

`Customer_PhoneNumbers` Table:
| PhoneNumberID | CustomerID | PhoneNumber |
| :--- | :--- | :--- |
| 1 | 55 | "555-1234" |
| 2 | 55 | "555-9876" |
| 3 | 82 | "555-4567" |

### **Second Normal Form (2NF): The Rule of the "Whole Key"**

*   **Pre-requisite:** The table must already be in 1NF.
*   **The Rule:** All non-key attributes (columns that are not part of the primary key) must be fully functionally dependent on the **entire primary key**.
*   **The Problem it Solves:** It removes redundant data that depends on only *part* of a composite primary key. **Note: 2NF is only a concern for tables that have a composite primary key.** If a table has a single-column primary key, it is automatically in 2NF.

**Violation of 2NF ("Before"):**
Let's look at a table representing student course enrollments. The primary key is `(StudentID, CourseID)`, because that combination uniquely identifies an enrollment.

| StudentID | CourseID | **CourseName** | Grade |
| :--- | :--- | :--- | :--- |
| 101 | C-10 | "Math 101" | A |
| 101 | C-22 | "History 202"| B |
| 102 | C-10 | "Math 101" | C |

*   The Primary Key is `(StudentID, CourseID)`.
*   `Grade` depends on the **whole key**. You need to know both the student and the course to determine the grade. (`(StudentID, CourseID) -> Grade`).
*   `CourseName` depends only on `CourseID`. (`CourseID -> CourseName`). This is a **partial dependency**, which violates 2NF. This causes redundancy; "Math 101" is repeated.

**Compliance with 2NF ("After"):**
We split the table to remove the partial dependency.

`Enrollments` Table:
| StudentID | CourseID | Grade |
| :--- | :--- | :--- |
| 101 | C-10 | A |
| 101 | C-22 | B |
| 102 | C-10 | C |

`Courses` Table:
| CourseID | CourseName |
| :--- | :--- |
| C-10 | "Math 101" |
| C-22 | "History 202"|

Now, `CourseName` is stored only once.

### **Third Normal Form (3NF): The Rule of "Nothing but the Key"**

*   **Pre-requisite:** The table must already be in 2NF.
*   **The Rule:** Every non-key attribute must be dependent *only* on the primary key, and not on any other non-key attribute.
*   **The Problem it Solves:** It removes **transitive dependencies**, where a non-key column depends on another non-key column.

**Violation of 3NF ("Before"):**
Let's extend our `Courses` table. `ProfessorID` depends on `CourseID`. `ProfessorOffice` depends on `ProfessorID`.

| CourseID | CourseName | ProfessorID | **ProfessorOffice** |
| :--- | :--- | :--- | :--- |
| C-10 | "Math 101" | P-5 | "Room 301" |
| C-22 | "History 202"| P-8 | "Room 215" |
| C-30 | "Advanced Math"| P-5 | "Room 301" |

*   The Primary Key is `CourseID`.
*   The `ProfessorOffice` depends on `ProfessorID`. `ProfessorID` depends on `CourseID`.
*   This creates the transitive dependency: `CourseID -> ProfessorID -> ProfessorOffice`. `ProfessorOffice` does not depend directly on the key. If Professor P-5 moves offices, you have to update multiple rows.

**Compliance with 3NF ("After"):**
We split the table again to remove the transitive dependency.

`Courses` Table:
| CourseID | CourseName | ProfessorID |
| :--- | :--- | :--- |
| C-10 | "Math 101" | P-5 |
| C-22 | "History 202"| P-8 |
| C-30 | "Advanced Math"| P-5 |

`Professors` Table:
| ProfessorID | ProfessorOffice |
| :--- | :--- |
| P-5 | "Room 301" |
| P-8 | "Room 215" |

Now, the professor's office is stored only once.

### **Interview Gold: The Summary and Key Questions**

A helpful mnemonic for the first three normal forms is: **"The key, the whole key, and nothing but the key."**

**Q1: What is normalization and why is it important?**
**A:** Normalization is the process of organizing tables in a database to minimize data redundancy and prevent data anomalies (insertion, update, and deletion anomalies). It's important because it improves data integrity, saves space, and makes the database schema more maintainable and scalable.

**Q2: Can you explain 1NF, 2NF, and 3NF in simple terms?**
**A:**
*   **1NF (First Normal Form):** Ensures every column has a single, atomic value. No lists or repeating groups in a cell.
*   **2NF (Second Normal Form):** Builds on 1NF. It requires that all non-key columns depend on the *entire* primary key, not just a part of it. This is only relevant for tables with composite primary keys.
*   **3NF (Third Normal Form):** Builds on 2NF. It requires that non-key columns depend *only* on the primary key, and not on other non-key columns. This removes transitive dependencies.

**Q3: Is it always best to normalize to the highest level possible?**
**A:** Not always. This is a crucial practical point. While 3NF is the standard for most transactional databases (OLTP), there are situations, particularly in data warehousing and reporting (OLAP), where you might intentionally **denormalize** the data. Denormalization involves adding back redundant data to a table to speed up complex queries by reducing the number of expensive `JOIN` operations. It is a trade-off: you sacrifice write efficiency and some data integrity for significantly faster read performance.