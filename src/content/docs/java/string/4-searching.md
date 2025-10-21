---
title: "String Interview Questions"
---

## How to find the longest substring without repeating characters?

Use the **sliding window technique** with a **HashSet** or **HashMap** to track characters. Expand the window when no duplicates exist, contract when duplicates appear.

**Interview Example:**

```java
// Method 1: Sliding Window with HashSet (Most Common)
public static int lengthOfLongestSubstring(String s) {
  Set<Character> set = new HashSet<>();
  int maxLength = 0;
  int left = 0;

  for (int right = 0; right < s.length(); right++) {
    // Remove characters from left until no duplicate
    while (set.contains(s.charAt(right))) {
      set.remove(s.charAt(left));
      left++;
    }

    set.add(s.charAt(right));
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
// Method 2: Optimized with HashMap (stores last index)
public static int lengthOfLongestSubstring2(String s) {
  Map<Character, Integer> map = new HashMap<>();
  int maxLength = 0;
  int left = 0;

  for (int right = 0; right < s.length(); right++) {
    char currentChar = s.charAt(right);

    // If char exists and is in current window
    if (map.containsKey(currentChar) && map.get(currentChar) >= left) {
      left = map.get(currentChar) + 1;
    }

    map.put(currentChar, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
// Test cases
System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3 ("abc")
System.out.println(lengthOfLongestSubstring("bbbbb")); // 1 ("b")
System.out.println(lengthOfLongestSubstring("pwwkew")); // 3 ("wke")
System.out.println(lengthOfLongestSubstring("")); // 0
System.out.println(lengthOfLongestSubstring("abcdef")); // 6
```

**Time Complexity:** O(n), **Space Complexity:** O(min(n, m)) where m is charset size.

## How to find all substrings of a given string?

Use **nested loops** to generate all possible substrings. Outer loop for start index, inner loop for end index.

**Interview Example:**

```java
// Method 1: Generate all substrings
public static List<String> getAllSubstrings(String str) {
  List<String> substrings = new ArrayList<>();

  for (int i = 0; i < str.length(); i++) {
    for (int j = i + 1; j <= str.length(); j++) {
      substrings.add(str.substring(i, j));
    }
  }

  return substrings;
}
// Method 2: Print all substrings
public static void printAllSubstrings(String str) {
  for (int i = 0; i < str.length(); i++) {
    for (int j = i + 1; j <= str.length(); j++) {
      System.out.println(str.substring(i, j));
    }
  }
}
// Test case
String s = "abc";
List<String> result = getAllSubstrings(s);
System.out.println(result); // Output: [a, ab, abc, b, bc, c]
// Count of substrings
System.out.println("Total substrings: " + result.size()); // 6
// Get unique substrings (remove duplicates)
public static Set<String> getUniqueSubstrings(String str) {
  Set<String> uniqueSubs = new HashSet<>();

  for (int i = 0; i < str.length(); i++) {
    for (int j = i + 1; j <= str.length(); j++) {
      uniqueSubs.add(str.substring(i, j));
    }
  }

  return uniqueSubs;
}
System.out.println(getUniqueSubstrings("aab")); // [a, aa, aab, ab, b]
```

**Time Complexity:** O(n³) - O(n²) to generate, O(n) to create each substring.

## How to count the number of substrings possible from a string of length n?

Use the **formula: n * (n + 1) / 2** where n is the string length. This counts all continuous substrings (contiguous subsequences).

**Interview Example:**

```java
// Formula-based approach
public static int countSubstrings(String str) {
  int n = str.length();
  return (n * (n + 1)) / 2;
}
// Verification by generating all substrings
public static int countSubstringsByGeneration(String str) {
  int count = 0;

  for (int i = 0; i < str.length(); i++) {
    for (int j = i + 1; j <= str.length(); j++) {
      count++;
    }
  }

  return count;
}
// Test cases
System.out.println(countSubstrings("abc")); // 6
System.out.println(countSubstrings("abcd")); // 10
System.out.println(countSubstrings("a")); // 1
// Explanation for "abc":
// Length 1: "a", "b", "c" = 3
// Length 2: "ab", "bc" = 2
// Length 3: "abc" = 1
// Total = 6 = (3 * 4) / 2
// Count unique substrings (considering duplicates)
public static int countUniqueSubstrings(String str) {
  Set<String> uniqueSubs = new HashSet<>();

  for (int i = 0; i < str.length(); i++) {
    for (int j = i + 1; j <= str.length(); j++) {
      uniqueSubs.add(str.substring(i, j));
    }
  }

  return uniqueSubs.size();
}
System.out.println(countUniqueSubstrings("aab")); // 5 (a, aa, aab, ab, b)
```

