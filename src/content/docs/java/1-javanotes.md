---
title: "Java Arrays: Concepts & Usage"

---

### Best Practices & Important Points
- Arrays in Java are always fixed-size; resizing creates a new array.
- For most dynamic use cases, prefer `ArrayList` or another `List` implementation.
- `copyOf()` and similar methods are shallow copies; for arrays of objects, only references are copied.
- For multi-dimensional arrays, resizing requires manual logic for each dimension.
- When performance is critical and the size is known, use arrays. For flexibility, use lists.

**Summary:**
Use `Arrays.copyOf()` for simple, one-time resizing of one-dimensional arrays. For dynamic, frequent resizing, use `ArrayList` or another collection. Always consider the trade-offs between performance, memory, and code clarity.


# Java Arrays: Concepts & Usage

Arrays in Java are fixed-size, contiguous memory containers for storing multiple values of the same type. They provide fast, index-based access and are fundamental for efficient data handling.

## Key Features

- Arrays are objects and a subtype of `Object`.
- The `.length` attribute gives the array size.
- Arrays are strongly typed; all elements must share the same data type.
- Indexing starts at `0` (zero-based).
- Can store primitives or objects, but only one type per array instance.
- Arrays can be declared as `static`, `final`, or passed as method arguments.
- Size must be specified as an `int`.
- Arrays are `Cloneable` and `Serializable`.

## Declaring Arrays

You can declare arrays in two ways:

```java
DataType[] arrayName;
// or
DataType arrayName[];

// Examples
int[] a1;
int[] a2 = {1, 2, 3};
int[] a3 = new int[]{1, 2, 3};
```

## Concatenating Arrays

There are several ways to combine arrays in Java:

### 1. Using a Loop
Manually copy elements from each array:
```java
for (int i = 0; i < array1.length; i++) {
    result[i] = array1[i];
}
for (int j = 0; j < array2.length; j++) {
    result[array1.length + j] = array2[j];
}
```

### 2. Using `System.arraycopy()`
Efficiently copy array contents:
```java
System.arraycopy(array1, 0, result, 0, array1.length);
System.arraycopy(array2, 0, result, array1.length, array2.length);
```

### 3. Using Java 8 Streams
Functional approach for primitives:
```java
int[] result = IntStream.concat(Arrays.stream(array1), Arrays.stream(array2)).toArray();
```

for other types:

- `IntStream`
- `LongStream`
- `DoubleStream`

---
## Notes: Splitting Arrays in Java

Splitting arrays is a common task in Java, and there are several practical approaches:

- **Arrays.copyOfRange()** is the primary API for splitting arrays. It creates a new array from a specified range of the original, using `System.arraycopy()` internally.
    - Syntax: `Arrays.copyOfRange(original, from, to)`
    - `from` is inclusive, `to` is exclusive. If `to` exceeds the array length, extra elements are filled with default values (e.g., `0` for int, `false` for boolean, `null` for objects).
    - Throws `IllegalArgumentException` if `from > to`.

- **Splitting at a specific index:**
    - Use `Arrays.copyOfRange(original, 0, index)` for the first part, and `Arrays.copyOfRange(original, index, original.length)` for the second.

- **Splitting in half:**
    - Calculate the midpoint: `int splitSize = original.length / 2;`
    - Use `copyOfRange` for each half.

- **Splitting into N parts:**
    - Iterate over the array in chunks of size N, using `copyOfRange` for each chunk.
    - If there are leftover elements, create a final array for the remainder.
    - Example utility method:
      ```java
      public static <T> List<T[]> splitArray(T[] array, int splitSize) {
          int numberOfArrays = array.length / splitSize;
          int remainder = array.length % splitSize;
          int start = 0, end = 0;
          List<T[]> list = new ArrayList<>();
          for (int i = 0; i < numberOfArrays; i++) {
              end += splitSize;
              list.add(Arrays.copyOfRange(array, start, end));
              start = end;
          }
          if (remainder > 0) {
              list.add(Arrays.copyOfRange(array, start, start + remainder));
          }
          return list;
      }
      ```

**Tips:**
- Always check array bounds when splitting.
- For primitive arrays, use utility methods to convert to object arrays if needed.
- Use `Arrays.toString()` for easy printing of array contents.

Splitting arrays efficiently is essential for many algorithms and data processing tasks in Java.
## Notes: Resizing Arrays in Java

Resizing arrays is a common need, but Java arrays are fixed-size. Here are the best approaches:

### 1. Using `java.util.Arrays.copyOf()`
- `copyOf(originalArray, newLength)` creates a new array of the specified length and copies elements from the original.
- If the new array is smaller, extra elements are truncated. If larger, new slots are filled with default values (`null` for objects, `0` for numbers, `false` for booleans).
- The resulting array is the same type as the original.
- Only works for one-dimensional arrays. For multi-dimensional arrays, you must implement custom logic.

**Example:**
```java
String[] originalArray = {"A", "B", "C", "D", "E"};
String[] resizedArray = Arrays.copyOf(originalArray, 10);
resizedArray[5] = "F";
System.out.println(Arrays.toString(resizedArray));
// Output: [A, B, C, D, E, F, null, null, null, null]
```

### 2. Using `ArrayList` for Dynamic Resizing
- If you need frequent resizing, consider using `ArrayList` instead of arrays.
- `ArrayList` is dynamically resizable, supports index-based access, and offers good performance for most use cases.
- You can convert an array to a list and add/remove elements as needed.

**Example:**
```java
String[] originalArray = {"A", "B", "C", "D", "E"};
ArrayList<String> list = new ArrayList<>(Arrays.asList(originalArray));
list.add("F");
System.out.println(list);
// Output: [A, B, C, D, E, F]
```

