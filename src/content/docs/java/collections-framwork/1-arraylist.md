---
title: ArrayList in Java
---

# ArrayList - Deep Dive

## Basics

### What is an ArrayList?

ArrayList is a **resizable array implementation** of the `List` interface from the Java Collections Framework. It's a dynamic data structure that combines the random access performance of arrays with the flexibility of dynamic sizing.

```java
ArrayList<Integer> list = new ArrayList<>();  // No size needed
```

### How is it different from a normal array?

From a DSA perspective, here are the fundamental differences :

| Aspect | Array | ArrayList |
|--------|-------|-----------|
| **Size** | Fixed at creation time | Dynamic, grows/shrinks automatically |
| **Type Safety** | No generics support | Full generics support (`ArrayList<T>`) |
| **Primitives** | Can store primitives directly (`int[]`) | Cannot store primitives (uses autoboxing to `Integer`) |
| **Memory Location** | Elements stored contiguously | Backed by array, references stored contiguously |
| **API** | Basic `[]` operator, `.length` | Rich API: `add()`, `remove()`, `get()`, `size()` |
| **Flexibility** | Cannot resize | Auto-resizes, can add/remove elements |
| **Performance** | Faster (no overhead) | Slightly slower due to resizing operations |

**Key Insight**: ArrayList cannot store primitives directly. When you do `list.add(5)`, autoboxing converts `int` to `Integer` object. This adds overhead—both memory (Integer wrapper) and performance (boxing/unboxing operations).

### What type of data structure does ArrayList use internally?

ArrayList is backed by a **dynamic array**. Internally, it maintains:

```java
transient Object[] elementData;  // The backing array
private int size;                 // Logical size (elements added)
```

It's essentially a wrapper around a native Java array with logic for dynamic resizing.

---

## Internal Working & Performance

### How does ArrayList grow when it becomes full?

When the internal array is full and you add a new element, ArrayList follows this growth strategy:

**Growth Algorithm:**
1. Current capacity is exhausted
2. Creates a **new array** with increased capacity: `newCapacity = oldCapacity + (oldCapacity >> 1)` 
   - This means **1.5x growth** (50% increase)
3. Copies all elements from old array to new array using `System.arraycopy()`
4. Old array becomes eligible for garbage collection

**Example:**
```
Initial capacity: 10
After 1st resize: 15
After 2nd resize: 22
After 3rd resize: 33
```

**DSA Perspective**: This exponential growth strategy ensures **amortized O(1)** time complexity for `add()` operations. While individual resize operations are O(n), they happen infrequently enough that the average cost per insertion remains constant.

**Memory Impact**: During resize, you briefly have **2x memory usage** (old + new array) until the old one is GC'd. This is why pre-sizing is crucial for large datasets.

### Time Complexity Analysis

#### `get(int index)` — **O(1)**

```java
return elementData[index];
```

Direct array access via index. No traversal needed. This is ArrayList's **biggest strength**.

**Why O(1)?** Array elements are stored in contiguous memory. Address calculation: `base_address + (index × element_size)` is constant time.

#### `add(E element)` — **Amortized O(1)**

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);
    elementData[size++] = e;
    return true;
}
```

**Best Case**: O(1) when capacity exists
**Worst Case**: O(n) when resize needed (copy all elements)
**Amortized**: O(1) because resizes are infrequent

**add(int index, E element)** — **O(n)**

Requires shifting all elements after `index` one position right.

```java
System.arraycopy(elementData, index, elementData, index + 1, size - index);
```

#### `remove(int index)` — **O(n)**

```java
int numMoved = size - index - 1;
System.arraycopy(elementData, index+1, elementData, index, numMoved);
```

Requires shifting all elements after `index` one position left to fill the gap.

**remove(Object o)** — **O(n)**

First needs to find the element (O(n) linear search), then remove it (O(n) shift).

### Why is removing or inserting in the middle slow?

**Fundamental reason**: Arrays require **contiguous memory allocation**.

When you insert/remove at index `i`:
1. All elements from `i+1` to `size-1` must shift
2. This involves `(size - i)` memory copy operations
3. Worst case: insert/remove at index 0 → shift all `n` elements

**Visual Example:**
```
Insert 'X' at index 2:
Before: [A, B, C, D, E]
         0  1  2  3  4

Step 1: Shift right [_, _, C, D, E] → [_, _, _, C, D, E]
                      2  3  4           2  3  4  5  6
