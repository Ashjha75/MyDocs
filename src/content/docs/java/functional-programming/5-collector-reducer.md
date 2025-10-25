---
title: "Collector vs Reducer in Java Streams"
---
Collectors and Reduction are powerful terminal operations in Java Streams for aggregating data. The `reduce()` method performs immutable reductions to produce a single result value like sum or maximum, creating new values at each step. The `collect()` method performs mutable reductions, accumulating elements into containers like List, Map, or Set by mutating existing values. Collectors provide pre-built operations for common tasks like grouping, partitioning, joining, and statistical summaries.

***

## Interview Questions & Expert Answers

### 1. Explain the difference between `reduce()` and `collect()`. When would you use each?

**Your Answer:**

The key difference is **mutability** :

- **`reduce()`** - Performs **immutable reduction**, always creating a new value at each step. Returns a single result value
- **`collect()`** - Performs **mutable reduction**, updating/mutating an existing container. Returns a collection or complex structure

**Example showing the difference:**
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// reduce() - creates new Integer at each step, returns single value
int sum = numbers.stream()
    .reduce(0, Integer::sum); // Result: 15

// collect() - mutates a List, returns collection
List<Integer> collected = numbers.stream()
    .collect(Collectors.toList()); // Result: [1, 2, 3, 4, 5]
```

**When to use each** :

**Use `reduce()` when:**
- You need a single result (sum, product, max, min, concatenation)
- The reduction logic is simple and associative
- Working with immutable values

**Use `collect()` when:**
- You need to transform stream into a collection (List, Set, Map)
- You need grouping, partitioning, or complex aggregations
- You want to use pre-built Collectors utilities

The `reduce()` method is more memory efficient for simple aggregations since it doesn't create intermediate containers.

### 2. How would you group employees by department and then count them in each department?

**Your Answer:**

Use `Collectors.groupingBy()` with a downstream collector `counting()`:

```java
Map<String, Long> employeeCountByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,      // Classifier function
        Collectors.counting()          // Downstream collector
    ));

// Result: {IT=15, HR=8, Finance=12, Sales=20}
```

**Breaking it down:**
- `groupingBy(Employee::getDepartment)` - Groups employees by their department field
- `Collectors.counting()` - Counts elements in each group
- Result is `Map<String, Long>` where key is department, value is count

**Alternative without downstream collector** (gives list of employees per department):
```java
Map<String, List<Employee>> empsByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment));
// Then get counts: empsByDept.get("IT").size()
```

The first approach is more efficient as it directly computes counts without storing employee objects.

### 3. What's the difference between `Collectors.toList()` and `Collectors.toCollection()`?

**Your Answer:**

The difference is in **control over the collection type**:

**`Collectors.toList()`:**
- Returns an unspecified List implementation (usually ArrayList)
- No control over which List type is created
- Most commonly used for general cases

```java
List<String> list = stream.collect(Collectors.toList());
// Returns some List implementation - you don't know which
```

**`Collectors.toCollection()`:**
- Lets you specify **exactly which collection type** you want
- Takes a Supplier that creates the collection
- Use when you need specific collection implementation

```java
// Create LinkedList specifically
LinkedList<String> linkedList = stream
    .collect(Collectors.toCollection(LinkedList::new));

// Create TreeSet for sorted unique elements
TreeSet<String> treeSet = stream
    .collect(Collectors.toCollection(TreeSet::new));

// Create specific ArrayList
ArrayList<String> arrayList = stream
    .collect(Collectors.toCollection(ArrayList::new));
```

**When to use each:**
- Use `toList()` when any List implementation is fine (most cases)
- Use `toCollection()` when you need:
  - Specific collection type (LinkedList, TreeSet, etc.)
  - Thread-safe collections (CopyOnWriteArrayList)
  - Custom collection implementations

### 4. How do you partition a list based on a predicate using Collectors?

**Your Answer:**

Use `Collectors.partitioningBy()` which creates a `Map<Boolean, List<T>>` with two entries - true and false:

```java
List<Employee> employees = getEmployees();

// Partition employees by salary > 50000
Map<Boolean, List<Employee>> partitioned = employees.stream()
    .collect(Collectors.partitioningBy(
        emp -> emp.getSalary() > 50000
    ));

List<Employee> highEarners = partitioned.get(true);   // Salary > 50000
List<Employee> lowEarners = partitioned.get(false);   // Salary <= 50000
```

**Key characteristics:**
- Always returns a map with **exactly 2 keys**: `true` and `false`
- Both keys exist even if one list is empty
- More efficient than filtering twice

**With downstream collector** (count instead of list):
```java
Map<Boolean, Long> partitionedCount = employees.stream()
    .collect(Collectors.partitioningBy(
        emp -> emp.getSalary() > 50000,
        Collectors.counting()
    ));

// Result: {false=45, true=55}
```

**Difference from groupingBy:**
- `partitioningBy()` - Binary split (2 groups: true/false)
- `groupingBy()` - Multiple groups based on key function (0 to N groups)

### 5. Write a collector operation to find the average salary by department from an employee list.

**Your Answer:**

Use `groupingBy()` with `averagingDouble()` downstream collector:

```java
Map<String, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.averagingDouble(Employee::getSalary)
    ));

// Result: {IT=75000.0, HR=55000.0, Finance=80000.0}
```

**Breaking it down:**
- `groupingBy(Employee::getDepartment)` - Groups by department
- `averagingDouble(Employee::getSalary)` - Calculates average of salary field
- Returns `Map<String, Double>` with department as key, average as value

**Alternative approaches:**

**With custom collector for more statistics:**
```java
Map<String, DoubleSummaryStatistics> salaryStats = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.summarizingDouble(Employee::getSalary)
    ));