## Notes: Removing Items from Arrays in Java
Note that theoretically, we can remove an array item in two ways:

`Create a new array` and copy all items from the original array, except the index or item to be deleted, into a new array. It creates a new array so it may not be a good fit for large-size arrays that require a sizable amount of memory. In this technique, the original array is unaffected.

`Overwrite all the array index locations` with the value stored in its next index, starting from index to be deleted to the end of the array. This effectively removes the item at the specified index.
As we do not create a new array, it is more memory efficient. Note that we might want to replace the last index location value with null so that we do not duplicate items in the last of the array.

Removing elements from arrays in Java can be done in several ways, each with its own trade-offs:

### 1. Using Apache Commons ArrayUtils
The `ArrayUtils` class (from Apache Commons Lang) provides convenient methods for removing elements. All methods return a new array; the original is not modified.

- `remove(array, index)`: Removes the element at the specified index. Throws `IndexOutOfBoundsException` if the index is invalid.
- `removeAll(array, indices...)`: Removes all elements at the specified indices.
- `removeElement(array, item)`: Removes the first occurrence of the specified item.
- `removeElements(array, items...)`: Removes specified items (in specified quantities).
- `removeAllOccurrences(array, item)`: Removes all occurrences of the specified item.

**Examples:**
```java
Integer[] originalArray = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
Integer[] reducedArray = ArrayUtils.remove(originalArray, 5); // [0, 1, 2, 3, 4, 6, 7, 8, 9]

Integer[] reducedArray2 = ArrayUtils.removeAll(originalArray, 5, 6, 7); // [0, 1, 2, 3, 4, 8, 9]

Integer[] reducedArray3 = ArrayUtils.removeElement(originalArray, 7); // [0, 1, 2, 3, 4, 5, 6, 8, 9]

Integer[] arr = {1, 1, 2, 2, 3, 3, 3, 4, 4, 4};
Integer[] reducedArray4 = ArrayUtils.removeElements(arr, 1, 2, 3); // [1, 2, 3, 3, 4, 4, 4]
Integer[] reducedArray5 = ArrayUtils.removeElements(arr, 1, 1, 2, 2, 3); // [3, 3, 4, 4, 4]
Integer[] reducedArray6 = ArrayUtils.removeAllOccurrences(arr, 4); // [1, 1, 2, 2, 3, 3, 3]
```

### 2. Using Collections (ArrayList)
Convert the array to a `List` for flexible removal operations, then convert back to an array if needed.

**Examples:**
```java
Integer[] originalArray = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
List<Integer> tempList = new ArrayList<>(Arrays.asList(originalArray));
tempList.remove(7); // Remove by index
tempList.removeAll(Collections.singleton(5)); // Remove all occurrences of 5
Integer[] reducedArray = tempList.toArray(new Integer[0]);
```

### 3. In-Place Removal and Shifting
For memory-sensitive applications, you can remove an item by shifting subsequent elements left and (optionally) setting the last element to `null`.

**Example:**
```java
Integer[] originalArray = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
removeIndexAndShift(originalArray, 6);
// Result: [0, 1, 2, 3, 4, 5, 7, 8, 9, null]

static <T> void removeIndexAndShift(T[] array, int indexToRemove) {
    for (int i = indexToRemove; i < array.length - 1; i++) {
        array[i] = array[i + 1];
    }
    array[array.length - 1] = null; // Optional: clear duplicate at end
}
```

## Notes: Finding, Counting, and Removing Duplicates in Java Arrays

Learn how to find, count, and remove duplicate elements from an array in Java using Streams, Maps, and Sets from the Collections framework.

### Example Array

```java
Integer[] numArray = new Integer[]{1, 2, 3, 4, 5, 1, 3, 5};
```

---

### 1. Using Stream and Map

- **Count occurrences:** Use `Collectors.groupingBy` to map each element to its count.
- **Find duplicates:** Filter map entries where count > 1.
- **Find uniques:** Filter map entries where count == 1.

```java
Map<Integer, Long> map = Arrays.stream(numArray)
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));  // {1=2, 2=1, 3=2, 4=1, 5=2}

// Count duplicates
long duplicateCount = map.keySet()
    .stream()
    .filter(k -> map.get(k) > 1)
    .count();

System.out.println("Count of duplicate elements : " + duplicateCount);   

// Get duplicate elements
Integer[] duplicateElementsArray = map.keySet()
    .stream()
    .filter(k -> map.get(k) > 1)
    .toArray(Integer[]::new);

System.out.println("Duplicate elements in the array : " + Arrays.toString(duplicateElementsArray));

// Get unique elements
Integer[] uniqueElementsArray = map.keySet()
    .stream()
    .filter(k -> map.get(k) == 1)
    .toArray(Integer[]::new);

System.out.println("Unique elements in the array : " + Arrays.toString(uniqueElementsArray));
```

**Sample Output:**
```
Count of duplicate elements : 3
Duplicate elements in the array : [1, 3, 5]
Unique elements in the array : [2, 4]
```

---

### 2. Using Stream and Set

- **Find duplicates:** Use a `HashSet` and filter elements that can't be added (already present).
- **Find uniques:** Remove all duplicates from the set.

