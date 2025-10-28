---
title: "Java TreeSet"
---

# TreeSet - Complete Basics Guide

## What is a TreeSet in Java?

TreeSet is a **sorted set implementation** in Java that stores unique elements in **ascending order** (or custom order with a Comparator). It's part of the Java Collections Framework and implements the `NavigableSet` interface, which extends `SortedSet`.

**Simple definition:** TreeSet is like a container that automatically keeps your elements sorted and ensures no duplicates.

```java
TreeSet<Integer> numbers = new TreeSet<>();
numbers.add(5);
numbers.add(1);
numbers.add(3);

System.out.println(numbers);  // Output: [1, 3, 5] - Automatically sorted!
```

**Key characteristics** :
- Stores unique elements (no duplicates)
- Maintains sorted order (natural or custom)
- Uses Red-Black Tree internally (self-balancing BST)
- O(log n) time for basic operations
- Does NOT allow null elements
- Not thread-safe

**What makes it special:** TreeSet is the **only Set implementation that automatically sorts elements**.

***

## How is TreeSet different from HashSet and LinkedHashSet?

The **fundamental difference** is in ordering and internal structure :

### Quick Comparison Table

| Feature | HashSet | LinkedHashSet | TreeSet |
|---------|---------|---------------|---------|
| **Data Structure** | Hash table | Hash table + Doubly-linked list | Red-Black Tree (BST) |
| **Ordering** | No order (random) | Insertion order | Sorted order (natural/custom) |
| **Null elements** | One null ✓ | One null ✓ | No nulls ✗ |
| **Performance - add** | O(1) | O(1) | O(log n) |
| **Performance - remove** | O(1) | O(1) | O(log n) |
| **Performance - contains** | O(1) | O(1) | O(log n) |
| **Memory** | Lowest | Medium | Highest (tree nodes) |
| **Speed** | Fastest | Second fastest | Slowest |
| **When to use** | No order needed | Need insertion order | Need sorted elements |



***

### Visual Comparison

**HashSet - Random order based on hash codes:**
```java
HashSet<String> hashSet = new HashSet<>();
hashSet.add("Banana");
hashSet.add("Apple");
hashSet.add("Cherry");

System.out.println(hashSet);
// Output: [Cherry, Apple, Banana] or any unpredictable order
```

**LinkedHashSet - Insertion order preserved:**
```java
LinkedHashSet<String> linkedSet = new LinkedHashSet<>();
linkedSet.add("Banana");
linkedSet.add("Apple");
linkedSet.add("Cherry");

System.out.println(linkedSet);
// Output: [Banana, Apple, Cherry] - Insertion order maintained
```

**TreeSet - Automatically sorted:**
```java
TreeSet<String> treeSet = new TreeSet<>();
treeSet.add("Banana");
treeSet.add("Apple");
treeSet.add("Cherry");

System.out.println(treeSet);
// Output: [Apple, Banana, Cherry] - Alphabetically sorted!
```


***

### Key Differences Explained

**1. Internal Data Structure**

- **HashSet:** Uses HashMap internally (hash table with buckets)
- **LinkedHashSet:** Uses LinkedHashMap (hash table + doubly-linked list)
- **TreeSet:** Uses TreeMap internally (Red-Black Tree - self-balancing BST)

**2. Performance**

**HashSet is fastest:**
```java
// Constant time O(1) for operations
hashSet.add(element);      // O(1)
hashSet.contains(element); // O(1)
hashSet.remove(element);   // O(1)
```

**LinkedHashSet is slightly slower than HashSet:**
```java
// O(1) but with linked list overhead
linkedSet.add(element);      // O(1) + pointer updates
linkedSet.contains(element); // O(1)
linkedSet.remove(element);   // O(1) + unlink operation
```

**TreeSet is slowest:**
```java
// Logarithmic time O(log n) due to tree traversal
treeSet.add(element);      // O(log n) - must find insertion point
treeSet.contains(element); // O(log n) - binary search
treeSet.remove(element);   // O(log n) - search + rebalance
```

**Real-world benchmark (1 million elements):**
- HashSet: ~100ms
- LinkedHashSet: ~120ms (20% slower)
- TreeSet: ~800ms (8x slower)

**3. Ordering Behavior**

- **HashSet:** Elements scattered based on hash codes - unpredictable
- **LinkedHashSet:** Elements in the exact order you added them
- **TreeSet:** Elements in ascending order (or comparator-defined order)

**4. Comparison Methods**

- **HashSet & LinkedHashSet:** Use `equals()` and `hashCode()` for comparison
- **TreeSet:** Uses `compareTo()` (from Comparable) or `compare()` (from Comparator)

```java
// For TreeSet, elements must be Comparable
TreeSet<String> strings = new TreeSet<>();  // String implements Comparable - OK

TreeSet<Person> people = new TreeSet<>();  // Person must implement Comparable or provide Comparator
```

**5. Null Handling**

- **HashSet:** Allows one null ✓
- **LinkedHashSet:** Allows one null ✓
- **TreeSet:** Does NOT allow null ✗

```java
HashSet<String> hashSet = new HashSet<>();
hashSet.add(null);  // OK

TreeSet<String> treeSet = new TreeSet<>();
treeSet.add(null);  // Throws NullPointerException!
```

**Why TreeSet doesn't allow null:** Because it needs to compare elements using `compareTo()`, and you cannot compare null with other objects.

***

## Does TreeSet allow duplicate elements?

**No, TreeSet does NOT allow duplicate elements**. Like all Set implementations, it stores only unique elements.

```java
TreeSet<Integer> numbers = new TreeSet<>();
numbers.add(10);    // Added successfully
numbers.add(20);    // Added successfully
numbers.add(10);    // Ignored (duplicate)

System.out.println(numbers);  // [10, 20]
System.out.println(numbers.size());  // 2 (not 3)
```

**How it detects duplicates:**