// Access multiple stats
DoubleSummaryStatistics itStats = salaryStats.get("IT");
double avgSalary = itStats.getAverage();
double maxSalary = itStats.getMax();
long count = itStats.getCount();
```

**If you need different numeric types:**
- `averagingInt()` - For int values
- `averagingLong()` - For long values
- `averagingDouble()` - For double values (most flexible)

### 6. Explain `Collectors.groupingBy()` with downstream collectors. Give a nested grouping example.

**Your Answer:**

`groupingBy()` with downstream collectors performs **multi-level aggregations** - first grouping, then applying another operation on each group.

**Basic syntax:**
```java
Collectors.groupingBy(
    classifierFunction,    // How to group
    downstreamCollector    // What to do with each group
)
```

**Simple downstream example:**
```java
// Group by department, then count employees
Map<String, Long> result = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,      // Classifier
        Collectors.counting()          // Downstream
    ));
```

**Nested grouping example** (multi-level hierarchy):

```java
// Group employees by department, then by job level, then collect names
Map<String, Map<String, List<String>>> nestedGroups = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,           // First level: by department
        Collectors.groupingBy(              // Second level: by job level
            Employee::getJobLevel,
            Collectors.mapping(             // Third level: extract names
                Employee::getName,
                Collectors.toList()
            )
        )
    ));

// Result structure:
// {
//   "IT": {
//     "Senior": ["John", "Jane"],
//     "Junior": ["Bob", "Alice"]
//   },
//   "HR": {
//     "Senior": ["Mike"],
//     "Junior": ["Sarah", "Tom"]
//   }
// }
```

**Complex example with multiple downstream collectors:**
```java
// Group by department, find max salary in each
Map<String, Optional<Employee>> highestPaidByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.maxBy(Comparator.comparing(Employee::getSalary))
    ));
```

**Common downstream collectors:**
- `counting()` - Count elements
- `summingInt/Long/Double()` - Sum values
- `averagingInt/Long/Double()` - Calculate averages
- `maxBy/minBy()` - Find max/min
- `mapping()` - Transform then collect
- `filtering()` - Filter then collect

### 7. How would you create a custom collector? What are the five arguments needed?

**Your Answer:**

Create a custom collector using `Collector.of()` with **five arguments**:

**The five components:**
1. **Supplier** - Creates the result container
2. **Accumulator** - Adds element to container
3. **Combiner** - Merges two containers (for parallel streams)
4. **Finisher** - Final transformation of container
5. **Characteristics** - Optimization hints (optional)

**Example - Custom collector to join strings with brackets:**

```java
Collector<String, StringBuilder, String> customCollector = Collector.of(
    // 1. Supplier: Create container
    () -> new StringBuilder("["),
    
    // 2. Accumulator: Add element to container
    (sb, s) -> {
        if (sb.length() > 1) sb.append(", ");
        sb.append(s);
    },
    
    // 3. Combiner: Merge two containers (parallel processing)
    (sb1, sb2) -> {
        if (sb1.length() > 1) sb1.append(", ");
        sb1.append(sb2.substring(1));
        return sb1;
    },
    
    // 4. Finisher: Transform container to final result
    sb -> sb.append("]").toString(),
    
    // 5. Characteristics: Optimization hints
    Collector.Characteristics.CONCURRENT
);

// Usage
String result = Stream.of("A", "B", "C")
    .collect(customCollector);
// Result: "[A, B, C]"
```

**Practical example - Custom collector for immutable list:**

```java
Collector<String, List<String>, List<String>> toImmutableList = Collector.of(
    ArrayList::new,                    // 1. Supplier
    List::add,                         // 2. Accumulator
    (list1, list2) -> {                // 3. Combiner
        list1.addAll(list2);
        return list1;
    },
    Collections::unmodifiableList      // 4. Finisher
);
```

**When characteristics is omitted**, the collector has no special properties. Common characteristics include `CONCURRENT`, `UNORDERED`, and `IDENTITY_FINISH`.

### 8. What's the difference between `summingInt()` and `reducing()` when calculating sums?

**Your Answer:**

Both calculate sums but differ in **purpose, flexibility, and performance**:

**`Collectors.summingInt()`:**
- **Specialized** collector designed specifically for summing integers
- More **readable and concise** for simple sums
- Better **performance** - optimized for numeric summation
- Returns primitive `int` (or `long`, `double`)

```java
int totalSalary = employees.stream()
    .collect(Collectors.summingInt(Employee::getSalary));
```

**`reducing()`:**
- **General-purpose** reduction operation
- More **flexible** - works for any binary operation (sum, multiply, concatenate, etc.)
- Slightly **less efficient** for simple sums
- Returns `Optional<T>` or T depending on overload

```java
int totalSalary = employees.stream()
    .collect(Collectors.reducing(
        0,                              // Identity value
        Employee::getSalary,            // Mapper
        Integer::sum                    // Binary operator
    ));
```

**Key differences:**

| Aspect | summingInt() | reducing() |
|--------|-------------|------------|
| Purpose | Specific to numeric sums | General reduction operations |
| Readability | More readable for sums | More verbose |
| Performance | Optimized for summation | General-purpose |
| Flexibility | Only sums | Any binary operation |
| Use Case | Simple numeric totals | Complex reductions |

**When to use each:**
- **Use `summingInt()`** for straightforward sums - clearer intent and better performance
- **Use `reducing()`** when you need flexibility for non-sum operations or complex custom reductions

**Example where `reducing()` is better:**
```java
// Finding product (can't use summingInt)
int product = numbers.stream()
    .collect(Collectors.reducing(1, (a, b) -> a * b));

// Concatenating with custom logic
String result = words.stream()
    .collect(Collectors.reducing("", (s1, s2) -> s1 + "-" + s2));
```