```java
Set<Integer> distinctElementsSet = new HashSet<>();
Integer[] duplicateElementsArray = Arrays.stream(numArray)
        .filter(e -> !distinctElementsSet.add(e))
        .toArray(Integer[]::new);

System.out.println("Duplicate elements in the array : " + Arrays.toString(duplicateElementsArray));  // [1, 3, 5]

int duplicateCount = duplicateElementsArray.length;
System.out.println("Count of duplicate elements : " + duplicateCount);   // 3

// Remove duplicates to get unique elements
distinctElementsSet.removeAll(Arrays.asList(duplicateElementsArray));
Integer[] uniqueElementsArray = distinctElementsSet.toArray(Integer[]::new);

System.out.println("Unique elements in the array : " + Arrays.toString(uniqueElementsArray)); // [2, 4]
```

---

### Key Points

- Use `Map` for counting occurrences and flexible grouping.
- Use `Set` for quick detection of duplicates and uniques.
- Both approaches are efficient and leverage Java 8+ features.
- The logic is similar for other data types (Strings, custom objects with proper `equals`/`hashCode`).

---

## Notes: Finding the Union of Two Arrays in Java

The union of two arrays is the set of all elements present in either array (no duplicates). Here are two common approaches:

### 1. Using HashSet

- Add all elements from the first array to a `HashSet`.
- Use `addAll()` to add elements from the second array.
- The set will automatically remove duplicates.

**Example:**
```java
Integer[] arr1 = {0, 2};
Integer[] arr2 = {1, 3};

HashSet<Integer> set = new HashSet<>();
set.addAll(Arrays.asList(arr1));
set.addAll(Arrays.asList(arr2));

// Convert to array if needed
Integer[] union = set.toArray(new Integer[0]);
System.out.println(Arrays.toString(union)); // [0, 1, 2, 3]
```

### 2. Using Java 8 Streams

- Use `Stream.of()` to create a stream of both arrays.
- Use `flatMap(Stream::of)` to flatten them into a single stream.
- Optionally, use `.distinct()` to remove duplicates.
- Collect the result into an array.

**Example:**
```java
Integer[] arr1 = {0, 2};
Integer[] arr2 = {1, 3};

Integer[] union = Stream.of(arr1, arr2)
    .flatMap(Stream::of)
    .distinct()
    .toArray(Integer[]::new);

System.out.println(Arrays.toString(union)); // [0, 1, 2, 3]
```

### Key Points
- HashSet is simple and efficient for union operations, automatically removing duplicates.
- Streams provide a flexible, functional approach and allow further processing in the pipeline.
- Both methods work for any object type with proper `equals`/`hashCode`.
- For primitive arrays, use boxed types (e.g., `Integer[]` instead of `int[]`).

---
## Notes: Finding the Intersection of Two Arrays in Java

The intersection of two arrays is the set of elements present in both arrays. Here are two common approaches:

### 1. Using HashSet

- Add all elements from the first array to a `HashSet`.
- Use `retainAll()` to keep only elements also present in the second array.
- The set will contain only the common elements.

**Example:**
```java
Integer[] array1 = new Integer[]{1, 2, 3, 4, 5};
Integer[] array2 = new Integer[]{4, 5, 6, 7};

HashSet<Integer> set = new HashSet<>();
set.addAll(Arrays.asList(array1));
set.retainAll(Arrays.asList(array2));

Integer[] intersection = set.toArray(new Integer[0]);
System.out.println(Arrays.toString(intersection)); // [4, 5]
```

### 2. Using Streams

- Use `Arrays.stream()` to process the first array.
- Use `.filter()` to keep elements present in the second array.
- Use `.distinct()` to remove duplicates.
- Collect the result into an array.

**Example:**
```java
Integer[] array1 = new Integer[]{1, 2, 3, 4, 5};
Integer[] array2 = new Integer[]{4, 5, 6, 7};

Integer[] intersection = Arrays.stream(array1)
    .distinct()
    .filter(x -> Arrays.asList(array2).contains(x))
    .toArray(Integer[]::new);

System.out.println(Arrays.toString(intersection)); // [4, 5]
```

### Key Points
- HashSet is efficient for intersection and automatically removes duplicates.
- Streams provide a flexible, functional approach and allow further processing in the pipeline.
- Both methods work for any object type with proper `equals`/`hashCode`.
- For primitive arrays, use boxed types (e.g., `Integer[]` instead of `int[]`).

---

## Notes: Checking for Element Presence and Index in Java Arrays

Learn how to check if an array contains an element and how to find its index, using several approaches:

### 1. Using Arrays.asList()

- Convert the array to a list and use `contains()` to check for presence.
- Use `indexOf()` to find the index (returns -1 if not found).
- Works for all types with proper `equals()` implementation (e.g., String, wrapper classes, custom objects with overridden `equals`).

**Example:**
```java
String[] fruits = new String[] { "banana", "guava", "apple", "cheeku" };

boolean hasApple = Arrays.asList(fruits).contains("apple"); // true
int appleIndex = Arrays.asList(fruits).indexOf("apple"); // 2

boolean hasLion = Arrays.asList(fruits).contains("lion"); // false
int lionIndex = Arrays.asList(fruits).indexOf("lion"); // -1
```

### 2. Using Streams

- Use `stream().anyMatch()` to check for presence with a custom predicate.
- Useful for case-insensitive or custom equality checks.

**Example:**
```java
String[] fruits = new String[] { "banana", "guava", "apple", "cheeku" };

boolean result = Arrays.asList(fruits)
    .stream()
    .anyMatch(x -> x.equalsIgnoreCase("apple")); // true

boolean result2 = Arrays.asList(fruits)
    .stream()
    .anyMatch(x -> x.equalsIgnoreCase("lion")); // false
```

### 3. Using Iteration

- Iterate over the array and check each element for equality.
- Works for both primitive and object arrays.

