---
title: "Java LinkedHashSet"
---


### What is a LinkedHashSet in Java?

LinkedHashSet is a **hybrid collection** that combines the features of **HashSet** (uniqueness) and **LinkedList** (order preservation). It's part of the Java Collections Framework and extends HashSet while adding the ability to maintain insertion order.

**Simple definition:** LinkedHashSet is like a HashSet that remembers the order in which you added elements.

```java
LinkedHashSet<String> linkedSet = new LinkedHashSet<>();
linkedSet.add("Apple");
linkedSet.add("Banana");
linkedSet.add("Cherry");

System.out.println(linkedSet);  
// Output: [Apple, Banana, Cherry] - Order preserved!
```

**Key characteristics** :
- Stores unique elements (no duplicates)
- Maintains insertion order
- Implements Set interface
- Uses hash table + doubly-linked list internally
- Not synchronized (not thread-safe)
- Allows one null element

***

### How is LinkedHashSet different from HashSet?

The **only fundamental difference** is that LinkedHashSet maintains insertion order, while HashSet doesn't.

**Internal structure difference** :

| Feature | HashSet | LinkedHashSet |
|---------|---------|---------------|
| **Data structure** | Hash table only | Hash table + Doubly-linked list |
| **Ordering** | No order guaranteed | Insertion order maintained |
| **Performance** | Faster (O(1)) | Slightly slower (O(1) but with overhead) |
| **Memory** | Lower | Higher (extra linked list pointers) |
| **Iteration** | Random/unpredictable order | Predictable (insertion order) |

**Visual comparison:**

**HashSet - No order:**
```java
HashSet<String> hashSet = new HashSet<>();
hashSet.add("First");
hashSet.add("Second");
hashSet.add("Third");

System.out.println(hashSet);
// Output: [Third, First, Second] - Random order based on hash codes
```

**LinkedHashSet - Insertion order preserved:**
```java
LinkedHashSet<String> linkedSet = new LinkedHashSet<>();
linkedSet.add("First");
linkedSet.add("Second");
linkedSet.add("Third");

System.out.println(linkedSet);
// Output: [First, Second, Third] - Order maintained!
```

**How it works internally** :

LinkedHashSet uses a **doubly-linked list** that connects all entries:

```
HashSet internal structure:
Bucket array: [entry1] [entry2] [entry3] [entry4]
(No connections between entries)

LinkedHashSet internal structure:
Bucket array: [entry1] ↔ [entry2] ↔ [entry3] ↔ [entry4]
(Doubly-linked list maintains order)

Each entry has:
- hash code (for bucket location)
- value
- before pointer (previous element)
- after pointer (next element)
```

**Performance impact** :
- LinkedHashSet is **slightly slower** than HashSet
- Still O(1) for add, remove, contains operations
- Extra overhead from maintaining linked list pointers
- About 10-20% slower than HashSet in practice

**Memory overhead** :
- LinkedHashSet requires **more memory** than HashSet
- Each element stores two extra pointers (before/after)
- Approximately 30-40% more memory usage

**Interview insight:** LinkedHashSet extends HashSet and overrides the underlying HashMap with LinkedHashMap, which provides the ordering capability.

---

### Does LinkedHashSet allow duplicates?

**No, LinkedHashSet does NOT allow duplicates**. Like all Set implementations, it stores only unique elements.

```java
LinkedHashSet<Integer> numbers = new LinkedHashSet<>();
numbers.add(10);    // Added successfully
numbers.add(20);    // Added successfully
numbers.add(10);    // Ignored (duplicate)

System.out.println(numbers);  // [10, 20]
System.out.println(numbers.size());  // 2 (not 3)
```

**How it detects duplicates** :

LinkedHashSet uses the same mechanism as HashSet:
1. **hashCode()** - First check for hash collision
2. **equals()** - Final check for actual equality

```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Java");
set.add("Python");
set.add("Java");  // Duplicate - add() returns false

System.out.println(set.add("Java"));  // false
System.out.println(set.add("Ruby"));  // true
```

**Example - Removing duplicates while preserving order:**
```java
List<String> listWithDuplicates = Arrays.asList("A", "B", "A", "C", "B", "D");

// Using LinkedHashSet to remove duplicates + keep order
LinkedHashSet<String> uniqueOrdered = new LinkedHashSet<>(listWithDuplicates);

System.out.println(uniqueOrdered);  // [A, B, C, D] - Order preserved!

// Compare with HashSet:
HashSet<String> uniqueUnordered = new HashSet<>(listWithDuplicates);
System.out.println(uniqueUnordered);  // [A, B, C, D] or any random order
```

This is one of the most common use cases for LinkedHashSet - removing duplicates while preserving the original order.

***

### Does LinkedHashSet maintain insertion order?

**Yes, LinkedHashSet maintains insertion order** - this is its defining feature.

**What does "insertion order" mean?**
Elements are returned in the **exact order they were first added** to the set.

```java
LinkedHashSet<String> fruits = new LinkedHashSet<>();

// Add in specific order
fruits.add("Mango");    // 1st
fruits.add("Apple");    // 2nd
fruits.add("Banana");   // 3rd
fruits.add("Cherry");   // 4th

// Iterate - same order preserved
for (String fruit : fruits) {
    System.out.println(fruit);
}
// Output:
// Mango
// Apple
// Banana
// Cherry
```

**Important: Re-insertion doesn't change order** :
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("First");
set.add("Second");
set.add("Third");
set.add("First");  // Duplicate - doesn't change position

System.out.println(set);  
// [First, Second, Third] - "First" stays in original position
```

**How it maintains order** :

Uses a **doubly-linked list** that connects all entries:
```java
Internal structure:
head → [Mango] ↔ [Apple] ↔ [Banana] ↔ [Cherry] ← tail

Each node has:
- Element value
- Hash code (for fast lookup)
- before pointer (to previous element)
- after pointer (to next element)
```

When you iterate, LinkedHashSet simply traverses the linked list from head to tail, ensuring insertion order.

**Comparison with other Sets:**

```java
// HashSet - Random order
HashSet<Integer> hashSet = new HashSet<>(Arrays.asList(3, 1, 4, 2));
System.out.println(hashSet);  // [1, 2, 3, 4] or any order

// LinkedHashSet - Insertion order
LinkedHashSet<Integer> linkedSet = new LinkedHashSet<>(Arrays.asList(3, 1, 4, 2));
System.out.println(linkedSet);  // [3, 1, 4, 2] - insertion order

// TreeSet - Sorted order
TreeSet<Integer> treeSet = new TreeSet<>(Arrays.asList(3, 1, 4, 2));
System.out.println(treeSet);  // [1, 2, 3, 4] - natural sorted order
```

**Interview tip:** LinkedHashSet is the **only Set implementation** that maintains predictable iteration order without sorting.

---

### Does LinkedHashSet allow null elements?

**Yes, LinkedHashSet allows ONE null element** , just like HashSet.

```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Apple");
set.add(null);      // OK - first null
set.add("Banana");
set.add(null);      // Ignored - duplicate null

