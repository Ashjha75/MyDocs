---
title: "Java PriorityQueue"
---

### What is a PriorityQueue in Java?

PriorityQueue is a **special type of queue** where elements are ordered based on their **priority** rather than insertion order (FIFO). Unlike a standard queue that processes elements in first-in-first-out manner, PriorityQueue always processes the element with the **highest priority** first, regardless of when it was inserted.

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.add(10);
pq.add(5);
pq.add(20);
System.out.println(pq.poll());  // Output: 5 (smallest element, highest priority)
```

**Key characteristics** :
- Elements are processed based on priority, not insertion order
- Automatically maintains heap structure on every insertion/deletion
- Unbounded capacity - grows automatically as needed
- Not thread-safe (use `PriorityBlockingQueue` for concurrent access)
- Does NOT guarantee stable sorting (equal elements may not maintain insertion order)

### Which data structure does PriorityQueue use internally?

PriorityQueue uses a **binary heap** (specifically a **min-heap** by default) implemented as an **array-based binary tree**.

**Internal structure:**
```java
transient Object[] queue;  // Array-based heap
private int size;          // Number of elements
```

**Why heap?**

| Data Structure | peek() | insert() | delete() |
|----------------|--------|----------|----------|
| Array/LinkedList | O(1) | O(n) | O(1) |
| Binary Heap | O(1) | O(log n) | O(log n) |
| Binary Search Tree | O(1) | O(log n) | O(log n) |

The binary heap provides the **best balance** of O(1) access to min/max element and O(log n) insertion/deletion. It's more space-efficient than BST (no pointers needed) and maintains the heap property automatically.

**Heap structure visualization:**
```
Array: [2, 5, 10, 15, 20, 12]

Binary Tree representation:
         2
       /   \
      5     10
     / \    /
   15  20  12

Parent at index i:
- Left child: 2*i + 1
- Right child: 2*i + 2
- Parent: (i-1)/2
```

### Is PriorityQueue ordered or sorted?

PriorityQueue is **partially ordered**, not fully sorted.

**What this means:**
- The **head** (root) is always the minimum element (in min-heap)
- The **heap property** is maintained: parent ≤ children
- But siblings and other levels are **not necessarily sorted**

**Example:**
```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.addAll(Arrays.asList(10, 5, 20, 15, 25, 12));

// Internal array might look like: [5, 10, 12, 15, 25, 20]
// Tree structure:
//         5
//       /   \
//      10    12
//     / \    /
//    15 25  20

System.out.println(pq);  // [5, 10, 12, 15, 25, 20] - NOT sorted!
```

**Why not fully sorted?** Because maintaining full sort order would require O(n log n) time for every insertion. The heap property allows O(log n) insertions while guaranteeing O(1) access to the highest priority element.

**Important interview point**: When you iterate over a PriorityQueue using an iterator, elements are **not** returned in sorted order. To get sorted output, you must repeatedly call `poll()`.

***

## Default Behavior & Configuration

### What is the default behavior of PriorityQueue (min-heap or max-heap)?

By default, PriorityQueue implements a **min-heap**, meaning the **smallest element** has the highest priority.

```java
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.add(10);
minHeap.add(5);
minHeap.add(20);
System.out.println(minHeap.peek());  // Output: 5 (minimum)
```

**Why min-heap by default?** It follows the **natural ordering** of elements using `Comparable.compareTo()`. For numbers, natural ordering is ascending (1 < 2 < 3), so smallest comes first.

### How do you create a max-heap using PriorityQueue?

To create a max-heap, provide a **reverse comparator** to invert the natural ordering:

**Method 1: Collections.reverseOrder() (Simplest)**
```java
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
maxHeap.add(10);
maxHeap.add(5);
maxHeap.add(20);
System.out.println(maxHeap.peek());  // Output: 20 (maximum)
```

**Method 2: Lambda expression (Java 8+)**
```java
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
```

**Method 3: Comparator.reverseOrder()**
```java
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
```

**Method 4: Custom Comparator**
```java
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(new Comparator<Integer>() {
    public int compare(Integer a, Integer b) {
        return b.compareTo(a);  // Reverse comparison
    }
});
```

**DSA Interview Tip**: Always clarify whether the problem requires min-heap or max-heap. Many candidates default to min-heap and get confused when expected output doesn't match.

### Does PriorityQueue allow null elements?

**No, PriorityQueue does NOT allow null elements**. Attempting to add null throws `NullPointerException`.

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.add(null);  // Throws NullPointerException
```