**Example (primitive):**
```java
int[] intArray = new int[]{1, 2, 3, 4, 5};
boolean found = false;
int searchedValue = 2;

for(int x : intArray){
    if(x == searchedValue){
        found = true;
        break;
    }
}
System.out.println(found); // true
```

**Example (object):**
```java
String[] stringArray = new String[]{"A", "B", "C", "D", "E"};
boolean found = false;
String searchedValue = "B";

for(String x : stringArray){
    if(x.equals(searchedValue)){
        found = true;
        break;
    }
}
System.out.println(found); // true
```

### Key Points
- Use `Arrays.asList()` for quick checks on object arrays.
- Use streams for flexible, functional checks (case-insensitive, custom logic).
- Use iteration for primitives or when you want full control.
- For custom objects, ensure `equals()` is properly overridden.

---

## Notes: Finding the Top N Items in a Java Array

Learn how to find the top N (largest) items in a Java array using several approaches:

### 1. Using PriorityQueue

- Use a `PriorityQueue` of size N (min-heap by default).
- Add each element; if the queue exceeds size N, remove the smallest.
- At the end, the queue contains the N largest items (order not guaranteed).

**Example:**
```java
Integer[] items = {0, 10, 30, 2, 7, 5, 90, 76, 100, 45, 55};
PriorityQueue<Integer> priorityQueue = new PriorityQueue<>(3);
for (Integer i : items) {
    priorityQueue.add(i);
    if (priorityQueue.size() > 3)
        priorityQueue.poll();
}
System.out.println("Items are : " + priorityQueue); // [76, 100, 90]
```

### 2. Using Guava MinMaxPriorityQueue

- `MinMaxPriorityQueue` (from Guava) is a double-ended priority queue.
- No need to manually poll; just set the maximum size.

**Example:**
```java
// Add Guava dependency in your build tool
// <dependency>
//   <groupId>com.google.guava</groupId>
//   <artifactId>guava</artifactId>
//   <version>latest-version</version>
// </dependency>

Integer[] items = {0, 10, 30, 2, 7, 5, 90, 76, 100, 45, 55};
MinMaxPriorityQueue<Integer> minMaxQueue =
    MinMaxPriorityQueue.orderedBy(Collections.reverseOrder())
        .maximumSize(3)
        .create();
for (Integer i : items) {
    minMaxQueue.add(i);
}
System.out.println("Items are : " + minMaxQueue); // [100, 90, 76]
```

### 3. Using Stream API

- Sort the array in descending order and take the first N items.

**Example:**
```java
Integer[] items = {0, 10, 30, 2, 7, 5, 90, 76, 100, 45, 55};
List<Integer> top3ItemsInList = Arrays.stream(items)
    .sorted(Collections.reverseOrder())
    .limit(3)
    .collect(Collectors.toList());
System.out.println("Items are : " + top3ItemsInList); // [100, 90, 76]
```

### 4. Using Arrays.copyOfRange()

- Sort the array in descending order, then copy the first N items.

**Example:**
```java
Integer[] items = {0, 10, 30, 2, 7, 5, 90, 76, 100, 45, 55};
Arrays.sort(items, Collections.reverseOrder());
Integer[] topThreeItems = Arrays.copyOfRange(items, 0, 3);
System.out.println("Items are : " + Arrays.toString(topThreeItems)); // [100, 90, 76]
```

### Key Points
- PriorityQueue is efficient and preserves original order for top N items.
- Streams and Arrays.copyOfRange require sorting, which may change the order.
- Guava's MinMaxPriorityQueue simplifies the logic for double-ended queues.
- Adapt the approach for smallest N items by reversing the comparator or using a max-heap.

---

## Notes: Finding Maximum and Minimum in Java Arrays

Learn how to find the maximum and minimum values in a Java array using several approaches:

### 1. Using a Simple Loop

- Iterate through the array, updating max and min as you go.

**Example:**
```java
int[] numbers = {2, 4, 1, 9, 6};
int max = numbers[0];
int min = numbers[0];
for (int n : numbers) {
    if (n > max) max = n;
    if (n < min) min = n;
}
System.out.println("Max: " + max + ", Min: " + min); // Max: 9, Min: 1
```

### 2. Using Java 8 Streams

- Use `IntStream.of()` or `Arrays.stream()` for primitives.
- Use `max()` and `min()` terminal operations.

**Example:**
```java
int[] numbers = {2, 4, 1, 9, 6};
int max = Arrays.stream(numbers).max().orElseThrow();
int min = Arrays.stream(numbers).min().orElseThrow();
System.out.println("Max: " + max + ", Min: " + min); // Max: 9, Min: 1
```

### 3. Using Collections for Object Arrays

- For `Integer[]`, `Double[]`, etc., use `Collections.max()` and `Collections.min()`.

**Example:**
```java
Integer[] numbers = {2, 4, 1, 9, 6};
int max = Collections.max(Arrays.asList(numbers));
int min = Collections.min(Arrays.asList(numbers));
System.out.println("Max: " + max + ", Min: " + min); // Max: 9, Min: 1
```

### 4. Using Arrays Utility Methods

- Sort the array and pick the first and last elements.
- Note: This changes the array order.

**Example:**
```java
int[] numbers = {2, 4, 1, 9, 6};
Arrays.sort(numbers);
int min = numbers[0];
int max = numbers[numbers.length - 1];
System.out.println("Max: " + max + ", Min: " + min); // Max: 9, Min: 1
```

### Key Points
- Use a simple loop for best performance and no side effects.
- Streams are concise and expressive for primitives and objects.
- Collections methods are handy for boxed types (`Integer[]`, etc.).
- Sorting is less efficient and changes the array order—use only if order doesn't matter.