Step 2: Insert [A, B, X, C, D, E]
```

This is **O(n)** because you're moving `n-i` elements. For a LinkedList, this would be O(1) after reaching the node.

***

## Usage & When to Use

### When should we use ArrayList instead of LinkedList?

**Use ArrayList when:**

1. **Random access is frequent** — `get(index)` is your primary operation
   - ArrayList: O(1)
   - LinkedList: O(n) — must traverse from head
   
2. **Read-heavy workload** — More reads than writes
   - Iteration is faster due to **cache locality** (contiguous memory)
   
3. **Known size or predictable growth** — Can pre-size to avoid resizing
   
4. **Memory efficiency matters** — LinkedList has ~40 bytes overhead per node (data + next + prev pointers)

5. **Adding at the end** — `list.add(element)` is amortized O(1)

**Real-world scenarios:**
- Storing search results for display
- Maintaining a list of configuration items
- Building a collection that's mostly read after construction
- Implementing a stack (add/remove from end only)

### When should we NOT use ArrayList?

**Avoid ArrayList when:**

1. **Frequent insertions/deletions in the middle** — Every operation is O(n)
   - Use LinkedList (O(1) after reaching node) or TreeMap/TreeSet for sorted data
   
2. **Unknown size with massive growth** — Frequent resizing kills performance
   - Consider LinkedList or pre-allocate with `new ArrayList<>(estimatedSize)`
   
3. **Need thread-safety by default** — ArrayList is not synchronized
   - Use `CopyOnWriteArrayList` (concurrent reads) or `Collections.synchronizedList()`
   
4. **Queue/Deque operations** — Adding/removing from both ends
   - Use `ArrayDeque` (O(1) for both ends) or `LinkedList`

5. **Memory is extremely tight** — Resizing causes 1.5x overcapacity wastage

***

## Behavior & Safety

### Is ArrayList synchronized? If not, how do you make it thread-safe?

**No, ArrayList is NOT synchronized** by design. Multiple threads can modify it simultaneously, leading to:
- Data corruption
- `ConcurrentModificationException`
- Race conditions

**Making it thread-safe:**

**Option 1: Collections.synchronizedList()** (Legacy approach)
```java
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
```
- Wraps every method with `synchronized` block
- **Heavy performance penalty** — every operation locks the entire list
- Manual synchronization still needed for iteration:
```java
synchronized(syncList) {
    for(String s : syncList) { }
}
```

**Option 2: CopyOnWriteArrayList** (Modern approach for read-heavy scenarios)
```java
List<String> cowList = new CopyOnWriteArrayList<>();
```
- Every write operation creates a **new copy** of the backing array
- **Excellent for reads** (lock-free, no synchronization)
- **Terrible for writes** (O(n) for every add/set/remove)
- **Use case**: Event listeners, observers, cached collections

**Option 3: External synchronization**
```java
List<String> list = new ArrayList<>();
synchronized(list) {
    list.add("item");
}
```

**Option 4: Use concurrent alternatives**
- `ConcurrentHashMap` if you need Map-like structure
- `ConcurrentLinkedQueue` for queue operations

**DSA Insight**: Synchronization adds **significant overhead**. The `synchronized` keyword prevents CPU-level optimizations and forces memory barrier operations. For high-performance concurrent code, consider lock-free data structures or partitioning strategies.

### What is fail-fast behavior in ArrayList?

**Fail-fast** means the iterator immediately throws `ConcurrentModificationException` if the list is structurally modified after the iterator is created.

**How it works:**
ArrayList maintains a `modCount` (modification count):
```java
protected transient int modCount = 0;
```

Every structural modification (`add()`, `remove()`, `clear()`) increments `modCount`.

When you create an iterator:
```java
Iterator<String> it = list.iterator();
```

The iterator stores the **expected modCount**:
```java
int expectedModCount = modCount;
```

Before every `next()` or `remove()` call, iterator checks:
```java
if (modCount != expectedModCount)
    throw new ConcurrentModificationException();