System.out.println(set);  // [Apple, null, Banana]
System.out.println(set.size());  // 3
```

**Why only one null?**
Because LinkedHashSet doesn't allow duplicates, and `null == null` evaluates to true. The second null is treated as a duplicate and ignored.

**Null maintains insertion order too:**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("First");
set.add(null);
set.add("Last");

System.out.println(set);  // [First, null, Last] - order preserved
```

**Comparison with other Set implementations:**

| Set Type | Null allowed? |
|----------|--------------|
| HashSet | One null ✓ |
| LinkedHashSet | One null ✓ |
| TreeSet | No nulls ✗ (throws NullPointerException) |
| ConcurrentSkipListSet | No nulls ✗ |

**Why TreeSet doesn't allow null:**
TreeSet needs to compare elements for sorting using `compareTo()` or `compare()`. You cannot compare null with other objects, so it throws `NullPointerException`.

```java
TreeSet<String> treeSet = new TreeSet<>();
treeSet.add(null);  // Throws NullPointerException!

LinkedHashSet<String> linkedSet = new LinkedHashSet<>();
linkedSet.add(null);  // OK
```

***

### When would you use LinkedHashSet instead of HashSet or ArrayList?

LinkedHashSet is the **perfect middle ground** when you need both uniqueness and order.

**Use LinkedHashSet when:**

---

**1. Need unique elements + insertion order**

This is the **most common use case** :

```java
// Example: Track visited URLs in order
LinkedHashSet<String> visitedURLs = new LinkedHashSet<>();
visitedURLs.add("google.com");
visitedURLs.add("stackoverflow.com");
visitedURLs.add("google.com");  // Duplicate - ignored
visitedURLs.add("github.com");

// Iterate in visit order
for (String url : visitedURLs) {
    System.out.println(url);
}
// Output:
// google.com
// stackoverflow.com
// github.com
```

***

**2. Remove duplicates while preserving order**

Better than HashSet + ArrayList combination:

```java
// Input with duplicates
String[] input = {"Java", "Python", "Java", "C++", "Python", "JavaScript"};

// Remove duplicates, keep order
LinkedHashSet<String> uniqueLanguages = new LinkedHashSet<>(Arrays.asList(input));

System.out.println(uniqueLanguages);
// [Java, Python, C++, JavaScript] - First occurrence order preserved
```

**Why not HashSet?** HashSet would give random order: `[C++, Java, JavaScript, Python]`

**Why not ArrayList?** Would need manual duplicate checking (O(n²)) or conversion to Set and back.

---

**3. Predictable iteration for caching**

```java
// LRU-like cache with predictable iteration
LinkedHashSet<String> recentSearches = new LinkedHashSet<>();

public void addSearch(String query) {
    if (recentSearches.contains(query)) {
        recentSearches.remove(query);  // Remove old position
    }
    recentSearches.add(query);  // Add at end
    
    if (recentSearches.size() > 10) {
        // Remove oldest (first element)
        Iterator<String> it = recentSearches.iterator();
        it.next();
        it.remove();
    }
}
```

***

**4. Processing items in order with no re-processing**

```java
// Process tasks in order, skip already processed
LinkedHashSet<Task> taskQueue = new LinkedHashSet<>();

taskQueue.add(task1);
taskQueue.add(task2);
taskQueue.add(task1);  // Ignored - already in queue

// Process in order
for (Task task : taskQueue) {
    process(task);  // Each task processed exactly once, in order
}
```

***

**5. Building ordered unique collections from streams**

```java
List<String> emails = getEmails();  // May have duplicates

// Get unique emails in order
LinkedHashSet<String> uniqueEmails = emails.stream()
    .collect(Collectors.toCollection(LinkedHashSet::new));
```

***

**When NOT to use LinkedHashSet:**

**Don't use if:**
- Order doesn't matter → Use **HashSet** (faster, less memory)
- Need sorted order → Use **TreeSet** (auto-sorted)
- Need indexed access → Use **ArrayList** (has get(index))
- Duplicates are needed → Use **ArrayList**
- Memory is very tight → Use **HashSet** (smaller memory footprint)

***

## Comparison Summary

**LinkedHashSet vs HashSet:**

| Scenario | Use HashSet | Use LinkedHashSet |
|----------|------------|------------------|
| Order doesn't matter | ✓ Faster | |
| Need insertion order | | ✓ Ordered |
| Memory-constrained | ✓ Less memory | |
| Predictable iteration | | ✓ Deterministic |
| Maximum performance | ✓ Fastest | |

**LinkedHashSet vs ArrayList:**

| Scenario | Use ArrayList | Use LinkedHashSet |
|----------|--------------|------------------|
| Need duplicates | ✓ Allows duplicates | |
| Need uniqueness | | ✓ No duplicates |
| Need indexed access (get(i)) | ✓ O(1) access | |
| Fast contains() check | | ✓ O(1) vs O(n) |
| Order matters | ✓ Maintains order | ✓ Maintains order |

**Real-world decision example:**

```java
// Scenario: Store user's search history (unique queries in order)

// Option 1: ArrayList - BAD (allows duplicates, slow contains check)
ArrayList<String> history = new ArrayList<>();
history.add("Java");
history.add("Python");
history.add("Java");  // Duplicate stored!
// Checking duplicates: if (!history.contains(query)) - O(n)

// Option 2: HashSet - BAD (loses order)
HashSet<String> history = new HashSet<>();
// Can't show history in chronological order

// Option 3: LinkedHashSet - PERFECT!
LinkedHashSet<String> history = new LinkedHashSet<>();
history.add("Java");
history.add("Python");
history.add("Java");  // Ignored automatically
// Shows in order + no duplicates + O(1) lookup
```

***

## Quick Decision Guide

```
Need unique elements?
├─ Yes → Need specific order?
│   ├─ Insertion order → LinkedHashSet
│   ├─ Sorted order → TreeSet
│   └─ No order → HashSet (fastest)
│
└─ No (duplicates OK) → Need indexed access?
    ├─ Yes → ArrayList
    └─ No → LinkedList
```

**Simple rule:** If you see "unique" + "order" in the problem statement, think LinkedHashSet first!


# LinkedHashSet - Internal Working (Deep Dive)

## Which data structure does LinkedHashSet use internally?

LinkedHashSet uses **LinkedHashMap** as its underlying data structure. This is similar to how HashSet uses HashMap internally.

**Internal implementation:**
```java
public class LinkedHashSet<E> extends HashSet<E> {
    // Constructor calls HashSet constructor with special parameter
    public LinkedHashSet(int initialCapacity, float loadFactor) {
        super(initialCapacity, loadFactor, true);  // 'true' flag is key!
    }
}

// In HashSet class:
HashSet(int initialCapacity, float loadFactor, boolean dummy) {
    map = new LinkedHashMap<>(initialCapacity, loadFactor);  // Uses LinkedHashMap!
}
```


