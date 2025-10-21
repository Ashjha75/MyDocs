---
title: "Java String Interview Questions and Solutions"
---
## 1. Reverse Words in a String (LeetCode #151)

**Problem:** Reverse the order of words in a string, removing extra spaces.[1][2]

**Interview Solution:**
```java
// Approach: Split, reverse, join
public String reverseWords(String s) {
    // Trim and split by whitespace
    String[] words = s.trim().split("\\s+");
    
    // Reverse the array
    int left = 0, right = words.length - 1;
    while (left < right) {
        String temp = words[left];
        words[left] = words[right];
        words[right] = temp;
        left++;
        right--;
    }
    
    return String.join(" ", words);
}

// Optimized: O(1) space (excluding output)
public String reverseWords2(String s) {
    StringBuilder result = new StringBuilder();
    int i = s.length() - 1;
    
    while (i >= 0) {
        // Skip spaces
        while (i >= 0 && s.charAt(i) == ' ') i--;
        
        // Find word end
        int j = i;
        
        // Find word start
        while (i >= 0 && s.charAt(i) != ' ') i--;
        
        // Append word
        if (j >= 0) {
            if (result.length() > 0) result.append(" ");
            result.append(s.substring(i + 1, j + 1));
        }
    }
    
    return result.toString();
}

// Test
System.out.println(reverseWords("  hello world  ")); // "world hello"
System.out.println(reverseWords("the sky is blue")); // "blue is sky the"
```

**Time:** O(n), **Space:** O(n)[1]

## 2. Longest Substring Without Repeating Characters (LeetCode #3)

**Problem:** Find length of longest substring without repeating characters.

**Interview Solution:**
```java
// Sliding Window with HashSet
public int lengthOfLongestSubstring(String s) {
    Set<Character> set = new HashSet<>();
    int maxLength = 0;
    int left = 0;
    
    for (int right = 0; right < s.length(); right++) {
        // Remove duplicates from left
        while (set.contains(s.charAt(right))) {
            set.remove(s.charAt(left));
            left++;
        }
        
        set.add(s.charAt(right));
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Optimized with HashMap (stores last index)
public int lengthOfLongestSubstring2(String s) {
    Map<Character, Integer> map = new HashMap<>();
    int maxLength = 0;
    int left = 0;
    
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        
        if (map.containsKey(c) && map.get(c) >= left) {
            left = map.get(c) + 1;
        }
        
        map.put(c, right);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Test
System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3
System.out.println(lengthOfLongestSubstring("pwwkew")); // 3
```

**Time:** O(n), **Space:** O(min(n, m)) where m is charset size

## 3. Valid Parentheses (LeetCode #20)

**Problem:** Check if string of brackets is valid and properly closed.

**Interview Solution:**
```java
public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else {
            if (stack.isEmpty()) return false;
            
            char top = stack.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    
    return stack.isEmpty();
}

// Cleaner with Map
public boolean isValid2(String s) {
    if (s.length() % 2 != 0) return false;
    
    Map<Character, Character> pairs = new HashMap<>();
    pairs.put(')', '(');
    pairs.put('}', '{');
    pairs.put(']', '[');
    
    Stack<Character> stack = new Stack<>();
    
    for (char c : s.toCharArray()) {
        if (pairs.containsKey(c)) {
            if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
                return false;
            }
        } else {
            stack.push(c);
        }
    }
    
    return stack.isEmpty();
}

// Test
System.out.println(isValid("()")); // true
System.out.println(isValid("()[]{}")); // true
System.out.println(isValid("(]")); // false
```

**Time:** O(n), **Space:** O(n)

## 4. Longest Palindromic Substring (LeetCode #5)

**Problem:** Find the longest palindrome substring.

**Interview Solution:**
```java
// Expand Around Center approach
public String longestPalindrome(String s) {
    if (s == null || s.length() < 1) return "";
    
    int start = 0, end = 0;
    
    for (int i = 0; i < s.length(); i++) {
        int len1 = expandAroundCenter(s, i, i);     // Odd length
        int len2 = expandAroundCenter(s, i, i + 1); // Even length
        int maxLen = Math.max(len1, len2);
        
        if (maxLen > end - start) {
            start = i - (maxLen - 1) / 2;
            end = i + maxLen / 2;
        }
    }
    
    return s.substring(start, end + 1);
}

private int expandAroundCenter(String s, int left, int right) {
    while (left >= 0 && right < s.length() && 
           s.charAt(left) == s.charAt(right)) {
        left--;
        right++;
    }
    
    return right - left - 1;
}

// Test
System.out.println(longestPalindrome("babad")); // "bab" or "aba"
System.out.println(longestPalindrome("cbbd")); // "bb"
```