```

**Why fail-fast?** To detect concurrent modifications early rather than allowing unpredictable behavior later.

### What happens if we modify the list while iterating over it?

**Scenario 1: Modify via list methods (WRONG)**
```java
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
for(String s : list) {
    if(s.equals("B")) {
        list.remove(s);  // THROWS ConcurrentModificationException
    }
}
```

**Why it fails**: Enhanced for-loop uses an iterator internally. `list.remove()` increments `modCount`, but iterator's `expectedModCount` remains unchanged.

**Scenario 2: Modify via iterator (CORRECT)**
```java
Iterator<String> it = list.iterator();
while(it.hasNext()) {
    String s = it.next();
    if(s.equals("B")) {
        it.remove();  // Safe - updates expectedModCount
    }
}
```

**Why it works**: `Iterator.remove()` updates both `modCount` and `expectedModCount`, keeping them in sync.

**Scenario 3: Using Java 8+ removeIf (BEST)**
```java
list.removeIf(s -> s.equals("B"));
```

**DSA Perspective**: This is a classic **concurrent modification** problem. The fail-fast mechanism is a **heuristic**, not a guarantee—it's "best effort" detection. In multi-threaded scenarios without proper synchronization, you might still get corrupt data even without an exception.

***

## Comparison

### ArrayList vs LinkedList

| Aspect | ArrayList | LinkedList |
|--------|-----------|------------|
| **Internal Structure** | Dynamic array | Doubly linked list |
| **Memory Layout** | Contiguous | Scattered (node-based) |
| **get(index)** | O(1) | O(n) — must traverse |
| **add(element)** | O(1) amortized | O(1) at ends |
| **add(index, element)** | O(n) — shift required | O(n) — traverse + O(1) insert |
| **remove(index)** | O(n) — shift required | O(n) — traverse + O(1) delete |
| **Memory per element** | 4-8 bytes (reference) | ~40 bytes (data + 2 pointers + object overhead) |
| **Cache Performance** | Excellent (sequential access) | Poor (scattered memory) |
| **Best Use** | Random access, iteration | Frequent insert/delete at ends |

**Key Insight**: Despite LinkedList being O(1) for insert/delete **at a known position**, you still need O(n) to **reach that position**. This makes ArrayList competitive even for middle insertions in practice, especially for small/medium lists due to **cache locality**.

**Modern CPU reality**: Array traversal benefits from:
- **Cache prefetching** — CPU loads adjacent memory
- **SIMD instructions** — Process multiple elements simultaneously
- **Branch prediction** — Simple loops are predictable

LinkedList loses all these advantages because nodes are scattered in heap memory.

**Benchmark insight**: For lists < 1000 elements, ArrayList often outperforms LinkedList even for insert-heavy workloads due to cache effects.

### ArrayList vs Vector

| Aspect | ArrayList | Vector |
|--------|-----------|--------|
| **Synchronization** | Not synchronized | Fully synchronized (every method) |
| **Performance** | Faster (no lock overhead) | Slower (locking overhead) |
| **Growth Strategy** | 1.5x (50% increase) | 2x (100% increase) |
| **Memory Efficiency** | Better | Wastes more memory on resize |
| **Legacy Status** | Modern (Java 1.2+) | Legacy (Java 1.0) |
| **Thread Safety** | Manual | Built-in (but inefficient) |
| **Iterator** | Fail-fast | Fail-fast |

**Why Vector is obsolete:**
1. **Coarse-grained locking** — Locks entire list for every operation, terrible for concurrent reads
2. **Aggressive growth** — Doubling capacity wastes memory
3. **No flexibility** — Cannot choose synchronization strategy

**Modern alternative**: Use `CopyOnWriteArrayList` for concurrent read-heavy workloads, or wrap ArrayList with `Collections.synchronizedList()` for simple thread-safety.

**DSA Perspective**: Vector's synchronization is **method-level**, meaning compound operations are still not atomic:
```java
// NOT thread-safe even with Vector!
if(!vector.isEmpty()) {
    vector.remove(0);  // Another thread might remove between check and remove
}
```

You still need external synchronization for compound operations, making Vector's built-in synchronization mostly useless.

***

## Quick Decision Tree

```
Need thread-safety?
├─ Yes → Read-heavy? → Use CopyOnWriteArrayList
│        Write-heavy? → Use Collections.synchronizedList() or ConcurrentHashMap
│
└─ No → Random access important?
         ├─ Yes → ArrayList
         └─ No → Frequent insert/delete at ends?
                  ├─ Yes → LinkedList or ArrayDeque
                  └─ No → ArrayList (default choice)
```

**Senior Dev Tip**: When in doubt, **start with ArrayList**. It's the most optimized collection in the JDK due to cache locality and simplicity. Profile first, optimize later. Premature use of LinkedList is a common mistake.

| Method                | Purpose            |
| --------------------- | ------------------ |
| `add(E e)`            | Add element at end |
| `add(int index, E e)` | Insert element     |
| `get(int index)`      | Retrieve element   |
| `set(int index, E e)` | Replace element    |
| `remove(int index)`   | Remove by index    |
| `contains(Object o)`  | Check presence     |
| `size()`              | Number of elements |
| `clear()`             | Remove all         |
