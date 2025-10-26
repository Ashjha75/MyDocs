---
title: "Java Comparable vs Comparator"
---
Comparable and Comparator are interfaces in Java used for sorting objects. Comparable defines the **natural ordering** of a class by implementing `compareTo()` within the class itself. Comparator provides **external sorting logic** through the `compare()` method, allowing multiple sorting strategies without modifying the original class.

---

## 1. What is Comparable in Java?
Comparable is an interface in Java that allows a class to define its **natural ordering**. When a class implements Comparable, it specifies how its objects should be compared and sorted by default.

```java
public class Student implements Comparable<Student> {
    private String name;
    private int marks;
    @Override
    public int compareTo(Student other) {
        return this.marks - other.marks; // Natural ordering by marks
    }
}
```
---

## 2. Which method does Comparable use and what does it return?
Comparable uses the **`compareTo(T obj)`** method.

**Returns:**
- Negative integer (< 0): Current object is less than the specified object
- Zero (0): Current object is equal to the specified object
- Positive integer (> 0): Current object is greater than the specified object

```java
@Override
public int compareTo(Student other) {
    return this.marks - other.marks;
    // Returns negative if this.marks < other.marks
    // Returns 0 if this.marks == other.marks
    // Returns positive if this.marks > other.marks
}
```
---

## 3. What is Comparator in Java?
Comparator is an interface that provides **external comparison logic** for sorting objects. It's a separate class that defines how to compare two objects without modifying the original class.

```java
class SortByName implements Comparator<Student> {
    @Override
    public int compare(Student s1, Student s2) {
        return s1.getName().compareTo(s2.getName());
    }
}
```
---

## 4. Which method does Comparator use and what does it return?
Comparator uses the **`compare(T obj1, T obj2)`** method.

**Returns:**
- Negative integer: First object should come before second object
- Zero: Both objects are equal in ordering
- Positive integer: Second object should come before first object

```java
@Override
public int compare(Student s1, Student s2) {
    return s1.getMarks() - s2.getMarks();
}
```
---

## 5. What is the key difference between Comparable and Comparator?
| Aspect         | Comparable (compareTo)         | Comparator (compare)         |
|---------------|-------------------------------|-----------------------------|
| Location      | Implemented inside the class   | External class/lambda        |
| Method        | `compareTo(T obj)`             | `compare(T obj1, T obj2)`    |
| Sorting Logic | Single natural ordering        | Multiple custom orderings    |
| Modification  | Requires modifying the class   | No modification needed       |
| Usage         | `Collections.sort(list)`       | `Collections.sort(list, comparator)` |

---

## 6. When would you prefer Comparable?
Use Comparable when:
- You want to define the **default/natural ordering** for your class
- There's **one obvious way** to sort objects (e.g., students by ID, products by price)
- You have **access to modify** the class source code
- You want sorting to work automatically without passing extra parameters

```java
// Once implemented, simple to use
Collections.sort(students); // Uses natural ordering
```
---

## 7. When would you prefer Comparator?
Use Comparator when:
- You need **multiple sorting strategies** (sort by name, age, salary, etc.)
- You **cannot modify** the original class (third-party libraries, legacy code)
- You want **flexibility** to change sorting logic at runtime
- Different parts of your application need different sorting orders

```java
// Multiple sorting strategies
Collections.sort(students, new SortByName());
Collections.sort(students, new SortByMarks());
Collections.sort(students, new SortByAge());
```
---

## 8. Can a class have both Comparable and Comparator sorting?
**Yes!** A class can implement Comparable for natural ordering AND have multiple Comparators for alternative sorting.

```java
// Class with Comparable (natural ordering by ID)
class Employee implements Comparable<Employee> {
    private int id;
    private String name;
    private double salary;
    @Override
    public int compareTo(Employee other) {
        return this.id - other.id; // Natural ordering
    }
}
// Additional Comparators for different sorting
Comparator<Employee> byName = Comparator.comparing(Employee::getName);
Comparator<Employee> bySalary = Comparator.comparing(Employee::getSalary);
// Usage
Collections.sort(employees); // Uses Comparable (by ID)
Collections.sort(employees, byName); // Uses Comparator (by name)
Collections.sort(employees, bySalary); // Uses Comparator (by salary)
```
---

## 9. How do you sort a list using Comparator with Java 8?
Java 8 provides multiple elegant ways:

**Method 1: Lambda expression**
```java
employees.sort((e1, e2) -> e1.getName().compareTo(e2.getName()));
```
**Method 2: Comparator.comparing() with method reference**
```java
employees.sort(Comparator.comparing(Employee::getName));
```
**Method 3: Stream API**
```java
List<Employee> sorted = employees.stream()
    .sorted(Comparator.comparing(Employee::getSalary))
    .collect(Collectors.toList());
```
**Method 4: List.sort() method**
```java
employees.sort(Comparator.comparing(Employee::getName));
```
---

