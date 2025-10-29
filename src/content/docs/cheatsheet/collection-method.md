---
title: Collection Methods
---

# Java Core Libraries Cheat Sheet

This cheat sheet lists commonly used methods from core Java libraries (`java.util`, `java.lang`, `java.util.stream`, etc.) for typical data structure and backend tasks. Each section covers a topic with a table of key functions, descriptions, and one-line example usage.

## Collections

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `Collections.sort(List<T>)` | Sorts the list into natural (ascending) order. | `Collections.sort(list);` |
| 2 | `Collections.reverse(List<?>)` | Reverses the order of elements in the list. | `Collections.reverse(list);` |
| 3 | `Collections.shuffle(List<?>)` | Randomly permutes (shuffles) the list. | `Collections.shuffle(list);` |
| 4 | `Collections.binarySearch(List<?>, key)` | Searches for `key` in a **sorted** list; returns index if found, or `-(insertionPoint)-1` if not. | `int idx = Collections.binarySearch(list, key);` |
| 5 | `Collections.max(Collection<? extends T>)` | Returns the maximum element of the collection (natural order or by supplied comparator). | `Collections.max(list);` |
| 6 | `Collections.min(Collection<? extends T>)` | Returns the minimum element of the collection. | `Collections.min(list);` |
| 7 | `Collections.frequency(Collection<?>, Object)` | Counts how many times the specified element appears in the collection. | `Collections.frequency(list, elem);` |
| 8 | `Collections.fill(List<? super T>, T)` | Replaces all elements in the list with the given value. | `Collections.fill(list, 0);` |
| 9 | `Collections.replaceAll(List<T>, T oldVal, T newVal)` | Replaces all occurrences of `oldVal` with `newVal`. | `Collections.replaceAll(list, 1, 100);` |

## List

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `List.add(E)` | Appends the element to the end of the list. | `list.add("item");` |
| 2 | `List.add(int, E)` | Inserts the element at the given index. | `list.add(0, "first");` |
| 3 | `List.get(int)` | Returns the element at the specified index. | `String s = list.get(2);` |
| 4 | `List.set(int, E)` | Replaces the element at index with a new value. | `list.set(1, "new");` |
| 5 | `List.remove(int)` | Removes the element at the specified index. | `list.remove(0);` |
| 6 | `List.size()` | Returns the number of elements. | `int n = list.size();` |
| 7 | `List.isEmpty()` | Checks if the list has no elements. | `boolean empty = list.isEmpty();` |
| 8 | `List.contains(Object)` | Checks if the list contains the given element. | `boolean has = list.contains("item");` |
| 9 | `List.indexOf(Object)` | Returns the index of the first occurrence or -1 if not found. | `int i = list.indexOf("item");` |
| 10 | `List.subList(int, int)` | Returns a view between indices. | `List<String> part = list.subList(1, 3);` |
| 11 | `List.sort(Comparator<? super E>)` | Sorts using comparator or natural order. *(Java 8+)* | `list.sort(Comparator.naturalOrder());` |
| 12 | `List.removeIf(Predicate<? super E>)` | Removes all elements that match predicate. *(Java 8+)* | `list.removeIf(x -> x < 0);` |

## Set

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `Set.add(E)` | Adds the element (ignores duplicates). | `set.add(42);` |
| 2 | `Set.remove(Object)` | Removes element. | `set.remove(42);` |
| 3 | `Set.contains(Object)` | Checks if contains. | `boolean ok = set.contains(5);` |
| 4 | `Set.size()` | Returns number of elements. | `int n = set.size();` |
| 5 | `Set.isEmpty()` | Checks if empty. | `boolean empty = set.isEmpty();` |
| 6 | `Set.clear()` | Removes all elements. | `set.clear();` |
| 7 | `Set.removeIf(Predicate<? super E>)` | Removes elements matching predicate. *(Java 8+)* | `set.removeIf(x -> x % 2 == 0);` |
| 8 | `Set.retainAll(Collection<?>)` | Keeps only elements present in another collection (intersection). | `set.retainAll(otherSet);` |