**The dummy boolean parameter** distinguishes this special constructor from regular HashSet constructors. When `true`, it creates a LinkedHashMap instead of HashMap.

**Core structure:** LinkedHashMap = **Hash Table + Doubly-Linked List**

```
LinkedHashSet internally:
┌─────────────────────────────────────────┐
│         LinkedHashMap                    │
│  ┌────────────────────────────────────┐ │
│  │  Hash Table (for O(1) access)     │ │
│  │  [bucket0] [bucket1] [bucket2] ... │ │
│  └────────────────────────────────────┘ │
│           ↓                              │
│  ┌────────────────────────────────────┐ │
│  │  Doubly-Linked List (for order)   │ │
│  │  head → [Entry] ↔ [Entry] ↔ ... → tail │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Why this design?**
- Hash table provides O(1) lookups (like HashSet)
- Doubly-linked list maintains insertion order (unique to LinkedHashSet)
- Best of both worlds: speed + predictability

---

## How does LinkedHashSet maintain insertion order?

LinkedHashSet maintains order using a **doubly-linked list** that connects all entries in insertion sequence.

### Entry Structure

Each entry in LinkedHashMap (and thus LinkedHashSet) has **six components** :

```java
static class Entry<K,V> extends HashMap.Node<K,V> {
    Entry<K,V> before;  // Previous entry in insertion order
    Entry<K,V> after;   // Next entry in insertion order
    
    // Inherited from HashMap.Node:
    int hash;           // Hash code of key
    K key;              // The element (in HashSet context)
    V value;            // Dummy value (always PRESENT)
    Node<K,V> next;     // Next entry in same bucket (collision chain)
}
```

### Head and Tail Pointers

LinkedHashMap maintains two special pointers :

```java
transient LinkedHashMap.Entry<K,V> head;  // First inserted element
transient LinkedHashMap.Entry<K,V> tail;  // Last inserted element
```

### How Order is Maintained

**When adding first element:**
```java
// Add "Apple"
1. Create Entry: {hash, "Apple", PRESENT, next=null, before=null, after=null}
2. Place in hash table bucket
3. Set head = this Entry
4. Set tail = this Entry

Result:
head → [Apple] ← tail
```

**When adding second element:**
```java
// Add "Banana"
1. Create Entry: {hash, "Banana", PRESENT, next=null, before=tail, after=null}
2. Place in hash table bucket
3. Set tail.after = this Entry  (link from old tail)
4. Set tail = this Entry         (update tail)

Result:
head → [Apple] ↔ [Banana] ← tail
```

**When adding third element:**
```java
// Add "Cherry"
1. Create Entry: {hash, "Cherry", PRESENT, next=null, before=tail, after=null}
2. Place in hash table bucket
3. Set tail.after = this Entry
4. Set tail = this Entry

Result:
head → [Apple] ↔ [Banana] ↔ [Cherry] ← tail
```

### Visual Representation

**Complete internal structure:**
```
Hash Table (for fast lookup):
Bucket[0]: null
Bucket: → [Apple] → null
Bucket: → [Banana] → null
Bucket: → [Cherry] → null
...

Doubly-Linked List (for order):
head → [Apple] ↔ [Banana] ↔ [Cherry] → tail
       ↑                              ↑
     before/after pointers      before/after pointers
```

**Key operations:**

**Insertion at end (O(1)):**
```java
// Pseudo-code for adding element
1. Create new Entry with element as key
2. Add to hash table at appropriate bucket
3. Link to tail of doubly-linked list:
   newEntry.before = tail;
   tail.after = newEntry;
   tail = newEntry;
```

**Iteration (follows linked list):**
```java
Entry current = head;
while (current != null) {
    process(current.key);
    current = current.after;  // Follow insertion order
}
```

### Why Doubly-Linked?

**Doubly-linked (before + after) allows:**
- Forward traversal (iteration)
- Backward removal (O(1) deletion when you have Entry reference)
- Easy insertion at both ends

**Interview insight:** The doubly-linked list is **separate from** the bucket chains (used for collision handling). The `next` pointer handles collisions within a bucket, while `before/after` maintain global insertion order.

***

## What is the time complexity of add, remove, and contains operations?

LinkedHashSet maintains the **same O(1) time complexity** as HashSet for basic operations :

| Operation | Time Complexity | Explanation |
|-----------|----------------|-------------|
| **add(E e)** | **O(1)** | Hash lookup + link to tail of list |
| **remove(E e)** | **O(1)** | Hash lookup + unlink from list |
| **contains(E e)** | **O(1)** | Hash table lookup only |
| **iteration** | **O(n)** | Traverse linked list (n = size) |

### Why O(1) Despite Extra Linked List?

**add() operation breakdown:**
```java
public boolean add(E e) {
    // Step 1: Hash and place in bucket - O(1)
    int bucket = hash(e) % capacity;
    
    // Step 2: Check for duplicate - O(1) average
    if (bucket contains e) return false;
    
    // Step 3: Link to tail of doubly-linked list - O(1)
    newEntry.before = tail;
    tail.after = newEntry;
    tail = newEntry;
    
    return true;
}
```

All three steps are constant time operations!

**remove() operation breakdown:**
```java
public boolean remove(E e) {
    // Step 1: Hash and find in bucket - O(1)
    Entry entry = findInBucket(hash(e));
    if (entry == null) return false;
    
    // Step 2: Unlink from doubly-linked list - O(1)
    entry.before.after = entry.after;  // Bypass this entry
    entry.after.before = entry.before;  // Bypass this entry
    
    // Step 3: Remove from bucket - O(1)
    removeFromBucket(entry);
    
    return true;
}
```

**Why unlinking is O(1):** With doubly-linked list, we have direct references to `before` and `after` entries. Just update pointers, no traversal needed!

### Comparison with Other Collections

| Collection | add() | remove() | contains() | Iteration |
|------------|-------|----------|------------|-----------|
| HashSet | O(1) | O(1) | O(1) | O(n) random |
| LinkedHashSet | O(1) | O(1) | O(1) | O(n) ordered |
| TreeSet | O(log n) | O(log n) | O(log n) | O(n) sorted |
| ArrayList | O(1)* | O(n) | O(n) | O(n) ordered |

*Amortized for ArrayList.add() at end

**Performance overhead:** LinkedHashSet is only about **10-20% slower** than HashSet in practice due to extra pointer manipulation. Still O(1), just slightly higher constant factor.

***

## How does LinkedHashSet handle duplicates?

LinkedHashSet handles duplicates the **exact same way as HashSet** - by rejecting them. It uses LinkedHashMap internally, which inherits duplicate detection from HashMap.

### Duplicate Detection Mechanism

**Two-step check:**

**Step 1: hashCode() check**
```java
int hash = element.hashCode();
int bucket = hash % capacity;
```

Find which bucket the element should be in.

**Step 2: equals() check**
```java
Entry current = buckets[bucket];
while (current != null) {
    if (current.hash == hash && current.key.equals(element)) {
        return false;  // Duplicate found!
    }
    current = current.next;
}
```

Scan bucket for actual equality.

### Internal Implementation

```java
public boolean add(E e) {
    return map.put(e, PRESENT) == null;
}

