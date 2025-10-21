---
title: "String Manipulation Interview Questions"
---

## Implement a function to reverse a string without using built-ins

Use **two pointers** or **character array manipulation** to reverse the string by swapping characters from both ends.

**Interview Example:**
```java
// Method 1: Using two pointers with char array
public static String reverseString(String str) {
    if (str == null || str.length() <= 1) {
        return str;
    }
    
    char[] chars = str.toCharArray();
    int left = 0;
    int right = chars.length - 1;
    
    while (left < right) {
        // Swap characters
        char temp = chars[left];
        chars[left] = chars[right];
        chars[right] = temp;
        
        left++;
        right--;
    }
    
    return new String(chars);
}

// Method 2: Using recursion
public static String reverseStringRecursive(String str) {
    if (str == null || str.length() <= 1) {
        return str;
    }
    
    return reverseStringRecursive(str.substring(1)) + str.charAt(0);
}

// Method 3: Using manual character building
public static String reverseStringManual(String str) {
    if (str == null) {
        return null;
    }
    
    char[] result = new char[str.length()];
    
    for (int i = 0; i < str.length(); i++) {
        result[i] = str.charAt(str.length() - 1 - i);
    }
    
    return new String(result);
}

// Test cases
System.out.println(reverseString("Hello")); // "olleH"
System.out.println(reverseString("Java Programming")); // "gnimmargorP avaJ"
System.out.println(reverseString("a")); // "a"
System.out.println(reverseString("")); // ""
System.out.println(reverseStringRecursive("Interview")); // "weivretnI"
```

**Time Complexity:** O(n), **Space Complexity:** O(n) for char array.

## Implement string compression (e.g., "aaabb" → "a3b2")

**Count consecutive characters** and append character followed by count. Return original if compressed version is not smaller.

**Interview Example:**
```java
// Method 1: Standard compression
public static String compressString(String str) {
    if (str == null || str.length() <= 1) {
        return str;
    }
    
    StringBuilder compressed = new StringBuilder();
    int count = 1;
    
    for (int i = 1; i < str.length(); i++) {
        if (str.charAt(i) == str.charAt(i - 1)) {
            count++;
        } else {
            compressed.append(str.charAt(i - 1)).append(count);
            count = 1;
        }
    }
    
    // Append last character group
    compressed.append(str.charAt(str.length() - 1)).append(count);
    
    // Return original if compressed is not smaller
    return compressed.length() < str.length() ? 
           compressed.toString() : str;
}

// Method 2: Only append count if > 1
public static String compressString2(String str) {
    if (str == null || str.length() <= 1) {
        return str;
    }
    
    StringBuilder compressed = new StringBuilder();
    int count = 1;
    
    for (int i = 1; i < str.length(); i++) {
        if (str.charAt(i) == str.charAt(i - 1)) {
            count++;
        } else {
            compressed.append(str.charAt(i - 1));
            if (count > 1) {
                compressed.append(count);
            }
            count = 1;
        }
    }
    
    compressed.append(str.charAt(str.length() - 1));
    if (count > 1) {
        compressed.append(count);
    }
    
    return compressed.toString();
}

// Method 3: Decompress (bonus)
public static String decompressString(String str) {
    StringBuilder result = new StringBuilder();
    
    for (int i = 0; i < str.length(); i++) {
        char ch = str.charAt(i);
        
        if (Character.isDigit(ch)) {
            int count = ch - '0';
            char prevChar = result.charAt(result.length() - 1);
            
            for (int j = 1; j < count; j++) {
                result.append(prevChar);
            }
        } else {
            result.append(ch);
        }
    }
    
    return result.toString();
}

// Test cases
System.out.println(compressString("aaabb")); // "a3b2"
System.out.println(compressString("aabcccccaaa")); // "a2b1c5a3"
System.out.println(compressString("abc")); // "abc" (not smaller)
System.out.println(compressString("aabbcc")); // "aabbcc" (same length)
System.out.println(compressString("aaaaaaa")); // "a7"

System.out.println(compressString2("aaabb")); // "a3b2"
System.out.println(compressString2("abc")); // "abc"
```