## Map

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `Map.put(K, V)` | Associates value with key. | `map.put("key", 100);` |
| 2 | `Map.get(Object)` | Returns value for key or `null`. | `int v = map.get("key");` |
| 3 | `Map.containsKey(Object)` | Checks if key exists. | `map.containsKey("key");` |
| 4 | `Map.size()` | Returns entry count. | `int n = map.size();` |
| 5 | `Map.isEmpty()` | Checks if map has no entries. | `map.isEmpty();` |
| 6 | `Map.remove(Object)` | Removes mapping for key. | `map.remove("key");` |
| 7 | `Map.remove(Object, Object)` | Removes entry if key mapped to value. | `map.remove("key", 100);` |
| 8 | `Map.keySet()` | Returns keys as Set. | `Set<String> keys = map.keySet();` |
| 9 | `Map.values()` | Returns values as Collection. | `map.values();` |
| 10 | `Map.putIfAbsent(K,V)` | Adds mapping if key missing. *(Java 8+)* | `map.putIfAbsent("key", 50);` |
| 11 | `Map.getOrDefault(K, V)` | Returns value or default. *(Java 8+)* | `map.getOrDefault("key", 0);` |
| 12 | `Map.computeIfAbsent(K, Function)` | Computes value if absent. *(Java 8+)* | `map.computeIfAbsent("k", k -> new ArrayList<>());` |
| 13 | `Map.merge(K, V, BiFunction)` | Merges values. *(Java 8+)* | `map.merge("k", 1, Integer::sum);` |
| 14 | `Map.forEach(BiConsumer)` | Iterates entries. *(Java 8+)* | `map.forEach((k,v)->System.out.println(k+":"+v));` |

## Queue

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `Queue.add(E)` | Inserts element (throws if full). | `queue.add(10);` |
| 2 | `Queue.offer(E)` | Inserts element (false if full). | `queue.offer(20);` |
| 3 | `Queue.poll()` | Retrieves/removes head or `null` if empty. | `queue.poll();` |
| 4 | `Queue.peek()` | Retrieves head without removal. | `queue.peek();` |
| 5 | `Queue.remove()` | Removes head (throws if empty). | `queue.remove();` |
| 6 | `Queue.element()` | Returns head (throws if empty). | `queue.element();` |
| 7 | `Queue.size()` | Returns count. | `queue.size();` |
| 8 | `Queue.isEmpty()` | Checks if empty. | `queue.isEmpty();` |

## String

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `String.length()` | Returns length. | `"Hello".length();` |
| 2 | `String.charAt(int)` | Returns char at index. | `"Hello".charAt(1);` |
| 3 | `String.substring(int,int)` | Returns substring. | `"Hello".substring(1,4);` |
| 4 | `String.indexOf(String)` | First occurrence index. | `"abcabc".indexOf("bc");` |
| 5 | `String.lastIndexOf(String)` | Last occurrence index. | `"abcabc".lastIndexOf("bc");` |
| 6 | `String.contains(CharSequence)` | Checks substring presence. | `"Hello".contains("ell");` |
| 7 | `String.startsWith(String)` | Checks prefix. | `"Hello".startsWith("He");` |
| 8 | `String.endsWith(String)` | Checks suffix. | `"Hello".endsWith("lo");` |
| 9 | `String.equals(Object)` | Compares for equality. | `"a".equals("A");` |
| 10 | `String.equalsIgnoreCase(String)` | Ignores case. | `"a".equalsIgnoreCase("A");` |
| 11 | `String.toLowerCase()` | Converts to lowercase. | `"Hello".toLowerCase();` |
| 12 | `String.toUpperCase()` | Converts to uppercase. | `"Hello".toUpperCase();` |
| 13 | `String.trim()` | Removes whitespace. | `"  Hi  ".trim();` |
| 14 | `String.replace(CharSequence, CharSequence)` | Replaces literal text. | `"aabb".replace("a","c");` |
| 15 | `String.replaceAll(String, String)` | Replaces using regex. | `"abc123".replaceAll("\\d","");` |
| 16 | `String.split(String)` | Splits using regex. | `"a,b,c".split(",");` |
| 17 | `String.join(CharSequence, CharSequence...)` | Joins with delimiter. *(Java 8+)* | `String.join("-", "a","b","c");` |
| 18 | `String.format(String,Object...)` | Formats string. | `String.format("Hi %s", "Bob");` |