**Formula:** For string of length n: **n(n+1)/2** substrings.

## How to find all palindromic substrings in a string?

Use **expand around center** technique. For each character (and pair), expand outward while characters match.

**Interview Example:**

```java
// Method to find all palindromic substrings
public static List<String> findAllPalindromes(String s) {
  List<String> palindromes = new ArrayList<>();

  for (int i = 0; i < s.length(); i++) {
    // Odd length palindromes (center is single char)
    expandAroundCenter(s, i, i, palindromes);

    // Even length palindromes (center is between two chars)
    expandAroundCenter(s, i, i + 1, palindromes);
  }

  return palindromes;
}
private static void expandAroundCenter(String s, int left, int right,
  List<String> palindromes) {
  while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
    palindromes.add(s.substring(left, right + 1));
    left--;
    right++;
  }
}
// Count only (more efficient)
public static int countPalindromes(String s) {
  int count = 0;

  for (int i = 0; i < s.length(); i++) {
    count += expandAndCount(s, i, i); // Odd length
    count += expandAndCount(s, i, i + 1); // Even length
  }

  return count;
}
private static int expandAndCount(String s, int left, int right) {
  int count = 0;

  while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
    count++;
    left--;
    right++;
  }

  return count;
}
// Test cases
String s = "aab";
System.out.println(findAllPalindromes(s)); // [a, a, aa, b]
System.out.println(countPalindromes(s)); // 4
String s2 = "abc";
System.out.println(findAllPalindromes(s2)); // [a, b, c]
System.out.println(countPalindromes(s2)); // 3
```

**Time Complexity:** O(n²) - checking each center takes O(n).

## How to find the longest palindromic substring?

Use **expand around center** for each possible center (n centers for odd, n-1 for even). Track maximum length found.

**Interview Example:**

```java
// Method 1: Expand Around Center (Best for interviews)
public static String longestPalindrome(String s) {
  if (s == null || s.length() < 1) return "";

  int start = 0, end = 0;

  for (int i = 0; i < s.length(); i++) {
    // Check odd length palindromes
    int len1 = expandAroundCenter(s, i, i);

    // Check even length palindromes
    int len2 = expandAroundCenter(s, i, i + 1);

    int maxLen = Math.max(len1, len2);

    if (maxLen > end - start) {
      start = i - (maxLen - 1) / 2;
      end = i + maxLen / 2;
    }
  }

  return s.substring(start, end + 1);
}
private static int expandAroundCenter(String s, int left, int right) {
  while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
    left--;
    right++;
  }

  return right - left - 1; // Length of palindrome
}
// Method 2: Dynamic Programming (more complex but good to know)
public static String longestPalindromeDP(String s) {
  int n = s.length();
  boolean[][] dp = new boolean[n][n];
  int start = 0, maxLength = 1;

  // All substrings of length 1 are palindromes
  for (int i = 0; i < n; i++) {
    dp[i][i] = true;
  }

  // Check substrings of length 2
  for (int i = 0; i < n - 1; i++) {
    if (s.charAt(i) == s.charAt(i + 1)) {
      dp[i][i + 1] = true;
      start = i;
      maxLength = 2;
    }
  }

  // Check substrings of length 3 and more
  for (int len = 3; len <= n; len++) {
    for (int i = 0; i < n - len + 1; i++) {
      int j = i + len - 1;

      if (s.charAt(i) == s.charAt(j) && dp[i + 1][j - 1]) {
        dp[i][j] = true;
        start = i;
        maxLength = len;
      }
    }
  }

  return s.substring(start, start + maxLength);
}
// Test cases
System.out.println(longestPalindrome("babad")); // "bab" or "aba"
System.out.println(longestPalindrome("cbbd")); // "bb"
System.out.println(longestPalindrome("racecar")); // "racecar"
System.out.println(longestPalindrome("abc")); // "a"
```