TreeSet uses `compareTo()` method (or Comparator's `compare()`) to check for duplicates :

```java
// If compareTo returns 0, elements are considered equal (duplicate)
if (existingElement.compareTo(newElement) == 0) {
    // Duplicate detected - don't add
    return false;
}
```

**Important: compareTo() must be consistent with equals()**

```java
class Student implements Comparable<Student> {
    String name;
    int id;
    
    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.id, other.id);  // Compare by id
    }
    
    @Override
    public boolean equals(Object o) {
        // Should also compare by id to be consistent
        return this.id == ((Student) o).id;
    }
}

TreeSet<Student> students = new TreeSet<>();
students.add(new Student("Alice", 101));
students.add(new Student("Bob", 102));
students.add(new Student("Alice", 101));  // Duplicate - rejected

System.out.println(students.size());  // 2
```

**What happens when you try to add a duplicate:**
1. TreeSet navigates the tree to find insertion point
2. Compares new element with existing elements using `compareTo()`
3. If comparison returns 0 (equal), element is rejected
4. `add()` method returns `false`
5. Set size remains unchanged

***

## Does TreeSet maintain insertion order or sorted order?

**TreeSet maintains SORTED ORDER, NOT insertion order**. This is its defining feature and main difference from other Set implementations.

**Example demonstrating sorted order:**
```java
TreeSet<Integer> numbers = new TreeSet<>();

// Add in random order
numbers.add(50);  // Added 1st
numbers.add(10);  // Added 2nd
numbers.add(30);  // Added 3rd
numbers.add(20);  // Added 4th

// Print - sorted order, NOT insertion order
System.out.println(numbers);
// Output: [10, 20, 30, 50] - Ascending order, NOT [50, 10, 30, 20]
```

### Two Types of Sorting

**1. Natural Ordering (Default)**

Elements are sorted according to their natural order (defined by `Comparable` interface):

```java
// Numbers - ascending order
TreeSet<Integer> numbers = new TreeSet<>();
numbers.addAll(Arrays.asList(5, 1, 9, 3));
System.out.println(numbers);  // [1, 3, 5, 9]

// Strings - alphabetical order
TreeSet<String> words = new TreeSet<>();
words.addAll(Arrays.asList("dog", "cat", "ant", "bat"));
System.out.println(words);  // [ant, bat, cat, dog]
```

**2. Custom Ordering (Using Comparator)**

You can define custom sort order using a Comparator:

```java
// Sort strings by length (shortest first)
TreeSet<String> words = new TreeSet<>(Comparator.comparingInt(String::length));
words.add("Apple");
words.add("Kiwi");
words.add("Banana");

System.out.println(words);  // [Kiwi, Apple, Banana] - Sorted by length
```

**Reverse order:**
```java
// Descending order
TreeSet<Integer> descending = new TreeSet<>(Collections.reverseOrder());
descending.addAll(Arrays.asList(5, 1, 9, 3));
System.out.println(descending);  // [9, 5, 3, 1]
```

**Custom object sorting:**
```java
class Employee implements Comparable<Employee> {
    String name;
    int salary;
    
    @Override
    public int compareTo(Employee other) {
        return Integer.compare(this.salary, other.salary);  // Sort by salary
    }
}

TreeSet<Employee> employees = new TreeSet<>();
employees.add(new Employee("Alice", 50000));
employees.add(new Employee("Bob", 80000));
employees.add(new Employee("Charlie", 60000));

// Iteration will be in salary order: Alice (50k), Charlie (60k), Bob (80k)
```

**Key point:** TreeSet **automatically re-sorts** after every insertion to maintain sorted order.

***

## Does TreeSet allow null elements?

**No, TreeSet does NOT allow null elements**. Attempting to add null throws `NullPointerException`.

```java
TreeSet<String> treeSet = new TreeSet<>();
treeSet.add("Apple");
treeSet.add(null);  // Throws NullPointerException!
```

**Why null is not allowed:**

TreeSet needs to **compare elements** to maintain sorted order. Comparison happens via:
- `element.compareTo(other)` for natural ordering
- `comparator.compare(element, other)` for custom ordering

You **cannot compare null** with other objects:

```java
String s1 = "Apple";
String s2 = null;
s1.compareTo(s2);  // NullPointerException - can't call method on null
```

**The error you'll see:**
```
Exception in thread "main" java.lang.NullPointerException
    at java.util.TreeMap.put(TreeMap.java:545)
    at java.util.TreeSet.add(TreeSet.java:238)
```


**Comparison with other Sets:**

| Set Type | Null allowed? | Why? |
|----------|--------------|------|
| HashSet | One null ✓ | Uses hashCode/equals, null has special handling |
| LinkedHashSet | One null ✓ | Same as HashSet |
| TreeSet | No nulls ✗ | Cannot compare null via compareTo() |

**Can you work around this?**

Theoretically, you could use a custom Comparator that handles null:

```java
TreeSet<String> set = new TreeSet<>((s1, s2) -> {
    if (s1 == null && s2 == null) return 0;
    if (s1 == null) return -1;  // Null comes first
    if (s2 == null) return 1;
    return s1.compareTo(s2);
});

set.add("Apple");
set.add(null);  // Would work with this comparator
set.add("Banana");

System.out.println(set);  // [null, Apple, Banana]
```

**But this is NOT recommended** - it breaks the TreeSet contract and can cause issues. Best practice: Don't use null in TreeSet.

***

## When would you use TreeSet instead of HashSet?

Use TreeSet when you need **sorted unique elements** or **special tree-based operations**. Here are specific scenarios:

### 1. When You Need Sorted Elements

**Use TreeSet when sort order matters:**

```java
// Leaderboard - always sorted by score
TreeSet<Integer> topScores = new TreeSet<>(Collections.reverseOrder());
topScores.add(85);
topScores.add(92);
topScores.add(78);
topScores.add(95);

System.out.println("Top scores: " + topScores);
// [95, 92, 85, 78] - Always sorted (highest first)
```

**Use HashSet when sort order doesn't matter:**
```java
// Just checking if user exists
HashSet<String> registeredUsers = new HashSet<>();
registeredUsers.add("alice");
registeredUsers.add("bob");

if (registeredUsers.contains("alice")) {  // O(1) - Faster than TreeSet
    System.out.println("User exists");
}
```

***

### 2. When You Need Range Operations

TreeSet provides special methods for range queries :

```java
TreeSet<Integer> numbers = new TreeSet<>(Arrays.asList(10, 20, 30, 40, 50, 60, 70));

// Get elements in range
Set<Integer> range = numbers.subSet(25, 65);  // Elements >= 25 and < 65
System.out.println(range);  // [30, 40, 50, 60]

// Get elements less than value
Set<Integer> headSet = numbers.headSet(35);  // Elements < 35
System.out.println(headSet);  // [10, 20, 30]

// Get elements greater than or equal to value
Set<Integer> tailSet = numbers.tailSet(45);  // Elements >= 45
System.out.println(tailSet);  // [50, 60, 70]
```

**HashSet doesn't have these methods** - you'd need to manually filter, which is O(n).

***

### 3. When You Need Min/Max Operations

TreeSet provides O(log n) access to minimum and maximum elements :

```java
TreeSet<Integer> prices = new TreeSet<>(Arrays.asList(99, 149, 79, 199, 89));

System.out.println("Lowest price: " + prices.first());   // 79 - O(log n)
System.out.println("Highest price: " + prices.last());   // 199 - O(log n)

// Next higher/lower elements
System.out.println("Next above 90: " + prices.higher(90));   // 99
System.out.println("Next below 90: " + prices.lower(90));    // 89
System.out.println("Ceiling of 85: " + prices.ceiling(85));  // 89 (>= 85)
System.out.println("Floor of 95: " + prices.floor(95));      // 89 (<= 95)
```

**With HashSet:** Finding min/max requires scanning entire set - O(n).

***

### 4. When You Need to Remove Duplicates AND Sort

```java
List<String> names = Arrays.asList("Charlie", "Alice", "Bob", "Alice", "David");

// Remove duplicates + sort in one step
TreeSet<String> uniqueSorted = new TreeSet<>(names);
System.out.println(uniqueSorted);  // [Alice, Bob, Charlie, David]

// With HashSet, you'd need two steps:
HashSet<String> unique = new HashSet<>(names);  // Remove duplicates
List<String> sorted = new ArrayList<>(unique);
Collections.sort(sorted);  // Then sort
```

***

### 5. Specific Real-World Use Cases

**Use TreeSet for:**

**Leaderboards/Rankings:**
```java
TreeSet<Player> leaderboard = new TreeSet<>(
    Comparator.comparingInt(Player::getScore).reversed()
);
// Always maintains top players in order
```

**Event scheduling (sorted by time):**
```java
TreeSet<Event> schedule = new TreeSet<>(
    Comparator.comparing(Event::getStartTime)
);
// Events always in chronological order
```

**Finding nearest elements:**
```java
TreeSet<Double> temperatures = new TreeSet<>();
// Find closest temperature to 25.0
Double closest = temperatures.floor(25.0);  // Largest <= 25
if (closest == null) closest = temperatures.ceiling(25.0);  // Smallest >= 25
```

**Price filtering with ranges:**
```java
TreeSet<Product> productsByPrice = new TreeSet<>(
    Comparator.comparingDouble(Product::getPrice)
);
// Get products in price range
Set<Product> affordable = productsByPrice.subSet(minPrice, maxPrice);
```

***

### When NOT to Use TreeSet (Use HashSet Instead)

**Use HashSet when:**

**1. Sort order doesn't matter:**
```java
// Just need unique IDs
HashSet<Integer> processedIds = new HashSet<>();
```

**2. Performance is critical:**
```java
// Frequent lookups - O(1) vs O(log n)
if (hashSet.contains(item)) {  // Faster
    // ...
}
```

**3. Simple membership checking:**
```java
HashSet<String> blacklist = new HashSet<>();
if (blacklist.contains(ipAddress)) {  // O(1) - Much faster
    block();
}
```

**4. Memory efficiency matters:**
TreeSet uses more memory due to tree node overhead.

---

### Performance Comparison Summary

| Operation | HashSet | TreeSet | When to prefer TreeSet |
|-----------|---------|---------|----------------------|
| add() | O(1) | O(log n) | When you need sorted insertion |
| contains() | O(1) | O(log n) | When you need range queries |
| remove() | O(1) | O(log n) | When sorting matters more than speed |
| min/max | O(n) | O(log n) | ✓ TreeSet wins |
| range query | O(n) | O(log n) | ✓ TreeSet wins |
| Memory | Lower | Higher | HashSet for memory efficiency |



---

## Quick Decision Guide

```
Need unique elements?
├─ Need sorted order?
│  ├─ Yes → TreeSet
│  └─ No → Need insertion order?
│      ├─ Yes → LinkedHashSet
│      └─ No → HashSet (fastest!)
│
└─ Need range operations (subSet, first, last)?
   └─ Yes → TreeSet
```

**Simple rule:** If you see words like "sorted," "ascending," "leaderboard," "min/max," or "range" in the problem, think TreeSet first!

---
# TreeSet - Internal Working (Deep Dive)

## Which data structure does TreeSet use internally?

TreeSet uses **TreeMap** as its internal data structure, which is backed by a **Red-Black Tree** (a self-balancing Binary Search Tree).

**Internal implementation:**
```java
public class TreeSet<E> extends AbstractSet<E> 
                        implements NavigableSet<E>, Cloneable, Serializable {
    
    private transient NavigableMap<E, Object> m;
    
    // Dummy value to associate with keys
    private static final Object PRESENT = new Object();
    
    public TreeSet() {
        this(new TreeMap<>());  // Creates TreeMap internally
    }
    
    TreeSet(NavigableMap<E, Object> m) {
        this.m = m;
    }
    
    public boolean add(E e) {
        return m.put(e, PRESENT) == null;
    }
}
```


**The relationship:** TreeSet → TreeMap → Red-Black Tree

```
User's perspective:
TreeSet<Integer> set = new TreeSet<>();
set.add(5);

Internal reality:
TreeMap<Integer, Object> map = new TreeMap<>();
map.put(5, PRESENT);  // Element as key, dummy value

Red-Black Tree structure:
        5
       / \
     null null
```

**Why TreeMap?** TreeMap already provides:
- Sorted key storage
- No duplicate keys (ensures uniqueness)
- O(log n) operations
- Self-balancing tree structure

TreeSet simply reuses this functionality by storing elements as keys with dummy values.

***

## Red-Black Tree Properties

TreeMap (and thus TreeSet) uses a **Red-Black Tree** - a self-balancing BST with special properties :

**Rules:**
1. Every node is either RED or BLACK
2. Root is always BLACK
3. All leaf nodes (null) are BLACK
4. If a node is RED, its children must be BLACK (no two consecutive red nodes)
5. Every path from root to leaf contains the same number of black nodes

**Why Red-Black Tree?**
- Self-balancing: Automatically maintains height ≈ log(n)
- Guaranteed O(log n) for insert, delete, search
- More lenient balancing than AVL trees (faster insertions)
- Never degenerates into linear structure (unlike simple BST)

**Visual example:**
```
Balanced Red-Black Tree for TreeSet with [10, 20, 30, 40, 50]:

        30(B)
       /      \
    20(R)    40(B)
    /          \
  10(B)       50(R)

(B) = Black node
(R) = Red node

Height = 3 (log₂(5) ≈ 2.3)
All operations: O(log n)
```

***

## How does TreeSet keep elements sorted?

TreeSet keeps elements sorted by **comparing them during every insertion** using either:
1. **Natural ordering** (Comparable interface)
2. **Custom ordering** (Comparator)



### Sorting Mechanism

**When you add an element:**
```java
TreeSet<Integer> set = new TreeSet<>();
set.add(50);
set.add(30);
set.add(70);
```

**Internal process:**
```
Step 1: Add 50
Tree: 50 (becomes root)

Step 2: Add 30
- Compare: 30 < 50? Yes
- Insert as left child of 50
Tree:    50
        /
      30

Step 3: Add 70
- Compare: 70 < 50? No
- Compare: 70 > 50? Yes
- Insert as right child of 50
Tree:    50
        /  \
      30    70

Step 4: Add 20
- Compare: 20 < 50? Yes
- Compare: 20 < 30? Yes
- Insert as left child of 30
Tree:    50
        /  \
      30    70
     /
   20

Result when iterating: [20, 30, 50, 70] - In-order traversal gives sorted output
```

### Natural Ordering (Comparable)

**TreeMap checks if comparator is null** :
```java
public TreeMap() {
    comparator = null;  // Uses natural ordering
}
```

**During insertion, TreeMap uses Comparable:**
```java
public V put(K key, V value) {
    if (comparator != null) {
        // Use custom comparator
    } else {
        // Use Comparable (natural ordering)
        Comparable<? super K> k = (Comparable<? super K>) key;
        
        // Navigate tree using compareTo()
        while (t != null) {
            int cmp = k.compareTo(t.key);
            if (cmp < 0)
                t = t.left;   // Go left
            else if (cmp > 0)
                t = t.right;  // Go right
            else
                return t.setValue(value);  // Duplicate found
        }
    }
}
```

**Example with natural ordering:**
```java
TreeSet<String> words = new TreeSet<>();
words.add("dog");
words.add("cat");
words.add("ant");
words.add("bat");

// Internal comparisons during insertion:
// "dog" vs nothing → insert as root
// "cat" vs "dog" → "cat".compareTo("dog") = -1 → left child
// "ant" vs "dog" → "ant".compareTo("dog") = -1 → left subtree
// "ant" vs "cat" → "ant".compareTo("cat") = -1 → left of "cat"
// "bat" vs "dog" → "bat".compareTo("dog") = -1 → left subtree
// "bat" vs "cat" → "bat".compareTo("cat") = -1 → left subtree
// "bat" vs "ant" → "bat".compareTo("ant") = 1 → right of "ant"

System.out.println(words);  // [ant, bat, cat, dog] - Alphabetically sorted
```

**Classes with natural ordering:**
- All wrapper classes (Integer, Double, etc.)
- String
- Date
- Any class implementing Comparable

***

## What is the time complexity of add, remove, and contains operations?

All basic operations in TreeSet have **O(log n)** time complexity due to the Red-Black Tree structure.

| Operation | Time Complexity | Explanation |
|-----------|----------------|-------------|
| **add(E e)** | **O(log n)** | Navigate tree to find insertion point + rebalance |
| **remove(E e)** | **O(log n)** | Navigate tree to find element + rebalance after removal |
| **contains(E e)** | **O(log n)** | Navigate tree using binary search |
| **first()** | **O(log n)** | Find leftmost node |
| **last()** | **O(log n)** | Find rightmost node |
| **higher(E e)** | **O(log n)** | Binary search + find next |
| **lower(E e)** | **O(log n)** | Binary search + find previous |
| **size()** | **O(1)** | Returns cached size variable |



### Why O(log n)?

**Red-Black Tree height:** The height of a Red-Black tree with n elements is always ≤ 2 log₂(n + 1).

**Example with 1 million elements:**
- Height ≈ 2 × log₂(1,000,001) ≈ 40
- Operations require at most 40 comparisons
- Much better than linear search (1 million comparisons)

**add() operation breakdown:**
```java
public boolean add(E e) {
    // Step 1: Navigate tree to find position - O(log n)
    // - Start at root
    // - Compare with current node
    // - Go left if smaller, right if larger
    // - Repeat until reaching leaf position
    // - Maximum comparisons = height of tree = log n
    
    // Step 2: Insert new node - O(1)
    
    // Step 3: Rebalance tree (if needed) - O(log n)
    // - Color adjustments
    // - Rotations (left/right)
    // - Maximum rotations = O(log n)
    
    return true;
}
```

**contains() operation breakdown:**
```java
public boolean contains(E e) {
    // Binary search in tree - O(log n)
    Node current = root;
    while (current != null) {
        int cmp = compare(e, current.element);
        if (cmp < 0)
            current = current.left;
        else if (cmp > 0)
            current = current.right;
        else
            return true;  // Found
    }
    return false;  // Not found
}
```

**Performance comparison:**

| Operation | ArrayList | HashSet | TreeSet |
|-----------|-----------|---------|---------|
| add() | O(1)* | O(1) | O(log n) |
| contains() | O(n) | O(1) | O(log n) |
| Sorted iteration | O(n log n) | Not possible | Free (O(n)) |

*Amortized for ArrayList

**Interview insight:** TreeSet trades raw speed (O(1)) for guaranteed sorted order (O(log n)). For 1 million elements:
- HashSet: 1 operation
- TreeSet: ~20 operations
- Still very fast in practice!

***

## How does TreeSet handle custom object sorting?

TreeSet handles custom objects in **two ways** :
1. Object implements **Comparable** interface (natural ordering)
2. Provide a **Comparator** to TreeSet constructor (custom ordering)

### Method 1: Implementing Comparable

**Your class must implement Comparable<T>:**
```java
class Student implements Comparable<Student> {
    String name;
    int rollNumber;
    double gpa;
    
    public Student(String name, int rollNumber, double gpa) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.gpa = gpa;
    }
    
    @Override
    public int compareTo(Student other) {
        // Define natural ordering - sort by roll number
        return Integer.compare(this.rollNumber, other.rollNumber);
    }
    
    @Override
    public String toString() {
        return name + "(" + rollNumber + ")";
    }
}

// Usage
TreeSet<Student> students = new TreeSet<>();
students.add(new Student("Alice", 103, 3.8));
students.add(new Student("Bob", 101, 3.5));
students.add(new Student("Charlie", 102, 3.9));

System.out.println(students);
// Output: [Bob(101), Charlie(102), Alice(103)] - Sorted by roll number
```

**compareTo() contract:**
- Returns **negative** if this < other
- Returns **zero** if this == other (duplicate)
- Returns **positive** if this > other

**Important: compareTo() should be consistent with equals()**
```java
// If two objects are equal according to compareTo(), 
// they should also be equal according to equals()
if (student1.compareTo(student2) == 0) {
    // Then student1.equals(student2) should also be true
}
```

### Method 2: Providing Comparator

**Pass Comparator to TreeSet constructor:**
```java
class Employee {
    String name;
    int salary;
    int age;
    
    public Employee(String name, int salary, int age) {
        this.name = name;
        this.salary = salary;
        this.age = age;
    }
    
    @Override
    public String toString() {
        return name + "($" + salary + ")";
    }
}

// Sort by salary (descending)
TreeSet<Employee> bySalary = new TreeSet<>(
    (e1, e2) -> Integer.compare(e2.salary, e1.salary)  // Reverse order
);

bySalary.add(new Employee("Alice", 80000, 30));
bySalary.add(new Employee("Bob", 95000, 35));
bySalary.add(new Employee("Charlie", 70000, 28));

System.out.println(bySalary);
// Output: [Bob($95000), Alice($80000), Charlie($70000)] - Highest salary first
```

**Multiple sorting criteria:**
```java
// Sort by salary (descending), then by age (ascending) for ties
TreeSet<Employee> employees = new TreeSet<>((e1, e2) -> {
    int salaryCompare = Integer.compare(e2.salary, e1.salary);
    if (salaryCompare != 0) {
        return salaryCompare;  // Different salaries
    }
    return Integer.compare(e1.age, e2.age);  // Same salary, sort by age
});
```

**Using Comparator.comparing() (Java 8+):**
```java
// Sort by name
TreeSet<Employee> byName = new TreeSet<>(
    Comparator.comparing(Employee::getName)
);

// Sort by salary descending
TreeSet<Employee> bySalaryDesc = new TreeSet<>(
    Comparator.comparingInt(Employee::getSalary).reversed()
);

// Multiple criteria
TreeSet<Employee> complex = new TreeSet<>(
    Comparator.comparingInt(Employee::getSalary)
              .reversed()
              .thenComparingInt(Employee::getAge)
);
```

### Which method takes precedence?

**If both Comparable and Comparator are present, Comparator wins** :
```java
class Person implements Comparable<Person> {
    String name;
    int age;
    
    @Override
    public int compareTo(Person other) {
        return this.name.compareTo(other.name);  // Sort by name
    }
}

// Create TreeSet with Comparator
TreeSet<Person> people = new TreeSet<>(
    Comparator.comparingInt(p -> p.age)  // Sort by age instead
);

// Comparator takes precedence over Comparable
```

***

## What happens if elements added to a TreeSet are not Comparable?

If you try to add elements that are **not Comparable** and **no Comparator is provided**, TreeSet throws **ClassCastException** at runtime.

**Example - Runtime error:**
```java
class Person {
    String name;
    int age;
    
    // Does NOT implement Comparable
}

TreeSet<Person> people = new TreeSet<>();  // No Comparator provided
people.add(new Person("Alice", 30));       // First addition works
people.add(new Person("Bob", 25));         // BOOM! ClassCastException

// Error message:
// Exception in thread "main" java.lang.ClassCastException: 
// Person cannot be cast to java.lang.Comparable
```

**Why the error occurs:**

When TreeMap (inside TreeSet) tries to insert the second element, it attempts to compare:
```java
Comparable<? super K> k = (Comparable<? super K>) key;
int cmp = k.compareTo(t.key);  // ClassCastException here!
```

Since `Person` doesn't implement `Comparable`, the cast fails.

**First element succeeds because there's nothing to compare with:**
```java
people.add(first);  // No comparison needed - becomes root
people.add(second); // Needs comparison - ERROR!
```

### How to fix this:

**Solution 1: Implement Comparable:**
```java
class Person implements Comparable<Person> {
    String name;
    int age;
    
    @Override
    public int compareTo(Person other) {
        return this.name.compareTo(other.name);
    }
}

TreeSet<Person> people = new TreeSet<>();
people.add(new Person("Alice", 30));  // Works!
people.add(new Person("Bob", 25));    // Works!
```

**Solution 2: Provide Comparator:**
```java
class Person {
    String name;
    int age;
    // No Comparable implementation
}

// Provide Comparator in constructor
TreeSet<Person> people = new TreeSet<>(
    Comparator.comparing(p -> p.name)
);

people.add(new Person("Alice", 30));  // Works!
people.add(new Person("Bob", 25));    // Works!
```

**Interview tip:** Always remember - TreeSet requires a way to compare elements. No comparison mechanism = runtime error!

***

## How do you use a Comparator in a TreeSet?

You provide a **Comparator** to the TreeSet constructor to define custom sorting logic.

### Basic Syntax

**Method 1: Anonymous class (pre-Java 8):**
```java
TreeSet<Integer> descendingNumbers = new TreeSet<>(new Comparator<Integer>() {
    @Override
    public int compare(Integer a, Integer b) {
        return b.compareTo(a);  // Reverse order
    }
});

descendingNumbers.addAll(Arrays.asList(5, 2, 8, 1));
System.out.println(descendingNumbers);  // [8, 5, 2, 1]
```

**Method 2: Lambda expression (Java 8+):**
```java
TreeSet<Integer> descendingNumbers = new TreeSet<>(
    (a, b) -> b.compareTo(a)
);

// Or even simpler with method reference
TreeSet<Integer> descendingNumbers = new TreeSet<>(
    Collections.reverseOrder()
);
```

**Method 3: Comparator.comparing() (Java 8+):**
```java
TreeSet<String> byLength = new TreeSet<>(
    Comparator.comparingInt(String::length)
);

byLength.addAll(Arrays.asList("Apple", "Kiwi", "Banana"));
System.out.println(byLength);  // [Kiwi, Apple, Banana] - Sorted by length
```

### Real-World Examples

**Example 1: Sort students by GPA (highest first):**
```java
class Student {
    String name;
    double gpa;
    
    public Student(String name, double gpa) {
        this.name = name;
        this.gpa = gpa;
    }
    
    public String toString() {
        return name + ":" + gpa;
    }
}

TreeSet<Student> topStudents = new TreeSet<>(
    (s1, s2) -> Double.compare(s2.gpa, s1.gpa)  // Descending GPA
);

topStudents.add(new Student("Alice", 3.8));
topStudents.add(new Student("Bob", 3.9));
topStudents.add(new Student("Charlie", 3.7));

System.out.println(topStudents);
// [Bob:3.9, Alice:3.8, Charlie:3.7] - Highest GPA first
```

**Example 2: Sort by multiple criteria:**
```java
// Sort by salary (desc), then by name (asc) for ties
TreeSet<Employee> employees = new TreeSet<>(
    Comparator.comparingInt(Employee::getSalary)
              .reversed()
              .thenComparing(Employee::getName)
);
```

**Example 3: Case-insensitive string sorting:**
```java
TreeSet<String> names = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
names.add("alice");
names.add("BOB");
names.add("Charlie");
names.add("ALICE");  // Duplicate (case-insensitive)

System.out.println(names);  // [alice, BOB, Charlie]
```

**Example 4: Custom complex comparison:**
```java
class Task {
    String name;
    int priority;
    LocalDateTime deadline;
}

TreeSet<Task> taskQueue = new TreeSet<>((t1, t2) -> {
    // 1. Higher priority first
    int priorityCompare = Integer.compare(t2.priority, t1.priority);
    if (priorityCompare != 0) return priorityCompare;
    
    // 2. Earlier deadline first (for same priority)
    int deadlineCompare = t1.deadline.compareTo(t2.deadline);
    if (deadlineCompare != 0) return deadlineCompare;
    
    // 3. Alphabetically by name (for same priority and deadline)
    return t1.name.compareTo(t2.name);
});
```

**Example 5: Reverse natural ordering:**
```java
// Method 1: Collections.reverseOrder()
TreeSet<Integer> desc1 = new TreeSet<>(Collections.reverseOrder());

// Method 2: Comparator.reverseOrder()
TreeSet<Integer> desc2 = new TreeSet<>(Comparator.reverseOrder());

// Method 3: Lambda
TreeSet<Integer> desc3 = new TreeSet<>((a, b) -> b.compareTo(a));
```

### Comparator vs Comparable Decision

**Use Comparable when:**
- The ordering is the "natural" way to order the objects
- You control the class source code
- There's one obvious way to sort
- Example: Student sorted by ID, Product sorted by price

**Use Comparator when:**
- You need multiple different sorting orders
- You don't control the class (can't modify it)
- The natural ordering doesn't fit your use case
- Example: Sort String by length instead of alphabetically

