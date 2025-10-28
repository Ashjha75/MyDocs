---
title: "Java HashSet"
---

## What is a HashSet in Java?

HashSet is a **collection that stores only unique elements** (no duplicates allowed). It's part of the Java Collections Framework and implements the `Set` interface.

**Simple definition**: Think of HashSet as a bag where you can throw items, but if you try to add the same item twice, it will ignore the duplicate.

```java
HashSet<String> names = new HashSet<>();
names.add("John");
names.add("Alice");
names.add("John");  // Duplicate - will be ignored

System.out.println(names);  // Output: [John, Alice]
System.out.println(names.size());  // Output: 2 (not 3)
```

**Key point for interview**: HashSet is used when you need to ensure **uniqueness** of elements and don't care about the order.

***

## How does HashSet store elements internally?

**Simple answer**: HashSet internally uses a **HashMap** to store elements.

**How it works**:
- When you add an element to HashSet, it's actually stored as a **key** in an internal HashMap
- The value is just a dummy constant object (always the same)
- This is why duplicates aren't allowed - HashMap keys must be unique!

```java
// What you write:
HashSet<String> set = new HashSet<>();
set.add("Apple");

// What happens internally (simplified):
HashMap<String, Object> map = new HashMap<>();
map.put("Apple", DUMMY_VALUE);  // DUMMY_VALUE is a constant
```

**Technical details for interview** :
- **Data structure**: Hash table (via HashMap)
- **Default capacity**: 16 buckets
- **Load factor**: 0.75 (when 75% full, capacity doubles)
- **Performance**: O(1) for add, remove, contains operations

**Why use hashing?**
When you add an element, HashSet calculates its **hashCode()** to determine which "bucket" to place it in. This makes lookups super fast - O(1) instead of O(n).

**Interview tip**: Mention that HashSet provides "constant-time performance" for basic operations, which is much faster than ArrayList for checking if an element exists.

***

## Does HashSet allow duplicate elements?

**No, HashSet does NOT allow duplicates**. This is the **main feature** of HashSet.

**What happens if you try to add a duplicate?**
- The `add()` method returns `false`
- The duplicate is ignored (not added)
- The HashSet size remains the same

```java
HashSet<Integer> numbers = new HashSet<>();
numbers.add(10);    // Returns true (added)
numbers.add(20);    // Returns true (added)
numbers.add(10);    // Returns false (duplicate, not added)

System.out.println(numbers);  // [10, 20]
System.out.println(numbers.size());  // 2
```

**How does it detect duplicates?**
HashSet uses two methods to check for duplicates:
1. **hashCode()** - First check: Do they have the same hash code?
2. **equals()** - Second check: Are they actually equal?

Both must return true for an element to be considered a duplicate.

**Real-world example**:
```java
// Remove duplicates from a list
List<String> listWithDuplicates = Arrays.asList("A", "B", "A", "C", "B");
HashSet<String> uniqueElements = new HashSet<>(listWithDuplicates);
System.out.println(uniqueElements);  // [A, B, C]
```

**Interview insight**: This is why HashSet is commonly used to remove duplicates from collections.

***

## Does HashSet maintain insertion order?

**No, HashSet does NOT maintain insertion order**. The elements are stored in an **unordered manner** based on their hash codes.

```java
HashSet<String> fruits = new HashSet<>();
fruits.add("Apple");   // Added first
fruits.add("Banana");  // Added second
fruits.add("Cherry");  // Added third

System.out.println(fruits);  
// Output might be: [Cherry, Apple, Banana]
// Order is NOT guaranteed to be insertion order!
```

**Why no order?**
Because elements are placed in buckets based on their **hash code**, not when they were added. The hash code determines the storage location, and hash codes don't follow insertion order.

**What if you need order?**

| Need | Use |
|------|-----|
| **Insertion order** | LinkedHashSet |
| **Sorted order** | TreeSet |
| **No order needed** | HashSet (fastest) |

```java
// To maintain insertion order, use LinkedHashSet:
LinkedHashSet<String> orderedSet = new LinkedHashSet<>();
orderedSet.add("Apple");
orderedSet.add("Banana");
orderedSet.add("Cherry");
System.out.println(orderedSet);  // [Apple, Banana, Cherry] - order preserved
```

**Interview tip**: HashSet is fastest because it doesn't maintain any order. If you need order, you pay a small performance cost with LinkedHashSet or TreeSet.

***

## Does HashSet allow null values?