---
## Notes: Finding Sum and Average of Array Elements in Java

Learn how to find the sum and average of numbers in an array using Java Streams and loops. Choose the right stream type for your primitive array:
- Use `IntStream` for `int`, `short`, `char`, `byte`, and `boolean` arrays.
- Use `LongStream` for `long` arrays.
- Use `DoubleStream` for `float` and `double` arrays.

### 1. Finding the Sum

**Using Streams:**
```java
int[] intArray = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
Integer[] integerArray = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// For primitive int array
long sum1 = Arrays.stream(intArray).sum();

// For Integer array
long sum2 = Arrays.stream(integerArray).mapToInt(i -> i).sum();

// Using summaryStatistics
long sum3 = Arrays.stream(intArray).summaryStatistics().getSum();
```

**Using a for loop:**
```java
long sum = 0;
for (int value : intArray) {
    sum += value;
}
System.out.println(sum);
```

### 2. Finding the Average

**Using Streams:**
```java
// For primitive int array
double average1 = Arrays.stream(intArray).average().orElse(Double.NaN);

// Using summaryStatistics
double average2 = Arrays.stream(intArray).summaryStatistics().getAverage();
```

### Key Points
- Use the appropriate stream type for your array's primitive type.
- For object arrays, use `mapToInt`, `mapToLong`, or `mapToDouble` as needed.
- `average()` returns an `OptionalDouble`; use `.orElse(Double.NaN)` to handle empty arrays.
- Loops are always available and work for any type.

---

## Notes: Sorting Arrays in Java (Primitives, Strings, Custom Objects)

Learn how to sort arrays in Java using natural, reverse, and custom orderings with `Comparable`, `Comparator`, `Arrays.sort()`, and `Stream.sorted()`.

### 1. Basics of Array Sorting
- By default, arrays are sorted in natural order: numbers ascending, strings lexicographically, custom objects by their `Comparable` implementation.
- Use `Comparator.reverseOrder()` for reverse sorting.
- For custom order, implement a `Comparator` and pass it to the sort method.

**Example custom object:**
```java
public class User implements Comparable<User> {
    public long id;
    public String firstName;
    public String lastName;
    // Getters and setters omitted
    @Override
    public int compareTo(final User user) {
        if(user == null ) {
            return -1;
        } else {
            return (int)(this.id - user.id);
        }
    }
}
```

### 2. Arrays.sort() and Arrays.parallelSort()
- `Arrays.sort(array)` sorts in natural order.
- `Arrays.sort(array, comparator)` sorts with a custom comparator.
- `Arrays.parallelSort(array)` is faster for large arrays (uses parallelism).

**Natural order:**
```java
String[] tokens = {"A","C","B","E","D"};
Arrays.sort(tokens); // [A, B, C, D, E]
```

**Reverse order:**
```java
Arrays.sort(tokens, Collections.reverseOrder()); // [E, D, C, B, A]
```

**Custom order:**
```java
User[] users = getUsersArray();
Comparator<User> firstNameSorter = Comparator.comparing(User::getFirstName);
Arrays.sort(users, firstNameSorter);
```

**Multiple fields:**
```java
Comparator<Employee> fullNameSorter = Comparator.comparing(Employee::getFirstName)
        .thenComparing(Employee::getLastName);
Arrays.sort(employees, fullNameSorter);
```

### 3. Sorting Arrays with Stream API
- Use `Stream.of(array).sorted()` for natural order.
- Use `.sorted(Comparator)` for custom order.
- Returns a sorted stream; collect to array or list as needed.

**Natural order:**
```java
User[] sortedUserArray = Stream.of(userArray)
        .sorted()
        .toArray(User[]::new);
```

**Reverse order:**
```java
User[] sortedUserArray = Stream.of(userArray)
        .sorted(Comparator.reverseOrder())
        .toArray(User[]::new);
```

**Custom order:**
```java
Comparator<Employee> nameComparator = Comparator.comparing(Employee::getName)
        .thenComparing(Employee::getId);
User[] sortedUserArray = Stream.of(userArray)
        .sorted(nameComparator)
        .toArray(User[]::new);
```

### Key Points
- Use `Comparable` for natural ordering in custom classes.
- Use `Comparator` for custom or multi-field sorting.
- `Arrays.sort()` is stable and efficient for most use cases.
- `Stream.sorted()` is flexible and works well for pipelines.
- For primitives, use `Arrays.sort()` directly.
- For large arrays, consider `Arrays.parallelSort()` for better performance.

---


## Notes: Checking if an Array is Sorted in Java

Learn how to check if an array is sorted in ascending, descending, or custom order using loops, Streams, Comparable, Comparator, and ArrayUtils.

### 1. Overview
- An array is sorted if every item is in the correct order relative to its predecessor.
- For primitives, compare values directly.
- For objects, use `Comparable` or a custom `Comparator`.
- Use `Comparator.reversed()` for reverse order.

### 2. Checking Sorted Arrays

#### 2.1. Primitive Arrays
Check if a primitive array is sorted in ascending order:
```java
int[] array = { 1, 2, 3, 4, 5 };
boolean isSorted = checkIsSortedPrimitiveArrayWithStream(array);
System.out.println(isSorted); // true

public static boolean checkIsSortedPrimitiveArrayWithStream(final int[] array) {
    if (array == null || array.length <= 1) {
        return true;
    }
    return IntStream.range(0, array.length - 1)
        .noneMatch(i -> array[i] > array[i + 1]);
}
```