**Time Complexity:** O(n²), **Space Complexity:** O(1) for expand method, O(n²) for DP.

## How to find the smallest window containing all characters of another string?

Use **sliding window with character frequency map**. Expand window to include all characters, then contract to find minimum.

**Interview Example:**

```java
public static String minWindow(String s, String t) {
  if (s.length() == 0 || t.length() == 0) return "";

  // Character frequency map for pattern
  Map<Character, Integer> targetMap = new HashMap<>();
  for (char c : t.toCharArray()) {
    targetMap.put(c, targetMap.getOrDefault(c, 0) + 1);
  }

  int required = targetMap.size();
  int formed = 0;

  Map<Character, Integer> windowMap = new HashMap<>();
  int left = 0, right = 0;

  // Result: [window length, left, right]
  int[] result = {-1, 0, 0};

  while (right < s.length()) {
    // Expand window
    char c = s.charAt(right);
    windowMap.put(c, windowMap.getOrDefault(c, 0) + 1);

    if (targetMap.containsKey(c) && windowMap.get(c).intValue() == targetMap.get(c).intValue()) {
      formed++;
    }

    // Contract window when all characters found
    while (left <= right && formed == required) {
      c = s.charAt(left);

      // Update result if smaller window found
      if (result[0] == -1 || right - left + 1 < result[0]) {
        result[0] = right - left + 1;
        result[1] = left;
        result[2] = right;
      }

      windowMap.put(c, windowMap.get(c) - 1);
      if (targetMap.containsKey(c) && windowMap.get(c) < targetMap.get(c)) {
        formed--;
      }

      left++;
    }

    right++;
  }

  return result[0] == -1 ? "" : s.substring(result[1], result[2] + 1);
}
// Test cases
System.out.println(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
System.out.println(minWindow("a", "a")); // "a"
System.out.println(minWindow("a", "aa")); // ""
System.out.println(minWindow("ab", "b")); // "b"
```

**Time Complexity:** O(|S| + |T|) where S and T are string lengths.

## How to check if one string is a subsequence of another?

Use **two pointers** approach. Traverse the main string and match characters of the subsequence in order.

**Interview Example:**

```java
// Method 1: Two Pointers (Most efficient)
public static boolean isSubsequence(String sub, String main) {
  int subIndex = 0;
  int mainIndex = 0;

  while (subIndex < sub.length() && mainIndex < main.length()) {
    if (sub.charAt(subIndex) == main.charAt(mainIndex)) {
      subIndex++;
    }
    mainIndex++;
  }

  return subIndex == sub.length();
}
// Method 2: Recursive approach
public static boolean isSubsequenceRecursive(String sub, String main,
  int subIdx, int mainIdx) {
  // If all characters of sub are matched
  if (subIdx == sub.length()) {
    return true;
  }

  // If main string exhausted
  if (mainIdx == main.length()) {
    return false;
  }

  // If current characters match, move both pointers
  if (sub.charAt(subIdx) == main.charAt(mainIdx)) {
    return isSubsequenceRecursive(sub, main, subIdx + 1, mainIdx + 1);
  }

  // Otherwise, move only main pointer
  return isSubsequenceRecursive(sub, main, subIdx, mainIdx + 1);
}
// Test cases
System.out.println(isSubsequence("abc", "aabbcc")); // true
System.out.println(isSubsequence("abc", "axbycz")); // true
System.out.println(isSubsequence("abc", "acb")); // false (order matters)
System.out.println(isSubsequence("ace", "abcde")); // true
System.out.println(isSubsequence("aec", "abcde")); // false
// Real-world example
String pattern = "git";
String text = "great interface technology";
System.out.println(isSubsequence(pattern, text)); // true
```

**Time Complexity:** O(n) where n is main string length, **Space Complexity:** O(1).

