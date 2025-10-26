---
title: LinkedList in Java
---


### What is a LinkedList?

LinkedList is a **doubly-linked list implementation** of both the `List` and `Deque` interfaces in the Java Collections Framework. It's a sequential data structure where elements are stored in nodes, and each node contains references to its predecessor and successor nodes.

```java
LinkedList<String> list = new LinkedList<>();
```

**Key characteristics:**
- Implements both `List` and `Deque` interfaces
- Non-contiguous memory allocation
- Dynamic size with no capacity constraints
- Each element has overhead for storing pointers

### How is LinkedList different from an array?

From a fundamental data structure perspective :

| Aspect | Array | LinkedList |
|--------|-------|------------|
| **Memory Layout** | Contiguous memory block | Scattered nodes across heap |
| **Element Access** | Direct index calculation: O(1) | Sequential traversal: O(n) |
| **Insertion/Deletion** | O(n) - requires shifting | O(1) at known position |
| **Memory per Element** | 4 bytes (just the reference) | 24 bytes (object header + data + 2 pointers) |
| **Cache Performance** | Excellent (locality of reference) | Poor (pointer chasing) |
| **Size** | Fixed (traditional arrays) | Dynamic, grows on-demand |
| **Memory Waste** | Unused allocated space | None (allocates per element) |
| **Fragmentation** | None | Can fragment heap memory |

**Critical DSA Insight**: While arrays store elements in a single contiguous block, LinkedList nodes are allocated separately and can be scattered across the entire heap memory. This fundamental difference drives all performance characteristics.

**Memory Reality in Java**: A LinkedList node in Java consumes **24 bytes** :
- 12 bytes: Object header
- 4 bytes: Data reference
- 4 bytes: `next` pointer
- 4 bytes: `prev` pointer

Compare this to an array element which only needs 4 bytes for the reference. **LinkedList uses 6x more memory than an array for the same number of elements**.

### What data structure does LinkedList use internally?

LinkedList uses a **doubly-linked list** data structure. Internally, it maintains:

```java
private static class Node<E> {
    E item;           // The element data
    Node<E> next;     // Reference to next node
    Node<E> prev;     // Reference to previous node
}

transient Node<E> first;  // Reference to first node
transient Node<E> last;   // Reference to last node
transient int size;       // Number of elements
```

**Why doubly-linked?**
- Allows bidirectional traversal
- Enables O(1) deletion when you have a reference to a node
- Supports `Deque` operations (add/remove from both ends)

***

## Internal Working & Performance

### What is a node in LinkedList?

A **node** is the fundamental building block of a LinkedList. Each node is a separate object that encapsulates :

1. **Data/Element** - The actual value stored (reference to the object)
2. **Next Pointer** - Reference to the next node in the sequence
3. **Previous Pointer** - Reference to the previous node (doubly-linked)

**Visual representation:**
```
Node Structure:
┌─────────────────────────┐
│  prev  │  data  │  next │
│   ←    │   "A"  │   →   │
└─────────────────────────┘

Doubly Linked List:
null ← [Node1: "A"] ⇄ [Node2: "B"] ⇄ [Node3: "C"] → null
```

