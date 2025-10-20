


----------------------------------------------------------------------------------
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