## How to find the longest common prefix in an array of strings?

Compare **characters vertically** across all strings or use **divide and conquer**. Stop when mismatch found.

**Interview Example:**

```java
// Method 1: Vertical Scanning (Best for interviews)
public static String longestCommonPrefix(String[] strs) {
  if (strs == null || strs.length == 0) return "";

  // Use first string as reference
  for (int i = 0; i < strs[0].length(); i++) {
    char c = strs[0].charAt(i);

    // Compare with all other strings
    for (int j = 1; j < strs.length; j++) {
      if (i >= strs[j].length() || strs[j].charAt(i) != c) {
        return strs[0].substring(0, i);
      }
    }
  }

  return strs[0];
}
// Method 2: Horizontal Scanning
public static String longestCommonPrefix2(String[] strs) {
  if (strs == null || strs.length == 0) return "";

  String prefix = strs[0];

  for (int i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) != 0) {
      prefix = prefix.substring(0, prefix.length() - 1);
      if (prefix.isEmpty()) return "";
    }
  }

  return prefix;
}
// Method 3: Using sorting (simple but less efficient)
public static String longestCommonPrefix3(String[] strs) {
  if (strs == null || strs.length == 0) return "";

  Arrays.sort(strs);
  String first = strs[0];
  String last = strs[strs.length - 1];

  int i = 0;
  while (i < first.length() && i < last.length() && first.charAt(i) == last.charAt(i)) {
    i++;
  }

  return first.substring(0, i);
}
// Test cases
String[] arr1 = {"flower", "flow", "flight"};
System.out.println(longestCommonPrefix(arr1)); // "fl"
String[] arr2 = {"dog", "racecar", "car"};
System.out.println(longestCommonPrefix(arr2)); // ""
String[] arr3 = {"interview", "internet", "internal"};
System.out.println(longestCommonPrefix(arr3)); // "inte"
String[] arr4 = {"a"};
System.out.println(longestCommonPrefix(arr4)); // "a"
```

**Time Complexity:** O(S) where S is sum of all characters in strings.

## How to find the edit distance (Levenshtein Distance) between two strings?

Use **Dynamic Programming** to calculate minimum operations (insert, delete, replace) needed to transform one string to another.

**Interview Example:**

```java
// Dynamic Programming approach (Best for interviews)
public static int editDistance(String str1, String str2) {
  int m = str1.length();
  int n = str2.length();

  // dp[i][j] = min operations to convert str1[0..i-1] to str2[0..j-1]
  int[][] dp = new int[m + 1][n + 1];

  // Base cases: empty string conversions
  for (int i = 0; i <= m; i++) {
    dp[i][0] = i; // Delete all characters
  }

  for (int j = 0; j <= n; j++) {
    dp[0][j] = j; // Insert all characters
  }

  // Fill the DP table
  for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
      if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
        // Characters match, no operation needed
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // Take minimum of three operations
        dp[i][j] = 1 + Math.min(dp[i - 1][j], // Delete
          Math.min(dp[i][j - 1], // Insert
            dp[i - 1][j - 1])); // Replace
      }
    }
  }

  return dp[m][n];
}
// Space optimized version (1D array)
public static int editDistanceOptimized(String str1, String str2) {
  int m = str1.length();
  int n = str2.length();

  int[] dp = new int[n + 1];

  for (int j = 0; j <= n; j++) {
    dp[j] = j;
  }

  for (int i = 1; i <= m; i++) {
    int prev = dp[0];
    dp[0] = i;

    for (int j = 1; j <= n; j++) {
      int temp = dp[j];

      if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));
      }

      prev = temp;
    }
  }

  return dp[n];
}
// Test cases
System.out.println(editDistance("horse", "ros")); // 3
// horse -> rorse (replace 'h' with 'r')
// rorse -> rose (remove 'r')
// rose -> ros (remove 'e')
System.out.println(editDistance("intention", "execution")); // 5
System.out.println(editDistance("sunday", "saturday")); // 3
System.out.println(editDistance("", "abc")); // 3
System.out.println(editDistance("abc", "")); // 3
System.out.println(editDistance("abc", "abc")); // 0
```