// In LinkedHashMap.put():
public V put(K key, V value) {
    int hash = hash(key);
    int bucket = indexFor(hash);
    
    // Check for existing key (duplicate check)
    for (Entry<K,V> e = table[bucket]; e != null; e = e.next) {
        if (e.hash == hash && (e.key == key || key.equals(e.key))) {
            V oldValue = e.value;
            e.value = value;
            return oldValue;  // Returns non-null for duplicate
        }
    }
    
    // New key - add to hash table AND linked list
    addEntry(hash, key, value, bucket);
    return null;  // Returns null for new element
}
```


### What Happens When Duplicate is Added?

**Example:**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("First");   // Returns true, added
set.add("Second");  // Returns true, added
set.add("First");   // Returns false, rejected (duplicate)

System.out.println(set);  // [First, Second] - no duplicate
```

**Internal flow for duplicate:**
1. Calculate hash of "First" → find bucket
2. Scan bucket, find existing "First" entry
3. `equals()` returns true → duplicate detected
4. LinkedHashMap.put() returns old value (not null)
5. `map.put(e, PRESENT) == null` evaluates to false
6. add() returns false, element NOT added
7. **Important:** Insertion order NOT changed - "First" stays in original position

### Re-insertion Doesn't Change Order

```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("A");      // Order: [A]
set.add("B");      // Order: [A, B]
set.add("C");      // Order: [A, B, C]
set.add("A");      // Duplicate - Order still: [A, B, C]

// "A" doesn't move to end!
```

This is different from some cache implementations (like LinkedHashMap with access-order mode).

### Custom Objects - Must Override hashCode() and equals()

```java
class Student {
    String name;
    int id;
    
    @Override
    public int hashCode() {
        return Objects.hash(name, id);
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        return id == student.id && Objects.equals(name, student.name);
    }
}

LinkedHashSet<Student> students = new LinkedHashSet<>();
students.add(new Student("Alice", 101));
students.add(new Student("Bob", 102));
students.add(new Student("Alice", 101));  // Duplicate - rejected

System.out.println(students.size());  // 2
```

**Interview tip:** LinkedHashSet's duplicate handling is identical to HashSet - the doubly-linked list only affects iteration order, not uniqueness logic.

***

## What happens if two elements have the same hash code?

When two elements have the same hash code, it's called a **hash collision**. LinkedHashSet handles collisions the same way as HashSet/HashMap - using **chaining** (linked lists in buckets).

### Collision Handling Structure

Each bucket can contain **multiple entries with same hash code** :

```
Hash Table:
Bucket: → [Entry1] → [Entry2] → [Entry3] → null
             ↓           ↓           ↓
          (hash=100)  (hash=100)  (hash=100)
          key="AB"    key="Ba"    key="XY"

All have same hash code but different keys!
```

### Two-Level Structure

**Level 1: Hash table with collision chains (next pointers)**
```
Bucket: [AB] → [Ba] → [XY]
           ↓      ↓      ↓
        next    next   next=null
```

**Level 2: Doubly-linked list for insertion order (before/after pointers)**
```
head → [AB] ↔ [Ba] ↔ [XY] ← tail
       ↓      ↓      ↓
    after   after   after=null
```

### Complete Entry Structure with Collision

```java
static class Entry<K,V> {
    int hash;           // Hash code (may collide with others)
    K key;              // The actual element
    V value;            // Dummy PRESENT object
    Node<K,V> next;     // Next in same bucket (collision chain)
    Entry<K,V> before;  // Previous in insertion order
    Entry<K,V> after;   // Next in insertion order
}
```

### Example Scenario

```java
class Word {
    String text;
    
    @Override
    public int hashCode() {
        // Poor hash function - only uses first character
        return text.charAt(0);
    }
    
    @Override
    public boolean equals(Object o) {
        return text.equals(((Word) o).text);
    }
}

LinkedHashSet<Word> words = new LinkedHashSet<>();
words.add(new Word("Apple"));    // hash = 65 ('A')
words.add(new Word("Avocado"));  // hash = 65 ('A') - COLLISION!
words.add(new Word("Apricot"));  // hash = 65 ('A') - COLLISION!
words.add(new Word("Banana"));   // hash = 66 ('B')
```

**Internal structure:**
```
Hash Table (collision handling):
Bucket[65]: [Apple] → [Avocado] → [Apricot] → null
Bucket[66]: [Banana] → null

Doubly-Linked List (insertion order):
head → [Apple] ↔ [Avocado] ↔ [Apricot] ↔ [Banana] ← tail
```

### Add Operation with Collision

```java
// Adding "Avocado" when "Apple" already exists with same hash

1. Calculate hash("Avocado") = 65
2. Go to bucket[65]
3. Scan collision chain:
   - Check "Apple".equals("Avocado") → false
   - No more entries, so it's unique
4. Add to bucket chain: bucket[65] = [Apple] → [Avocado]
5. Add to linked list tail: tail.after = [Avocado]
```

### Contains Operation with Collision

```java
// Checking if "Avocado" exists

1. Calculate hash("Avocado") = 65
2. Go to bucket[65]
3. Scan collision chain:
   - Check "Apple".equals("Avocado") → false, continue
   - Check "Avocado".equals("Avocado") → true, FOUND!
4. Return true

// Still O(1) on average (few collisions with good hash function)
```

### Performance Impact

**With good hash function:**
- Few collisions per bucket (0-2 entries)
- O(1) operations maintained

**With poor hash function:**
- Many collisions per bucket
- Worst case: O(n) for operations in that bucket
- Java 8+ optimization: Bucket converts to tree after 8 entries

**Interview insight:** The key difference from HashSet is that collisions are handled via the `next` pointer (bucket chain), while insertion order is maintained via `before/after` pointers (doubly-linked list). These are **two independent structures** working together.

***

## How does LinkedHashSet ensure predictable iteration order?

LinkedHashSet ensures predictable iteration by **following the doubly-linked list** instead of traversing the hash table buckets.

### Iteration Mechanism

**Iterator implementation:**
```java
private class LinkedHashIterator implements Iterator<E> {
    LinkedHashMap.Entry<K,V> next;
    LinkedHashMap.Entry<K,V> current;
    
    LinkedHashIterator() {
        next = header;  // Start at head of linked list
    }
    
    public boolean hasNext() {
        return next != null;
    }
    
    public E next() {
        current = next;
        next = next.after;  // Follow 'after' pointer, not bucket chain!
        return current.key;
    }
}
```

### Comparison: HashSet vs LinkedHashSet Iteration