**Time:** O(n²), **Space:** O(1)

## 5. Group Anagrams (LeetCode #49)

**Problem:** Group strings that are anagrams of each other.

**Interview Solution:**
```java
// Using sorted string as key
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    
    for (String str : strs) {
        char[] chars = str.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        
        map.putIfAbsent(key, new ArrayList<>());
        map.get(key).add(str);
    }
    
    return new ArrayList<>(map.values());
}

// Using character count as key (faster)
public List<List<String>> groupAnagrams2(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    
    for (String str : strs) {
        int[] count = new int[26];
        for (char c : str.toCharArray()) {
            count[c - 'a']++;
        }
        
        String key = Arrays.toString(count);
        map.putIfAbsent(key, new ArrayList<>());
        map.get(key).add(str);
    }
    
    return new ArrayList<>(map.values());
}

// Test
String[] strs = {"eat", "tea", "tan", "ate", "nat", "bat"};
System.out.println(groupAnagrams(strs));
// Output: [[eat, tea, ate], [tan, nat], [bat]]
```

**Time:** O(n × k log k) for sorting, O(n × k) for counting. **Space:** O(n × k)

## 6. Minimum Window Substring (LeetCode #76)

**Problem:** Find minimum window in s that contains all characters of t.

**Interview Solution:**
```java
public String minWindow(String s, String t) {
    if (s.length() < t.length()) return "";
    
    Map<Character, Integer> targetMap = new HashMap<>();
    for (char c : t.toCharArray()) {
        targetMap.put(c, targetMap.getOrDefault(c, 0) + 1);
    }
    
    int required = targetMap.size();
    int formed = 0;
    
    Map<Character, Integer> windowMap = new HashMap<>();
    int left = 0, right = 0;
    int minLen = Integer.MAX_VALUE;
    int minLeft = 0, minRight = 0;
    
    while (right < s.length()) {
        char c = s.charAt(right);
        windowMap.put(c, windowMap.getOrDefault(c, 0) + 1);
        
        if (targetMap.containsKey(c) && 
            windowMap.get(c).intValue() == targetMap.get(c).intValue()) {
            formed++;
        }
        
        while (left <= right && formed == required) {
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minLeft = left;
                minRight = right;
            }
            
            char leftChar = s.charAt(left);
            windowMap.put(leftChar, windowMap.get(leftChar) - 1);
            
            if (targetMap.containsKey(leftChar) && 
                windowMap.get(leftChar) < targetMap.get(leftChar)) {
                formed--;
            }
            
            left++;
        }
        
        right++;
    }
    
    return minLen == Integer.MAX_VALUE ? "" : 
           s.substring(minLeft, minRight + 1);
}

// Test
System.out.println(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
```

**Time:** O(|S| + |T|), **Space:** O(|S| + |T|)

## 7. Implement strStr() (LeetCode #28)

**Problem:** Return index of first occurrence of needle in haystack.

**Interview Solution:**
```java
// Brute Force
public int strStr(String haystack, String needle) {
    if (needle.isEmpty()) return 0;
    
    int n = haystack.length();
    int m = needle.length();
    
    for (int i = 0; i <= n - m; i++) {
        int j = 0;
        while (j < m && haystack.charAt(i + j) == needle.charAt(j)) {
            j++;
        }
        
        if (j == m) return i;
    }
    
    return -1;
}

// Using built-in
public int strStr2(String haystack, String needle) {
    return haystack.indexOf(needle);
}

// Test
System.out.println(strStr("hello", "ll")); // 2
System.out.println(strStr("aaaaa", "bba")); // -1
```

**Time:** O(n × m), **Space:** O(1)

## 8. Valid Anagram (LeetCode #242)

**Problem:** Check if two strings are anagrams.

**Interview Solution:**
```java
// Using sorting
public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    
    char[] sArr = s.toCharArray();
    char[] tArr = t.toCharArray();
    
    Arrays.sort(sArr);
    Arrays.sort(tArr);
    
    return Arrays.equals(sArr, tArr);
}

// Using frequency count
public boolean isAnagram2(String s, String t) {
    if (s.length() != t.length()) return false;
    
    int[] count = new int[26];
    
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }
    
    for (int c : count) {
        if (c != 0) return false;
    }
    
    return true;
}

// Test
System.out.println(isAnagram("anagram", "nagaram")); // true
System.out.println(isAnagram("rat", "car")); // false
```

**Time:** O(n log n) sorting, O(n) counting. **Space:** O(1)

## 9. Count and Say (LeetCode #38)

**Problem:** Generate the nth term of count-and-say sequence.[3][4]