**Time Complexity:** O(n), **Space Complexity:** O(n).

## Implement a custom substring() method

Extract characters from **start index** (inclusive) to **end index** (exclusive) manually using a loop.

**Interview Example:**
```java
// Custom substring implementation
public static String customSubstring(String str, int start, int end) {
    // Validation
    if (str == null) {
        throw new NullPointerException("String is null");
    }
    
    if (start < 0 || end > str.length() || start > end) {
        throw new IndexOutOfBoundsException(
            "Invalid start or end index"
        );
    }
    
    // Build substring character by character
    char[] result = new char[end - start];
    
    for (int i = start; i < end; i++) {
        result[i - start] = str.charAt(i);
    }
    
    return new String(result);
}

// Overload: substring from start to end of string
public static String customSubstring(String str, int start) {
    return customSubstring(str, start, str.length());
}

// Alternative using StringBuilder
public static String customSubstring2(String str, int start, int end) {
    if (str == null) {
        throw new NullPointerException("String is null");
    }
    
    if (start < 0 || end > str.length() || start > end) {
        throw new IndexOutOfBoundsException(
            "Invalid start or end index"
        );
    }
    
    StringBuilder sb = new StringBuilder();
    
    for (int i = start; i < end; i++) {
        sb.append(str.charAt(i));
    }
    
    return sb.toString();
}

// Test cases
String text = "Java Programming";

System.out.println(customSubstring(text, 0, 4)); // "Java"
System.out.println(customSubstring(text, 5, 16)); // "Programming"
System.out.println(customSubstring(text, 5)); // "Programming"
System.out.println(customSubstring(text, 0, text.length())); // "Java Programming"
System.out.println(customSubstring(text, 2, 6)); // "va P"

// Edge cases
System.out.println(customSubstring("", 0, 0)); // ""
System.out.println(customSubstring("a", 0, 1)); // "a"

// Error cases (will throw exceptions)
// customSubstring(text, -1, 5); // IndexOutOfBoundsException
// customSubstring(text, 0, 100); // IndexOutOfBoundsException
// customSubstring(null, 0, 5); // NullPointerException
```

**Time Complexity:** O(n) where n is substring length, **Space Complexity:** O(n).

## Implement a custom split() function

**Identify delimiter positions** and extract substrings between delimiters using loops.

**Interview Example:**
```java
// Custom split implementation (single char delimiter)
public static String[] customSplit(String str, char delimiter) {
    if (str == null) {
        throw new NullPointerException("String is null");
    }
    
    // Count delimiters to determine array size
    int count = 1;
    for (int i = 0; i < str.length(); i++) {
        if (str.charAt(i) == delimiter) {
            count++;
        }
    }
    
    String[] result = new String[count];
    int index = 0;
    int start = 0;
    
    for (int i = 0; i < str.length(); i++) {
        if (str.charAt(i) == delimiter) {
            result[index++] = customSubstring(str, start, i);
            start = i + 1;
        }
    }
    
    // Add last part
    result[index] = customSubstring(str, start, str.length());
    
    return result;
}

// Custom split with String delimiter
public static String[] customSplit(String str, String delimiter) {
    if (str == null || delimiter == null) {
        throw new NullPointerException("String or delimiter is null");
    }
    
    if (delimiter.isEmpty()) {
        return new String[]{str};
    }
    
    List<String> parts = new ArrayList<>();
    int start = 0;
    int index = customIndexOf(str, delimiter, start);
    
    while (index != -1) {
        parts.add(customSubstring(str, start, index));
        start = index + delimiter.length();
        index = customIndexOf(str, delimiter, start);
    }
    
    // Add remaining part
    parts.add(customSubstring(str, start, str.length()));
    
    return parts.toArray(new String[0]);
}

// Helper method: custom indexOf
private static int customIndexOf(String str, String pattern, int fromIndex) {
    if (fromIndex >= str.length()) {
        return -1;
    }
    
    for (int i = fromIndex; i <= str.length() - pattern.length(); i++) {
        boolean found = true;
        
        for (int j = 0; j < pattern.length(); j++) {
            if (str.charAt(i + j) != pattern.charAt(j)) {
                found = false;
                break;
            }
        }
        
        if (found) {
            return i;
        }
    }
    
    return -1;
}

// Test cases
String text1 = "Java,Python,C++,JavaScript";
String[] result1 = customSplit(text1, ',');
System.out.println(Arrays.toString(result1));
// Output: [Java, Python, C++, JavaScript]

String text2 = "apple::banana::orange";
String[] result2 = customSplit(text2, "::");
System.out.println(Arrays.toString(result2));
// Output: [apple, banana, orange]

String text3 = "Hello World";
String[] result3 = customSplit(text3, ' ');
System.out.println(Arrays.toString(result3));
// Output: [Hello, World]

// Edge cases
String[] result4 = customSplit("", ',');
System.out.println(Arrays.toString(result4)); // [""]

String[] result5 = customSplit("abc", ',');
System.out.println(Arrays.toString(result5)); // [abc]
```

