---
title: Java Array Cheatsheet
---

## 1. ARRAY BASICS & DECLARATION

```java
// Declare
int[] arr;
int arr2[];
String[] names;

// Initialize
int[] arr = {1, 2, 3};
int[] arr = new int[5];        // Default: 0
String[] arr = new String[3];  // Default: null

// Length
arr.length;

// Access
arr[0] = 10;
int x = arr[2];
```

**Key Point:** Arrays are fixed-size. Once created, size cannot change.

---

## 2. ARRAY CREATION & COPYING

### Create New Arrays
```java
// Basic copy (shallow)
int[] copy = arr.clone();
int[] copy = Arrays.copyOf(arr, arr.length);

// Copy range
int[] part = Arrays.copyOfRange(arr, 0, 3);  // [0,3) - 3 exclusive

// Copy with System
System.arraycopy(source, 0, dest, 0, length);
```

### Concatenate Arrays
```java
// Using System.arraycopy
int[] result = new int[arr1.length + arr2.length];
System.arraycopy(arr1, 0, result, 0, arr1.length);
System.arraycopy(arr2, 0, result, arr1.length, arr2.length);

// Using Streams (cleaner)
int[] merged = IntStream.concat(
    Arrays.stream(arr1), 
    Arrays.stream(arr2)
).toArray();
```

---

## 3. SEARCHING & CHECKING

```java
// Contains element
Arrays.asList(arr).contains(5);
Arrays.stream(arr).anyMatch(x -> x == 5);

// Find index
int index = Arrays.asList(arr).indexOf(5);  // -1 if not found

// Check sorted
boolean sorted = IntStream.range(0, arr.length - 1)
    .noneMatch(i -> arr[i] > arr[i + 1]);

// Binary search (requires sorted array)
int index = Arrays.binarySearch(arr, 5);  // Returns index or (-(insertion point) - 1)
```

---

## 4. SORTING

```java
// Primitive array - ascending
Arrays.sort(arr);

// Primitive array - descending
Integer[] arr = {3, 1, 4, 1, 5};
Arrays.sort(arr, Collections.reverseOrder());

// Custom comparator
Arrays.sort(arr, (a, b) -> b - a);  // Descending
Arrays.sort(arr, (a, b) -> a.compareTo(b));  // For objects

// Multiple fields
Arrays.sort(employees, Comparator
    .comparing(Employee::getFirstName)
    .thenComparing(Employee::getLastName));

// Streams (doesn't modify original)
Integer[] sorted = Arrays.stream(arr)
    .sorted()
    .toArray(Integer[]::new);

Integer[] sorted = Arrays.stream(arr)
    .sorted(Collections.reverseOrder())
    .toArray(Integer[]::new);
```

---

## 5. AGGREGATION OPERATIONS

### Sum & Average
```java
// Sum
int sum = Arrays.stream(arr).sum();
long sum = 0;
for(int x : arr) sum += x;

// Average
double avg = Arrays.stream(arr).average().orElse(0);

// Count
long count = Arrays.stream(arr).count();
```

### Min & Max
```java
// Min
int min = Arrays.stream(arr).min().orElseThrow();
int min = Collections.min(Arrays.asList(arr));

// Max
int max = Arrays.stream(arr).max().orElseThrow();
int max = Collections.max(Arrays.asList(arr));

// Loop (efficient for arrays)
int max = arr[0], min = arr[0];
for(int x : arr) {
    max = Math.max(max, x);
    min = Math.min(min, x);
}
```

---

## 6. FILTERING & TRANSFORMATION

```java
// Filter
Integer[] evens = Arrays.stream(arr)
    .filter(x -> x % 2 == 0)
    .toArray(Integer[]::new);

// Map/Transform
Integer[] doubled = Arrays.stream(arr)
    .map(x -> x * 2)
    .toArray(Integer[]::new);

// Filter + Map
String[] names = {"alex", "brian", "charles"};
String[] caps = Arrays.stream(names)
    .filter(n -> n.length() > 4)
    .map(String::toUpperCase)
    .toArray(String[]::new);
```

---

## 7. DUPLICATES & UNIQUE ELEMENTS