**Interview Solution:**
```java
public String countAndSay(int n) {
    if (n == 1) return "1";
    
    String prev = countAndSay(n - 1);
    StringBuilder result = new StringBuilder();
    
    int count = 1;
    for (int i = 1; i < prev.length(); i++) {
        if (prev.charAt(i) == prev.charAt(i - 1)) {
            count++;
        } else {
            result.append(count).append(prev.charAt(i - 1));
            count = 1;
        }
    }
    
    // Append last group
    result.append(count).append(prev.charAt(prev.length() - 1));
    
    return result.toString();
}

// Iterative version
public String countAndSay2(int n) {
    String result = "1";
    
    for (int i = 1; i < n; i++) {
        StringBuilder sb = new StringBuilder();
        int count = 1;
        
        for (int j = 1; j < result.length(); j++) {
            if (result.charAt(j) == result.charAt(j - 1)) {
                count++;
            } else {
                sb.append(count).append(result.charAt(j - 1));
                count = 1;
            }
        }
        
        sb.append(count).append(result.charAt(result.length() - 1));
        result = sb.toString();
    }
    
    return result;
}

// Test
System.out.println(countAndSay(1)); // "1"
System.out.println(countAndSay(4)); // "1211"
// 1 -> 11 -> 21 -> 1211
```

**Time:** O(2^n), **Space:** O(2^n)[4][3]

## 10. String Compression (LeetCode #443)

**Problem:** Compress array of characters in-place.

**Interview Solution:**
```java
public int compress(char[] chars) {
    int write = 0;
    int i = 0;
    
    while (i < chars.length) {
        char current = chars[i];
        int count = 0;
        
        // Count consecutive characters
        while (i < chars.length && chars[i] == current) {
            i++;
            count++;
        }
        
        // Write character
        chars[write++] = current;
        
        // Write count if > 1
        if (count > 1) {
            for (char c : String.valueOf(count).toCharArray()) {
                chars[write++] = c;
            }
        }
    }
    
    return write;
}

// Test
char[] chars = {'a', 'a', 'b', 'b', 'c', 'c', 'c'};
int len = compress(chars);
System.out.println(Arrays.toString(Arrays.copyOf(chars, len)));
// Output: [a, 2, b, 2, c, 3]
```

**Time:** O(n), **Space:** O(1)

## 11. Word Pattern (LeetCode #290)

**Problem:** Check if string follows the same pattern.[5][6][7]

**Interview Solution:**
```java
public boolean wordPattern(String pattern, String s) {
    String[] words = s.split(" ");
    
    if (pattern.length() != words.length) return false;
    
    Map<Character, String> charToWord = new HashMap<>();
    Map<String, Character> wordToChar = new HashMap<>();
    
    for (int i = 0; i < pattern.length(); i++) {
        char c = pattern.charAt(i);
        String word = words[i];
        
        // Check char -> word mapping
        if (charToWord.containsKey(c)) {
            if (!charToWord.get(c).equals(word)) {
                return false;
            }
        } else {
            charToWord.put(c, word);
        }
        
        // Check word -> char mapping (bijection)
        if (wordToChar.containsKey(word)) {
            if (wordToChar.get(word) != c) {
                return false;
            }
        } else {
            wordToChar.put(word, c);
        }
    }
    
    return true;
}

// Test
System.out.println(wordPattern("abba", "dog cat cat dog")); // true
System.out.println(wordPattern("abba", "dog cat cat fish")); // false
```

**Time:** O(n), **Space:** O(n)[7]

## 12. Isomorphic Strings (LeetCode #205)

**Problem:** Check if two strings are isomorphic (one-to-one character mapping).

**Interview Solution:**
```java
public boolean isIsomorphic(String s, String t) {
    if (s.length() != t.length()) return false;
    
    Map<Character, Character> mapS = new HashMap<>();
    Map<Character, Character> mapT = new HashMap<>();
    
    for (int i = 0; i < s.length(); i++) {
        char c1 = s.charAt(i);
        char c2 = t.charAt(i);
        
        if (mapS.containsKey(c1)) {
            if (mapS.get(c1) != c2) return false;
        } else {
            mapS.put(c1, c2);
        }
        
        if (mapT.containsKey(c2)) {
            if (mapT.get(c2) != c1) return false;
        } else {
            mapT.put(c2, c1);
        }
    }
    
    return true;
}

// Using arrays (for ASCII)
public boolean isIsomorphic2(String s, String t) {
    int[] mapS = new int[256];
    int[] mapT = new int[256];
    
    for (int i = 0; i < s.length(); i++) {
        if (mapS[s.charAt(i)] != mapT[t.charAt(i)]) {
            return false;
        }
        
        mapS[s.charAt(i)] = i + 1;
        mapT[t.charAt(i)] = i + 1;
    }
    
    return true;
}

// Test
System.out.println(isIsomorphic("egg", "add")); // true
System.out.println(isIsomorphic("foo", "bar")); // false
System.out.println(isIsomorphic("paper", "title")); // true
```