**HashSet iteration (unpredictable):**
```java
// Iterates through hash table buckets
for (int bucket = 0; bucket < capacity; bucket++) {
    Entry entry = table[bucket];
    while (entry != null) {
        process(entry.key);
        entry = entry.next;  // Follow collision chain
    }
}

// Order depends on:
// 1. Hash codes of elements
// 2. Bucket distribution
// 3. Collision resolution
// Result: UNPREDICTABLE ORDER
```

**LinkedHashSet iteration (predictable):**
```java
// Iterates through doubly-linked list
Entry entry = head;
while (entry != null) {
    process(entry.key);
    entry = entry.after;  // Follow insertion order
}

// Order depends on:
// 1. Sequence of add() calls
// Result: INSERTION ORDER GUARANTEED
```

### Visual Walkthrough

**Setup:**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Third");   // Added 1st
set.add("First");   // Added 2nd
set.add("Second");  // Added 3rd
```

**Internal structure:**
```
Hash Table (based on hash codes):
Bucket: [First] → null
Bucket: [Second] → null
Bucket: [Third] → null

Doubly-Linked List (insertion order):
head → [Third] ↔ [First] ↔ [Second] ← tail
```

**Iteration path:**
```java
for (String s : set) {
    System.out.println(s);
}

// Iterator follows linked list:
1. Start at head → "Third"
2. Follow after → "First"
3. Follow after → "Second"
4. after == null → stop

// Output:
// Third
// First
// Second
```

**Not the hash table path (which would be unpredictable)!**

### Why This Matters

**Predictable iteration enables:**

**1. Reproducible results:**
```java
LinkedHashSet<String> set = buildSet();
for (String item : set) {
    log(item);  // Always same order in logs
}
```

**2. Ordered unique collections:**
```java
// Remove duplicates from list, keep first occurrence order
List<Integer> list = Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6, 5);
LinkedHashSet<Integer> unique = new LinkedHashSet<>(list);
// Result: [3, 1, 4, 5, 9, 2, 6] - order preserved
```

**3. LRU-like behavior:**
```java
LinkedHashSet<String> recentItems = new LinkedHashSet<>();
// Items can be processed in access order if needed
```

### Time Complexity of Iteration

**LinkedHashSet:** O(n) where n = number of elements
- Simply walks the linked list from head to tail
- Visits each element exactly once
- Doesn't matter how many buckets or collisions

**HashSet:** O(n + capacity)
- Must scan all buckets, including empty ones
- With low load factor, many empty buckets
- Can be slower in practice

### Modification During Iteration

**Fail-fast behavior (same as HashSet):**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("A"); set.add("B"); set.add("C");

for (String s : set) {
    set.add("D");  // Throws ConcurrentModificationException!
}

// Correct way:
Iterator<String> it = set.iterator();
while (it.hasNext()) {
    String s = it.next();
    it.remove();  // Safe - uses iterator's remove
}
```

The doubly-linked list is updated during iterator.remove() to maintain order consistency.



# LinkedHashSet - Behavior, Safety & Comparisons

## Behavior & Safety

### Is LinkedHashSet synchronized? How to make it thread-safe?

**No, LinkedHashSet is NOT synchronized** (not thread-safe by default). Multiple threads accessing a LinkedHashSet concurrently without proper synchronization can lead to:
- Data corruption
- Lost updates
- Inconsistent state
- Unpredictable behavior

**Example of the problem:**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();

// Thread 1
set.add("A");

// Thread 2 (concurrent)
set.add("B");

// Result: May lose insertions, corrupt internal linked list
```

**Testing thread-safety issue** :
```java
public void testConcurrentAccess() throws InterruptedException {
    final LinkedHashSet<String> set = new LinkedHashSet<>();
    ExecutorService executor = Executors.newFixedThreadPool(100);
    
    for (int i = 0; i < 100; i++) {
        executor.execute(() -> set.add("item"));
    }
    
    executor.shutdown();
    executor.awaitTermination(1, TimeUnit.SECONDS);
    
    System.out.println("Set size: " + set.size());
    // Expected: 1 (all threads adding same element)
    // Actual: May vary (data corruption)
}
```

***

### How to make LinkedHashSet thread-safe:

**Option 1: Collections.synchronizedSet() (Simple wrapper)**
```java
Set<String> normalSet = new LinkedHashSet<>();
Set<String> syncSet = Collections.synchronizedSet(normalSet);

// Now thread-safe for basic operations
syncSet.add("Apple");
syncSet.remove("Banana");
```


**How it works:**
- Wraps LinkedHashSet in a synchronized decorator
- Every method call is wrapped with `synchronized` block
- All public methods acquire the wrapper's intrinsic lock

**Critical caveat - Manual synchronization for iteration** :
```java
Set<String> syncSet = Collections.synchronizedSet(new LinkedHashSet<>());

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

**Why manual synchronization is needed:** The `synchronized` wrapper only protects individual method calls. Iteration involves multiple method calls (hasNext(), next()), and these must be atomic.

**Limitations:**
- Serializes all access (performance bottleneck)
- Only one thread can access at a time
- Still fails fast during iteration without manual sync

***

**Option 2: CopyOnWriteArraySet (Read-heavy workloads)**
```java
Set<String> concurrentSet = new CopyOnWriteArraySet<>();
concurrentSet.add("Apple");
concurrentSet.add("Banana");

// Safe concurrent iteration - no synchronization needed
for (String item : concurrentSet) {
    process(item);  // Safe even if another thread modifies
}
```


**Characteristics:**
- Thread-safe by design
- Every write creates a new copy of underlying array
- Reads are lock-free (very fast)
- Writes are expensive (O(n))
- **Does NOT maintain insertion order like LinkedHashSet**
- Best for: Read >> Write scenarios

**Trade-offs:**
- ✓ Excellent for read-heavy workloads
- ✓ No synchronization needed for iteration
- ✗ Very slow writes (copies entire array)
- ✗ High memory usage (during copy)
- ✗ No insertion order guarantee

***

**Option 3: Custom concurrent implementation (Advanced)**

There's no built-in `ConcurrentLinkedHashSet` in JDK. For truly concurrent LinkedHashSet behavior, you'd need to build a custom solution using:
- `ConcurrentHashMap` for fast lookups
- `ConcurrentSkipListSet` for ordered iteration
- Atomic operations for consistency

**Example approach** :
```java
public class ConcurrentLinkedHashSet<E> {
    private final ConcurrentHashMap<E, InsertionOrder> map;
    private final ConcurrentSkipListSet<InsertionOrder> orderedSet;
    private final AtomicLong counter = new AtomicLong(0);
    
    public boolean add(E element) {
        return map.computeIfAbsent(element, e -> {
            InsertionOrder order = new InsertionOrder(counter.getAndIncrement(), e);
            orderedSet.add(order);
            return order;
        }) != null;
    }
    
    // Iterator follows orderedSet for insertion order
}
```

This is complex and not recommended for production without extensive testing.

***

**Performance comparison:**