#### 2.2. Comparable Objects
Check if an array of objects implementing `Comparable` is sorted:
```java
Integer[] array = { 1, 2, 3, 4, 5 };
boolean isSorted = checkIsSortedObjectArrayWithStream(array);
System.out.println(isSorted); // true

public static <T extends Comparable<? super T>>
boolean checkIsSortedObjectArrayWithStream(final T[] array) {
    if (array.length <= 1) {
        return true;
    }
    return IntStream.range(0, array.length - 1)
        .noneMatch(i -> array[i].compareTo(array[i + 1]) > 0);
}
```

#### 2.3. Custom Comparator
Check if an array is sorted using a custom `Comparator`:
```java
User[] users = getSortedArray();
Comparator<User> firstNameSorter = Comparator.comparing(User::getFirstName);
boolean isSorted = checkIsSortedObjectArrayForCustomSort(users, firstNameSorter);
System.out.println(isSorted); // true

public static <T> boolean checkIsSortedObjectArrayForCustomSort(
    final T[] array, final Comparator<T> comparator) {
    if (comparator == null) {
        throw new IllegalArgumentException("Comparator should not be null.");
    }
    if (array.length <= 1) {
        return true;
    }
    return IntStream.range(0, array.length - 1)
        .noneMatch(i -> comparator.compare(array[i], array[i + 1]) > 0);
}
```

### 3. Using Apache Commons ArrayUtils
`ArrayUtils.isSorted()` can check if an array is sorted in natural or custom order in one line:
```java
User[] users = getSortedArray();
boolean isSorted = ArrayUtils.isSorted(users); // Natural order
boolean isSortedCustom = ArrayUtils.isSorted(users, Comparator.comparing(User::getFirstName));
```

### Key Points
- For primitives, use direct comparison or Streams.
- For objects, use `Comparable` or a custom `Comparator`.
- `ArrayUtils.isSorted()` is the most concise for both natural and custom order.
- Always check for null or single-element arrays (they are considered sorted).

---

## Notes: Converting Arrays of Primitives to Arrays of Objects in Java

Learn how to convert arrays of primitives (int, double, etc.) to arrays of their corresponding wrapper objects (Integer, Double, etc.) using Java Streams and utility methods.

### 1. Using Java 8 Streams
- Use `Arrays.stream()` and `.boxed()` to convert primitive arrays to object arrays.

**Example (int[] to Integer[]):**
```java
int[] intArray = {1, 2, 3, 4, 5};
Integer[] integerArray = Arrays.stream(intArray)
    .boxed()
    .toArray(Integer[]::new);
```

**Example (double[] to Double[]):**
```java
double[] doubleArray = {1.1, 2.2, 3.3};
Double[] doubleObjArray = Arrays.stream(doubleArray)
    .boxed()
    .toArray(Double[]::new);
```

### 2. Using Loops
- For older Java versions, use a loop to manually box each element.

**Example:**
```java
int[] intArray = {1, 2, 3, 4, 5};
Integer[] integerArray = new Integer[intArray.length];
for (int i = 0; i < intArray.length; i++) {
    integerArray[i] = intArray[i];
}
```

### 3. Using Apache Commons Lang
- Use `ArrayUtils.toObject()` for quick conversion (requires Apache Commons Lang).

**Example:**
```java
int[] intArray = {1, 2, 3, 4, 5};
Integer[] integerArray = ArrayUtils.toObject(intArray);
```

### Key Points
- Use `.boxed()` with Streams for concise, modern code.
- Manual loops work in all Java versions.
- `ArrayUtils.toObject()` is convenient but requires an external library.
- Converting is useful for working with collections, generics, and APIs that require object types.

---


## Notes: Converting Between Lists and Arrays in Java

Learn how to convert a list to an array and an array to a list in Java using core APIs and Streams.

### 1. Converting List to Array

#### 1.1. Using List.toArray()
- `Object[] toArray()`: returns an array of all elements.
- `<T> T[] toArray(T[] a)`: returns an array of the specified type.
- `<T> T[] toArray(IntFunction<T[]> generator)`: uses a generator function to allocate the array.

**Example:**
```java
List<String> list = Arrays.asList("A", "B", "C");
Object[] objArray = list.toArray();
String[] stringArray1 = list.toArray(new String[0]);
String[] stringArray2 = list.toArray(String[]::new);
```

#### 1.2. Using Stream.toArray()
- Use `list.stream().toArray()` or with a generator for type safety.
- Streams allow filtering and parallel processing.

**Example:**
```java
List<String> list = Arrays.asList("A", "B", "C");
String[] stringArray = list.stream().toArray(String[]::new);

// Filtered example
String[] filteredArray = list.stream()
    .filter(s -> s.equals("A"))
    .toArray(String[]::new);
```

### 2. Converting Array to List

#### 2.1. Using Arrays.asList()
- Returns a fixed-size list backed by the array (changes reflect both ways).

**Example:**
```java
String[] stringArray = new String[]{"A", "B", "C"};
List<String> list = Arrays.asList(stringArray);
list.set(0, "Aa");
System.out.println(list); // [Aa, B, C]
System.out.println(Arrays.toString(stringArray)); // [Aa, B, C]
// list.add("D"); // UnsupportedOperationException
```

#### 2.2. Using Collections.unmodifiableList()
- Creates an unmodifiable list from the array.

**Example:**
```java
String[] stringArray = new String[]{"A", "B", "C"};
List<String> list = Collections.unmodifiableList(Arrays.asList(stringArray));
// list.set(0, "Aa"); // UnsupportedOperationException
```

#### 2.3. Using Iteration and Stream
- Use `Stream.of(array).collect(Collectors.toList())` for a mutable, independent list.