## Arrays

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `Arrays.sort(int[])` | Sorts ascending. | `Arrays.sort(arr);` |
| 2 | `Arrays.sort(T[], Comparator)` | Sorts with comparator. | `Arrays.sort(arr, Collections.reverseOrder());` |
| 3 | `Arrays.binarySearch(int[], key)` | Searches sorted array. | `Arrays.binarySearch(arr, key);` |
| 4 | `Arrays.equals(int[], int[])` | Compares arrays. | `Arrays.equals(a,b);` |
| 5 | `Arrays.toString(Object[])` | Returns string form. | `Arrays.toString(arr);` |
| 6 | `Arrays.asList(T...)` | Returns fixed-size List view. | `Arrays.asList(1,2,3);` |
| 7 | `Arrays.copyOf(T[], int)` | Copies to new length. | `Arrays.copyOf(arr,5);` |
| 8 | `Arrays.copyOfRange(T[], int, int)` | Copies range. | `Arrays.copyOfRange(arr,0,3);` |
| 9 | `Arrays.fill(T[], T)` | Fills array. | `Arrays.fill(arr,0);` |
| 10 | `Arrays.parallelSort(int[])` | Parallel sort *(Java 8+)* | `Arrays.parallelSort(arr);` |
| 11 | `Arrays.stream(T[])` | Creates Stream. *(Java 8+)* | `Arrays.stream(arr);` |

## Streams (Java 8+)

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `Collection.stream()` | Creates stream. | `list.stream()` |
| 2 | `Stream.filter(Predicate)` | Filters elements. | `list.stream().filter(n -> n>0)` |
| 3 | `Stream.map(Function)` | Maps elements. | `list.stream().map(String::length)` |
| 4 | `Stream.flatMap(Function)` | Flattens nested streams. | `listOfLists.stream().flatMap(List::stream)` |
| 5 | `Stream.distinct()` | Removes duplicates. | `list.stream().distinct()` |
| 6 | `Stream.sorted()` | Sorts elements. | `list.stream().sorted()` |
| 7 | `Stream.limit(long)` | Limits count. | `list.stream().limit(5)` |
| 8 | `Stream.skip(long)` | Skips first n. | `list.stream().skip(2)` |
| 9 | `Stream.forEach(Consumer)` | Iterates elements. | `list.stream().forEach(System.out::println)` |
| 10 | `Stream.collect(Collector)` | Collects to container. | `list.stream().collect(Collectors.toList())` |
| 11 | `Stream.reduce(T, BinaryOperator)` | Reduces values. | `list.stream().reduce(0, Integer::sum)` |
| 12 | `Stream.count()` | Counts elements. | `list.stream().count()` |
| 13 | `Stream.anyMatch(Predicate)` | Any matches predicate. | `list.stream().anyMatch(x->x>5)` |
| 14 | `Stream.allMatch(Predicate)` | All match predicate. | `list.stream().allMatch(x->x>0)` |
| 15 | `Stream.findFirst()` | Returns first element Optional. | `list.stream().findFirst()` |
| 16 | `Stream.min(Comparator)` | Minimum element. | `list.stream().min(Integer::compareTo)` |
| 17 | `Stream.max(Comparator)` | Maximum element. | `list.stream().max(Integer::compareTo)` |

## Optional (Java 8+)

| # | Method/Function | Description | Example |
|---|------------------|-------------|----------|
| 1 | `Optional.of(T)` | Creates non-null Optional. | `Optional.of("test")` |
| 2 | `Optional.ofNullable(T)` | Creates Optional or empty. | `Optional.ofNullable(maybeNull)` |
| 3 | `Optional.empty()` | Empty Optional. | `Optional.empty()` |
| 4 | `Optional.isPresent()` | Checks if value present. | `opt.isPresent()` |
| 5 | `Optional.ifPresent(Consumer)` | Runs if present. | `opt.ifPresent(x->System.out.println(x));` |
| 6 | `Optional.orElse(T)` | Returns value or default. | `opt.orElse("fallback");` |
| 7 | `Optional.orElseGet(Supplier)` | Returns value or supplier result. | `opt.orElseGet(() -> "fallback");` |
| 8 | `Optional.orElseThrow(Supplier)` | Throws exception if empty. | `opt.orElseThrow(() -> new RuntimeException("No value"));` |
| 9 | `Optional.filter(Predicate)` | Filters value. | `opt.filter(x -> x.startsWith("A"));` |
| 10 | `Optional.map(Function)` | Transforms if present. | `opt.map(String::toUpperCase);` |
| 11 | `Optional.flatMap(Function)` | Flattens nested Optional. | `opt.flatMap(x -> Optional.of(x.length()));` |
| 12 | `Optional.ifPresentOrElse(Consumer,Runnable)` | Runs consumer or else. *(Java 9+)* | `opt.ifPresentOrElse(x->System.out.println(x),()->System.out.println("Empty"));` |