**Why not?**
- PriorityQueue needs to compare elements to maintain heap property
- Comparison requires calling `compareTo()` or `compare()` methods
- Cannot compare null with other objects - it's meaningless

**Contrast with other collections:**
- ArrayList/LinkedList: Allow null ✓
- HashMap: Allows one null key and multiple null values ✓
- TreeSet/TreeMap: Don't allow null (same reason as PriorityQueue) ✗
- HashSet: Allows null ✓

***

## Operations & Behavior

### How is the head (top) element of the PriorityQueue determined?

The head is **always the root of the heap**, which is stored at `queue` in the internal array.

**For min-heap (default):**
- Head = smallest element according to natural ordering or comparator
- Example: `` → head is `1`

**For max-heap (custom comparator):**
- Head = largest element according to comparator
- Example: `` → head is `20`

**How it's maintained:**
Every insertion or deletion triggers a **heapify** operation that preserves the heap property, ensuring the minimum/maximum element bubbles to the root.

### What happens when you insert elements with add() or offer()?

Both `add()` and `offer()` insert elements into the heap, but with subtle differences :

**add(E element):**
```java
public boolean add(E e) {
    return offer(e);
}
```
- Returns `true` on success
- Throws `IllegalStateException` if capacity-restricted queue is full
- For PriorityQueue (unbounded), always succeeds

**offer(E element):**
```java
public boolean offer(E e) {
    if (e == null)
        throw new NullPointerException();
    int i = size;
    if (i >= queue.length)
        grow(i + 1);  // Resize if needed
    size = i + 1;
    if (i == 0)
        queue[0] = e;
    else
        siftUp(i, e);  // Heapify up
    return true;
}
```
- Returns `true` on success, `false` if queue is full
- Never throws exception for capacity issues
- Preferred for capacity-bounded queues

**Insertion algorithm (siftUp):**
1. Add element at the end of the array (next available position)
2. Compare with parent: `parent = (i-1)/2`
3. If element < parent (min-heap), swap
4. Repeat until heap property is satisfied or reach root
5. Time complexity: **O(log n)** - max height of binary tree

**Visual example:**
```
Insert 3 into min-heap [5, 10, 20, 15]:

Step 1: Add at end
         5
       /   \
      10    20
     /  \
    15   3

Step 2: Compare 3 with parent 10 → 3 < 10, swap
         5
       /   \
      3     20
     /  \
    15   10

Step 3: Compare 3 with parent 5 → 3 < 5, swap
         3
       /   \
      5     20
     /  \
    15   10

Result: [3, 5, 20, 15, 10]
```

**Interview insight**: Candidates often forget that insertion is O(log n), not O(1). The heapify operation is essential for maintaining priority order.

### What is the difference between peek() and poll()?

| Method | peek() | poll() |
|--------|--------|--------|
| **Returns** | Head element | Head element |
| **Removes?** | No (read-only) | Yes (destructive) |
| **Empty queue** | Returns `null` | Returns `null` |
| **Time Complexity** | O(1) | O(log n) |
| **Use case** | Check priority without removal | Process and remove highest priority |

**peek() - O(1):**
```java
public E peek() {
    return (size == 0) ? null : (E) queue[0];
}
```
Simply returns the root element without any modification. No heapify needed.

**poll() - O(log n):**
```java
public E poll() {
    if (size == 0)
        return null;
    int s = --size;
    E result = (E) queue[0];
    E x = (E) queue[s];
    queue[s] = null;
    if (s != 0)
        siftDown(0, x);  // Heapify down from root
    return result;
}
```