### Find Duplicates
```java
// Using Map
Map<Integer, Long> map = Arrays.stream(arr)
    .collect(Collectors.groupingBy(
        Function.identity(), 
        Collectors.counting()
    ));
Integer[] dups = map.keySet().stream()
    .filter(k -> map.get(k) > 1)
    .toArray(Integer[]::new);

// Using Set
Set<Integer> seen = new HashSet<>();
Integer[] dups = Arrays.stream(arr)
    .filter(e -> !seen.add(e))
    .toArray(Integer[]::new);
```

### Remove Duplicates
```java
// Keep order with LinkedHashSet
Integer[] unique = Arrays.stream(arr)
    .distinct()
    .toArray(Integer[]::new);

// Or use Set
Set<Integer> uniqueSet = new LinkedHashSet<>(Arrays.asList(arr));
Integer[] unique = uniqueSet.toArray(new Integer[0]);
```

---

## 8. UNION & INTERSECTION

### Union (combine, remove duplicates)
```java
// HashSet approach
HashSet<Integer> set = new HashSet<>();
set.addAll(Arrays.asList(arr1));
set.addAll(Arrays.asList(arr2));
Integer[] union = set.toArray(new Integer[0]);

// Stream approach
Integer[] union = Stream.of(arr1, arr2)
    .flatMap(Stream::of)
    .distinct()
    .toArray(Integer[]::new);
```

### Intersection (common elements)
```java
// HashSet approach
HashSet<Integer> set = new HashSet<>(Arrays.asList(arr1));
set.retainAll(Arrays.asList(arr2));
Integer[] intersection = set.toArray(new Integer[0]);

// Stream approach
Integer[] intersection = Arrays.stream(arr1)
    .distinct()
    .filter(x -> Arrays.asList(arr2).contains(x))
    .toArray(Integer[]::new);
```

---

## 9. SPLITTING ARRAYS

```java
// Split at index
int[] part1 = Arrays.copyOfRange(arr, 0, 3);
int[] part2 = Arrays.copyOfRange(arr, 3, arr.length);

// Split in half
int mid = arr.length / 2;
int[] first = Arrays.copyOfRange(arr, 0, mid);
int[] second = Arrays.copyOfRange(arr, mid, arr.length);

// Split into N parts (chunks)
List<Integer[]> chunks = new ArrayList<>();
int chunkSize = 3;
for(int i = 0; i < arr.length; i += chunkSize) {
    int end = Math.min(i + chunkSize, arr.length);
    chunks.add(Arrays.copyOfRange(arr, i, end));
}
```

---

## 10. REMOVING ELEMENTS

```java
// Remove by index (create new array)
Integer[] result = new Integer[arr.length - 1];
System.arraycopy(arr, 0, result, 0, index);
System.arraycopy(arr, index + 1, result, index, arr.length - index - 1);

// Using List (easier)
List<Integer> list = new ArrayList<>(Arrays.asList(arr));
list.remove(Integer.valueOf(5));  // Remove value
list.remove(2);                   // Remove by index
Integer[] result = list.toArray(new Integer[0]);

// Remove all occurrences
List<Integer> list = new ArrayList<>(Arrays.asList(arr));
list.removeAll(Collections.singleton(5));
Integer[] result = list.toArray(new Integer[0]);
```

---

## 11. TOP N ELEMENTS

```java
// Using PriorityQueue (min-heap for top N)
PriorityQueue<Integer> pq = new PriorityQueue<>();
for(int x : arr) {
    pq.add(x);
    if(pq.size() > N) pq.poll();
}
// pq contains top N elements

// Using Streams (easier)
Integer[] topN = Arrays.stream(arr)
    .sorted(Collections.reverseOrder())
    .limit(N)
    .toArray(Integer[]::new);

// Reverse sorted
Integer[] bottom N = Arrays.stream(arr)
    .sorted()
    .limit(N)
    .toArray(Integer[]::new);
```

---

## 12. CONVERSIONS

### Array ↔ List
```java
// Array to List (fixed-size, backed by array)
List<Integer> list = Arrays.asList(arr);

// Array to List (independent, mutable)
List<Integer> list = new ArrayList<>(Arrays.asList(arr));
List<Integer> list = Arrays.stream(arr).collect(Collectors.toList());

// List to Array
Integer[] arr = list.toArray(new Integer[0]);
Integer[] arr = list.toArray(Integer[]::new);
```

