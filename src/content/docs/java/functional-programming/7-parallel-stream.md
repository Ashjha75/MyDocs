---
title: "Parallel Streams in Java"
---



Parallel streams in Java allow stream operations to execute concurrently using multiple threads, typically leveraging multicore processors. They are created using `Collection.parallelStream()` or by calling `stream().parallel()`, and are suitable for CPU-bound, stateless, and independently processed data. However, not all tasks benefit from parallelism—there are caveats related to thread safety, overhead, and ordering constraints.

***

## Interview Questions & Expert Answers

### 1. When would you use parallel streams? Give scenarios where they're beneficial and where they're not.

**Your Answer:**

Use parallel streams when:
- Data processing is computationally intensive (CPU-bound), not I/O-bound.
- Each data element is independent (no shared state or side effects).
- The dataset is fairly large (thousands of elements or more).
- Task performance significantly improves with parallelism (e.g., image/video processing, scientific calculations).

Don’t use parallel streams when:
- The operations involve lots of I/O, remote calls, or DB access (parallelism won’t help and may make it slower).
- There’s significant thread contention, shared mutable state, or synchronization is needed.
- The work per element is trivial; overhead can outweigh gains for small/simple tasks.
- Order of results is critical and must be preserved.

### 2. What's the difference between `stream()` and `parallelStream()`? Can you convert between them?

**Your Answer:**

- `stream()`: Processes elements **sequentially**—one after another on a single thread.
- `parallelStream()`: Processes elements **concurrently**—splitting them across multiple threads.

You can convert between them:
```java
list.stream().parallel()           // Converts sequential to parallel
list.parallelStream().sequential() // Converts parallel to sequential
```
This flexibility helps optimize performance based on task needs.

### 3. Explain thread safety issues with parallel streams. How do you handle shared mutable state?

**Your Answer:**

Parallel streams use multiple threads, so **shared mutable state** can lead to race conditions and data corruption (e.g., updating a shared variable inside a parallel stream).

To handle this:
- Avoid shared mutable state—keep operations stateless and functional.
- Use thread-safe data structures (ConcurrentHashMap, synchronized collections) if state must be shared.
- Use reduction/collection operations provided by streams, which are internally handled in a thread-safe way.
- Never mutate external lists, maps, or objects directly from inside a parallel stream.

### 4. What's the ForkJoin pool and how does it relate to parallel streams?

**Your Answer:**

Parallel streams use the **ForkJoinPool.commonPool** under the hood. This pool manages a set of worker threads that recursively break tasks into smaller pieces (fork), then combine results (join). ForkJoinPool enables efficient processing by executing tasks in parallel and balancing the workload automatically.

### 5. How do you control the number of threads used by parallel streams?

**Your Answer:**

By default, the parallel stream uses the number of threads equal to your system’s CPU cores (determined by `Runtime.getRuntime().availableProcessors()`).

To control the pool size, set the `java.util.concurrent.ForkJoinPool.common.parallelism` system property at JVM startup:
```
-Djava.util.concurrent.ForkJoinPool.common.parallelism=8
```
You can also supply your own custom ForkJoinPool and submit your stream computations in its context using `pool.submit(() -> stream.parallel().collect(...))`.

### 6. Why might parallel streams be slower than sequential streams in some cases?

**Your Answer:**

- Overhead of thread management and context switching can outweigh parallelism benefits if the task is lightweight or the dataset is small.
- False sharing and thread contention can reduce speed, especially when accessing shared data.
- If operations are I/O-bound or blocking, threads may be idle, making parallelism ineffective.
- Maintaining order or combining results incurs extra synchronization costs.

### 7. What's the impact of boxing/unboxing operations in parallel streams?

**Your Answer:**

Boxing (wrapping primitive types in objects) and unboxing (converting objects to primitives) incurs performance overhead, especially in tight loops or large datasets. This effect can be magnified in parallel streams due to the extra object creation and garbage collection. Using specialized stream types (IntStream, LongStream, DoubleStream) helps avoid unnecessary boxing/unboxing.

### 8. How do ordering constraints affect parallel stream performance?

**Your Answer:**

When a parallel stream must maintain encounter order (e.g., because of `forEachOrdered()` or certain ordered collectors), performance suffers due to added synchronization and reduced parallelism. Orderless operations (like `findAny()`, unordered reduction) allow threads to run more freely and combine results faster, taking full advantage of parallelism.

### 9. Given a large dataset, how would you decide whether to use parallel or sequential processing?

**Your Answer:**

Consider:
- The **size and nature of work**: Large, CPU-intensive, and independent tasks benefit most from parallel streams.
- Whether operations are I/O-bound or mutate shared state—even with large data, parallel streams may not help in these cases.
- Test performance in your specific environment—sometimes sequential streams outperform parallel, especially with small/medium data or on systems with few cores.
- Be aware of side effects: use parallel streams only when you can guarantee thread safety and stateless operations.