**Example:**
```java
String[] stringArray = new String[]{"A", "B", "C"};
List<String> list = Stream.of(stringArray).collect(Collectors.toList());
list.add("D");
System.out.println(list); // [A, B, C, D]
System.out.println(Arrays.toString(stringArray)); // [A, B, C]
```

### Key Points
- `Arrays.asList()` returns a fixed-size, backed list; changes to one affect the other.
- Use Streams or iteration for a new, independent, mutable list.
- Use `Collections.unmodifiableList()` for a read-only list.
- Choose the method based on mutability and independence requirements.

---

## Notes: Converting Between Arrays and Streams in Java

Learn how to convert arrays to streams and streams to arrays in Java, for both primitives and objects.

### Quick Reference
```java
String[] stringArray = {"a", "b", "c", "d", "e"};
// array -> stream
Stream<String> strStream = Arrays.stream(stringArray);
// stream -> array
String[] stringArray2 = strStream.toArray(String[]::new);
```

### Specialized Primitive Streams
- `IntStream` – for `int` values
- `LongStream` – for `long` values
- `DoubleStream` – for `double` values

### 1. Converting an Array to Stream

#### 1.1. Method Syntax
- `Stream<T> stream(T[] array)`
- `Stream<T> stream(T[] array, int start, int end)`

#### 1.2. Primitive Array to Stream
```java
int[] primitiveArray = {0,1,2,3,4};
IntStream intStream = Arrays.stream(primitiveArray);

// To Stream<Integer>
Stream<Integer> integerStream = Arrays.stream(primitiveArray).boxed();
```

#### 1.3. Object Array to Stream
```java
String[] stringArray = {"a", "b", "c", "d", "e"};
Stream<String> strStream = Arrays.stream(stringArray);
```

### 2. Converting a Stream to Array

#### 2.1. Method Syntax
- `Object[] toArray()`
- `T[] toArray(IntFunction<T[]> generator)`

#### 2.2. Stream to Primitive Array
```java
IntStream intStream = Arrays.stream(new int[]{1,2,3});
int[] primitiveArray = intStream.toArray();

// Stream<Integer> to int[]
Stream<Integer> integerStream = Arrays.stream(new Integer[]{1,2,3});
int[] primitiveArray2 = integerStream.mapToInt(i -> i).toArray();
```

#### 2.3. Stream to Object Array
```java
Stream<String> strStream = Arrays.stream(new String[]{});
String[] stringArray = strStream.toArray(String[]::new);
```

### Key Points
- Use `Arrays.stream()` for array-to-stream conversion.
- Use `.boxed()` to convert primitive streams to object streams.
- Use `Stream.toArray()` with a generator for type safety.
- Specialized streams (`IntStream`, `LongStream`, `DoubleStream`) support aggregate operations like `sum()` and `average()`.
- For custom objects, use the generic `Stream<T>`.

---

## Notes: Converting Between String and String Array in Java

Learn how to convert a String to a String array and vice versa using `String.split()`, `Pattern.split()`, and `String.join()`.

### 1. String to String[]

#### 1.1. Using String.split()
- Use `split()` to tokenize a string by a delimiter or regex.

**Example:**
```java
String names = "alex,brian,charles,david";
String[] namesArray = names.split(","); // [alex, brian, charles, david]
```

#### 1.2. Using Pattern.split()
- Use `Pattern.compile(delimiter).split(string)` for regex-based splitting.

**Example:**
```java
String names = "alex,brian,charles,david";
Pattern pattern = Pattern.compile(",");
String[] namesArray = pattern.split(names); // [alex, brian, charles, david]
```

### 2. String[] to String

- Use `String.join(delimiter, array)` to join array elements into a single string.

**Example:**
```java
String[] tokens = {"How","To","Do","In","Java"};
String blogName1 = String.join("", tokens);      // HowToDoInJava
String blogName2 = String.join(" ", tokens);     // How To Do In Java
String blogName3 = String.join("-", tokens);     // How-To-Do-In-Java
```

### Key Points
- `split()` and `Pattern.split()` are flexible for tokenizing strings.
- `String.join()` is concise for building strings from arrays with any delimiter.
- For complex splitting, use regex patterns with `Pattern.split()`.
- For joining, choose a delimiter that matches your output format.

---

## Notes: Converting String Array to int[] or Integer[] in Java

Learn how to convert a String array to an array of int or Integer values using Java 8 Streams, including handling invalid values.

### 1. String[] to int[]
- Use `Arrays.stream()` and `mapToInt(Integer::parseInt)` to parse each string and collect to an int array.

**Example:**
```java
String[] strArray = new String[] {"1", "2", "3"};
int[] intArray = Arrays.stream(strArray)
        .mapToInt(Integer::parseInt)
        .toArray();
System.out.println(Arrays.toString(intArray)); // [1, 2, 3]
```

### 2. String[] to Integer[]
- Use `map(Integer::parseInt)` and collect to an Integer array.

**Example:**
```java
String[] strArray = new String[] {"1", "2", "3"};
Integer[] integerArray = Arrays.stream(strArray)
        .map(Integer::parseInt)
        .toArray(Integer[]::new);
System.out.println(Arrays.toString(integerArray)); // [1, 2, 3]
```

### 3. Handling Invalid Values
- Use a try-catch in the mapping function to handle `NumberFormatException` and return a default value (e.g., -1) for invalid entries.

**Example:**
```java
String[] invalidStrArray = new String[]{"1", "2", "3", "four", "5"};
int[] intArray = Arrays.stream(invalidStrArray).mapToInt(str -> {
    try {
        return Integer.parseInt(str);
    } catch (NumberFormatException nfe) {
        return -1;
    }
}).toArray();
System.out.println(Arrays.toString(intArray)); // [1, 2, 3, -1, 5]
```