**Time Complexity:** O(n²) for string delimiter, O(n) for char delimiter.

## Implement your own version of equalsIgnoreCase()

**Convert both strings to same case** manually using ASCII values or **compare characters** after case conversion.

**Interview Example:**
```java
// Method 1: Character-by-character comparison
public static boolean customEqualsIgnoreCase(String str1, String str2) {
    if (str1 == str2) {
        return true; // Same reference
    }
    
    if (str1 == null || str2 == null) {
        return false;
    }
    
    if (str1.length() != str2.length()) {
        return false;
    }
    
    for (int i = 0; i < str1.length(); i++) {
        char c1 = str1.charAt(i);
        char c2 = str2.charAt(i);
        
        // Direct match
        if (c1 == c2) {
            continue;
        }
        
        // Convert to lowercase and compare
        if (toLowerCase(c1) != toLowerCase(c2)) {
            return false;
        }
    }
    
    return true;
}

// Helper: convert char to lowercase
private static char toLowerCase(char ch) {
    if (ch >= 'A' && ch <= 'Z') {
        return (char) (ch + 32); // ASCII difference
    }
    return ch;
}

// Helper: convert char to uppercase
private static char toUpperCase(char ch) {
    if (ch >= 'a' && ch <= 'z') {
        return (char) (ch - 32);
    }
    return ch;
}

// Method 2: Using manual case conversion
public static boolean customEqualsIgnoreCase2(String str1, String str2) {
    if (str1 == str2) {
        return true;
    }
    
    if (str1 == null || str2 == null) {
        return false;
    }
    
    if (str1.length() != str2.length()) {
        return false;
    }
    
    String lower1 = convertToLowerCase(str1);
    String lower2 = convertToLowerCase(str2);
    
    return lower1.equals(lower2);
}

// Convert entire string to lowercase manually
private static String convertToLowerCase(String str) {
    char[] chars = new char[str.length()];
    
    for (int i = 0; i < str.length(); i++) {
        chars[i] = toLowerCase(str.charAt(i));
    }
    
    return new String(chars);
}

// Test cases
System.out.println(customEqualsIgnoreCase("Java", "JAVA")); // true
System.out.println(customEqualsIgnoreCase("Hello", "hello")); // true
System.out.println(customEqualsIgnoreCase("ABC", "abc")); // true
System.out.println(customEqualsIgnoreCase("Test", "Test")); // true
System.out.println(customEqualsIgnoreCase("Java", "Python")); // false
System.out.println(customEqualsIgnoreCase("", "")); // true
System.out.println(customEqualsIgnoreCase(null, null)); // true
System.out.println(customEqualsIgnoreCase("Test", null)); // false

// Mixed case
System.out.println(customEqualsIgnoreCase("JaVa", "jAvA")); // true
System.out.println(customEqualsIgnoreCase("Programming", "PROGRAMMING")); // true
```