## 10. How do you sort using Comparable with Collections.sort()?
Simply pass the list to `Collections.sort()` without any comparator:

```java
List<Student> students = new ArrayList<>();
students.add(new Student("Alice", 85));
students.add(new Student("Bob", 92));
students.add(new Student("Charlie", 78));
// Sorts using compareTo() method defined in Student class
Collections.sort(students);
// Java 8 alternative
students.sort(null); // Uses natural ordering (Comparable)
```
**Requirement:** The class must implement `Comparable<T>` interface.

---

## 11. Which one supports multiple sorting strategies?
**Comparator** supports multiple sorting strategies. You can create as many Comparators as needed for different sorting criteria without modifying the original class.

```java
// Multiple strategies with Comparator
Comparator<Employee> byName = Comparator.comparing(Employee::getName);
Comparator<Employee> bySalary = Comparator.comparing(Employee::getSalary);
Comparator<Employee> byAge = Comparator.comparing(Employee::getAge);
// Comparable only provides ONE natural ordering
```
---

## 12. Can Comparator sort by multiple fields? Which method is used? (thenComparing())
**Yes!** Comparator can sort by multiple fields using **`thenComparing()`** method for chaining:

```java
// Sort by department, then by salary, then by name
Comparator<Employee> multiFieldComparator = Comparator
    .comparing(Employee::getDepartment)
    .thenComparing(Employee::getSalary)
    .thenComparing(Employee::getName);
employees.sort(multiFieldComparator);
```
**Advanced examples:**
```java
// Reverse order for salary
Comparator<Employee> comparator = Comparator
    .comparing(Employee::getDepartment)
    .thenComparing(Employee::getSalary, Comparator.reverseOrder())
    .thenComparing(Employee::getName);
// Custom comparison for second field
Comparator<Employee> custom = Comparator
    .comparing(Employee::getDepartment)
    .thenComparingDouble(Employee::getSalary)
    .thenComparingInt(Employee::getAge);
```
---

## 13. Where are Comparable and Comparator located (which package)?
- **Comparable**: `java.lang.Comparable` - part of `java.lang` package (no import needed)
- **Comparator**: `java.util.Comparator` - part of `java.util` package (requires import)

```java
// Comparable - no import needed (java.lang package)
public class Student implements Comparable<Student> { }
// Comparator - requires import
import java.util.Comparator;
public class NameComparator implements Comparator<Student> { }
```
---

## 14. Which one defines natural ordering?
**Comparable** defines the natural ordering. Natural ordering is the default way objects of a class should be sorted.

```java
// Comparable defines natural ordering
class Student implements Comparable<Student> {
    @Override
    public int compareTo(Student other) {
        return this.id - other.id; // Natural ordering by ID
    }
}
// Comparator provides alternative/custom ordering
Comparator<Student> byName = Comparator.comparing(Student::getName);
```
**Examples of natural ordering:**
- Integer: ascending numeric order (1, 2, 3...)
- String: alphabetical order (A, B, C...)
- Date: chronological order (oldest to newest)
---

## 15. How do you handle sorting when the field may be null? (nullsFirst / nullsLast)
Use **`Comparator.nullsFirst()`** or **`Comparator.nullsLast()`** to handle null values safely:

**nullsFirst() - Null values appear first:**
```java
Comparator<Employee> comparator = Comparator.nullsFirst(Comparator.comparing(Employee::getName));
employees.sort(comparator); // Result: null employees first, then sorted by name
```
**nullsLast() - Null values appear last:**
```java
Comparator<Employee> comparator = Comparator.nullsLast(Comparator.comparing(Employee::getName));
employees.sort(comparator); // Result: sorted employees first, null employees last
```
**Handling null fields (not null objects):**
```java
// If name field itself can be null
Comparator<Employee> comparator = Comparator.comparing(Employee::getName, Comparator.nullsFirst(String::compareTo));
// Or more concisely
Comparator<Employee> comparator = Comparator.comparing(Employee::getName, Comparator.nullsFirst(Comparator.naturalOrder()));
employees.sort(comparator);
```
**Complete example with multiple fields and null handling:**
```java
Comparator<Employee> safeComparator = Comparator
    .comparing(Employee::getDepartment, Comparator.nullsLast(Comparator.naturalOrder()))
    .thenComparing(Employee::getSalary, Comparator.nullsFirst(Comparator.reverseOrder()))
    .thenComparing(Employee::getName, Comparator.nullsLast(String::compareTo));
employees.sort(safeComparator);
```
**Why this matters:**
Without null handling, sorting with null values throws `NullPointerException`. Using `nullsFirst()` or `nullsLast()` makes your code robust and handles edge cases gracefully.

---