**Poll algorithm (siftDown):**
1. Save root element (to return)
2. Move last element to root position
3. Compare with both children
4. Swap with smaller child (min-heap)
5. Repeat until heap property restored or reach leaf
6. Time complexity: **O(log n)**

**Visual example:**
```
Poll from [3, 5, 20, 15, 10]:

Step 1: Remove 3, move 10 to root
        10
       /  \
      5    20
     /
   15

Step 2: Compare 10 with children (5, 20) → 5 is smaller, swap
        5
       /  \
     10    20
     /
   15

Result: [5, 10, 20, 15]
```

**Common mistake**: Using `peek()` in a loop expecting elements to be processed. You must use `poll()` to actually remove elements.

### What happens if you remove elements in a loop from a PriorityQueue?

Elements are removed in **priority order** (sorted order for min-heap/max-heap) :

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.addAll(Arrays.asList(10, 5, 20, 15, 25, 12));

while (!pq.isEmpty()) {
    System.out.print(pq.poll() + " ");
}
// Output: 5 10 12 15 20 25 (sorted ascending)
```

**Why this works:**
- Each `poll()` removes the current minimum
- Heapify operation promotes the next minimum to root
- Effectively performs a **heap sort** with O(n log n) total complexity

**For max-heap:**
```java
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
maxHeap.addAll(Arrays.asList(10, 5, 20, 15, 25, 12));

while (!maxHeap.isEmpty()) {
    System.out.print(maxHeap.poll() + " ");
}
// Output: 25 20 15 12 10 5 (sorted descending)
```

**Interview application**: "Given an unsorted array, return the k largest elements."
```java
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int num : array) {
    minHeap.offer(num);
    if (minHeap.size() > k) {
        minHeap.poll();  // Remove smallest
    }
}
// minHeap now contains k largest elements
```

### What is the time complexity of insertion and deletion in PriorityQueue?

| Operation | Time Complexity | Explanation |
|-----------|----------------|-------------|
| `offer()/add()` | **O(log n)** | Heapify up from leaf to root (max height = log n) |
| `poll()/remove()` | **O(log n)** | Heapify down from root to leaf (max height = log n) |
| `peek()` | **O(1)** | Direct array access to root element |
| `remove(Object)` | **O(n)** | Linear search + O(log n) heapify |
| `contains(Object)` | **O(n)** | Linear search through array |
| `size()` | **O(1)** | Returns size variable |

**Why O(log n) for insert/delete?**
- Binary heap has height = log₂(n)
- Heapify operations traverse at most one path from root to leaf
- Each level involves constant-time comparison and swap

**Space complexity:** O(n) for storing n elements

**Amortized analysis:** Unlike ArrayList which has occasional O(n) resizing, PriorityQueue's O(log n) is guaranteed for every operation (worst case = amortized case).

***

## Ordering & Comparisons

### Does PriorityQueue maintain insertion order? Why/Why not?

**No, PriorityQueue does NOT maintain insertion order**. It maintains **heap order** based on priority.

**Why not?**
- The heap property requires parent ≤ children (min-heap)
- This forces reorganization on every insertion
- Elements are placed based on comparison, not arrival time

**Example:**
```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.add(10);  // First
pq.add(5);   // Second
pq.add(20);  // Third

System.out.println(pq.poll());  // 5 (not 10, even though 10 was added first)
```

**When insertion order matters:**
- Use `LinkedList` or `ArrayDeque` for FIFO
- Use `LinkedHashSet` or `LinkedHashMap` for unique elements with insertion order
- PriorityQueue is **only** for priority-based processing

**Stability note:** PriorityQueue is **not stable**. If two elements have equal priority, their relative order is not guaranteed.

```java
class Task {
    String name;
    int priority;
}