**Can have both:**
```java
class Product implements Comparable<Product> {
    String name;
    double price;
    
    @Override
    public int compareTo(Product other) {
        return Double.compare(this.price, other.price);  // Natural: by price
    }
}

// Use natural ordering (by price)
TreeSet<Product> byPrice = new TreeSet<>();

// Use custom ordering (by name)
TreeSet<Product> byName = new TreeSet<>(
    Comparator.comparing(Product::getName)
);
```
# TreeSet - Behavior, Safety & Sorting

## Behavior & Safety

### Is TreeSet synchronized? How to make it thread-safe?

**No, TreeSet is NOT synchronized** (not thread-safe). Multiple threads accessing a TreeSet concurrently can cause data corruption, lost updates, or unpredictable behavior.

**Why TreeSet isn't thread-safe:**
```java
TreeSet<Integer> set = new TreeSet<>();

// Thread 1
set.add(10);

// Thread 2 (concurrent)
set.add(20);

// Result: May corrupt internal Red-Black Tree structure
```

**Demonstration of the problem** :
```java
ExecutorService executor = Executors.newFixedThreadPool(100);
TreeSet<String> set = new TreeSet<>();

for (int i = 0; i < 100; i++) {
    executor.execute(() -> set.add("item"));
}

executor.shutdown();
executor.awaitTermination(1, TimeUnit.SECONDS);

System.out.println("Set size: " + set.size());
// Expected: 1 (all threads adding same element)
// Actual: May vary due to race conditions (e.g., 0, 1, or corrupted state)
```


