---
title: "Java ArrayDeque"
---

### What is ArrayDeque in Java?

ArrayDeque (Array Double-Ended Queue) is a **resizable-array implementation** of the `Deque` interface in Java. It's a versatile data structure that allows **efficient insertion and removal from both ends** (head and tail).

```java
ArrayDeque<String> deque = new ArrayDeque<>();
deque.addFirst("A");   // Add at beginning
deque.addLast("B");    // Add at end
deque.removeFirst();   // Remove from beginning
deque.removeLast();    // Remove from end
```

**Key characteristics** :
- Implements both `Queue` and `Deque` interfaces
- No capacity restrictions - grows dynamically
- Faster than `LinkedList` for most operations
- More memory-efficient than `LinkedList` (no node overhead)
- Not thread-safe
- Does not allow null elements
- Can function as both Stack (LIFO) and Queue (FIFO)

**Default capacity**: Starts with capacity for **16 elements**.

### Which data structure does ArrayDeque use internally?

ArrayDeque uses a **circular array (ring buffer)** with **two pointers** :

```java
transient Object[] elements;  // Circular array
transient int head;           // Index of first element
transient int tail;           // Index of next empty slot
```

**Circular array visualization:**
```
Array: [_, A, B, C, _, _, _]
       0  1  2  3  4  5  6
          ↑        ↑
        head      tail

After addFirst(X):
Array: [_, A, B, C, _, _, X]
       0  1  2  3  4  5  6
          ↑        ↑     ↑
        head      tail  new head wraps around

After wraparound:
head = 6, tail = 4
```

**Why circular?**
- Allows O(1) operations at both ends without shifting elements
- When `tail` reaches array end, it wraps to index 0
- When `head` goes below 0, it wraps to `array.length - 1`
- Maximizes array utilization

**Index calculation:**
```java
// Move head backward (for addFirst)
head = (head - 1) & (elements.length - 1);

// Move tail forward (for addLast)
tail = (tail + 1) & (elements.length - 1);
```

**DSA Insight**: The bitwise AND operation `& (length - 1)` only works because ArrayDeque **always uses power-of-2 sized arrays**. This makes modulo operation extremely fast (single CPU instruction vs expensive division).

***

## ArrayDeque vs Stack/LinkedList

### Why is ArrayDeque preferred over Stack for LIFO operations?

**Stack class problems** :
1. **Legacy class** - from Java 1.0, pre-Collections Framework
2. **Extends Vector** - inherits synchronized overhead (slow)
3. **Synchronized methods** - every operation locks, even in single-threaded code
4. **Poor design** - exposes Vector methods like `get(index)`, breaking stack abstraction

**ArrayDeque advantages**:

```java
// Old way (NOT recommended)
Stack<Integer> stack = new Stack<>();
stack.push(1);
stack.pop();

// Modern way (RECOMMENDED)
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.pop();
```

**Performance comparison**:

| Operation | Stack (synchronized) | ArrayDeque | Winner |
|-----------|---------------------|------------|---------|
| push() | O(1) + lock overhead | O(1) no locks | ArrayDeque |
| pop() | O(1) + lock overhead | O(1) no locks | ArrayDeque |
| peek() | O(1) + lock overhead | O(1) no locks | ArrayDeque |
| Memory | Inherits Vector overhead | Lean implementation | ArrayDeque |
| Cache performance | Good | Excellent | ArrayDeque |

**Real numbers**: ArrayDeque can be **3-5x faster** than Stack in single-threaded scenarios due to lack of synchronization overhead.

**Interview point**: Stack is **not recommended** in modern Java. Always use `Deque<E> stack = new ArrayDeque<>()`.

### Why is ArrayDeque preferred over LinkedList for queue operations?

ArrayDeque outperforms LinkedList for queue/deque operations due to **modern hardware characteristics** :

**Memory efficiency:**
- LinkedList: 24 bytes per element (12B header + 4B data + 8B pointers)
- ArrayDeque: 4 bytes per element (just reference in array)
- **6x less memory usage**

**Cache locality:**
- ArrayDeque: Elements in **contiguous memory** → CPU cache prefetching works
- LinkedList: Elements **scattered across heap** → cache misses on every access
- **Result**: ArrayDeque is 2-3x faster for iteration

**Performance comparison:**