### Key Points
- Use `mapToInt()` for primitive int arrays, `map()` for Integer arrays.
- Always handle possible parsing errors when working with external data.
- Choose a sensible default value for invalid entries based on your use case.
- These techniques work for other numeric types (Double, Long) with their respective parsing methods.

---

# Advanced Array topics in Java

# Array Advanced

## Notes: Shallow and Deep Copying Arrays in Java

Learn how to create shallow and deep copies of arrays in Java, with examples and best practices.

### 1. Shallow Copy of Arrays

In a shallow copy, only the references to the objects are copied. Changes to the objects in the original array will be reflected in the copied array.

#### 1.1. Using `array.clone()`
```java
Employee[] empArray = new Employee[2];
empArray[0] = new Employee(100, "Lokesh", "Gupta", new Department(1, "HR"));
empArray[1] = new Employee(200, "Pankaj", "Kumar", new Department(2, "Finance"));
Employee[] clonedArray = empArray.clone();
// Changes to empArray[0] or its Department will affect clonedArray[0]
```

#### 1.2. Using `Arrays.copyOf()`
```java
Employee[] copiedArray = Arrays.copyOf(empArray, empArray.length);
```

#### 1.3. Using `System.arraycopy()`
```java
String[] names = {"Alex", "Brian", "Charles", "David"};
String[] copyOfNames = new String[names.length];
System.arraycopy(names, 0, copyOfNames, 0, copyOfNames.length);
```

### 2. Deep Copy of Arrays

In a deep copy, new instances of the objects are created. Changes to the original array or its objects do not affect the copied array.

#### 2.1. Using Apache Commons SerializationUtils
- Use `SerializationUtils.clone(array)` for deep copying (all objects must be Serializable).
```java
Employee[] copiedArray = SerializationUtils.clone(empArray); // Deep copied array
```

#### 2.2. Manual Deep Copy
- For custom deep copy, create new instances of each object in a loop.
```java
Employee[] deepCopied = new Employee[empArray.length];
for (int i = 0; i < empArray.length; i++) {
    deepCopied[i] = new Employee(empArray[i]); // Assuming a copy constructor
}
```

### Key Points
- Shallow copy: changes to referenced objects affect both arrays.
- Deep copy: changes to original objects do not affect the copy.
- Use `clone()`, `Arrays.copyOf()`, or `System.arraycopy()` for shallow copies.
- Use serialization or manual copying for deep copies.
- Always ensure your objects are Serializable for serialization-based deep copy.

---


## Notes: Using clone() with Arrays in Java

The `clone()` method is a built-in way to create a shallow copy of an array in Java. It works for arrays of primitives and objects.

- For primitive arrays, `clone()` copies all values.
- For object arrays, `clone()` copies references (not the objects themselves).
- The returned array is of the same type as the original.

**Example (primitive array):**
```java
int[] original = {1, 2, 3};
int[] copy = original.clone();
copy[0] = 99;
System.out.println(Arrays.toString(original)); // [1, 2, 3]
System.out.println(Arrays.toString(copy));     // [99, 2, 3]
```

**Example (object array):**
```java
Employee[] empArray = new Employee[2];
empArray[0] = new Employee(100, "Lokesh", "Gupta", new Department(1, "HR"));
empArray[1] = new Employee(200, "Pankaj", "Kumar", new Department(2, "Finance"));
Employee[] clonedArray = empArray.clone();
// Changing empArray[0].firstName or its Department will affect clonedArray[0] as well (shallow copy)
```

### Key Points
- `clone()` is fast and easy for shallow copies.
- For deep copies, use serialization or manual copying.
- Always check the type of array and whether you need a deep or shallow copy.

---


## Notes: Creating Subarrays (Array Slices) in Java

Learn how to create subarrays (array slices) in Java using `Arrays.copyOfRange()` and Apache Commons `ArrayUtils.subarray()`, and how to convert subarrays to lists.

### 1. Using Arrays.copyOfRange()
- Copies a range from the original array into a new array.
- Syntax: `Arrays.copyOfRange(array, from, to)` (from inclusive, to exclusive).
- If `to` > array length, extra slots are filled with default values (e.g., `null` for objects).

**Example:**
```java
String[] names = {"Alex", "Brian", "Charles", "David"};
String[] partialNames = Arrays.copyOfRange(names, 0, 2); // [Alex, Brian]
String[] endNames = Arrays.copyOfRange(names, 2, names.length); // [Charles, David]
String[] moreNames = Arrays.copyOfRange(names, 2, 10); // [Charles, David, null, null, ...]
```

### 2. Using Apache Commons ArrayUtils.subarray()
- More flexible and handles edge cases gracefully.
- Returns null if the input array is null.
- Adjusts indices to valid ranges and returns an empty array if the range is invalid.

**Example:**
```java
String[] names = {"Alex", "Brian", "Charles", "David"};
String[] partialNames = ArrayUtils.subarray(names, 0, 2); // [Alex, Brian]
```

### 3. Converting Subarray to List
- Use `Arrays.asList()` to convert a subarray to a list.

**Example:**
```java
String[] names = {"Alex", "Brian", "Charles", "David"};
List<String> namesList = Arrays.asList(Arrays.copyOfRange(names, 0, 2)); // [Alex, Brian]
```

### Key Points
- `Arrays.copyOfRange()` is standard and works for all array types.
- `ArrayUtils.subarray()` (from Apache Commons Lang) is more robust for edge cases.
- Converting a subarray to a list is a common pattern for further processing.
- Always check index bounds to avoid unexpected results.

---