***

### How to make TreeSet thread-safe:

**Option 1: Collections.synchronizedSortedSet() (Simple wrapper)**
```java
SortedSet<String> syncSet = Collections.synchronizedSortedSet(new TreeSet<>());

// Now thread-safe for basic operations
syncSet.add("Apple");
syncSet.remove("Banana");
```


**Important caveat - Manual synchronization for iteration** :
```java
SortedSet<String> syncSet = Collections.synchronizedSortedSet(new TreeSet<>());

// WRONG - Not thread-safe during iteration!
for (String item : syncSet) {
    process(item);  // Another thread can modify during iteration
}

// CORRECT - Must manually synchronize
synchronized(syncSet) {
    for (String item : syncSet) {
        process(item);  // Safe - no other thread can access
    }
}
```

**Syntax:**
```java
public static <T> SortedSet<T> synchronizedSortedSet(SortedSet<T> s)
```


**Limitations:**
- Serializes all access (only one thread at a time)
- Poor performance under high concurrency
- Still requires manual synchronization for iteration

---

**Option 2: External synchronization with synchronized blocks**
```java
TreeSet<Integer> set = new TreeSet<>();

// Thread 1
synchronized (set) {
    set.add(4);
}

// Thread 2
synchronized (set) {
    set.remove(5);
}
```