**Code representation:**
```java
private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;
    
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

### Why is get(index) slow in LinkedList?

**Fundamental reason**: LinkedList has **no direct indexing** like arrays. To access element at index `i`, you must **traverse the list sequentially** from either the beginning or end.

**Algorithm:**
```java
Node<E> node(int index) {
    if (index < (size >> 1)) {  // Optimization: start from closer end
        Node<E> x = first;
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

**Why it's slow:**
1. **Sequential access required** - Must follow `next`/`prev` pointers hop-by-hop
2. **No address calculation** - Arrays can compute address as `base + (index × size)` in O(1)
3. **Cache misses** - Each node is at a random memory location, causing CPU cache misses
4. **Pointer chasing penalty** - Modern CPUs are optimized for contiguous memory access

**Example**: To get `list.get(5000)` in a 10,000-element LinkedList:
- Must traverse 5,000 nodes
- Each node access requires loading from potentially different memory pages
- No CPU cache prefetching benefits
- No SIMD instruction utilization

**Optimization**: Java's implementation checks if `index < size/2` and traverses from the closer end, but this only reduces average traversal to `n/4`, still O(n).

### Time Complexity Analysis

#### `add()` at beginning/end — **O(1)**

**Adding at the beginning:**
```java
public void addFirst(E e) {
    final Node<E> f = first;
    final Node<E> newNode = new Node<>(null, e, f);
    first = newNode;
    if (f == null)
        last = newNode;
    else
        f.prev = newNode;
    size++;
}
```

**Why O(1)?**
- Direct access to `first` and `last` references
- Only requires creating one node and updating 2-3 pointers
- No traversal needed
- No element shifting required

**Adding at the end:**
```java
public void addLast(E e) {
    final Node<E> l = last;
    final Node<E> newNode = new Node<>(l, e, null);
    last = newNode;
    if (l == null)
        first = newNode;
    else
        l.next = newNode;
    size++;
}
```

**Performance advantage**: Unlike ArrayList which may need to grow and copy its internal array, LinkedList **never needs reallocation**. Every `add()` operation is predictable O(1) at the ends.

#### `remove()` from middle — **O(n)**

```java
public E remove(int index) {
    return unlink(node(index));  // node(index) is O(n)
}

E unlink(Node<E> x) {
    final E element = x.item;
    final Node<E> next = x.next;
    final Node<E> prev = x.prev;
    
    if (prev == null) {
        first = next;
    } else {
        prev.next = next;
        x.prev = null;
    }
    
    if (next == null) {
        last = prev;
    } else {
        next.prev = prev;
        x.next = null;
    }
    
    x.item = null;  // GC help
    size--;
    return element;
}
```

**Two-phase cost:**
1. **Finding the node**: O(n) - must traverse to index
2. **Unlinking the node**: O(1) - just pointer reassignment

**Total**: O(n) because finding dominates

**Important DSA note**: While unlinking is O(1), you still pay O(n) for traversal. This is why LinkedList's theoretical advantage doesn't materialize in practice for middle operations.

#### `get(index)` — **O(n)**

As explained above, requires sequential traversal. Average case is `n/4` traversals due to bidirectional optimization, but still O(n).

#### Summary Table

| Operation | LinkedList | ArrayList | Winner |
|-----------|------------|-----------|---------|
| `add()` (end) | O(1) guaranteed | O(1) amortized | LinkedList (predictable) |
| `addFirst()` | O(1) | O(n) | LinkedList |
| `add(index)` | O(n) | O(n) | ArrayList (cache-friendly) |
| `get(index)` | O(n) | O(1) | ArrayList |
| `remove(index)` | O(n) | O(n) | ArrayList (cache-friendly) |
| `removeFirst()` | O(1) | O(n) | LinkedList |
| `removeLast()` | O(1) | O(1) amortized | Tie |
| `contains()` | O(n) | O(n) | ArrayList (cache-friendly) |

### Why is inserting and deleting fast in LinkedList?

**The Theory**: When you have a **direct reference to a node**, insertion/deletion is O(1) because you only need to update pointers :

**Insertion between nodes:**
```
Before:  A ⇄ B ⇄ C

Insert X between A and B:
1. X.next = B
2. X.prev = A
3. A.next = X
4. B.prev = X

After:   A ⇄ X ⇄ B ⇄ C
```

**No elements need to move** - unlike ArrayList which must shift all subsequent elements.

**The Reality**: The "fast insert/delete" advantage only applies when :
1. You already have a reference to the exact node position
2. You're operating at the beginning or end of the list
3. You're iterating and modifying simultaneously

**Why it's NOT faster in practice for middle operations**:
- You still need O(n) to find the position
- Modern CPUs penalize pointer chasing heavily
- Cache misses dominate the cost
- ArrayList's O(n) shift is cache-friendly and often faster than LinkedList's O(n) traversal + O(1) unlink

**Benchmark reality** : For lists under ~1000-10,000 elements, ArrayList often outperforms LinkedList even for insertion-heavy workloads due to cache locality.

***

## Usage & When to Use

### When should you use LinkedList over ArrayList?

**Use LinkedList when** :

**1. Implementing Queue/Deque operations**
```java
Queue<String> queue = new LinkedList<>();
queue.offer("first");   // O(1) at end
queue.poll();           // O(1) at beginning

Deque<String> deque = new LinkedList<>();
deque.addFirst("A");    // O(1)
deque.addLast("Z");     // O(1)
deque.removeFirst();    // O(1)
deque.removeLast();     // O(1)
```

This is LinkedList's **sweet spot**. Operations at both ends are guaranteed O(1) with predictable performance.

**2. Frequent insertions/deletions at the beginning**
```java
list.addFirst(element);     // O(1) vs ArrayList's O(n)
list.removeFirst();         // O(1) vs ArrayList's O(n)
```

**3. Iterator-based modifications during traversal**
```java
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (condition) {
        it.remove();  // O(1) - already at the node
    }
}
```

When iterating and removing, LinkedList benefits because you already have a node reference.

**4. Unpredictable size with extreme memory efficiency requirements**
- LinkedList allocates exactly what's needed, no over-capacity
- ArrayList typically wastes 33-50% capacity during growth
- **But beware**: Each element uses 24 bytes vs ArrayList's 4 bytes

**5. You need a stack with predictable performance**
```java
LinkedList<String> stack = new LinkedList<>();
stack.push("A");   // addFirst() - O(1)
stack.pop();       // removeFirst() - O(1)
```

### When should you NOT use LinkedList?

**Avoid LinkedList when** :

**1. Random access is needed** (Most common case)
```java
for (int i = 0; i < list.size(); i++) {
    String s = list.get(i);  // O(n) each call = O(n²) total!
}
```

This is **catastrophically slow**. ArrayList does this in O(n) total.

**2. Memory is constrained**
- LinkedList uses **6x more memory** than ArrayList in Java
- Each node has 20 bytes of overhead beyond the data reference
- For small objects, overhead can exceed actual data size

**Example**: Storing 1 million integers:
- ArrayList: ~4 MB (1M × 4 bytes)
- LinkedList: ~24 MB (1M × 24 bytes)

**3. Your workload is read-heavy**
- Even simple iteration is slower due to cache misses
- Modern CPUs prefetch array data, not scattered linked nodes

**4. You're searching frequently**
```java
list.contains(element);  // O(n) but slower than ArrayList's O(n)
```

Both are O(n), but ArrayList benefits from:
- Cache line prefetching
- SIMD instructions
- Branch prediction
- Sequential memory access patterns

**5. You need to serialize/deserialize data**
- Serializing LinkedList is slower (must follow pointers)
- Increased GC pressure (more objects to track)

**Senior Dev Insight**: The default choice should **always** be ArrayList unless you have specific requirements for queue/deque operations or frequent beginning insertions. The theoretical advantages of LinkedList rarely materialize on modern hardware.

***

## Behavior & Safety

### Is LinkedList synchronized? How to make it thread-safe?

**No, LinkedList is NOT synchronized**, just like ArrayList. Multiple threads can corrupt the list structure through:
- Broken pointer chains
- Lost nodes
- Concurrent modification exceptions
- Size inconsistencies

**Making it thread-safe:**

**Option 1: Collections.synchronizedList()**
```java
List<String> syncList = Collections.synchronizedList(new LinkedList<>());
```

**Pros:**
- Simple wrapper
- All methods synchronized

**Cons:**
- Heavy locking overhead (worse than ArrayList due to pointer operations)
- Must manually synchronize iteration:
```java
synchronized(syncList) {
    Iterator<String> it = syncList.iterator();
    while (it.hasNext()) { 
        process(it.next());
    }
}
```

**Option 2: ConcurrentLinkedQueue/Deque**
```java
Queue<String> queue = new ConcurrentLinkedQueue<>();
Deque<String> deque = new ConcurrentLinkedDeque<>();
```

**Pros:**
- Lock-free algorithms using CAS (Compare-And-Swap)
- Much better concurrent performance
- No external synchronization needed

**Cons:**
- Only implements Queue/Deque, not List interface
- Weakly consistent iterators (may not reflect recent changes)

**Option 3: BlockingQueue implementations**
```java
BlockingQueue<String> queue = new LinkedBlockingQueue<>();
BlockingDeque<String> deque = new LinkedBlockingDeque<>();
```

**Best for**: Producer-consumer patterns with blocking operations.

**DSA Insight**: Synchronizing pointer-based structures is more complex than array-based ones. Each pointer modification must be atomic, and the JVM's memory model makes this expensive. CAS-based implementations are preferred for high-concurrency scenarios.

**Recommendation**: For concurrent access, **avoid synchronized LinkedList** entirely. Use `ConcurrentLinkedQueue`, `LinkedBlockingQueue`, or even `ConcurrentHashMap` depending on your use case.

### What happens when modifying LinkedList during iteration (fail-fast)?

LinkedList exhibits the same **fail-fast behavior** as ArrayList. It uses a `modCount` (modification counter) to detect concurrent modifications:

```java
protected transient int modCount = 0;  // Inherited from AbstractList
```

**Fail-fast mechanism:**
```java
final void checkForComodification() {
    if (modCount != expectedModCount)
        throw new ConcurrentModificationException();
}
```

**Scenario 1: Direct modification (WRONG)**
```java
LinkedList<String> list = new LinkedList<>(Arrays.asList("A", "B", "C"));
for (String s : list) {
    if (s.equals("B")) {
        list.remove(s);  // Throws ConcurrentModificationException
    }
}
```

**Scenario 2: Iterator modification (CORRECT)**
```java
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.equals("B")) {
        it.remove();  // Safe - iterator maintains internal consistency
    }
}
```

**Scenario 3: Java 8+ removeIf (BEST)**
```java
list.removeIf(s -> s.equals("B"));
```

**Important distinction**: LinkedList's iterator removal is genuinely O(1) because the iterator maintains a reference to the current node:

```java
private class ListItr implements ListIterator<E> {
    private Node<E> lastReturned;  // Reference to current node
    private Node<E> next;
    private int expectedModCount = modCount;
    
    public void remove() {
        checkForComodification();
        unlink(lastReturned);      // O(1) - have direct node reference
        expectedModCount = modCount;
    }
}
```

This is one case where LinkedList has a **real advantage** over ArrayList during iterator-based removal.

### Does LinkedList allow null elements?

**Yes, LinkedList allows multiple null elements**, unlike some other collections:

```java
LinkedList<String> list = new LinkedList<>();
list.add(null);     // OK
list.add("A");
list.add(null);     // OK - multiple nulls allowed
list.add("B");

System.out.println(list.size());  // 4
list.contains(null);              // true
list.indexOf(null);               // 0 (first occurrence)
```

**Why allowed?**
- LinkedList implements the `List` interface, which permits null elements
- The node structure stores references, and `null` is a valid reference
- Consistent with List contract

**Contrast with**:
- `TreeSet`/`TreeMap` - throw `NullPointerException` (can't compare null)
- `ConcurrentLinkedQueue` - doesn't allow null (uses it as sentinel value)
- `HashMap` - allows one null key and multiple null values

**DSA consideration**: Allowing nulls requires extra null checks in `contains()`, `indexOf()`, and `remove()` operations:

```java
public boolean contains(Object o) {
    return indexOf(o) != -1;
}

public int indexOf(Object o) {
    int index = 0;
    if (o == null) {  // Special handling for null
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null)
                return index;
            index++;
        }
    } else {
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item))
                return index;
            index++;
        }
    }
    return -1;
}
```

***

## Comparison

### ArrayList vs LinkedList - Comprehensive

| Criteria | ArrayList | LinkedList | Winner |
|----------|-----------|------------|--------|
| **Data Structure** | Dynamic array | Doubly linked list | - |
| **Memory per element** | 4 bytes (reference only) | 24 bytes (12B header + 4B data + 8B pointers) | ArrayList (6x less) |
| **Memory efficiency** | Wastes 33-50% during growth | No waste, allocates per-element | LinkedList (variable size) |
| **Total memory for 1M elements** | ~4-6 MB | ~24 MB | ArrayList |
| **Cache locality** | Excellent (contiguous) | Terrible (scattered) | ArrayList |
| **Random access `get(i)`** | O(1) | O(n) | ArrayList |
| **Sequential iteration** | Fast (cache-friendly) | Slower (pointer chasing) | ArrayList |
| **Insert/delete at beginning** | O(n) | O(1) | LinkedList |
| **Insert/delete at end** | O(1) amortized | O(1) guaranteed | LinkedList (predictable) |
| **Insert/delete in middle** | O(n) | O(n) | ArrayList (cache wins) |
| **`contains()` / Search** | O(n) but faster | O(n) but slower | ArrayList |
| **Iterator removal** | O(n) | O(1) | LinkedList |
| **Implements** | List | List + Deque | LinkedList (more interfaces) |
| **Use as Stack** | OK | Excellent | LinkedList |
| **Use as Queue** | Poor | Excellent | LinkedList |
| **GC pressure** | Low (one array object) | High (1M node objects) | ArrayList |
| **Predictable performance** | No (resizing spikes) | Yes (no reallocation) | LinkedList |
| **Overall performance** | Better in 95% of cases | Better for queue/deque ops | ArrayList (general) |

### Real-World Performance

**Benchmark insights** (list with 10,000 elements):

**Random access:**
- ArrayList: ~0.001ms per access
- LinkedList: ~5ms per access (5000x slower!)

**Iteration:**
- ArrayList: ~0.5ms total
- LinkedList: ~2ms total (4x slower)

**Insert at beginning:**
- ArrayList: ~50ms (must shift all elements)
- LinkedList: ~0.001ms (just pointer updates)

**Insert in middle (5000 known inserts):**
- ArrayList: ~25ms (shift half the elements each time)
- LinkedList: ~25ms (traverse to position each time)
- **Tie** because traversal cost equals shift cost

**Insert at end:**
- ArrayList: ~0.001ms (amortized)
- LinkedList: ~0.001ms
- **Tie**

### When to Choose What

**Choose ArrayList (default):**
```java
// General-purpose list
List<String> items = new ArrayList<>();

// Known size
List<Integer> numbers = new ArrayList<>(1000);

// Read-heavy workload
List<User> users = new ArrayList<>();
for (User u : users) {  // Fast iteration
    process(u);
}

// Random access needed
String item = list.get(500);  // O(1)
```

**Choose LinkedList (specific cases):**
```java
// Queue operations
Queue<Task> taskQueue = new LinkedList<>();
taskQueue.offer(task);  // O(1) at end
taskQueue.poll();       // O(1) at beginning

// Deque operations
Deque<String> deque = new LinkedList<>();
deque.addFirst("start");
deque.addLast("end");

// Stack with predictable performance
Deque<Integer> stack = new LinkedList<>();
stack.push(1);
stack.pop();

// Iterator-based removal
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (shouldRemove(it.next())) {
        it.remove();  // O(1) in LinkedList
    }
}
```

### The Modern Reality

**Hardware changes everything** :

1. **CPU caches are king** - Sequential array access is 100-1000x faster than pointer chasing
2. **Memory is cheap, time is expensive** - The 6x memory overhead matters less than performance
3. **Compilers optimize arrays** - SIMD, loop unrolling, prefetching all favor arrays
4. **GC efficiency** - One array object vs millions of node objects

**Senior Dev Wisdom**: LinkedList is a textbook data structure that looks great on paper but disappoints in production. Modern CPUs are designed for array operations. Use LinkedList **only** when you specifically need:
- Queue/Deque operations (or use `ArrayDeque` instead)
- Frequent beginning insertions
- Stack with guaranteed O(1) operations

For everything else, **ArrayList wins**. Period.

**The ArrayDeque alternative**: For most LinkedList use cases (queue, deque, stack), `ArrayDeque` is actually faster because it combines O(1) operations at both ends with array cache locality. Only use LinkedList when you specifically need the `List` interface alongside deque operations.

| Method                           | Purpose               |
| -------------------------------- | --------------------- |
| `add(E e)`                       | Add to end            |
| `addFirst(E e)`                  | Add at beginning      |
| `addLast(E e)`                   | Add at end            |
| `remove()`                       | Remove first element  |
| `remove(int index)`              | Remove by index       |
| `removeFirst()` / `removeLast()` | Remove boundaries     |
| `get(int index)`                 | Access element (slow) |
| `getFirst()` / `getLast()`       | Access boundaries     |
| `size()`                         | Count elements        |