| Approach | Read Performance | Write Performance | Iteration | Use Case |
|----------|-----------------|-------------------|-----------|----------|
| Collections.synchronizedSet() | Slow (locks) | Slow (locks) | Requires manual sync | Low contention |
| CopyOnWriteArraySet | Very fast | Very slow | Lock-free | Read >> Write |
| Custom concurrent (advanced) | Fast | Moderate | Weakly consistent | High concurrency needs |

**Best practice for interviews** :
- Simple needs → `Collections.synchronizedSet()`
- Read-heavy → `CopyOnWriteArraySet` (but loses order)
- High concurrency → Consider if you really need LinkedHashSet ordering, or use `ConcurrentHashMap.newKeySet()` with manual ordering

***

### What happens when LinkedHashSet is modified during iteration? (Fail-fast)

LinkedHashSet exhibits **fail-fast behavior** - it throws `ConcurrentModificationException` when structurally modified during iteration.

**Fail-fast mechanism:**
```java
// LinkedHashSet (via LinkedHashMap) tracks modifications
transient int modCount = 0;  // Modification counter

// Every add/remove increments it
public boolean add(E e) {
    // ... add logic
    modCount++;
}

// Iterator stores expected count
private class LinkedHashIterator {
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
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Apple");
set.add("Banana");
set.add("Cherry");

for (String fruit : set) {
    if (fruit.equals("Banana")) {
        set.remove(fruit);  // Throws ConcurrentModificationException!
    }
}
```

**Why it fails:**
1. Enhanced for-loop creates iterator with `expectedModCount = 3`
2. `set.remove()` increments `modCount` to 4
3. Next call to `iterator.next()` detects mismatch (3 ≠ 4)
4. Throws `ConcurrentModificationException`

***

**Example 2: Iterator modification (CORRECT)**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Apple");
set.add("Banana");
set.add("Cherry");

Iterator<String> it = set.iterator();
while (it.hasNext()) {
    String fruit = it.next();
    if (fruit.equals("Banana")) {
        it.remove();  // Safe - iterator handles modCount
    }
}

System.out.println(set);  // [Apple, Cherry] - order preserved
```

**Why it works:**
- `iterator.remove()` removes element AND updates `expectedModCount`
- Both counters stay synchronized
- Insertion order maintained correctly

***

**Example 3: removeIf() (BEST - Java 8+)**
```java
set.removeIf(fruit -> fruit.equals("Banana"));
```

**Advantages:**
- Cleaner syntax
- Handles modification counter internally
- Maintains insertion order
- More efficient

***

**Multi-threaded scenario:**
```java
// Thread 1: Iterating
for (String item : set) {
    process(item);  // May throw ConcurrentModificationException
}

// Thread 2: Modifying concurrently
set.add("NewItem");  // Causes exception in Thread 1
```

**Important notes:**
- Fail-fast is **best-effort**, not guaranteed
- May not always throw exception (race conditions)
- In multi-threaded code without synchronization, you might get corrupted data WITHOUT exception
- Use `Collections.synchronizedSet()` for thread-safety

**Interview insight:** The doubly-linked list in LinkedHashSet makes fail-fast detection even more critical - concurrent modification can corrupt both the hash table AND the linked list structure, leading to serious data corruption.

---

### Can LinkedHashSet store heterogeneous objects?

**Yes, LinkedHashSet can technically store heterogeneous (different types) objects**, but it's generally bad practice.

**Example - Technically possible:**
```java
LinkedHashSet<Object> mixedSet = new LinkedHashSet<>();
mixedSet.add("String");
mixedSet.add(123);           // Integer
mixedSet.add(45.67);         // Double
mixedSet.add(new Date());    // Date
mixedSet.add(true);          // Boolean

System.out.println(mixedSet);
// [String, 123, 45.67, Tue Oct 28 19:42:00 IST 2025, true]
// Order preserved!
```

**Key observation:** Insertion order is maintained even with mixed types.

***

**Why it works:**
- All objects extend `Object` class
- All objects have `hashCode()` and `equals()` methods
- LinkedHashSet accepts any `Object` type
- Doubly-linked list connects any type of entries

***

**Why it's bad practice:**

**1. Type safety lost - Runtime errors:**
```java
LinkedHashSet<Object> set = new LinkedHashSet<>();
set.add("Text");
set.add(100);

// Dangerous - ClassCastException at runtime
for (Object obj : set) {
    String s = (String) obj;  // Crashes on Integer!
    System.out.println(s.toUpperCase());
}
```

**2. Requires excessive type checking:**
```java
for (Object obj : set) {
    if (obj instanceof String) {
        System.out.println(((String) obj).toUpperCase());
    } else if (obj instanceof Integer) {
        System.out.println(((Integer) obj) * 2);
    } else if (obj instanceof Double) {
        System.out.println(((Double) obj) * 1.5);
    }
    // Ugly and error-prone!
}
```

**3. TreeSet compatibility issues:**
```java
// This works with LinkedHashSet
LinkedHashSet<Object> linkedSet = new LinkedHashSet<>();
linkedSet.add("String");
linkedSet.add(123);  // OK - no comparison needed

// But fails with TreeSet
TreeSet<Object> treeSet = new TreeSet<>();
treeSet.add("String");
treeSet.add(123);  // Throws ClassCastException!
// Cannot compare String with Integer for sorting
```

***

**Best practices:**

**Use specific generic types:**
```java
// Good - Type-safe
LinkedHashSet<String> stringSet = new LinkedHashSet<>();
stringSet.add("Apple");
stringSet.add("Banana");
// stringSet.add(123);  // Compile error - caught early!

// Good - Common supertype
LinkedHashSet<Number> numberSet = new LinkedHashSet<>();
numberSet.add(123);      // Integer extends Number
numberSet.add(45.67);    // Double extends Number
numberSet.add(100L);     // Long extends Number
```

**When heterogeneous might be acceptable:**
- Temporary collections during data transformation
- Configuration settings (consider Map<String, Object> instead)
- Legacy code integration
- Working with reflection/serialization

***

**Interview answer:** "Yes, LinkedHashSet<Object> can store different types and will maintain their insertion order. However, it's an anti-pattern that defeats Java's type safety. The compiler can't catch type errors, leading to runtime ClassCastException. Always use specific generic types like LinkedHashSet<String> for maintainability and safety. If you truly need mixed types, consider using a Map with type-safe keys or separate collections for different types."

***

## Comparison

### Difference between HashSet, LinkedHashSet, and TreeSet

All three implement `Set` interface (unique elements only), but differ fundamentally in ordering and performance:

| Feature | HashSet | LinkedHashSet | TreeSet |
|---------|---------|---------------|---------|
| **Internal Structure** | HashMap (hash table) | LinkedHashMap (hash table + doubly-linked list) | TreeMap (Red-Black Tree) |
| **Ordering** | No order (random) | Insertion order | Sorted order (natural/comparator) |
| **Null elements** | One null ✓ | One null ✓ | No nulls ✗ |
| **Performance - add** | O(1) | O(1) | O(log n) |
| **Performance - remove** | O(1) | O(1) | O(log n) |
| **Performance - contains** | O(1) | O(1) | O(log n) |
| **Memory** | Lowest | Medium (linked list overhead) | Highest (tree nodes) |
| **Iteration** | Fast but random | Fast and predictable | Slower but sorted |
| **When to use** | No order needed, fastest | Need insertion order | Need sorted elements |

***

**Visual comparison:**

**HashSet - Random order:**
```java
HashSet<Integer> hashSet = new HashSet<>();
hashSet.add(3);
hashSet.add(1);
hashSet.add(4);
hashSet.add(2);