| Operation | ArrayDeque | LinkedList | Winner |
|-----------|------------|------------|---------|
| addFirst() | O(1) | O(1) | Tie (but ArrayDeque faster due to cache) |
| addLast() | O(1) | O(1) | Tie (but ArrayDeque faster due to cache) |
| removeFirst() | O(1) | O(1) | Tie (but ArrayDeque faster due to cache) |
| removeLast() | O(1) | O(1) | Tie (but ArrayDeque faster due to cache) |
| Random access | O(n) | O(n) | ArrayDeque (cache-friendly) |
| Memory overhead | Low | High (24B/element) | ArrayDeque |
| GC pressure | Low (1 array) | High (n node objects) | ArrayDeque |

**Benchmark reality** :
```
Queue operations (1 million elements):
ArrayDeque: ~15ms
LinkedList: ~45ms
(ArrayDeque is 3x faster)
```

**When LinkedList might win**: Never for pure queue/deque operations. LinkedList only makes sense if you need the `List` interface alongside deque operations, which is rare.

**Interview wisdom**: ArrayDeque is **the default choice** for queue, deque, and stack implementations in modern Java.

***

## Null Handling & Method Differences

### Does ArrayDeque allow null elements? Why not?

**No, ArrayDeque does NOT allow null elements**. Attempting to add null throws `NullPointerException`:

```java
ArrayDeque<String> deque = new ArrayDeque<>();
deque.add(null);  // Throws NullPointerException
```

**Why the restriction?**

**Reason 1: Sentinel value for empty slots**

ArrayDeque internally uses `null` to mark **empty positions** in the circular array:

```java
// Internal check for empty deque
if (elements[head] == null) {
    // Deque is empty
}
```

If user-added nulls were allowed, ArrayDeque couldn't distinguish between:
- Empty slot (null)
- User-added null element

**Reason 2: Method contracts**

Methods like `poll()` and `peek()` return `null` to indicate **empty deque**:

```java
String element = deque.poll();  // Returns null if deque is empty

// If nulls were allowed:
if (element == null) {
    // Ambiguous: Is deque empty OR did we poll a null element?
}
```