**Time Complexity:** O(n), **Space Complexity:** O(1) for method 1, O(n) for method 2.

## Implement atoi() (convert string to integer)

Parse string character by character, handle **whitespace, sign, digits, and overflow**.[1][2][3]

**Interview Example:**
```java
// Complete atoi implementation with all edge cases
public static int customAtoi(String str) {
    if (str == null || str.length() == 0) {
        return 0;
    }
    
    int index = 0;
    int n = str.length();
    
    // Step 1: Skip leading whitespace
    while (index < n && str.charAt(index) == ' ') {
        index++;
    }
    
    if (index == n) {
        return 0; // Only whitespace
    }
    
    // Step 2: Check for sign
    int sign = 1;
    if (str.charAt(index) == '+' || str.charAt(index) == '-') {
        sign = str.charAt(index) == '+' ? 1 : -1;
        index++;
    }
    
    // Step 3: Convert digits
    int result = 0;
    
    while (index < n && Character.isDigit(str.charAt(index))) {
        int digit = str.charAt(index) - '0';
        
        // Step 4: Check for overflow before multiplication
        // INT_MAX = 2147483647, INT_MIN = -2147483648
        if (result > Integer.MAX_VALUE / 10 || 
            (result == Integer.MAX_VALUE / 10 && digit > 7)) {
            return sign == 1 ? Integer.MAX_VALUE : Integer.MIN_VALUE;
        }
        
        result = result * 10 + digit;
        index++;
    }
    
    return result * sign;
}

// Simpler version without overflow handling
public static int simpleAtoi(String str) {
    if (str == null || str.isEmpty()) {
        return 0;
    }
    
    str = str.trim();
    if (str.isEmpty()) {
        return 0;
    }
    
    int index = 0;
    int sign = 1;
    
    if (str.charAt(0) == '-') {
        sign = -1;
        index = 1;
    } else if (str.charAt(0) == '+') {
        index = 1;
    }
    
    int result = 0;
    
    while (index < str.length() && Character.isDigit(str.charAt(index))) {
        result = result * 10 + (str.charAt(index) - '0');
        index++;
    }
    
    return result * sign;
}

// Test cases
System.out.println(customAtoi("42")); // 42
System.out.println(customAtoi("   -42")); // -42
System.out.println(customAtoi("4193 with words")); // 4193
System.out.println(customAtoi("words and 987")); // 0
System.out.println(customAtoi("-91283472332")); // -2147483648 (overflow)
System.out.println(customAtoi("91283472332")); // 2147483647 (overflow)
System.out.println(customAtoi("  +123")); // 123
System.out.println(customAtoi("00123")); // 123
System.out.println(customAtoi("")); // 0
System.out.println(customAtoi("   ")); // 0
System.out.println(customAtoi("-")); // 0
System.out.println(customAtoi("2147483647")); // 2147483647 (INT_MAX)
System.out.println(customAtoi("-2147483648")); // -2147483648 (INT_MIN)
```

**Time Complexity:** O(n), **Space Complexity:** O(1).[2][4]

## Implement isAnagram() using HashMap

**Count character frequencies** using HashMap and compare both maps for equality.