**Yes, HashSet allows ONE null element**. You can add null, but only once (since duplicates aren't allowed).

```java
HashSet<String> set = new HashSet<>();
set.add("Apple");
set.add(null);     // OK - first null
set.add("Banana");
set.add(null);     // Ignored - duplicate null

System.out.println(set);  // [null, Apple, Banana]
System.out.println(set.size());  // 3 (not 4)
```

**Why only one null?**
Because HashSet doesn't allow duplicates, and null == null. So the second null is treated as a duplicate.

**Comparison with other collections**:

| Collection | Null allowed? |
|------------|--------------|
| HashSet | One null ✓ |
| ArrayList | Multiple nulls ✓ |
| TreeSet | No nulls ✗ (throws NullPointerException) |
| HashMap | One null key, multiple null values ✓ |

**Interview note**: TreeSet doesn't allow null because it needs to compare elements for sorting, and you can't compare null with other objects.

---

## When should you use HashSet instead of List?

**Use HashSet when** :

### 1. You need to ensure uniqueness (no duplicates)
```java
// Store unique user IDs
HashSet<Integer> uniqueUserIds = new HashSet<>();
uniqueUserIds.add(101);
uniqueUserIds.add(102);
uniqueUserIds.add(101);  // Automatically ignored
```

### 2. You need fast lookups (checking if element exists)
```java
// Check if email already exists - O(1) in HashSet vs O(n) in ArrayList
HashSet<String> registeredEmails = new HashSet<>();
if (registeredEmails.contains("user@example.com")) {
    System.out.println("Email already registered!");
}
// HashSet.contains() is much faster than ArrayList.contains()
```

### 3. You frequently add/remove elements and check membership
```java
// Operations are O(1) in HashSet
set.add("item");        // O(1)
set.remove("item");     // O(1)
set.contains("item");   // O(1)

// vs ArrayList
list.add("item");       // O(1) at end
list.remove("item");    // O(n) - needs to search first
list.contains("item");  // O(n) - linear search
```

### 4. Order doesn't matter
If you don't care about insertion order or sorting, HashSet is the fastest choice.

---
# HashSet - Internal Working (Deep Dive)

## Which data structure does HashSet use internally?

HashSet uses a **HashMap** as its backing data structure. This is the key to understanding how HashSet works.

**Internal implementation:**
```java
public class HashSet<E> {
    private transient HashMap<E, Object> map;
    
    // Dummy value to associate with keys in the backing map
    private static final Object PRESENT = new Object();
    
    public HashSet() {
        map = new HashMap<>();
    }
    
    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }
}
```

**How it works** :
- When you add an element to HashSet, it's stored as a **key** in the internal HashMap
- The value is always a dummy constant object called `PRESENT`
- Since HashMap keys must be unique, HashSet automatically gets uniqueness

**Example:**
```java
HashSet<String> set = new HashSet<>();
set.add("Apple");
set.add("Banana");

// Internally becomes:
// HashMap: {"Apple" -> PRESENT, "Banana" -> PRESENT}
```

**Why HashMap?**
- HashMap already provides O(1) lookups and doesn't allow duplicate keys
- Reusing existing, well-tested HashMap code
- Inherits all the performance optimizations of HashMap (hashing, collision handling, rehashing)

**The backing structure:** HashMap itself uses an **array of Node objects** (buckets), where each node can be:
- A single entry
- A linked list (if collisions occur)
- A balanced tree (Java 8+, if bucket has 8+ entries)

***

## How does HashSet check for duplicates?

HashSet uses a **two-step process** to check for duplicates :

### Step 1: Check hashCode()

When you add an element, HashSet first calculates its hash code:
```java
int hash = element.hashCode();
int index = hash % bucketSize;  // Determines bucket location
```

If no element exists at that bucket location, the element is unique (so far).

### Step 2: Check equals()

If an element already exists at that bucket location, HashSet uses `equals()` to check if they're actually the same:
```java
if (existingElement.equals(newElement)) {
    // Duplicate found - don't add
    return false;
} else {
    // Same hash code, but different objects (collision)
    // Add to same bucket (linked list or tree)
    return true;
}
```

**Complete flow when adding an element:**
```java
public boolean add(E e) {
    // Step 1: Calculate hash code
    int hash = e.hashCode();
    int bucketIndex = calculateIndex(hash);
    
    // Step 2: Check bucket
    if (bucket is empty) {
        // No element at this location - add it
        return true;
    }
    
    // Step 3: Bucket has elements - check with equals()
    for (each element in bucket) {
        if (element.equals(e)) {
            // Duplicate found
            return false;
        }
    }
    
    // Step 4: Same hash but different object - collision
    // Add to bucket (linked list/tree)
    return true;
}
```

**Visual example:**
```java
HashSet<String> set = new HashSet<>();
set.add("AB");  // hashCode: 2081
set.add("AB");  // hashCode: 2081, equals("AB") -> true, REJECTED
set.add("Ba");  // hashCode: 2081, equals("AB") -> false, ADDED (collision)
```

***

## What methods are used to compare elements for equality?

Two methods work together to determine equality :

### 1. hashCode()

**Purpose:** Determines the bucket location (initial filtering)

**Contract:**
- If two objects are equal (according to `equals()`), they **must** have the same hash code
- If two objects have the same hash code, they **may or may not** be equal (collisions are allowed)

**Example:**
```java
String s1 = "hello";
String s2 = "hello";
System.out.println(s1.hashCode());  // 99162322
System.out.println(s2.hashCode());  // 99162322 (same)
```

### 2. equals()

**Purpose:** Final check for actual equality

**Contract:**
- Returns `true` if objects are logically equal
- Returns `false` otherwise
- Must be **consistent** with `hashCode()`

**Example:**
```java
String s1 = "hello";
String s2 = "hello";
System.out.println(s1.equals(s2));  // true
```

### The Contract (Critical for Interviews!)

**Golden rule:** If you override `equals()`, you **must** override `hashCode()`.

```java
class Person {
    String name;
    int age;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age);  // Must use same fields as equals()
    }
}
```

**Why both methods?**
- `hashCode()` is **fast** (O(1)) - quickly narrows down location
- `equals()` is **accurate** - final verification
- Using only `equals()` would require O(n) search through all elements
- Using only `hashCode()` would incorrectly treat collisions as duplicates

***

## What happens if hashCode() or equals() are not implemented properly?

Improper implementation causes serious bugs in HashSet:

### Problem 1: Not overriding hashCode()

```java
class Student {
    String name;
    
    public Student(String name) {
        this.name = name;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        return Objects.equals(name, student.name);
    }
    
    // Missing hashCode() override!
    // Uses default Object.hashCode() based on memory address
}

// Bug demonstration:
HashSet<Student> set = new HashSet<>();
Student s1 = new Student("John");
Student s2 = new Student("John");

set.add(s1);
set.add(s2);  // Should be duplicate, but gets added!

System.out.println(set.size());  // Output: 2 (WRONG! Should be 1)
System.out.println(set.contains(new Student("John")));  // false (WRONG!)
```

**Why it fails:**
- `s1` and `s2` have different memory addresses
- Default `hashCode()` returns different values
- They go into different buckets
- `equals()` is never called because they're in different buckets

### Problem 2: Inconsistent hashCode() and equals()

```java
class Product {
    String id;
    String name;
    
    @Override
    public boolean equals(Object o) {
        // Only compares id
        Product p = (Product) o;
        return Objects.equals(id, p.id);
    }
    
    @Override
    public int hashCode() {
        // Uses both id AND name (inconsistent!)
        return Objects.hash(id, name);
    }
}

// Bug demonstration:
Product p1 = new Product("123", "Laptop");
Product p2 = new Product("123", "Desktop");

p1.equals(p2);  // true (same id)
p1.hashCode() == p2.hashCode();  // false (different names)

// HashSet will treat them as different elements even though equals() says they're same!
```

**Contract violation:** If `a.equals(b)` is true, then `a.hashCode()` **must** equal `b.hashCode()`.

### Problem 3: Mutable objects as HashSet elements

```java
class Person {
    String name;
    
    @Override
    public int hashCode() {
        return name.hashCode();
    }
    
    @Override
    public boolean equals(Object o) {
        return name.equals(((Person) o).name);
    }
}

// Bug demonstration:
Person person = new Person("John");
set.add(person);
System.out.println(set.contains(person));  // true

person.name = "Jane";  // Mutate the object!
System.out.println(set.contains(person));  // false! (lost in HashSet)

// The person is still IN the set, but in the wrong bucket
// Can't find it, can't remove it - HashSet is corrupted!
```

**Best practice:** Never modify objects after adding them to HashSet, or use immutable objects.

---

## What is the time complexity of add, remove, and contains operations?

| Operation | Average Case | Worst Case | Explanation |
|-----------|--------------|------------|-------------|
| **add(e)** | **O(1)** | O(n) | Average: Direct bucket access. Worst: All elements in one bucket (poor hash function) |
| **remove(e)** | **O(1)** | O(n) | Same as add - hash to bucket, remove element |
| **contains(e)** | **O(1)** | O(n) | Same as add - hash to bucket, check existence |

### Why O(1) on average?

**1. Direct bucket access via hashing:**
```java
int bucketIndex = hashCode(element) % bucketArray.length;
// This is O(1) - simple arithmetic
```

**2. Few elements per bucket (with good hash function):**
- Ideal: 1 element per bucket (no collisions)
- Reality: Load factor 0.75 means 75% occupancy
- Average: Very few collisions, so O(1) lookup within bucket

**3. Java 8 optimization:**
- If bucket has 8+ elements, converts linked list → balanced tree
- Lookup becomes O(log n) instead of O(n) in that bucket
- But with good hashing, this rarely happens

### Worst case O(n) scenarios:

**Scenario 1: Poor hash function**
```java
class BadHash {
    @Override
    public int hashCode() {
        return 1;  // All objects get same hash code!
    }
}

// Result: All elements go into ONE bucket
// Must traverse entire bucket = O(n)
```

**Scenario 2: Many collisions**
- All elements happen to hash to same bucket
- Must use `equals()` to check each element in bucket
- Time = O(number of elements in bucket)

**In practice:** With good hash function and proper load factor, collisions are rare and O(1) is achieved 99%+ of the time.

---

## What happens when two objects have the same hash code?

This is called a **hash collision**. HashSet handles this gracefully using **chaining**.

### Collision Handling Strategy

**Java 7 and earlier: Linked List**

When collision occurs, elements with same hash code are stored in a **linked list** in the same bucket:

```
Bucket 5: [Node1] -> [Node2] -> [Node3]
          (hash=100) (hash=100) (hash=100)
```

**Steps when adding with collision:**
1. Calculate hash code → bucket 5
2. Bucket already occupied → traverse linked list
3. Use `equals()` on each node to check for duplicates
4. If no duplicate found → add to end of linked list

**Performance:** O(n) where n = length of linked list in that bucket

**Java 8 and later: Treeification**

If a bucket's linked list grows beyond **8 elements** (threshold), it's converted to a **balanced binary tree** (Red-Black tree):

```
Before (Linked List):
Bucket 5: [A] -> [B] -> [C] -> [D] -> [E] -> [F] -> [G] -> [H] -> [I]

After (Red-Black Tree):
Bucket 5:      [E]
              /   \
            [C]   [G]
           / \    / \
         [B] [D][F] [H]
         /           \
       [A]           [I]
```

**Performance:** O(log n) lookups in tree instead of O(n) in linked list

**Treeification conditions:**
- Bucket must have 8+ elements
- Total HashMap capacity must be ≥ 64 (otherwise, resize instead)

### Example with Collisions

```java
class Book {
    String title;
    
    @Override
    public int hashCode() {
        // Poor hash function - only uses first character
        return title.charAt(0);
    }
    
    @Override
    public boolean equals(Object o) {
        return title.equals(((Book) o).title);
    }
}

HashSet<Book> books = new HashSet<>();
books.add(new Book("Alice"));     // hash = 65 (ASCII 'A')
books.add(new Book("Animal"));    // hash = 65 (collision!)
books.add(new Book("Avalanche")); // hash = 65 (collision!)

// All three stored in same bucket:
// Bucket 65: [Alice] -> [Animal] -> [Avalanche]

// When checking contains():
books.contains(new Book("Animal"));
// 1. Hash to bucket 65
// 2. Traverse list: "Alice".equals("Animal") -> false
// 3. Next: "Animal".equals("Animal") -> true (found!)
```

**Key insight:** Collisions don't break HashSet - they just make operations slower for that specific bucket. With a good hash function, collisions should be rare.

***

## What is load factor and capacity in HashSet (inherited from HashMap)?

HashSet inherits these concepts from its underlying HashMap :

### Capacity

**Definition:** The number of buckets in the hash table (internal array size).

**Default initial capacity:** 16 buckets

```java
HashSet<String> set = new HashSet<>();  // capacity = 16

// With custom initial capacity:
HashSet<String> set = new HashSet<>(100);  // capacity = 100
```

**Capacity is always a power of 2:** 16, 32, 64, 128, 256, etc.

**Why power of 2?** Enables fast modulo operation using bitwise AND:
```java
// Instead of expensive modulo:
int index = hash % capacity;

// Use fast bitwise AND (only works if capacity is power of 2):
int index = hash & (capacity - 1);
```

### Load Factor

**Definition:** The threshold ratio that determines when the HashSet should be resized (rehashed).

**Formula:** `Load Factor = Number of elements / Capacity`

**Default load factor:** 0.75 (75%)

```java
HashSet<String> set = new HashSet<>();  // load factor = 0.75

// With custom load factor:
HashSet<String> set = new HashSet<>(16, 0.5f);  // load factor = 0.5 (50%)
```

### How They Work Together

**Resize trigger:** When `size > capacity × load factor`, HashSet rehashes.

**Example:**
```
Initial capacity: 16
Load factor: 0.75
Threshold: 16 × 0.75 = 12

When you add the 13th element:
- Size (13) > Threshold (12)
- Triggers rehashing
- New capacity: 32 (doubled)
- New threshold: 32 × 0.75 = 24
```

### Trade-offs

**High load factor (e.g., 0.9):**
- **Pro:** Better memory utilization (fewer empty buckets)
- **Con:** More collisions, slower lookups
- **Use case:** When memory is tight

**Low load factor (e.g., 0.5):**
- **Pro:** Fewer collisions, faster lookups
- **Con:** Wastes memory (many empty buckets)
- **Use case:** When performance is critical

**Default 0.75 is a good balance** between time and space efficiency.

### Sizing for Performance

**If you know the number of elements in advance:**
```java
// If you're adding 1000 elements:
// capacity = (1000 / 0.75) + 1 = 1334 → next power of 2 = 2048
HashSet<String> set = new HashSet<>(2048);

// This prevents multiple rehashing operations
```

***

## What is rehashing in HashSet?

**Rehashing** is the process of reorganizing the entire HashSet when it grows beyond its threshold.

### When Rehashing Occurs

**Trigger:** `size > capacity × load factor`

Example:
```java
Capacity: 16
Load factor: 0.75
Threshold: 16 × 0.75 = 12

Adding 1st-12th elements: OK
Adding 13th element: Triggers rehashing!
```

### Rehashing Process

**Step 1: Create new bucket array (double capacity)**
```java
int oldCapacity = 16;
int newCapacity = oldCapacity << 1;  // 32 (bit shift = multiply by 2)
Node[] newBuckets = new Node[newCapacity];
```

**Step 2: Rehash every element**
- Take each element from old buckets
- Recalculate its bucket index using new capacity
- Place it in new bucket array

```java
for (Node node : oldBuckets) {
    while (node != null) {
        int newIndex = node.hash & (newCapacity - 1);  // New bucket
        // Place node in newBuckets[newIndex]
        node = node.next;
    }
}
```

**Step 3: Replace old array with new array**
```java
buckets = newBuckets;
threshold = newCapacity * loadFactor;  // 32 × 0.75 = 24
```

### Why Rehashing Is Necessary

**Without rehashing:**
- Fixed capacity means more collisions as elements increase
- All elements eventually end up in same few buckets
- Performance degrades from O(1) to O(n)

**With rehashing:**
- Maintains low collision rate
- Elements redistributed across more buckets
- Keeps O(1) performance

### Performance Impact

**Time complexity:** O(n) where n = number of elements

**Why expensive?**
- Must iterate through all elements
- Recalculate hash index for each
- Move to new locations

**Amortized cost:** Still O(1) for add operations over many insertions because rehashing happens infrequently (exponential growth).

### Example

```java
HashSet<Integer> set = new HashSet<>(4, 0.75f);  // capacity=4, threshold=3

set.add(1);   // size=1, no rehash
set.add(2);   // size=2, no rehash
set.add(3);   // size=3, no rehash
set.add(4);   // size=4 > threshold=3, REHASH!

// After rehashing:
// Old capacity: 4 → New capacity: 8
// Old threshold: 3 → New threshold: 6
// All 4 elements redistributed to new buckets
```


### Is HashSet synchronized? How can you make it thread-safe?

**No, HashSet is NOT synchronized** (not thread-safe by default). Multiple threads accessing a HashSet concurrently can cause data corruption, lost updates, or inconsistent state.

**Why not synchronized?**
- Most use cases are single-threaded
- Synchronization adds 20-30% performance overhead
- Developers can add thread-safety only when needed

**How to make it thread-safe:**

**Option 1: Collections.synchronizedSet() (Simple wrapper)**
```java
Set<String> normalSet = new HashSet<>();
Set<String> syncSet = Collections.synchronizedSet(normalSet);

// Now thread-safe for basic operations
syncSet.add("Apple");
syncSet.remove("Banana");
```


**How it works:**
- Wraps HashSet in synchronized decorator
- Every method call is wrapped with `synchronized` block
- Uses the wrapper object's intrinsic lock

**Important caveat - Manual synchronization needed for iteration:**
```java
Set<String> syncSet = Collections.synchronizedSet(new HashSet<>());

// WRONG - Not thread-safe during iteration!
for (String item : syncSet) {
    process(item);
}

// CORRECT - Must manually synchronize
synchronized(syncSet) {
    for (String item : syncSet) {
        process(item);
    }
}
```


**Limitation:** Serializes all access - only one thread can access at a time, creating a bottleneck.

***

**Option 2: ConcurrentHashMap.newKeySet() (Better performance)**
```java
Set<String> concurrentSet = ConcurrentHashMap.newKeySet();

// Lock-free operations, better concurrency
concurrentSet.add("Apple");
concurrentSet.remove("Banana");
```


**Advantages:**
- Lock-free using CAS (Compare-And-Swap) operations
- Multiple threads can read/write simultaneously
- Better performance under high contention
- No manual synchronization needed for iteration

**Alternative syntax:**
```java
// Using keySet() with default value
ConcurrentHashMap<String, Boolean> map = new ConcurrentHashMap<>();
Set<String> concurrentSet = map.keySet(Boolean.TRUE);
```


***

**Option 3: CopyOnWriteArraySet (Read-heavy workloads)**
```java
Set<String> cowSet = new CopyOnWriteArraySet<>();
```

**When to use:**
- Read operations >>> Write operations
- Iteration is frequent, modifications are rare
- Small to medium-sized sets

**How it works:**
- Every write creates a new copy of the array
- Reads are lock-free and fast
- Writes are expensive (O(n))

***

**Performance Comparison:**

| Approach | Read Performance | Write Performance | Use Case |
|----------|-----------------|-------------------|----------|
| Collections.synchronizedSet() | Slow (locks) | Slow (locks) | Simple needs, low contention |
| ConcurrentHashMap.newKeySet() | Fast (lock-free) | Fast (CAS) | High concurrency, balanced read/write |
| CopyOnWriteArraySet | Very fast (no locks) | Very slow (copy array) | Read-heavy, rare writes |

**Interview tip:** For modern Java applications, prefer `ConcurrentHashMap.newKeySet()` over `Collections.synchronizedSet()` for better concurrent performance.

---

### What happens if you modify HashSet while iterating? (Fail-fast behavior)

HashSet uses **fail-fast iterators** that immediately throw `ConcurrentModificationException` when the set is structurally modified during iteration.

**Fail-fast mechanism:**
```java
// HashSet maintains a modification counter
transient int modCount = 0;

// Every add/remove increments it
public boolean add(E e) {
    // ... add logic
    modCount++;
}

// Iterator stores expected count at creation
private class HashIterator {
    int expectedModCount = modCount;
    
    public E next() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
        // ... return element
    }
}
```

**Example 1: Direct modification (WRONG)**
```java
HashSet<String> set = new HashSet<>(Arrays.asList("A", "B", "C"));

for (String s : set) {
    if (s.equals("B")) {
        set.remove(s);  // Throws ConcurrentModificationException!
    }
}
```

**Why it fails:**
1. Enhanced for-loop creates an iterator internally
2. `set.remove()` increments `modCount`
3. Iterator's `expectedModCount` is now stale
4. Next `iterator.next()` detects mismatch → throws exception

***

**Example 2: Iterator modification (CORRECT)**
```java
HashSet<String> set = new HashSet<>(Arrays.asList("A", "B", "C"));
Iterator<String> it = set.iterator();

while (it.hasNext()) {
    String s = it.next();
    if (s.equals("B")) {
        it.remove();  // Safe - updates expectedModCount
    }
}
```

**Why it works:**
- `iterator.remove()` modifies the set AND updates `expectedModCount`
- Both counters stay in sync

***

**Example 3: removeIf (BEST - Java 8+)**
```java
set.removeIf(s -> s.equals("B"));
```

**Advantages:**
- Cleaner syntax
- Internally handles modification counter
- More efficient than manual iteration

---

**Multi-threaded scenario:**
```java
// Thread 1: Iterating
for (String s : set) {
    process(s);
}

// Thread 2: Modifying concurrently
set.add("X");  // May throw ConcurrentModificationException in Thread 1
```

**Important notes:**
- Fail-fast is **best-effort**, not guaranteed
- In multi-threaded code without proper synchronization, you might get corrupted data WITHOUT an exception
- For thread-safe concurrent modification, use `ConcurrentHashMap.newKeySet()`

**Interview insight:** Fail-fast behavior is a debugging aid to catch programming errors early, not a concurrency control mechanism. For true thread-safety, use concurrent collections.

***

### Can HashSet contain heterogeneous objects?

**Yes, HashSet can contain heterogeneous (different types) objects**, but it's generally a bad practice.

**Example - Technically possible:**
```java
HashSet<Object> mixedSet = new HashSet<>();
mixedSet.add("String");
mixedSet.add(123);           // Integer
mixedSet.add(45.67);         // Double
mixedSet.add(new Date());    // Date
mixedSet.add(true);          // Boolean

System.out.println(mixedSet);  
// [String, 123, 45.67, Mon Oct 28 19:30:00 IST 2025, true]
```

**Why it works:**
- All objects inherit from `Object` class
- All objects have `hashCode()` and `equals()` methods
- HashSet accepts `Object` type

***

**Why it's generally bad practice:**

**1. Type safety lost:**
```java
HashSet<Object> set = new HashSet<>();
set.add("Text");
set.add(100);

// Need instanceof checks and casting
for (Object obj : set) {
    if (obj instanceof String) {
        String s = (String) obj;
        System.out.println(s.toUpperCase());
    } else if (obj instanceof Integer) {
        Integer i = (Integer) obj;
        System.out.println(i * 2);
    }
}
```

**2. Runtime errors possible:**
```java
for (Object obj : set) {
    String s = (String) obj;  // ClassCastException if obj is Integer!
}
```

**3. Comparison issues with TreeSet:**
```java
// This will fail with TreeSet
TreeSet<Object> treeSet = new TreeSet<>();
treeSet.add("String");
treeSet.add(123);  // Throws ClassCastException!
// Can't compare String with Integer for sorting
```

***

**Best practices:**

**Use generics for type safety:**
```java
// Good - Type-safe
HashSet<String> stringSet = new HashSet<>();
stringSet.add("Apple");
stringSet.add("Banana");
// stringSet.add(123);  // Compile error - caught at compile time!

// Good - Specific common type
HashSet<Number> numberSet = new HashSet<>();
numberSet.add(123);        // Integer extends Number
numberSet.add(45.67);      // Double extends Number
numberSet.add(100L);       // Long extends Number
```

**When heterogeneous might be acceptable:**
- Configuration settings with mixed types (still, consider Map instead)
- Temporary collections during data transformation
- Working with legacy non-generic code

**Interview tip:** When asked this question, say "Yes, technically possible with `HashSet<Object>`, but it's an anti-pattern that defeats Java's type safety. Always use specific generic types like `HashSet<String>` for type safety and maintainability."

***

## Comparison

### Difference between HashSet, LinkedHashSet, and TreeSet

All three implement the `Set` interface (no duplicates), but differ in ordering and performance:

| Feature | HashSet | LinkedHashSet | TreeSet |
|---------|---------|---------------|---------|
| **Internal Structure** | HashMap (hash table) | HashMap + Doubly-linked list | Red-Black Tree (TreeMap) |
| **Ordering** | No order | Insertion order | Sorted order (natural/comparator) |
| **Null elements** | One null allowed | One null allowed | No nulls (throws NPE) |
| **Performance - add** | O(1) | O(1) | O(log n) |
| **Performance - remove** | O(1) | O(1) | O(log n) |
| **Performance - contains** | O(1) | O(1) | O(log n) |
| **Memory** | Lowest | Medium (extra linked list) | Highest (tree nodes) |
| **When to use** | No order needed, fastest | Insertion order matters | Need sorted elements |

***

**HashSet - Fastest, no order:**
```java
HashSet<String> hashSet = new HashSet<>();
hashSet.add("Banana");
hashSet.add("Apple");
hashSet.add("Cherry");

System.out.println(hashSet);  
// Output: [Cherry, Apple, Banana] - Random order!
```

**Use when:**
- You need fastest performance
- Order doesn't matter
- Just need uniqueness guarantee

***

**LinkedHashSet - Maintains insertion order:**
```java
LinkedHashSet<String> linkedSet = new LinkedHashSet<>();
linkedSet.add("Banana");
linkedSet.add("Apple");
linkedSet.add("Cherry");

System.out.println(linkedSet);  
// Output: [Banana, Apple, Cherry] - Insertion order maintained!
```

**How it works:**
- Uses HashMap internally + doubly-linked list connecting entries
- Extra prev/next pointers maintain order
- Slightly slower than HashSet due to link maintenance

**Use when:**
- Need insertion order preserved
- Want predictable iteration order
- Building ordered unique collections

***

**TreeSet - Automatically sorted:**
```java
TreeSet<String> treeSet = new TreeSet<>();
treeSet.add("Banana");
treeSet.add("Apple");
treeSet.add("Cherry");

System.out.println(treeSet);  
// Output: [Apple, Banana, Cherry] - Alphabetically sorted!
```

**How it works:**
- Uses Red-Black Tree (self-balancing BST)
- Elements must be Comparable or use Comparator
- Every insertion maintains sorted order

**Custom sorting with Comparator:**
```java
// Sort by string length
TreeSet<String> treeSet = new TreeSet<>(Comparator.comparingInt(String::length));
treeSet.add("A");
treeSet.add("Apple");
treeSet.add("An");

System.out.println(treeSet);  // [A, An, Apple] - Sorted by length
```

**Use when:**
- Need sorted elements
- Want to find min/max efficiently
- Need range operations (subSet, headSet, tailSet)
- Using as a priority-based unique collection

**TreeSet special operations:**
```java
TreeSet<Integer> numbers = new TreeSet<>(Arrays.asList(1, 3, 5, 7, 9));

numbers.first();        // 1 (minimum)
numbers.last();         // 9 (maximum)
numbers.higher(5);      // 7 (next element > 5)
numbers.lower(5);       // 3 (previous element < 5)
numbers.subSet(3, 8);   // [3, 5, 7] (elements in range)
```

***

**Quick decision guide:**

```
Need sorted elements?
├─ Yes → TreeSet
└─ No → Need insertion order?
    ├─ Yes → LinkedHashSet
    └─ No → HashSet (fastest!)
```

***

### Difference between HashSet and HashMap

This is a **very common interview question** because HashSet actually uses HashMap internally!

| Feature | HashSet | HashMap |
|---------|---------|---------|
| **Interface** | Implements Set | Implements Map |
| **Storage** | Stores single values (elements) | Stores key-value pairs |
| **Internal implementation** | Uses HashMap internally | Array of Node objects |
| **Add method** | `add(element)` | `put(key, value)` |
| **Duplicates** | No duplicate elements | No duplicate keys, duplicate values OK |
| **Null** | One null element | One null key, multiple null values |
| **Retrieve** | `contains(element)` | `get(key)` returns value |
| **Use case** | Unique collection of items | Key-value associations |

***

**The secret relationship:**
```java
// When you write:
HashSet<String> set = new HashSet<>();
set.add("Apple");

// Internally, HashSet does:
HashMap<String, Object> map = new HashMap<>();
map.put("Apple", PRESENT);  // PRESENT is a dummy constant object
```

**HashSet source code (simplified):**
```java
public class HashSet<E> {
    private transient HashMap<E, Object> map;
    private static final Object PRESENT = new Object();
    
    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }
    
    public boolean contains(Object o) {
        return map.containsKey(o);
    }
    
    public boolean remove(Object o) {
        return map.remove(o) == PRESENT;
    }
}
```

**Key insight:** HashSet is essentially a **HashMap with dummy values**. The element you add becomes a key, and the value is always the same dummy object.

***

**Visual comparison:**

**HashMap:**
```java
HashMap<String, Integer> studentMarks = new HashMap<>();
studentMarks.put("Alice", 95);
studentMarks.put("Bob", 87);
studentMarks.put("Alice", 98);  // Updates Alice's marks

// Internal structure:
// {"Alice" -> 98, "Bob" -> 87}
```

**HashSet:**
```java
HashSet<String> students = new HashSet<>();
students.add("Alice");
students.add("Bob");
students.add("Alice");  // Ignored (duplicate)

// Internal structure (using HashMap):
// {"Alice" -> PRESENT, "Bob" -> PRESENT}
```

***

**When to use which:**

**Use HashMap when:**
- You need to associate keys with values
- Looking up values by keys
- Each key has meaningful data associated with it

```java
// Student ID → Student Name
HashMap<Integer, String> students = new HashMap<>();
students.put(101, "Alice");
students.put(102, "Bob");

String name = students.get(101);  // "Alice"
```

**Use HashSet when:**
- You only care about unique elements
- No key-value relationship needed
- Just checking membership (contains)

```java
// Unique email addresses
HashSet<String> emails = new HashSet<>();
emails.add("user@example.com");

if (emails.contains("user@example.com")) {
    System.out.println("Email already registered");
}
```

***

### Difference between HashSet and ArrayList

These are fundamentally different collection types with different purposes:

| Feature | HashSet | ArrayList |
|---------|---------|-----------|
| **Interface** | Set | List |
| **Internal structure** | HashMap (hash table) | Dynamic array |
| **Duplicates** | Not allowed | Allowed |
| **Ordering** | No order | Insertion order maintained |
| **Null** | One null | Multiple nulls |
| **Indexed access** | No `get(index)` | `get(index)` in O(1) |
| **contains()** | O(1) | O(n) |
| **add()** | O(1) | O(1) at end, O(n) in middle |
| **remove(element)** | O(1) | O(n) |
| **Iteration** | Unordered | Ordered (by index) |
| **Use case** | Unique elements, fast lookups | Ordered list, indexed access |

***

**HashSet - Unique, unordered, fast lookups:**
```java
HashSet<String> hashSet = new HashSet<>();
hashSet.add("Apple");
hashSet.add("Banana");
hashSet.add("Apple");  // Ignored

System.out.println(hashSet.size());  // 2
System.out.println(hashSet);  // [Banana, Apple] - random order

// Fast membership check
if (hashSet.contains("Apple")) {  // O(1)
    System.out.println("Found!");
}

// No indexed access
// hashSet.get(0);  // Compile error - method doesn't exist
```

***

**ArrayList - Ordered, allows duplicates, indexed access:**
```java
ArrayList<String> arrayList = new ArrayList<>();
arrayList.add("Apple");
arrayList.add("Banana");
arrayList.add("Apple");  // Allowed

System.out.println(arrayList.size());  // 3
System.out.println(arrayList);  // [Apple, Banana, Apple] - insertion order

// Indexed access
String first = arrayList.get(0);  // "Apple" - O(1)

// Slow membership check
if (arrayList.contains("Apple")) {  // O(n) - must scan entire list
    System.out.println("Found!");
}
```

***

**Performance comparison:**

**Scenario 1: Checking if element exists (frequent operation)**
```java
// With ArrayList - O(n) each check
List<String> emails = new ArrayList<>();
// Add 1 million emails
if (emails.contains("user@example.com")) {  // Scans entire list
    // ... takes milliseconds
}

// With HashSet - O(1) each check
Set<String> emails = new HashSet<>();
// Add 1 million emails
if (emails.contains("user@example.com")) {  // Direct hash lookup
    // ... takes microseconds
}
```

**Scenario 2: Accessing by position**
```java
// ArrayList - Perfect
list.get(500);      // O(1) - direct array access

// HashSet - Impossible
// set.get(500);    // No such method!
// Must iterate to position (very slow)
```

***

**When to use which:**

**Use HashSet when:**
```java
// ✓ Need unique elements
HashSet<String> uniqueUsernames = new HashSet<>();

// ✓ Frequent membership checks
if (blacklist.contains(ipAddress)) { }

// ✓ Removing duplicates
List<Integer> listWithDupes = Arrays.asList(1, 2, 2, 3, 3, 3);
Set<Integer> unique = new HashSet<>(listWithDupes);

// ✓ Set operations (union, intersection)
set1.addAll(set2);     // Union
set1.retainAll(set2);  // Intersection
```

**Use ArrayList when:**
```java
// ✓ Need to maintain insertion order
List<String> todoList = new ArrayList<>();

// ✓ Need indexed access
String third = list.get(2);

// ✓ Duplicates are meaningful
List<Integer> scores = new ArrayList<>();  // Can have multiple same scores

// ✓ Need to access by position frequently
for (int i = 0; i < list.size(); i++) {
    process(list.get(i));
}
```

***

**Real-world examples:**

**HashSet example - Email validation:**
```java
Set<String> registeredEmails = new HashSet<>();

public boolean registerUser(String email) {
    if (registeredEmails.contains(email)) {  // O(1) check
        return false;  // Email already exists
    }
    registeredEmails.add(email);
    return true;
}
```

**ArrayList example - Shopping cart:**
```java
List<Product> cart = new ArrayList<>();

cart.add(product1);
cart.add(product2);
cart.add(product1);  // Can add same product multiple times

// Access by position for display
for (int i = 0; i < cart.size(); i++) {
    System.out.println((i+1) + ". " + cart.get(i));
}
```