**Time:** O(n), **Space:** O(1) for array version

## 13. Longest Common Prefix (LeetCode #14)

**Problem:** Find longest common prefix among array of strings.

**Interview Solution:**
```java
// Vertical scanning
public String longestCommonPrefix(String[] strs) {
    if (strs == null || strs.length == 0) return "";
    
    for (int i = 0; i < strs[0].length(); i++) {
        char c = strs[0].charAt(i);
        
        for (int j = 1; j < strs.length; j++) {
            if (i >= strs[j].length() || strs[j].charAt(i) != c) {
                return strs[0].substring(0, i);
            }
        }
    }
    
    return strs[0];
}

// Using sorting
public String longestCommonPrefix2(String[] strs) {
    if (strs == null || strs.length == 0) return "";
    
    Arrays.sort(strs);
    String first = strs[0];
    String last = strs[strs.length - 1];
    
    int i = 0;
    while (i < first.length() && i < last.length() && 
           first.charAt(i) == last.charAt(i)) {
        i++;
    }
    
    return first.substring(0, i);
}

// Test
String[] strs = {"flower", "flow", "flight"};
System.out.println(longestCommonPrefix(strs)); // "fl"
```

**Time:** O(S) where S is sum of all characters, **Space:** O(1)

## 14. Check if String is Rotation of Another

**Problem:** Check if str2 is rotation of str1 (e.g., "waterbottle" is rotation of "erbottlewat").

**Interview Solution:**
```java
public boolean isRotation(String s1, String s2) {
    if (s1 == null || s2 == null) return false;
    if (s1.length() != s2.length()) return false;
    
    // Key insight: rotation exists in concatenated string
    String doubled = s1 + s1;
    return doubled.contains(s2);
}

// Manual check without contains()
public boolean isRotation2(String s1, String s2) {
    if (s1.length() != s2.length() || s1.isEmpty()) {
        return false;
    }
    
    String doubled = s1 + s1;
    
    for (int i = 0; i <= doubled.length() - s2.length(); i++) {
        boolean found = true;
        for (int j = 0; j < s2.length(); j++) {
            if (doubled.charAt(i + j) != s2.charAt(j)) {
                found = false;
                break;
            }
        }
        if (found) return true;
    }
    
    return false;
}

// Test
System.out.println(isRotation("waterbottle", "erbottlewat")); // true
System.out.println(isRotation("hello", "lohel")); // true
System.out.println(isRotation("hello", "world")); // false
```

**Time:** O(n), **Space:** O(n)

## 15. Remove Adjacent Duplicates in String

**Problem:** Remove all adjacent duplicate characters.

**Interview Solution:**
```java
// Using Stack
public String removeDuplicates(String s) {
    Stack<Character> stack = new Stack<>();
    
    for (char c : s.toCharArray()) {
        if (!stack.isEmpty() && stack.peek() == c) {
            stack.pop();
        } else {
            stack.push(c);
        }
    }
    
    StringBuilder result = new StringBuilder();
    for (char c : stack) {
        result.append(c);
    }
    
    return result.toString();
}

// Using StringBuilder (more efficient)
public String removeDuplicates2(String s) {
    StringBuilder sb = new StringBuilder();
    
    for (char c : s.toCharArray()) {
        int len = sb.length();
        if (len > 0 && sb.charAt(len - 1) == c) {
            sb.deleteCharAt(len - 1);
        } else {
            sb.append(c);
        }
    }
    
    return sb.toString();
}

// Remove all duplicates (advanced version with k duplicates)
public String removeDuplicates(String s, int k) {
    Stack<int[]> stack = new Stack<>(); // [char, count]
    
    for (char c : s.toCharArray()) {
        if (!stack.isEmpty() && stack.peek()[0] == c) {
            stack.peek()[1]++;
            if (stack.peek()[1] == k) {
                stack.pop();
            }
        } else {
            stack.push(new int[]{c, 1});
        }
    }
    
    StringBuilder result = new StringBuilder();
    for (int[] pair : stack) {
        for (int i = 0; i < pair[1]; i++) {
            result.append((char) pair[0]);
        }
    }
    
    return result.toString();
}

// Test
System.out.println(removeDuplicates("abbaca")); // "ca"
System.out.println(removeDuplicates("azxxzy")); // "ay"
System.out.println(removeDuplicates("deeedbbcccbdaa", 3)); // "aa"
```

**Time:** O(n), **Space:** O(n)

---