**Pros:** Fine-grained control
**Cons:** Manual locking on every operation, easy to forget

***

**Option 3: ReentrantReadWriteLock (Better for read-heavy workloads)**
```java
TreeSet<Integer> set = new TreeSet<>();
ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

// Thread 1 (write operation)
lock.writeLock().lock();
try {
    set.add(4);
} finally {
    lock.writeLock().unlock();
}

// Thread 2 (read operation)
lock.readLock().lock();
try {
    set.contains(5);
} finally {
    lock.readLock().unlock();
}
```

**Advantage:** Multiple threads can read concurrently, only writes are exclusive.

***

**Option 4: ConcurrentSkipListSet (Best for high concurrency)**
```java
NavigableSet<String> concurrentSet = new ConcurrentSkipListSet<>();
concurrentSet.add("Apple");
concurrentSet.add("Banana");

// Thread-safe by design, no manual synchronization needed
for (String item : concurrentSet) {
    process(item);  // Safe even during concurrent modifications
}
```

**ConcurrentSkipListSet vs TreeSet:**

| Feature | TreeSet | ConcurrentSkipListSet |
|---------|---------|----------------------|
| **Thread-safe** | No | Yes |
| **Iterator** | Fail-fast | Fail-safe (weakly consistent) |
| **Concurrent reads** | Not safe | Safe |
| **Concurrent writes** | Not safe | Safe |
| **Performance (single thread)** | Faster | Slightly slower |
| **Performance (multi-thread)** | Poor (with locks) | Excellent |
| **Data structure** | Red-Black Tree | Skip List |