PriorityQueue<Task> pq = new PriorityQueue<>(Comparator.comparingInt(t -> t.priority));
pq.add(new Task("A", 1));  // Same priority
pq.add(new Task("B", 1));  // Same priority

// Order of A and B is not guaranteed when polled
```

### How does PriorityQueue decide order for custom objects?

PriorityQueue uses **one of two comparison mechanisms** :

**Option 1: Natural Ordering (Comparable interface)**

The class must implement `Comparable<T>`:

```java
class Task implements Comparable<Task> {
    String name;
    int priority;
    
    Task(String name, int priority) {
        this.name = name;
        this.priority = priority;
    }
    
    @Override
    public int compareTo(Task other) {
        return Integer.compare(this.priority, other.priority);  // Min-heap by priority
    }
}

// Usage
PriorityQueue<Task> pq = new PriorityQueue<>();
pq.add(new Task("High", 1));
pq.add(new Task("Low", 10));
pq.add(new Task("Medium", 5));

System.out.println(pq.poll().name);  // "High" (priority = 1, smallest)
```

**Option 2: Custom Comparator (passed to constructor)**

Provide a `Comparator<T>` to the PriorityQueue constructor:

```java
class Employee {
    String name;
    int salary;
    
    Employee(String name, int salary) {
        this.name = name;
        this.salary = salary;
    }
}

// Comparator for max salary (max-heap)
PriorityQueue<Employee> pq = new PriorityQueue<>(
    (e1, e2) -> Integer.compare(e2.salary, e1.salary)  // Reverse for max-heap
);

pq.add(new Employee("Alice", 50000));
pq.add(new Employee("Bob", 80000));
pq.add(new Employee("Charlie", 60000));

System.out.println(pq.poll().name);  // "Bob" (highest salary)
```

**What if neither is provided?**
```java
class Person {
    String name;
}

PriorityQueue<Person> pq = new PriorityQueue<>();
pq.add(new Person("Alice"));  // Throws ClassCastException at runtime!
```

**Interview tip:** Always check if your custom class implements `Comparable` or provide a `Comparator`. Missing both is a common bug that fails at runtime, not compile time.

### How do you sort objects in PriorityQueue using Comparator?

**Scenario 1: Sort by single field (ascending)**
```java
class Student {
    String name;
    int marks;
}

// Min-heap by marks (lowest marks first)
PriorityQueue<Student> pq = new PriorityQueue<>(
    Comparator.comparingInt(s -> s.marks)
);
```

**Scenario 2: Sort by single field (descending)**
```java
// Max-heap by marks (highest marks first)
PriorityQueue<Student> pq = new PriorityQueue<>(
    Comparator.comparingInt(Student::getMarks).reversed()
);
```

**Scenario 3: Sort by multiple fields (chained comparators)**
```java
// Sort by marks (descending), then by name (ascending) for ties
PriorityQueue<Student> pq = new PriorityQueue<>(
    Comparator.comparingInt(Student::getMarks)
              .reversed()
              .thenComparing(Student::getName)
);
```

**Scenario 4: Complex custom logic**
```java
class Order {
    int orderId;
    LocalDateTime timestamp;
    boolean isPremium;
}

// Premium orders first, then by oldest timestamp
PriorityQueue<Order> pq = new PriorityQueue<>((o1, o2) -> {
    if (o1.isPremium != o2.isPremium) {
        return o1.isPremium ? -1 : 1;  // Premium has higher priority
    }
    return o1.timestamp.compareTo(o2.timestamp);  // Older first
});
```

**Interview-ready example: Sort by frequency then value**
```java
// Problem: Sort elements by frequency (descending), then by value (ascending)
Map<Integer, Integer> freqMap = new HashMap<>();
// ... populate frequency map

PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> {
    int freqCompare = Integer.compare(freqMap.get(b), freqMap.get(a));  // Descending frequency
    if (freqCompare == 0) {
        return Integer.compare(a, b);  // Ascending value for ties
    }
    return freqCompare;
});
```

***

## Real-World DSA Applications

### Where do we commonly use PriorityQueue in real-world problems (DSA)?

**1. Top K Elements Problems**

**Problem:** Find k largest/smallest elements from a stream or array

**Solution pattern:**
```java
// Find k largest elements - Use MIN heap of size k
public List<Integer> kLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int num : nums) {
        minHeap.offer(num);
        if (minHeap.size() > k) {
            minHeap.poll();  // Remove smallest
        }
    }
    return new ArrayList<>(minHeap);
}

// Time: O(n log k), Space: O(k)
```

**Real-world:** 
- Top K frequently searched keywords (Google Search)
- Top K trending topics (Twitter)
- K highest-rated products (Amazon)

**Interview examples:**
- LeetCode 215: Kth Largest Element in an Array
- LeetCode 347: Top K Frequent Elements
- LeetCode 692: Top K Frequent Words

***

**2. Merge K Sorted Lists/Arrays**

**Problem:** Merge K sorted arrays into one sorted array

**Solution pattern:**
```java
class Element {
    int value;
    int arrayIndex;
    int elementIndex;
}

public List<Integer> mergeKSortedArrays(int[][] arrays) {
    PriorityQueue<Element> minHeap = new PriorityQueue<>(
        Comparator.comparingInt(e -> e.value)
    );
    
    // Add first element from each array
    for (int i = 0; i < arrays.length; i++) {
        if (arrays[i].length > 0) {
            minHeap.offer(new Element(arrays[i][0], i, 0));
        }
    }
    
    List<Integer> result = new ArrayList<>();
    while (!minHeap.isEmpty()) {
        Element curr = minHeap.poll();
        result.add(curr.value);
        
        // Add next element from same array
        if (curr.elementIndex + 1 < arrays[curr.arrayIndex].length) {
            minHeap.offer(new Element(
                arrays[curr.arrayIndex][curr.elementIndex + 1],
                curr.arrayIndex,
                curr.elementIndex + 1
            ));
        }
    }
    return result;
}

// Time: O(n log k) where n = total elements, k = number of arrays
```

**Real-world:**
- Distributed database query results merging
- Multi-server log aggregation (sorted by timestamp)
- Combining multiple sorted result sets

**Interview examples:**
- LeetCode 23: Merge K Sorted Lists
- LeetCode 378: Kth Smallest Element in a Sorted Matrix

***

**3. Dijkstra's Shortest Path Algorithm**

**Problem:** Find shortest path in a weighted graph

**Solution pattern:**
```java
class Node {
    int vertex;
    int distance;
}

public int[] dijkstra(int[][] graph, int source) {
    int n = graph.length;
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[source] = 0;
    
    PriorityQueue<Node> pq = new PriorityQueue<>(
        Comparator.comparingInt(node -> node.distance)
    );
    pq.offer(new Node(source, 0));
    
    while (!pq.isEmpty()) {
        Node curr = pq.poll();
        int u = curr.vertex;
        
        for (int v = 0; v < n; v++) {
            if (graph[u][v] != 0) {  // Edge exists
                int newDist = dist[u] + graph[u][v];
                if (newDist < dist[v]) {
                    dist[v] = newDist;
                    pq.offer(new Node(v, newDist));
                }
            }
        }
    }
    return dist;
}

// Time: O((V + E) log V)
```

**Real-world:**
- Google Maps shortest route
- Network routing protocols (OSPF)
- Flight path optimization

**Interview examples:**
- LeetCode 743: Network Delay Time
- LeetCode 787: Cheapest Flights Within K Stops

***

**4. Task Scheduling / CPU Scheduling**

**Problem:** Schedule tasks based on priority or deadline

**Solution pattern:**
```java
class Task {
    String name;
    int priority;
    int deadline;
}

// CPU scheduling with priority
public void executeTasks(List<Task> tasks) {
    PriorityQueue<Task> taskQueue = new PriorityQueue<>(
        Comparator.comparingInt(t -> t.priority)
    );
    taskQueue.addAll(tasks);
    
    while (!taskQueue.isEmpty()) {
        Task task = taskQueue.poll();
        execute(task);  // Execute highest priority task
    }
}