**Contrast with other collections:**
- ArrayList/LinkedList: Allow null ✓ (don't use null as sentinel)
- HashMap: Allows null ✓ (uses special handling)
- ConcurrentLinkedQueue: Doesn't allow null ✗ (same sentinel reason)
- TreeSet: Doesn't allow null ✗ (comparison issues)

**Interview tip**: This is a common "gotcha" question. Many candidates assume all Collections allow null like ArrayList does.

### What is the difference between offer(), poll(), and peek() in ArrayDeque?

These are the **Queue interface methods** for queue operations :

**offer(E element) - Add to end:**
```java
public boolean offer(E e) {
    return offerLast(e);  // Add at tail
}
```
- Inserts element at the **tail** (end)
- Returns `true` on success, `false` if full (but ArrayDeque is unbounded, so always `true`)
- Throws `NullPointerException` if element is null
- Equivalent to `add()` for unbounded queues
- Time: **O(1)**

**poll() - Remove from beginning:**
```java
public E poll() {
    return pollFirst();  // Remove from head
}
```
- Removes and returns element from **head** (beginning)
- Returns `null` if deque is empty (doesn't throw exception)
- Time: **O(1)**

**peek() - View beginning without removal:**
```java
public E peek() {
    return peekFirst();  // View head element
}
```
- Returns head element **without removing** it
- Returns `null` if deque is empty
- Read-only operation
- Time: **O(1)**

**Visual example:**
```java
ArrayDeque<String> queue = new ArrayDeque<>();
queue.offer("A");   // [A]
queue.offer("B");   // [A, B]
queue.offer("C");   // [A, B, C]

String peeked = queue.peek();   // "A" - doesn't remove, queue = [A, B, C]
String polled = queue.poll();   // "A" - removes, queue = [B, C]
String next = queue.poll();     // "B" - removes, queue = [C]
```

**Comparison table:**

| Method | Purpose | Returns on empty | Throws exception? | Modifies deque? |
|--------|---------|------------------|-------------------|-----------------|
| offer() | Add at end | N/A | No (always succeeds) | Yes |
| poll() | Remove from beginning | null | No | Yes |
| peek() | View beginning | null | No | No |

### What is the difference between push() / pop() and offer() / poll()?

These are **two different mental models** for using ArrayDeque :

**push() / pop() - Stack operations (LIFO):**
```java
Deque<String> stack = new ArrayDeque<>();
stack.push("A");   // Add at beginning (head)
stack.push("B");   // Add at beginning (head)
stack.push("C");   // Add at beginning (head)

// Stack: [C, B, A] - C at head
stack.pop();       // Returns "C" - removes from head
stack.pop();       // Returns "B" - removes from head
```

**Implementation:**
```java
public void push(E e) {
    addFirst(e);  // Always adds at HEAD
}

public E pop() {
    return removeFirst();  // Always removes from HEAD
}
```

**offer() / poll() - Queue operations (FIFO):**
```java
Deque<String> queue = new ArrayDeque<>();
queue.offer("A");  // Add at end (tail)
queue.offer("B");  // Add at end (tail)
queue.offer("C");  // Add at end (tail)

// Queue: [A, B, C] - A at head
queue.poll();      // Returns "A" - removes from head
queue.poll();      // Returns "B" - removes from head
```

**Implementation:**
```java
public boolean offer(E e) {
    return offerLast(e);  // Always adds at TAIL
}

public E poll() {
    return pollFirst();  // Always removes from HEAD
}
```

**Key difference:**

| Aspect | push/pop (Stack) | offer/poll (Queue) |
|--------|-----------------|-------------------|
| **Mental model** | LIFO (Last In, First Out) | FIFO (First In, First Out) |
| **push/offer adds** | At HEAD | At TAIL |
| **pop/poll removes** | From HEAD | From HEAD |
| **Order** | Reversed | Preserved |
| **Interface** | Deque methods | Queue methods |

**Visual comparison:**
```java
// STACK behavior (LIFO)
stack.push(1);  // 
stack.push(2);  // [2, 1]
stack.push(3);  // [3, 2, 1]
stack.pop();    // Returns 3 (last pushed)

// QUEUE behavior (FIFO)
queue.offer(1); // 
queue.offer(2); // [1, 2]
queue.offer(3); // [1, 2, 3]
queue.poll();   // Returns 1 (first offered)
```

**Interview insight**: Understanding that **ArrayDeque can behave as both** Stack and Queue based on which methods you use is crucial. The same underlying data structure, different access patterns.

***

## Thread Safety & Growth

### Is ArrayDeque synchronized? How can you make it thread-safe?

**No, ArrayDeque is NOT synchronized** by design. It's optimized for single-threaded performance.

**Why not synchronized?**
- Most use cases are single-threaded
- Synchronization adds 20-30% overhead
- Users can add synchronization only when needed

**Making it thread-safe:**

**Option 1: Collections.synchronizedDeque() (Simple wrapper)**
```java
Deque<String> syncDeque = Collections.synchronizedDeque(new ArrayDeque<>());
```

**Pros**: Easy one-liner
**Cons**: 
- Coarse-grained locking (entire deque locked for every operation)
- Manual synchronization still needed for iteration:
```java
synchronized(syncDeque) {
    Iterator<String> it = syncDeque.iterator();
    while (it.hasNext()) {
        process(it.next());
    }
}
```

**Option 2: ConcurrentLinkedDeque (Lock-free)**
```java
Deque<String> concurrentDeque = new ConcurrentLinkedDeque<>();
```

**Pros**: 
- Lock-free using CAS (Compare-And-Swap) operations
- Much better concurrent performance
- Weakly consistent iterators (safe during modification)

**Cons**: 
- Uses LinkedList internally (higher memory overhead)
- Slightly slower for single-threaded use

**Option 3: LinkedBlockingDeque (Blocking queue)**
```java
BlockingDeque<String> blockingDeque = new LinkedBlockingDeque<>();
```

**Pros**: 
- Blocking operations (`put()`, `take()`)
- Ideal for producer-consumer patterns
- Thread-safe by design

**Cons**: 
- Blocking overhead
- LinkedList-based (memory overhead)

**Option 4: External synchronization (Fine-grained control)**
```java
Deque<String> deque = new ArrayDeque<>();
Lock lock = new ReentrantLock();

// In your methods:
lock.lock();
try {
    deque.addFirst("item");
} finally {
    lock.unlock();
}
```

**Recommendation for 2-year experience interview**:
- Single-threaded: Use plain `ArrayDeque`
- Multi-threaded, simple needs: `Collections.synchronizedDeque()`
- Multi-threaded, high concurrency: `ConcurrentLinkedDeque`
- Producer-consumer: `LinkedBlockingDeque`

### How does ArrayDeque grow when more space is needed?

ArrayDeque uses a **smart growth strategy** that doubles the capacity :

**Growth algorithm:**
```java
private void doubleCapacity() {
    int n = elements.length;
    int newCapacity = n << 1;  // n * 2 (bit shift left = double)
    
    if (newCapacity < 0)  // Overflow check
        throw new IllegalStateException("Deque too big");
    
    Object[] newArray = new Object[newCapacity];
    
    // Copy elements to new array
    // Handle wraparound: copy from head to end, then from 0 to tail
    int r = n - head;  // Elements from head to array end
    System.arraycopy(elements, head, newArray, 0, r);
    System.arraycopy(elements, 0, newArray, r, head);
    
    elements = newArray;
    head = 0;
    tail = n;
}
```

**Growth pattern:**
```
Initial capacity: 16
After 1st resize: 32
After 2nd resize: 64
After 3rd resize: 128
After 4th resize: 256
```

**Why doubling (not 1.5x like ArrayList)?**
- ArrayDeque always maintains **power-of-2 capacity**
- Enables fast modulo using bitwise AND: `index & (capacity - 1)`
- This is **much faster** than division-based modulo
- Example: `index % 64` (slow) vs `index & 63` (single CPU instruction)

**Complexity:**
- **Amortized O(1)** for additions
- Individual resize is O(n), but happens so infrequently (exponential growth)
- Over n operations, total resize cost is O(n), making each operation O(1) on average

**Memory impact during resize:**
- Briefly uses **2x memory** (old + new array)
- Old array becomes eligible for GC immediately
- More aggressive than ArrayList (2x vs 1.5x growth)

**Pre-sizing optimization:**
```java
// If you know you'll have ~1000 elements
ArrayDeque<String> deque = new ArrayDeque<>(1024);  // Next power of 2

// Avoids multiple resizes during initial population
```

**Interview tip**: Mention that ArrayDeque's doubling strategy is more aggressive than ArrayList's 1.5x growth because maintaining power-of-2 sizes enables bitwise optimizations.

***

## When Not to Use & Fail-Fast Behavior

### When would you NOT use an ArrayDeque?

**Avoid ArrayDeque when:**

**1. You need random access (indexed access)**
```java
// ArrayDeque does NOT have efficient get(index)
deque.get(500);  // This doesn't exist! ArrayDeque doesn't implement get(int)

// Use ArrayList instead:
List<String> list = new ArrayList<>();
String item = list.get(500);  // O(1)
```

ArrayDeque only provides efficient access at **ends** (head/tail), not middle.

**2. You need to store null elements**
```java
ArrayDeque<String> deque = new ArrayDeque<>();
deque.add(null);  // Throws NullPointerException

// Use LinkedList if nulls are required:
Deque<String> deque = new LinkedList<>();
deque.add(null);  // OK
```

**3. You need thread-safety with high write contention**
- ArrayDeque requires external synchronization
- For concurrent access, `ConcurrentLinkedDeque` or `LinkedBlockingDeque` are better

**4. You need stable iteration during modification**
- ArrayDeque is fail-fast (throws exception on concurrent modification)
- Use `CopyOnWriteArrayList` if iteration during modification is common (though it's a List, not Deque)

**5. You need the List interface**
```java
// ArrayDeque doesn't implement List
List<String> list = new ArrayDeque<>();  // Compile error!

// If you need List operations + deque-like access:
List<String> list = new LinkedList<>();  // Implements both List and Deque
```

**6. Memory is extremely tight and size is unpredictable**
- ArrayDeque over-allocates (powers of 2, minimum 16)
- A deque with 10 elements uses capacity of 16 (37% waste)
- A deque with 17 elements uses capacity of 32 (47% waste)
- LinkedList allocates exactly what's needed (but 6x per-element overhead)

**7. You need predictable worst-case performance for each operation**
- Most operations are O(1), but occasional resize is O(n)
- If hard real-time guarantees matter, this unpredictability is problematic
- LinkedList has truly O(1) for head/tail operations (no resizing)

**Decision tree:**
```
Need indexed access (get/set by position)?
└─ Yes → Use ArrayList

Need null elements?
└─ Yes → Use LinkedList

Need thread-safety?
└─ Yes → Use ConcurrentLinkedDeque or LinkedBlockingDeque

Need efficient head/tail operations?
└─ Yes → Use ArrayDeque (default choice!)
```

### Is ArrayDeque fail-fast? What happens if the structure is modified while iterating?

**Yes, ArrayDeque is fail-fast**. It detects concurrent modifications during iteration and throws `ConcurrentModificationException`.

**Fail-fast mechanism:**
```java
// ArrayDeque maintains a modification counter
transient int modCount = 0;

// Every structural modification increments it:
public void addFirst(E e) {
    // ... add logic
    modCount++;
}

// Iterator stores expected count:
private class DeqIterator implements Iterator<E> {
    private int expectedModCount = modCount;
    
    public E next() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
        // ... return element
    }
}
```

**Scenario 1: Modify via deque methods during iteration (WRONG)**
```java
ArrayDeque<String> deque = new ArrayDeque<>(Arrays.asList("A", "B", "C"));

for (String s : deque) {
    if (s.equals("B")) {
        deque.remove(s);  // Throws ConcurrentModificationException
    }
}
```

**Why it fails**: `deque.remove()` increments `modCount`, but iterator's `expectedModCount` stays unchanged.

**Scenario 2: Modify via iterator (CORRECT)**
```java
ArrayDeque<String> deque = new ArrayDeque<>(Arrays.asList("A", "B", "C"));
Iterator<String> it = deque.iterator();

while (it.hasNext()) {
    String s = it.next();
    if (s.equals("B")) {
        it.remove();  // Safe - updates expectedModCount
    }
}
```

**Scenario 3: Multi-threaded modification**
```java
// Thread 1: Iterating
for (String s : deque) {
    process(s);
}

// Thread 2: Adding concurrently
deque.add("X");  // May cause ConcurrentModificationException in Thread 1
```

**Important notes:**
- Fail-fast is **best-effort**, not guaranteed
- In multi-threaded scenarios, you might get corrupted data **without** an exception
- Use `ConcurrentLinkedDeque` for safe concurrent access
- Fail-fast only detects **structural modifications** (add/remove), not element changes

**Interview distinction**: ArrayDeque's fail-fast is **weaker** than ArrayList's because the circular buffer nature makes detection harder in some edge cases.

***

## Performance Comparison

### How does ArrayDeque perform compared to LinkedList in terms of insertion/removal?

**Theoretical time complexity** (both O(1) for ends):

| Operation | ArrayDeque | LinkedList | Theoretical Winner |
|-----------|------------|------------|-------------------|
| addFirst() | O(1) | O(1) | Tie |
| addLast() | O(1) | O(1) | Tie |
| removeFirst() | O(1) | O(1) | Tie |
| removeLast() | O(1) | O(1) | Tie |

**Practical performance** (considers hardware realities) :

**ArrayDeque wins due to:**

**1. Cache locality**
- Elements in **contiguous memory** → CPU cache prefetching
- LinkedList nodes **scattered across heap** → cache miss per access
- **Impact**: ArrayDeque is 2-4x faster for iteration

**2. Memory overhead**
- ArrayDeque: 4 bytes per element (just reference)
- LinkedList: 24 bytes per element (object header + data + 2 pointers)
- **Impact**: Better cache utilization, less GC pressure

**3. No pointer management**
- ArrayDeque: Just increment/decrement indices
- LinkedList: Update `next`/`prev` pointers, more dereferencing
- **Impact**: Fewer memory accesses per operation

**4. Branch prediction**
- ArrayDeque: Simple arithmetic on indices
- LinkedList: Pointer chasing defeats CPU prediction
- **Impact**: More efficient CPU pipeline

**Real-world benchmarks** :
```
Operation: 1 million addFirst/removeFirst cycles

ArrayDeque:  ~25ms
LinkedList:  ~85ms
(ArrayDeque is 3.4x faster)

Operation: 1 million addLast/removeLast cycles

ArrayDeque:  ~22ms
LinkedList:  ~80ms
(ArrayDeque is 3.6x faster)

Operation: Iterate over 1 million elements

ArrayDeque:  ~5ms
LinkedList:  ~18ms
(ArrayDeque is 3.6x faster)
```

**When LinkedList might compete:**
- **Never** for pure head/tail operations
- LinkedList only makes sense if you:
  - Need `List` interface (indexed access)
  - Frequently iterate and remove simultaneously
  - Need to store null elements

**Memory usage comparison** (1 million elements):
```
ArrayDeque: 
- Array size: ~2-4 MB (depending on load factor)
- Total overhead: Minimal (one array object)

LinkedList:
- Nodes: 24 MB (24 bytes × 1M)
- Plus data references: 4 MB
- Total: ~28 MB
(LinkedList uses 7-14x more memory)
```

**Interview key point**: Despite identical Big-O complexity, ArrayDeque is **significantly faster in practice** due to modern CPU architecture favoring sequential memory access. This is a perfect example of why Big-O alone doesn't tell the full story.

***

## Versatility

### Can ArrayDeque be used as both Queue and Stack? Explain.

**Yes, ArrayDeque can function as both**, making it the **most versatile collection** in Java.

**As a Stack (LIFO - Last In, First Out):**
```java
Deque<Integer> stack = new ArrayDeque<>();

// Push elements (add to top/head)
stack.push(1);    // 
stack.push(2);    // [2, 1]
stack.push(3);    // [3, 2, 1]

// Pop elements (remove from top/head)
int top = stack.pop();      // 3 - removes [2, 1]
int next = stack.pop();     // 2 - removes 

// Peek at top (don't remove)
int peek = stack.peek();    // 1
```

**Stack method mapping:**
- `push(e)` → `addFirst(e)` (add at head)
- `pop()` → `removeFirst()` (remove from head)
- `peek()` → `peekFirst()` (view head)

**As a Queue (FIFO - First In, First Out):**
```java
Deque<String> queue = new ArrayDeque<>();

// Enqueue elements (add to tail)
queue.offer("A");   // [A]
queue.offer("B");   // [A, B]
queue.offer("C");   // [A, B, C]

// Dequeue elements (remove from head)
String first = queue.poll();   // "A" - removes [B, C]
String second = queue.poll();  // "B" - removes [C]

// Peek at front (don't remove)
String peek = queue.peek();    // "C"
```

**Queue method mapping:**
- `offer(e)` → `addLast(e)` (add at tail)
- `poll()` → `removeFirst()` (remove from head)
- `peek()` → `peekFirst()` (view head)

**As a Deque (Both ends):**
```java
Deque<String> deque = new ArrayDeque<>();

// Add/remove from both ends
deque.addFirst("A");     // [A]
deque.addLast("B");      // [A, B]
deque.addFirst("C");     // [C, A, B]
deque.addLast("D");      // [C, A, B, D]

deque.removeFirst();     // Removes "C" → [A, B, D]
deque.removeLast();      // Removes "D" → [A, B]
```

**Complete API comparison:**

| Purpose | Stack methods | Queue methods | Deque methods | All work? |
|---------|--------------|---------------|---------------|-----------|
| Add at head | push(e) | - | addFirst(e) / offerFirst(e) | ✓ |
| Add at tail | - | offer(e) / add(e) | addLast(e) / offerLast(e) | ✓ |
| Remove from head | pop() | poll() / remove() | removeFirst() / pollFirst() | ✓ |
| Remove from tail | - | - | removeLast() / pollLast() | ✓ |
| View head | peek() | peek() / element() | peekFirst() / getFirst() | ✓ |
| View tail | - | - | peekLast() / getLast() | ✓ |

**Why this versatility matters:**

**1. Single data structure for multiple patterns**
```java
// No need for separate Stack, Queue classes
Deque<Task> taskStack = new ArrayDeque<>();    // Use as stack
Deque<Request> requestQueue = new ArrayDeque<>();  // Use as queue
```

**2. Better performance than dedicated classes**
- Faster than `Stack` (no synchronization overhead)
- Faster than `LinkedList` (cache locality)
- More memory-efficient than both

**3. Consistent API across use cases**
```java
// Same underlying structure, different access patterns
Deque<String> deque = new ArrayDeque<>();

// Queue behavior: add tail, remove head
deque.offerLast("A");
deque.pollFirst();

// Stack behavior: add head, remove head
deque.offerFirst("B");
deque.pollFirst();
```

**Real-world example - BFS and DFS using same structure:**
```java
// Breadth-First Search (Queue - FIFO)
Deque<Node> bfsQueue = new ArrayDeque<>();
bfsQueue.offerLast(root);
while (!bfsQueue.isEmpty()) {
    Node node = bfsQueue.pollFirst();  // FIFO
    // Process node, add children to tail
}

// Depth-First Search (Stack - LIFO)
Deque<Node> dfsStack = new ArrayDeque<>();
dfsStack.push(root);
while (!dfsStack.isEmpty()) {
    Node node = dfsStack.pop();  // LIFO
    // Process node, push children to head
}
```

**Interview key insight**: ArrayDeque's versatility comes from the **circular array** structure that allows efficient O(1) operations at **both ends**. This is impossible with a simple array (shifting required) and less efficient with LinkedList (cache misses). It's the perfect balance of flexibility and performance.

---