**When to use ConcurrentSkipListSet:**
- High concurrency scenarios
- Multiple threads reading/writing simultaneously
- No manual synchronization wanted

***

**Important note from search results** :
> "Both TreeMap and TreeSet are safe when read, even concurrently, by multiple threads. So if they have been created and populated by a single thread (say, at the start of the program), and only then read, but not modified by multiple threads, there's no reason for synchronization or locking."

**Read-only scenario doesn't need synchronization:**
```java
// Populate in main thread
TreeSet<Integer> readOnlySet = new TreeSet<>();
readOnlySet.addAll(Arrays.asList(1, 2, 3, 4, 5));

// Multiple threads can safely read
ExecutorService executor = Executors.newFixedThreadPool(10);
for (int i = 0; i < 10; i++) {
    executor.execute(() -> {
        System.out.println(readOnlySet.first());  // Safe - read-only
    });
}
```

***

### What happens when TreeSet is modified during iteration? (Fail-fast)

TreeSet exhibits **fail-fast behavior** - it throws `ConcurrentModificationException` when the set is structurally modified during iteration.

**Fail-fast mechanism:**
```java
// TreeSet (via TreeMap) tracks modifications
transient int modCount = 0;  // Modification counter

// Every structural change increments it
public boolean add(E e) {
    // ... add logic
    modCount++;
}

// Iterator stores expected count at creation
private class TreeSetIterator {
    int expectedModCount = modCount;
    
    public E next() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
        // ... return element
    }
}
```

***

**Example 1: Direct modification during iteration (WRONG)**
```java
TreeSet<String> fruits = new TreeSet<>();
fruits.add("Apple");
fruits.add("Banana");
fruits.add("Cherry");

for (String fruit : fruits) {
    if (fruit.equals("Banana")) {
        fruits.remove(fruit);  // Throws ConcurrentModificationException!
    }
}
```

**Why it fails:**
1. Enhanced for-loop creates iterator with `expectedModCount = 3`
2. `fruits.remove()` increments `modCount` to 4
3. Next `iterator.next()` detects mismatch (3 ≠ 4)
4. Throws `ConcurrentModificationException`

***

**Example 2: Iterator modification (CORRECT)**
```java
TreeSet<String> fruits = new TreeSet<>();
fruits.add("Apple");
fruits.add("Banana");
fruits.add("Cherry");

Iterator<String> it = fruits.iterator();
while (it.hasNext()) {
    String fruit = it.next();
    if (fruit.equals("Banana")) {
        it.remove();  // Safe - updates expectedModCount
    }
}

System.out.println(fruits);  // [Apple, Cherry] - sorted order maintained
```

**Why it works:**
- `iterator.remove()` modifies the set AND updates `expectedModCount`
- Both counters stay synchronized
- Sorted order is maintained after removal

***

**Example 3: removeIf() (BEST - Java 8+)**
```java
fruits.removeIf(fruit -> fruit.equals("Banana"));
```

**Advantages:**
- Cleaner syntax
- Handles modification counter internally
- Maintains tree structure correctly

***

**Multi-threaded scenario** :
```java
// Thread 1: Iterating
for (String item : treeSet) {
    process(item);  // May throw ConcurrentModificationException
}

// Thread 2: Modifying concurrently
treeSet.add("NewItem");  // Causes exception in Thread 1
```

**TreeSet vs ConcurrentSkipListSet iterators** :

| Iterator Type | TreeSet | ConcurrentSkipListSet |
|--------------|---------|----------------------|
| **Behavior** | Fail-fast | Fail-safe (weakly consistent) |
| **Concurrent modification** | Throws exception | No exception |
| **Consistency** | Snapshot at creation | May reflect updates |
| **Use case** | Single-threaded | Multi-threaded |

***

**Important note:** Fail-fast is **best-effort**, not guaranteed. In rare cases with precise timing, you might get corrupted data WITHOUT an exception. For true thread-safety, use `Collections.synchronizedSortedSet()` or `ConcurrentSkipListSet`.

***

### What is the difference between Comparable and Comparator in TreeSet?

Both are used to define ordering in TreeSet, but they serve different purposes:

**Comparison Table:**

| Aspect | Comparable | Comparator |
|--------|-----------|-----------|
| **What is it?** | Interface implemented by the element class | Separate interface passed to TreeSet |
| **Method** | `int compareTo(T o)` | `int compare(T o1, T o2)` |
| **Where defined?** | Inside the element class | External (separate class/lambda) |
| **How many?** | One per class (natural ordering) | Multiple possible (custom ordering) |
| **When used?** | You control the class source code | You don't control the class OR need multiple orderings |
| **Syntax** | `class Student implements Comparable<Student>` | `new TreeSet<>(comparator)` |
| **Precedence** | Lower priority | Higher priority (overrides Comparable) |

***

### Comparable - Natural Ordering

**Definition:** Defines the "natural" ordering of objects.

**Example:**
```java
class Student implements Comparable<Student> {
    String name;
    int rollNumber;
    double gpa;
    
    public Student(String name, int rollNumber, double gpa) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.gpa = gpa;
    }
    
    @Override
    public int compareTo(Student other) {
        // Natural ordering: sort by roll number
        return Integer.compare(this.rollNumber, other.rollNumber);
    }
    
    @Override
    public String toString() {
        return name + "(" + rollNumber + ")";
    }
}

// Usage - No comparator needed
TreeSet<Student> students = new TreeSet<>();
students.add(new Student("Alice", 103, 3.8));
students.add(new Student("Bob", 101, 3.5));
students.add(new Student("Charlie", 102, 3.9));

System.out.println(students);
// Output: [Bob(101), Charlie(102), Alice(103)] - Sorted by roll number
```

**When to use Comparable:**
- There's ONE obvious way to order objects
- You control the class source code
- This ordering makes sense as the "default" for the class
- Examples: Integer (by value), String (alphabetically), Date (chronologically)

***

### Comparator - Custom Ordering

**Definition:** Defines custom ordering separate from the class.

**Example:**
```java
class Product {
    String name;
    double price;
    
    // No Comparable implementation
}

// Sort by price (ascending)
TreeSet<Product> byPrice = new TreeSet<>(
    Comparator.comparingDouble(Product::getPrice)
);

// Sort by name (alphabetically)
TreeSet<Product> byName = new TreeSet<>(
    Comparator.comparing(Product::getName)
);

// Sort by price (descending)
TreeSet<Product> byPriceDesc = new TreeSet<>(
    Comparator.comparingDouble(Product::getPrice).reversed()
);
```

