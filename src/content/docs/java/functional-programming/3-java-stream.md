---
title: Java Stream API
---

# Java Stream API - Complete Interview Guide

## Summary of Stream API

The Stream API is Java's functional programming feature for processing collections of data in a declarative way. It consists of **intermediate operations** (lazy, return streams, can be chained) like `filter()`, `map()`, `flatMap()` that transform data, and **terminal operations** (eager, trigger execution) like `collect()`, `forEach()`, `reduce()` that produce final results. Streams are single-use, follow lazy evaluation, and support both sequential and parallel processing.
***

``` mermaid
---
config:
  theme: forest
  layout: elk
---
flowchart TD
    A["Collection"] --> B["Step 1:<br>Create Stream"]
    B --> C["Step 2:<br>Intermediate Operations"]
    C --> D["Step 3:<br>Terminal Operations"]
    B --- B_note["At Step 1:<br>Streams are created from a data source<br>like Collection or Array."]
    C --- C_note["At Step 2:<br><br>- Intermediate Operations like:<br>filter(), sorted(), map(), distinct(), etc.<br><br>- These operations transform the stream<br>into another stream.<br><br>- These are Lazy in nature, meaning they<br>execute only when a terminal operation is called."]
    D --- D_note["At Step 3:<br><br>- Terminal Operations like:<br>collect(), reduce(), count(), etc.<br><br>- These trigger stream processing.<br><br>- After Terminal Operation, stream closes and<br>no more operations can be performed."]
``` 

## Interview Questions & Expert Answers

### 1. What's the difference between intermediate and terminal operations? Can you give examples of when a stream would not execute at all?

**Your Answer:**

Intermediate operations like `filter()`, `map()`, `sorted()` are **lazy** - they don't execute immediately and just return another Stream that can be chained. Terminal operations like `collect()`, `forEach()`, `count()` are **eager** - they trigger the actual processing and produce a final result.[2][3][4][5]

A stream won't execute at all if there's no terminal operation. For example:
```java
list.stream()
    .filter(x -> x > 5)
    .map(x -> x * 2); // Nothing happens - no terminal operation
```

This pipeline does nothing because there's no terminal operation to trigger execution.

### 2. Explain the difference between `map()` and `flatMap()`. When would you use each?

**Your Answer:**

`map()` transforms each element **one-to-one** - each input produces one output. `flatMap()` transforms each element **one-to-many** and then **flattens** the result into a single stream.

**Use `map()`** when transforming elements directly:
```java
List<String> names = Arrays.asList("john", "jane");
names.stream().map(String::toUpperCase) // ["JOHN", "JANE"]
```

**Use `flatMap()`** when each element produces multiple values or nested collections:
```java
List<List<Integer>> nested = Arrays.asList(Arrays.asList(1,2), Arrays.asList(3,4));
nested.stream().flatMap(List::stream) // Flattens to [1,2,3,4]
```

For example, if you have a list of sentences and want all words, use `flatMap()` because each sentence splits into multiple words.

### 3. How do `filter()` and `skip()` differ from `limit()`? Can you chain them and what's the order of execution?

**Your Answer:**

- `filter(Predicate)` keeps only elements matching a condition[1][4]
- `skip(n)` skips the first n elements[3][4]
- `limit(n)` keeps only the first n elements[4][3]

Yes, you can chain them and **order matters**:
```java
stream.filter(x -> x > 10)  // Filter first
      .skip(2)               // Skip 2 from filtered results
      .limit(5)              // Take 5 from remaining
```

The operations execute in the order specified. For efficiency, put `filter()` first to reduce data early, then `skip()`, then `limit()`. This is more efficient than limiting first and filtering later.

### 4. What happens if you try to reuse a stream after a terminal operation? Why?

**Your Answer:**

You'll get an **IllegalStateException** with a message like "stream has already been operated upon or closed".[5][4]

```java
Stream<String> stream = list.stream();
stream.count(); // First terminal operation - OK
stream.collect(Collectors.toList()); // ERROR - stream already consumed
```

This happens because streams are designed for **single-use only**. Once a terminal operation executes, the stream is consumed and cannot be reused. This design ensures memory efficiency and prevents unexpected behavior. If you need to perform multiple operations, create a new stream from the source.

### 5. Write a stream operation to find the second highest salary from a list of employees without sorting the entire list.

**Your Answer:**

```java
Optional<Double> secondHighest = employees.stream()
    .map(Employee::getSalary)
    .distinct()
    .sorted(Comparator.reverseOrder())
    .skip(1)
    .findFirst();
```

Or more efficiently without full sorting:
```java
Optional<Double> secondHighest = employees.stream()
    .map(Employee::getSalary)
    .distinct()
    .collect(Collectors.collectingAndThen(
        Collectors.toCollection(() -> new TreeSet<>(Comparator.reverseOrder())),
        set -> set.stream().skip(1).findFirst()
    ));
```

The first approach is simpler and readable. Use `distinct()` to handle duplicate salaries, `sorted()` in reverse order, `skip(1)` to skip the highest, and `findFirst()` to get the second.

### 6. How would you handle exceptions inside stream operations? What are the challenges?

**Your Answer:**

Stream operations don't handle checked exceptions well because functional interfaces like `Function`, `Predicate` don't declare `throws` clauses.

**Challenges:**
- Lambda expressions can't throw checked exceptions directly
- Wrapping in try-catch inside lambda makes code messy
- Breaking the functional programming flow

**Solutions:**

1. **Wrapper method** (cleanest):
```java
public static <T, R> Function<T, R> wrap(CheckedFunction<T, R> fn) {
    return t -> {
        try {
            return fn.apply(t);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    };
}
// Usage: stream.map(wrap(obj::methodThatThrows))
```

2. **Try-catch inside lambda** (simple but verbose):
```java
stream.map(s -> {
    try {
        return Integer.parseInt(s);
    } catch (NumberFormatException e) {
        return 0;
    }
})
```

3. **Filter out failures** using Optional or custom Result type.

### 7. Explain lazy evaluation in streams with a practical example.

**Your Answer:**

Lazy evaluation means intermediate operations don't execute until a terminal operation is called. They just **build a pipeline** of operations that execute only when needed.

**Example:**
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

Stream<Integer> stream = numbers.stream()
    .filter(n -> {
        System.out.println("Filtering: " + n);
        return n > 2;
    })
    .map(n -> {
        System.out.println("Mapping: " + n);
        return n * 2;
    });
// Nothing prints yet - no terminal operation

stream.findFirst(); // NOW operations execute
// Output: Filtering: 1, Filtering: 2, Filtering: 3, Mapping: 3
```

Notice it stops after finding the first match - it doesn't process all elements. This is efficient because it only processes what's necessary. Without lazy evaluation, all elements would be filtered first, then all mapped, wasting resources.

### 8. What's the difference between `findFirst()` and `findAny()`? When would each be more appropriate?

**Your Answer:**

Both return an `Optional` with an element from the stream, but:

- **`findFirst()`** returns the **first element** in the encounter order, guaranteed
- **`findAny()`** returns **any element**, no guarantee which one

**When to use:**

**Use `findFirst()`** when:
- Order matters (sequential streams)
- You need deterministic, reproducible results
- Working with sorted data
```java
stream.filter(x -> x > 10).findFirst() // Always returns the first match
```

**Use `findAny()`** when:
- Order doesn't matter
- Working with **parallel streams** for better performance
- Any matching element is acceptable
```java
parallelStream.filter(x -> x > 10).findAny() // Faster in parallel - returns any match
```