**Interview Example:**
```java
// Method using HashMap
public static boolean isAnagramHashMap(String str1, String str2) {
    if (str1 == null || str2 == null) {
        return false;
    }
    
    if (str1.length() != str2.length()) {
        return false;
    }
    
    // Count frequencies for first string
    Map<Character, Integer> freqMap = new HashMap<>();
    
    for (char ch : str1.toCharArray()) {
        freqMap.put(ch, freqMap.getOrDefault(ch, 0) + 1);
    }
    
    // Decrement frequencies for second string
    for (char ch : str2.toCharArray()) {
        if (!freqMap.containsKey(ch)) {
            return false;
        }
        
        freqMap.put(ch, freqMap.get(ch) - 1);
        
        if (freqMap.get(ch) < 0) {
            return false;
        }
    }
    
    // Check if all frequencies are zero
    for (int count : freqMap.values()) {
        if (count != 0) {
            return false;
        }
    }
    
    return true;
}

// Optimized version (single pass decrement)
public static boolean isAnagramHashMap2(String str1, String str2) {
    if (str1 == null || str2 == null || str1.length() != str2.length()) {
        return false;
    }
    
    Map<Character, Integer> freqMap = new HashMap<>();
    
    // Increment for str1, decrement for str2
    for (int i = 0; i < str1.length(); i++) {
        char c1 = str1.charAt(i);
        char c2 = str2.charAt(i);
        
        freqMap.put(c1, freqMap.getOrDefault(c1, 0) + 1);
        freqMap.put(c2, freqMap.getOrDefault(c2, 0) - 1);
    }
    
    // All values should be zero
    for (int count : freqMap.values()) {
        if (count != 0) {
            return false;
        }
    }
    
    return true;
}

// Test cases
System.out.println(isAnagramHashMap("listen", "silent")); // true
System.out.println(isAnagramHashMap("hello", "world")); // false
System.out.println(isAnagramHashMap("anagram", "nagaram")); // true
System.out.println(isAnagramHashMap("rat", "car")); // false
System.out.println(isAnagramHashMap("", "")); // true
System.out.println(isAnagramHashMap("a", "a")); // true

// Case-insensitive anagram check
String s1 = "Listen";
String s2 = "Silent";
System.out.println(isAnagramHashMap(
    s1.toLowerCase(), s2.toLowerCase()
)); // true
```

**Time Complexity:** O(n), **Space Complexity:** O(k) where k is unique characters.

## Implement removeDuplicates() without using collections

Use **boolean array** or **two pointers** to track seen characters and build result without duplicates.

**Interview Example:**
```java
// Method 1: Using boolean array (for ASCII characters)
public static String removeDuplicates(String str) {
    if (str == null || str.length() <= 1) {
        return str;
    }
    
    boolean[] seen = new boolean[256]; // ASCII
    char[] result = new char[str.length()];
    int index = 0;
    
    for (char ch : str.toCharArray()) {
        if (!seen[ch]) {
            seen[ch] = true;
            result[index++] = ch;
        }
    }
    
    return new String(result, 0, index);
}

// Method 2: Using nested loops (no extra space except output)
public static String removeDuplicates2(String str) {
    if (str == null || str.length() <= 1) {
        return str;
    }
    
    char[] result = new char[str.length()];
    int index = 0;
    
    for (int i = 0; i < str.length(); i++) {
        char current = str.charAt(i);
        boolean isDuplicate = false;
        
        // Check if already in result
        for (int j = 0; j < index; j++) {
            if (result[j] == current) {
                isDuplicate = true;
                break;
            }
        }
        
        if (!isDuplicate) {
            result[index++] = current;
        }
    }
    
    return new String(result, 0, index);
}

// Method 3: In-place removal (modifying approach)
public static String removeDuplicates3(String str) {
    if (str == null || str.length() <= 1) {
        return str;
    }
    
    StringBuilder sb = new StringBuilder();
    boolean[] seen = new boolean[256];
    
    for (int i = 0; i < str.length(); i++) {
        char ch = str.charAt(i);
        
        if (!seen[ch]) {
            seen[ch] = true;
            sb.append(ch);
        }
    }
    
    return sb.toString();
}

// Test cases
System.out.println(removeDuplicates("programming")); // "progamin"
System.out.println(removeDuplicates("hello")); // "helo"
System.out.println(removeDuplicates("aabbcc")); // "abc"
System.out.println(removeDuplicates("abcabc")); // "abc"
System.out.println(removeDuplicates("")); // ""
System.out.println(removeDuplicates("a")); // "a"
System.out.println(removeDuplicates("aaaaaa")); // "a"

// Preserves order
System.out.println(removeDuplicates("banana")); // "ban"
System.out.println(removeDuplicates("Java Programming")); // "Jav Progmni"
```