**When to use Comparator:**
- You DON'T control the class source code (e.g., String, Integer)
- You need MULTIPLE different orderings
- The natural ordering doesn't fit your use case
- You want to override the natural ordering

***

### Can you have both?

**Yes! Comparator takes precedence over Comparable:**
```java
class Employee implements Comparable<Employee> {
    String name;
    int salary;
    
    @Override
    public int compareTo(Employee other) {
        return this.name.compareTo(other.name);  // Natural: by name
    }
}

// Use natural ordering (by name)
TreeSet<Employee> byName = new TreeSet<>();

// Use custom ordering (by salary) - overrides Comparable
TreeSet<Employee> bySalary = new TreeSet<>(
    Comparator.comparingInt(Employee::getSalary)
);
```

***

### Real-world comparison:

**Scenario: Sorting students**

**Using Comparable (one way):**
```java
class Student implements Comparable<Student> {
    String name;
    int marks;
    
    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.marks, other.marks);  // By marks
    }
}

TreeSet<Student> students = new TreeSet<>();
// Always sorted by marks
```

**Using Comparator (multiple ways):**
```java
class Student {
    String name;
    int marks;
    // No Comparable - more flexible
}

// Sort by marks
TreeSet<Student> byMarks = new TreeSet<>(
    Comparator.comparingInt(Student::getMarks)
);

// Sort by name
TreeSet<Student> byName = new TreeSet<>(
    Comparator.comparing(Student::getName)
);

// Sort by marks descending
TreeSet<Student> byMarksDesc = new TreeSet<>(
    Comparator.comparingInt(Student::getMarks).reversed()
);
```

***

**What happens if you use neither?**
```java
class Person {
    String name;
    // No Comparable, no Comparator provided
}

TreeSet<Person> people = new TreeSet<>();
people.add(new Person("Alice"));  // First add - OK
people.add(new Person("Bob"));    // Throws ClassCastException!

// Error: Person cannot be cast to java.lang.Comparable
```

**Interview key point:** TreeSet REQUIRES a way to compare elements. Use Comparable for natural ordering, Comparator for custom ordering, or both (Comparator wins).

***

## Sorting Behavior

### What type of sorting does TreeSet perform by default?

TreeSet performs **ascending order sorting** using **natural ordering** (defined by the `Comparable` interface).

**Default behavior:**
```java
// Numbers - ascending order
TreeSet<Integer> numbers = new TreeSet<>();
numbers.addAll(Arrays.asList(50, 10, 30, 20, 40));
System.out.println(numbers);
// Output: [10, 20, 30, 40, 50] - Smallest to largest

// Strings - alphabetical order
TreeSet<String> words = new TreeSet<>();
words.addAll(Arrays.asList("dog", "cat", "ant", "bat"));
System.out.println(words);
// Output: [ant, bat, cat, dog] - Alphabetically

// Characters - ASCII order
TreeSet<Character> chars = new TreeSet<>();
chars.addAll(Arrays.asList('Z', 'A', 'M', 'B'));
System.out.println(chars);
// Output: [A, B, M, Z] - Alphabetically
```

**Why ascending?**

TreeSet uses `compareTo()` method from `Comparable` interface:
```java
// Integer.compareTo() implementation
public int compareTo(Integer other) {
    return this.value - other.value;  // Positive if this > other
}
```

When navigating the tree:
- If `element.compareTo(node) < 0` → go left (smaller)
- If `element.compareTo(node) > 0` → go right (larger)

This naturally results in **ascending order** when traversing the tree in-order (left → root → right).

**Natural ordering for common types:**
- **Numbers** (Integer, Double, Long): Smallest to largest
- **String**: Alphabetical (A-Z, case-sensitive: 'A' < 'a')
- **Date/LocalDate**: Earliest to latest
- **Boolean**: false < true

---

### Can TreeSet sort in descending order? How?

**Yes, TreeSet can sort in descending order** using a **Comparator** to reverse the natural ordering.

**Method 1: Collections.reverseOrder() (Simplest)**
```java
TreeSet<Integer> descending = new TreeSet<>(Collections.reverseOrder());
descending.addAll(Arrays.asList(10, 30, 20, 50, 40));

System.out.println(descending);
// Output: [50, 40, 30, 20, 10] - Largest to smallest
```

**Method 2: Comparator.reverseOrder() (Java 8+)**
```java
TreeSet<String> descending = new TreeSet<>(Comparator.reverseOrder());
descending.addAll(Arrays.asList("dog", "cat", "ant", "bat"));

System.out.println(descending);
// Output: [dog, cat, bat, ant] - Reverse alphabetical
```

**Method 3: Lambda expression**
```java
TreeSet<Integer> descending = new TreeSet<>((a, b) -> b.compareTo(a));
descending.addAll(Arrays.asList(5, 2, 8, 1));

System.out.println(descending);
// Output: [8, 5, 2, 1] - Descending
```

**Method 4: Using Comparator.comparing().reversed()**
```java
class Student {
    String name;
    int marks;
    
    // Getters...
}

// Sort by marks in descending order
TreeSet<Student> students = new TreeSet<>(
    Comparator.comparingInt(Student::getMarks).reversed()
);

students.add(new Student("Alice", 85));
students.add(new Student("Bob", 92));
students.add(new Student("Charlie", 78));

// Output: Bob(92), Alice(85), Charlie(78) - Highest marks first
```

**Method 5: Custom Comparator with reversed logic**
```java
TreeSet<Integer> descending = new TreeSet<>(new Comparator<Integer>() {
    @Override
    public int compare(Integer a, Integer b) {
        return Integer.compare(b, a);  // Note: b compared to a (reversed)
    }
});
```

***

**Descending with NavigableSet methods:**

TreeSet also provides methods to get descending views:
```java
TreeSet<Integer> ascending = new TreeSet<>(Arrays.asList(1, 2, 3, 4, 5));

// Get descending iterator
Iterator<Integer> descIt = ascending.descendingIterator();
while (descIt.hasNext()) {
    System.out.print(descIt.next() + " ");
}
// Output: 5 4 3 2 1

// Get descending set (view)
NavigableSet<Integer> descending = ascending.descendingSet();
System.out.println(descending);
// Output: [5, 4, 3, 2, 1]

// Note: Changes to descending view affect original set
descending.add(6);
System.out.println(ascending);
// Output: [1, 2, 3, 4, 5, 6] - Original set updated
```

**Real-world example: Leaderboard**
```java
class Player {
    String name;
    int score;
    
    public Player(String name, int score) {
        this.name = name;
        this.score = score;
    }
    
    @Override
    public String toString() {
        return name + ":" + score;
    }
}

// Leaderboard: highest score first
TreeSet<Player> leaderboard = new TreeSet<>(
    Comparator.comparingInt(Player::getScore).reversed()
);

leaderboard.add(new Player("Alice", 850));
leaderboard.add(new Player("Bob", 920));
leaderboard.add(new Player("Charlie", 780));

System.out.println(leaderboard);
// Output: [Bob:920, Alice:850, Charlie:780] - Top scores first
```

***

### What is the difference between headSet(), tailSet(), and subSet() methods?

These are **range-view methods** that return portions of the TreeSet based on element values. They provide views (not copies) of the original set.

**Method signatures:**
```java
SortedSet<E> headSet(E toElement);          // Elements < toElement
SortedSet<E> tailSet(E fromElement);        // Elements >= fromElement
SortedSet<E> subSet(E fromElement, E toElement); // fromElement <= elements < toElement
```