// Deadline-based scheduling
public int maxProfit(int[][] jobs) {  // [profit, deadline]
    Arrays.sort(jobs, (a, b) -> b[0] - a[0]);  // Sort by profit descending
    
    PriorityQueue<Integer> pq = new PriorityQueue<>();  // Min-heap for deadlines
    int time = 0;
    
    for (int[] job : jobs) {
        if (time < job) {
            pq.offer(job[0]);
            time++;
        } else if (pq.peek() < job[0]) {
            pq.poll();
            pq.offer(job[0]);
        }
    }
    
    return pq.stream().mapToInt(Integer::intValue).sum();
}
```

**Real-world:**
- Operating system process scheduling
- Email queue processing by priority
- Hospital emergency room triage

**Interview examples:**
- LeetCode 621: Task Scheduler
- LeetCode 1353: Maximum Number of Events That Can Be Attended

***

**5. Median Finding in Data Stream**

**Problem:** Maintain median as numbers are added dynamically

**Solution pattern:**
```java
class MedianFinder {
    PriorityQueue<Integer> maxHeap;  // Lower half (max at top)
    PriorityQueue<Integer> minHeap;  // Upper half (min at top)
    
    public MedianFinder() {
        maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        minHeap = new PriorityQueue<>();
    }
    
    public void addNum(int num) {
        maxHeap.offer(num);
        minHeap.offer(maxHeap.poll());  // Balance
        
        if (minHeap.size() > maxHeap.size()) {
            maxHeap.offer(minHeap.poll());
        }
    }
    
    public double findMedian() {
        if (maxHeap.size() > minHeap.size()) {
            return maxHeap.peek();
        }
        return (maxHeap.peek() + minHeap.peek()) / 2.0;
    }
}

// Time: O(log n) per insertion, O(1) for median
```

**Real-world:**
- Real-time analytics (median response time)
- Stock price median tracking
- Network latency monitoring

**Interview examples:**
- LeetCode 295: Find Median from Data Stream
- LeetCode 480: Sliding Window Median

---

**6. Sliding Window Maximum/Minimum**

**Problem:** Find max/min in every window of size k

**Solution pattern:**
```java
// Using PriorityQueue (alternative to deque)
public int[] maxSlidingWindow(int[] nums, int k) {
    PriorityQueue<int[]> maxHeap = new PriorityQueue<>(
        (a, b) -> b[0] != a[0] ? b[0] - a[0] : b - a  // [value, index]
    );
    
    int[] result = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        maxHeap.offer(new int[]{nums[i], i});
        
        // Remove elements outside window
        while (maxHeap.peek() <= i - k) {
            maxHeap.poll();
        }
        
        if (i >= k - 1) {
            result[i - k + 1] = maxHeap.peek()[0];
        }
    }
    return result;
}
```

**Real-world:**
- Stock trading max price in time window
- Traffic monitoring peak congestion
- Temperature extremes in hourly windows

***

**7. Meeting Rooms / Interval Scheduling**

**Problem:** Find minimum conference rooms needed

**Solution pattern:**
```java
public int minMeetingRooms(int[][] intervals) {
    Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));  // Sort by start time
    
    PriorityQueue<Integer> endTimes = new PriorityQueue<>();  // Min-heap of end times
    
    for (int[] interval : intervals) {
        if (!endTimes.isEmpty() && endTimes.peek() <= interval[0]) {
            endTimes.poll();  // Room becomes free
        }
        endTimes.offer(interval);  // Book room until end time
    }
    
    return endTimes.size();  // Number of rooms needed
}

// Time: O(n log n)
```

**Real-world:**
- Conference room allocation (Google Calendar)
- Resource scheduling (AWS instance management)
- Parking space availability

**Interview examples:**
- LeetCode 253: Meeting Rooms II
- LeetCode 1353: Maximum Number of Events That Can Be Attended

***