System.out.println(hashSet);
// Output: [1, 2, 3, 4] or [4, 1, 3, 2] or any order
// Depends on hash codes, NOT insertion order!
```

**LinkedHashSet - Insertion order:**
```java
LinkedHashSet<Integer> linkedSet = new LinkedHashSet<>();
linkedSet.add(3);
linkedSet.add(1);
linkedSet.add(4);
linkedSet.add(2);

System.out.println(linkedSet);
// Output: [3, 1, 4, 2] - EXACTLY insertion order
```

**TreeSet - Sorted order:**
```java
TreeSet<Integer> treeSet = new TreeSet<>();
treeSet.add(3);
treeSet.add(1);
treeSet.add(4);
treeSet.add(2);

System.out.println(treeSet);
// Output: [1, 2, 3, 4] - ALWAYS sorted (natural order)
```

***

**Detailed comparison:**

**HashSet - Fastest, no order:**
```java
// Best for: Maximum performance, order doesn't matter
HashSet<String> users = new HashSet<>();
users.add("Alice");
users.add("Bob");

if (users.contains("Alice")) {  // O(1)
    System.out.println("Found!");
}

// Use case: Checking membership, removing duplicates (order doesn't matter)
```

**LinkedHashSet - Insertion order preserved:**
```java
// Best for: Need uniqueness + predictable order
LinkedHashSet<String> browserHistory = new LinkedHashSet<>();
browserHistory.add("google.com");
browserHistory.add("stackoverflow.com");
browserHistory.add("google.com");  // Duplicate - ignored

// Iterate in visit order
for (String url : browserHistory) {
    System.out.println(url);  // google.com, stackoverflow.com
}

// Use case: Browser history, ordered unique collections, LRU caches
```

**TreeSet - Automatically sorted:**
```java
// Best for: Need sorted unique elements
TreeSet<Integer> scores = new TreeSet<>();
scores.add(85);
scores.add(92);
scores.add(78);
scores.add(92);  // Duplicate - ignored

System.out.println(scores);  // [78, 85, 92] - sorted!

// Special operations
scores.first();        // 78 (minimum)
scores.last();         // 92 (maximum)
scores.higher(80);     // 85 (next element > 80)
scores.subSet(80, 90); // [85] (elements in range)

// Use case: Leaderboards, priority queues, sorted unique data
```

***

**Custom sorting with TreeSet:**
```java
// Sort strings by length
TreeSet<String> words = new TreeSet<>(Comparator.comparingInt(String::length));
words.add("Java");
words.add("C");
words.add("Python");

System.out.println(words);  // [C, Java, Python] - sorted by length
```

***

**Null handling:**
```java
// HashSet and LinkedHashSet - allow one null
HashSet<String> hashSet = new HashSet<>();
hashSet.add(null);  // OK

LinkedHashSet<String> linkedSet = new LinkedHashSet<>();
linkedSet.add(null);  // OK

// TreeSet - no nulls allowed
TreeSet<String> treeSet = new TreeSet<>();
treeSet.add(null);  // Throws NullPointerException!
// Reason: Can't compare null with other objects for sorting
```

***

**Performance in practice:**

**Scenario 1: Adding 1 million elements**
```
HashSet:       ~100ms
LinkedHashSet: ~120ms (20% slower - linked list overhead)
TreeSet:       ~800ms (8x slower - tree balancing)
```

**Scenario 2: Contains check (1 million elements)**
```
HashSet:       <1ms (O(1))
LinkedHashSet: <1ms (O(1))
TreeSet:       ~1ms (O(log n) ≈ 20 comparisons)
```

**Scenario 3: Iteration (1 million elements)**
```
HashSet:       ~50ms (random bucket order)
LinkedHashSet: ~45ms (faster - follows linked list)
TreeSet:       ~70ms (slower - tree traversal)
```

***

**Decision tree:**
```
Need sorted elements?
├─ Yes → TreeSet
└─ No → Need predictable order?
    ├─ Yes → LinkedHashSet
    └─ No → HashSet (fastest!)
```

***

### Difference between LinkedHashSet and LinkedList

These are **fundamentally different** collection types serving different purposes:

| Feature | LinkedHashSet | LinkedList |
|---------|---------------|------------|
| **Interface** | Set | List & Deque |
| **Duplicates** | Not allowed | Allowed |
| **Ordering** | Insertion order | Insertion order |
| **Null** | One null | Multiple nulls |
| **Indexed access** | No `get(index)` | `get(index)` in O(n) |
| **contains()** | O(1) | O(n) |
| **add()** | O(1) | O(1) |
| **remove(element)** | O(1) | O(n) |
| **Use case** | Unique elements + order | Ordered list + duplicates |

***

**LinkedHashSet - Unique, ordered, fast lookups:**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Apple");
set.add("Banana");
set.add("Apple");  // Ignored (duplicate)

System.out.println(set.size());  // 2
System.out.println(set);  // [Apple, Banana]

// Fast membership check
if (set.contains("Apple")) {  // O(1)
    System.out.println("Found!");
}

// No indexed access
// set.get(0);  // Compile error - method doesn't exist
```

**LinkedList - Ordered, allows duplicates, sequential access:**
```java
LinkedList<String> list = new LinkedList<>();
list.add("Apple");
list.add("Banana");
list.add("Apple");  // Allowed (duplicate)

System.out.println(list.size());  // 3
System.out.println(list);  // [Apple, Banana, Apple]

// Slow membership check
if (list.contains("Apple")) {  // O(n) - must scan
    System.out.println("Found!");
}

// Indexed access (but slow)
String first = list.get(0);  // O(n) - must traverse
```

***

**When to use which:**

**Use LinkedHashSet when:**
```java
// ✓ Need unique elements
LinkedHashSet<String> uniqueUsernames = new LinkedHashSet<>();

// ✓ Fast membership testing important
if (visitedPages.contains(url)) { }  // O(1)

// ✓ Removing duplicates while keeping order
List<String> withDupes = Arrays.asList("A", "B", "A", "C");
LinkedHashSet<String> unique = new LinkedHashSet<>(withDupes);
// Result: [A, B, C]

// ✓ Set operations (union, intersection)
set1.addAll(set2);  // Union
set1.retainAll(set2);  // Intersection
```