**Time Complexity:** O(n) for method 1&3, O(n²) for method 2. **Space Complexity:** O(1) extra for method 1 (fixed size array).

## Implement strStr() (index of first occurrence of pattern in text)

Use **brute force** or **KMP algorithm** to find first occurrence of pattern in text.[5][6][7]

**Interview Example:**
```java
// Method 1: Brute Force (Simple and interview-friendly)
public static int strStr(String text, String pattern) {
    if (pattern == null || pattern.isEmpty()) {
        return 0;
    }
    
    if (text == null || text.length() < pattern.length()) {
        return -1;
    }
    
    int n = text.length();
    int m = pattern.length();
    
    // Try each position in text
    for (int i = 0; i <= n - m; i++) {
        boolean found = true;
        
        // Check if pattern matches at position i
        for (int j = 0; j < m; j++) {
            if (text.charAt(i + j) != pattern.charAt(j)) {
                found = false;
                break;
            }
        }
        
        if (found) {
            return i;
        }
    }
    
    return -1;
}

// Method 2: KMP Algorithm (Optimal)
public static int strStrKMP(String text, String pattern) {
    if (pattern == null || pattern.isEmpty()) {
        return 0;
    }
    
    if (text == null || text.length() < pattern.length()) {
        return -1;
    }
    
    int[] lps = computeLPS(pattern);
    int i = 0; // text pointer
    int j = 0; // pattern pointer
    
    while (i < text.length()) {
        if (text.charAt(i) == pattern.charAt(j)) {
            i++;
            j++;
        }
        
        if (j == pattern.length()) {
            return i - j; // Found at index
        } else if (i < text.length() && text.charAt(i) != pattern.charAt(j)) {
            if (j != 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    
    return -1;
}

// Compute Longest Proper Prefix which is also Suffix
private static int[] computeLPS(String pattern) {
    int m = pattern.length();
    int[] lps = new int[m];
    int len = 0;
    int i = 1;
    
    lps[0] = 0; // lps[0] is always 0
    
    while (i < m) {
        if (pattern.charAt(i) == pattern.charAt(len)) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len != 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    
    return lps;
}

// Method 3: Using two pointers (cleaner brute force)
public static int strStr2(String haystack, String needle) {
    if (needle.isEmpty()) return 0;
    if (haystack.length() < needle.length()) return -1;
    
    for (int i = 0; i <= haystack.length() - needle.length(); i++) {
        int j = 0;
        
        while (j < needle.length() && 
               haystack.charAt(i + j) == needle.charAt(j)) {
            j++;
        }
        
        if (j == needle.length()) {
            return i;
        }
    }
    
    return -1;
}

// Test cases
System.out.println(strStr("hello", "ll")); // 2
System.out.println(strStr("aaaaa", "bba")); // -1
System.out.println(strStr("", "")); // 0
System.out.println(strStr("abc", "")); // 0
System.out.println(strStr("mississippi", "issip")); // 4

// KMP tests
System.out.println(strStrKMP("sadbutsad", "sad")); // 0
System.out.println(strStrKMP("leetcode", "leeto")); // -1
System.out.println(strStrKMP("ababcabcabababd", "ababd")); // 10

// Find all occurrences (bonus)
public static List<Integer> findAllOccurrences(String text, String pattern) {
    List<Integer> positions = new ArrayList<>();
    int index = 0;
    
    while (index <= text.length() - pattern.length()) {
        int pos = strStr(text.substring(index), pattern);
        
        if (pos == -1) break;
        
        positions.add(index + pos);
        index = index + pos + 1;
    }
    
    return positions;
}

System.out.println(findAllOccurrences("aabaabaa", "aab")); // [0, 3, 6]
```

**Time Complexity:** Brute Force: O(n×m), KMP: O(n+m). **Space Complexity:** O(1) for brute force, O(m) for KMP.[7][5]