***

### 1. headSet() - Elements less than specified element

**Returns:** All elements **strictly less than** the specified element.

```java
TreeSet<Integer> numbers = new TreeSet<>(Arrays.asList(10, 20, 30, 40, 50, 60, 70));

SortedSet<Integer> head = numbers.headSet(40);
System.out.println(head);
// Output: [10, 20, 30] - All elements < 40
```

**Visual representation:**
```
Original: [10, 20, 30, 40, 50, 60, 70]
headSet(40):  ^------^  (< 40)
Result: [10, 20, 30]
```

**Important: It's a VIEW, not a copy:**
```java
TreeSet<Integer> numbers = new TreeSet<>(Arrays.asList(10, 20, 30, 40, 50));
SortedSet<Integer> head = numbers.headSet(40);

// Modify the view
head.add(25);  // OK - 25 < 40
System.out.println(numbers);  // [10, 20, 25, 30, 40, 50] - Original modified!

// Try to add element >= 40
head.add(45);  // Throws IllegalArgumentException - outside range!
```

**NavigableSet version (Java 6+):**
```java
NavigableSet<Integer> head = numbers.headSet(40, true);  // Include 40
System.out.println(head);
// Output: [10, 20, 30, 40] - Elements <= 40
```

***

### 2. tailSet() - Elements greater than or equal to specified element

**Returns:** All elements **greater than or equal to** the specified element.

```java
TreeSet<Integer> numbers = new TreeSet<>(Arrays.asList(10, 20, 30, 40, 50, 60, 70));

SortedSet<Integer> tail = numbers.tailSet(40);
System.out.println(tail);
// Output: [40, 50, 60, 70] - All elements >= 40
```

**Visual representation:**
```
Original: [10, 20, 30, 40, 50, 60, 70]
tailSet(40):          ^--------------^  (>= 40)
Result: [40, 50, 60, 70]
```

**It's a VIEW:**
```java
TreeSet<Integer> numbers = new TreeSet<>(Arrays.asList(10, 20, 30, 40, 50));
SortedSet<Integer> tail = numbers.tailSet(40);

// Modify the view
tail.add(45);  // OK - 45 >= 40
System.out.println(numbers);  // [10, 20, 30, 40, 45, 50] - Original modified!

// Remove from view
tail.remove(40);
System.out.println(numbers);  // [10, 20, 30, 45, 50] - Removed from original too!

// Try to add element < 40
tail.add(35);  // Throws IllegalArgumentException - outside range!
```

**NavigableSet version:**
```java
NavigableSet<Integer> tail = numbers.tailSet(40, false);  // Exclude 40
System.out.println(tail);
// Output: [50, 60, 70] - Elements > 40
```

***

### 3. subSet() - Elements in range

**Returns:** All elements from `fromElement` (inclusive) to `toElement` (exclusive).

```java
TreeSet<Integer> numbers = new TreeSet<>(Arrays.asList(10, 20, 30, 40, 50, 60, 70));

SortedSet<Integer> sub = numbers.subSet(25, 65);
System.out.println(sub);
// Output: [30, 40, 50, 60] - Elements >= 25 and < 65
```

**Visual representation:**
```
Original: [10, 20, 30, 40, 50, 60, 70]
subSet(25, 65):    ^-----------^  (25 <= x < 65)
Result: [30, 40, 50, 60]
```

**It's a VIEW:**
```java
TreeSet<Integer> numbers = new TreeSet<>(Arrays.asList(10, 20, 30, 40, 50, 60, 70));
SortedSet<Integer> sub = numbers.subSet(25, 65);

// Modify the view
sub.add(35);  // OK - 25 <= 35 < 65
System.out.println(numbers);  // [10, 20, 30, 35, 40, 50, 60, 70] - Original modified!

// Try to add outside range
sub.add(70);  // Throws IllegalArgumentException - 70 >= 65 (outside range)
sub.add(10);  // Throws IllegalArgumentException - 10 < 25 (outside range)
```

**NavigableSet version (control inclusiveness):**
```java
NavigableSet<Integer> sub = numbers.subSet(30, true, 60, true);
// Include both 30 and 60
System.out.println(sub);
// Output: [30, 40, 50, 60]

NavigableSet<Integer> sub2 = numbers.subSet(30, false, 60, false);
// Exclude both 30 and 60
System.out.println(sub2);
// Output: [40, 50]
```

***

### Comparison Summary

| Method | Returns | fromElement | toElement |
|--------|---------|-------------|-----------|
| **headSet(E to)** | Elements < to | N/A | Exclusive |
| **tailSet(E from)** | Elements >= from | Inclusive | N/A |
| **subSet(E from, E to)** | from <= elements < to | Inclusive | Exclusive |

**NavigableSet extended versions:**
```java
// More control over inclusiveness
headSet(E to, boolean inclusive)           // Elements < or <= to
tailSet(E from, boolean inclusive)         // Elements > or >= from
subSet(E from, boolean fromInclusive,      // Full control over both ends
       E to, boolean toInclusive)
```

***

### Real-World Use Cases

**Example 1: Price filtering**
```java
TreeSet<Double> prices = new TreeSet<>(
    Arrays.asList(9.99, 19.99, 29.99, 39.99, 49.99, 59.99)
);

// Products under $30
SortedSet<Double> affordable = prices.headSet(30.0);
System.out.println("Under $30: " + affordable);
// Output: [9.99, 19.99, 29.99]

// Products $40 and above
SortedSet<Double> premium = prices.tailSet(40.0);
System.out.println("$40+: " + premium);
// Output: [49.99, 59.99]

// Products in $20-$50 range
SortedSet<Double> midRange = prices.subSet(20.0, 50.0);
System.out.println("$20-$50: " + midRange);
// Output: [29.99, 39.99, 49.99]
```

**Example 2: Date ranges**
```java
TreeSet<LocalDate> dates = new TreeSet<>(Arrays.asList(
    LocalDate.of(2025, 1, 15),
    LocalDate.of(2025, 3, 20),
    LocalDate.of(2025, 6, 10),
    LocalDate.of(2025, 9, 5),
    LocalDate.of(2025, 12, 25)
));

// Events before June
SortedSet<LocalDate> firstHalf = dates.headSet(LocalDate.of(2025, 7, 1));
System.out.println(firstHalf);
// [2025-01-15, 2025-03-20, 2025-06-10]

// Events from September onwards
SortedSet<LocalDate> fallWinter = dates.tailSet(LocalDate.of(2025, 9, 1));
System.out.println(fallWinter);
// [2025-09-05, 2025-12-25]

// Q2 events (April-June)
SortedSet<LocalDate> q2 = dates.subSet(
    LocalDate.of(2025, 4, 1),
    LocalDate.of(2025, 7, 1)
);
System.out.println(q2);
// [2025-06-10]
```

**Example 3: Student grade ranges**
```java
TreeSet<Integer> scores = new TreeSet<>(
    Arrays.asList(55, 62, 78, 85, 92, 88, 73, 95)
);

// Students who passed (>= 60)
SortedSet<Integer> passed = scores.tailSet(60);
System.out.println("Passed: " + passed);
// [62, 73, 78, 85, 88, 92, 95]

// Students with A grade (>= 90)
SortedSet<Integer> aGrades = scores.tailSet(90);
System.out.println("A grades: " + aGrades);
// [92, 95]

// B grade range (80-89)
SortedSet<Integer> bGrades = scores.subSet(80, 90);
System.out.println("B grades: " + bGrades);
// [85, 88]
```