**Use LinkedList when:**
```java
// ✓ Duplicates are meaningful
LinkedList<Order> orderQueue = new LinkedList<>();
orderQueue.add(order1);
orderQueue.add(order1);  // Same order twice is valid

// ✓ Queue/Deque operations
LinkedList<Task> queue = new LinkedList<>();
queue.addFirst(task);   // O(1)
queue.addLast(task);    // O(1)
queue.removeFirst();    // O(1)

// ✓ Need List interface methods
list.set(2, "NewValue");  // Replace at index
list.add(1, "Insert");    // Insert at position
```

***

**Real-world examples:**

**LinkedHashSet - Tracking visited pages:**
```java
LinkedHashSet<String> visitedURLs = new LinkedHashSet<>();
visitedURLs.add("page1.html");
visitedURLs.add("page2.html");
visitedURLs.add("page1.html");  // Revisit - ignored

// Shows unique pages in visit order
for (String url : visitedURLs) {
    System.out.println(url);
}
// Output: page1.html, page2.html
```

**LinkedList - Browser history with duplicates:**
```java
LinkedList<String> fullHistory = new LinkedList<>();
fullHistory.add("page1.html");
fullHistory.add("page2.html");
fullHistory.add("page1.html");  // Revisit - recorded again

// Shows all visits in order
for (String url : fullHistory) {
    System.out.println(url);
}
// Output: page1.html, page2.html, page1.html
```

***

**Key insight:** LinkedHashSet = "I need unique items in order." LinkedList = "I need all items (including duplicates) in order."

---

### Difference between LinkedHashSet and HashMap (since it uses LinkedHashMap internally)

LinkedHashSet actually **uses LinkedHashMap internally**, but they serve different purposes:

| Feature | LinkedHashSet | HashMap |
|---------|---------------|---------|
| **Interface** | Set | Map |
| **Stores** | Single values (elements) | Key-value pairs |
| **Internal impl** | LinkedHashMap | HashMap (array + linked lists/trees) |
| **Duplicates** | No duplicate elements | No duplicate keys, values can duplicate |
| **Null** | One null element | One null key, multiple null values |
| **Methods** | add(), remove(), contains() | put(), get(), remove() |
| **Ordering** | Insertion order of elements | Insertion order of keys (in LinkedHashMap) |
| **Use case** | Unique collection with order | Key-value associations with order |

***

**The internal relationship:**

**LinkedHashSet implementation:**
```java
public class LinkedHashSet<E> extends HashSet<E> {
    private transient LinkedHashMap<E, Object> map;
    private static final Object PRESENT = new Object();
    
    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }
    
    public boolean contains(E e) {
        return map.containsKey(e);
    }
    
    public boolean remove(E e) {
        return map.remove(e) == PRESENT;
    }
}
```

**What's happening:**
- Element is stored as **key** in LinkedHashMap
- Value is always a dummy `PRESENT` object
- This leverages HashMap's key uniqueness for Set's uniqueness

***

**Visual comparison:**

**LinkedHashSet - Just values:**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Apple");
set.add("Banana");
set.add("Cherry");

// Internal structure (using LinkedHashMap):
// {"Apple" -> PRESENT, "Banana" -> PRESENT, "Cherry" -> PRESENT}

System.out.println(set);  // [Apple, Banana, Cherry]
System.out.println(set.contains("Apple"));  // true
```

**LinkedHashMap - Key-value pairs:**
```java
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
map.put("Apple", 10);
map.put("Banana", 20);
map.put("Cherry", 30);

// Internal structure:
// {"Apple" -> 10, "Banana" -> 20, "Cherry" -> 30}

System.out.println(map);  // {Apple=10, Banana=20, Cherry=30}
System.out.println(map.get("Apple"));  // 10
```

***

**Duplicate handling:**

**LinkedHashSet - No duplicate elements:**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("Java");
set.add("Python");
set.add("Java");  // Ignored - duplicate

System.out.println(set);  // [Java, Python]
```

**LinkedHashMap - No duplicate keys, values can repeat:**
```java
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
map.put("Java", 1);
map.put("Python", 2);
map.put("Java", 3);  // Updates Java's value to 3

System.out.println(map);  // {Java=3, Python=2}

// But values can be duplicates:
map.put("C++", 2);  // Value 2 appears twice - OK!
System.out.println(map);  // {Java=3, Python=2, C++= 2}
```

***

**Null handling:**

**LinkedHashSet - One null element:**
```java
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("A");
set.add(null);
set.add("B");
set.add(null);  // Ignored

System.out.println(set);  // [A, null, B]
```

**LinkedHashMap - One null key, multiple null values:**
```java
LinkedHashMap<String, String> map = new LinkedHashMap<>();
map.put("key1", null);
map.put(null, "value");
map.put("key2", null);  // Multiple null values OK
map.put(null, "updated");  // Updates null key's value

System.out.println(map);  // {key1=null, null=updated, key2=null}
```

***

**Ordering:**

**Both maintain insertion order:**
```java
// LinkedHashSet - insertion order of elements
LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("First");
set.add("Second");
set.add("Third");
// Iteration: First, Second, Third

// LinkedHashMap - insertion order of keys
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
map.put("First", 1);
map.put("Second", 2);
map.put("Third", 3);
// Key iteration: First, Second, Third
```

***

**When to use which:**

**Use LinkedHashSet when:**
```java
// Need unique elements with order
LinkedHashSet<String> uniqueTags = new LinkedHashSet<>();
uniqueTags.add("Java");
uniqueTags.add("Python");
uniqueTags.add("Java");  // Ignored

// Just checking membership
if (uniqueTags.contains("Java")) { }

// No associated values needed
```

**Use LinkedHashMap when:**
```java
// Need key-value associations with order
LinkedHashMap<String, Integer> scores = new LinkedHashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 87);
scores.put("Alice", 98);  // Updates Alice's score

// Retrieving values by keys
int aliceScore = scores.get("Alice");  // 98

// Each key has meaningful data
```

***

**Real-world examples:**

**LinkedHashSet - Form field validation:**
```java
// Track which fields have errors (unique, ordered)
LinkedHashSet<String> errorFields = new LinkedHashSet<>();
errorFields.add("email");
errorFields.add("password");
errorFields.add("email");  // Already flagged

// Show errors in order fields appear on form
for (String field : errorFields) {
    showError(field);
}
```

**LinkedHashMap - Form field values:**
```java
// Store field names → values (ordered)
LinkedHashMap<String, String> formData = new LinkedHashMap<>();
formData.put("email", "user@example.com");
formData.put("password", "secret");
formData.put("email", "updated@example.com");  // Update value

// Process fields in form order
for (Map.Entry<String, String> entry : formData.entrySet()) {
    validate(entry.getKey(), entry.getValue());
}
```

***

**Interview key point:** "LinkedHashSet is essentially a wrapper around LinkedHashMap where elements are stored as keys with a dummy constant value. This clever design reuses LinkedHashMap's functionality - hash table for O(1) operations and doubly-linked list for insertion order - while presenting a simpler Set interface. When you need just unique elements in order, use LinkedHashSet. When you need to associate each unique key with a value, use LinkedHashMap."

***