### Primitive ↔ Object Array
```java
// int[] to Integer[]
Integer[] boxed = Arrays.stream(arr).boxed().toArray(Integer[]::new);

// Integer[] to int[]
int[] unboxed = Arrays.stream(arr).mapToInt(Integer::intValue).toArray();
```

### String ↔ Array
```java
// String to String[]
String[] words = "hello world java".split(" ");
String[] words = Pattern.compile(" ").split("hello world java");

// String[] to String
String joined = String.join(" ", words);
String joined = String.join(",", arr);
```

### String[] ↔ int[]
```java
// String[] to int[]
int[] nums = Arrays.stream(strArr)
    .mapToInt(Integer::parseInt)
    .toArray();

// Handle invalid values
int[] nums = Arrays.stream(strArr).mapToInt(str -> {
    try {
        return Integer.parseInt(str);
    } catch(NumberFormatException e) {
        return -1;
    }
}).toArray();

// String[] to Integer[]
Integer[] nums = Arrays.stream(strArr)
    .map(Integer::parseInt)
    .toArray(Integer[]::new);
```

---

## 13. PRINTING & DEBUGGING

```java
// Print array
System.out.println(Arrays.toString(arr));

// Print 2D array
System.out.println(Arrays.deepToString(arr2d));

// Print with custom format
Arrays.stream(arr).forEach(x -> System.out.print(x + " "));
Arrays.stream(arr).forEach(System.out::println);
```

---

## 14. MULTI-DIMENSIONAL ARRAYS

```java
// Declare 2D
int[][] matrix = new int[3][4];
int[][] matrix = {{1,2}, {3,4}, {5,6}};

// Access
matrix[0][1] = 5;

// Iterate
for(int i = 0; i < matrix.length; i++) {
    for(int j = 0; j < matrix[i].length; j++) {
        System.out.println(matrix[i][j]);
    }
}

// Enhanced loop
for(int[] row : matrix) {
    for(int x : row) {
        System.out.println(x);
    }
}

// Sum all elements
int sum = Arrays.stream(matrix)
    .flatMapToInt(Arrays::stream)
    .sum();
```

---

## 15. COMMON DSA PATTERNS

### Prefix Sum
```java
int[] prefix = new int[arr.length];
prefix[0] = arr[0];
for(int i = 1; i < arr.length; i++) {
    prefix[i] = prefix[i-1] + arr[i];
}
```

### Two Pointer
```java
int left = 0, right = arr.length - 1;
while(left < right) {
    // Do something
    if(condition) left++;
    else right--;
}
```

### Sliding Window
```java
int windowSum = 0;
for(int i = 0; i < windowSize; i++) {
    windowSum += arr[i];
}
for(int i = windowSize; i < arr.length; i++) {
    windowSum = windowSum - arr[i - windowSize] + arr[i];
    // Process windowSum
}
```

### Frequency Array (for counting)
```java
int[] freq = new int[26];  // For 'a' to 'z'
for(char c : str.toCharArray()) {
    freq[c - 'a']++;
}
```

---

## QUICK REFERENCE TABLE

| Task | Method |
|------|--------|
| Create copy | `Arrays.copyOf()`, `clone()` |
| Get subarray | `Arrays.copyOfRange()` |
| Search | `Arrays.binarySearch()`, `contains()` |
| Sort | `Arrays.sort()` |
| Sum/Avg | `stream().sum()`, `average()` |
| Min/Max | `min()`, `max()` |
| Filter | `stream().filter()` |
| Remove duplicates | `distinct()` |
| Convert to List | `Arrays.asList()` |
| Join string | `String.join()` |
| Split string | `split()` |

---

## GOTCHAS TO AVOID

1. **Arrays are fixed-size** → Use ArrayList for dynamic sizing
2. **Shallow copy** → `clone()` copies references, not objects
3. **Arrays.asList()** is fixed-size → Changes reflect in original array
4. **Off-by-one errors** → `copyOfRange(a, b, c)` has c exclusive
5. **Null for objects** → `new String[5]` contains null values
6. **String.split()** with regex → Escape special chars like `.`, `|`
7. **Primitive streams** → Use `IntStream`, `LongStream`, `DoubleStream`
8. **Binary search** → Array must be sorted first
9. **Performance** → Loop > stream for simple operations on small arrays
10. **Memory** → Creating new array for every operation is expensive