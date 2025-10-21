---
title: "String Comparison Operations"
---
## How do you compare two strings ignoring case (equalsIgnoreCase())?

**equalsIgnoreCase()** compares two strings **content-wise** while **ignoring case differences**. It returns **boolean** (true if equal ignoring case, false otherwise).

**Interview Example:**

java

`String s1 =  "Java";  String s2 =  "JAVA";  String s3 =  "java";  String s4 =  "Python";  
System.out.println(s1.equalsIgnoreCase(s2));  // true  System.out.println(s1.equalsIgnoreCase(s3));  // true  System.out.println(s1.equalsIgnoreCase(s4));  // false  
// Case-sensitive vs case-insensitive  System.out.println(s1.equals(s2));  // false (case matters)  System.out.println(s1.equalsIgnoreCase(s2));  // true (case ignored)  
// Practical use case - user input validation  String userInput =  "YES";  if  (userInput.equalsIgnoreCase("yes"))  {   System.out.println("User confirmed");  // Executes  }  
// Email comparison  String email1 =  "User@Example.COM";  String email2 =  "user@example.com";  System.out.println(email1.equalsIgnoreCase(email2));  // true` 

## How to check if a string is empty or blank?

Use **isEmpty()** (Java 6+) to check for empty strings ("") or **isBlank()** (Java 11+) to check for empty or whitespace-only strings. Both return **boolean**.

**Interview Example:**

java

`String s1 =  "";  String s2 =  "   ";  String s3 =  "Hello";  
// isEmpty() - checks length == 0  System.out.println(s1.isEmpty());  // true  System.out.println(s2.isEmpty());  // false (contains spaces)  System.out.println(s3.isEmpty());  // false  
// isBlank() - checks empty or only whitespace (Java 11+)  System.out.println(s1.isBlank());  // true  System.out.println(s2.isBlank());  // true (only whitespace)  System.out.println(s3.isBlank());  // false  
// Null-safe check (pre-Java 11)  String s4 =  null;  if  (s4 !=  null  &&  !s4.isEmpty())  {   System.out.println("Valid string");  }  
// Modern null-safe check (Java 11+)  if  (s4 !=  null  &&  !s4.isBlank())  {   System.out.println("Valid non-blank string");  }` 

## What is the difference between isEmpty() and isBlank()?

**isEmpty()** (Java 6+) returns true only for **zero-length strings**. **isBlank()** (Java 11+) returns true for **zero-length or whitespace-only strings**.[baeldung+2](https://www.baeldung.com/java-string-isempty-vs-isblank)​

**Interview Example:**

java

`String s1 =  "";  // empty  String s2 =  "   ";  // spaces  String s3 =  "\t\n";  // tab and newline  String s4 =  "Hello";  // content  
// isEmpty() - checks length() == 0 only  System.out.println(s1.isEmpty());  // true  System.out.println(s2.isEmpty());  // false (has characters)  System.out.println(s3.isEmpty());  // false (has characters)  System.out.println(s4.isEmpty());  // false  
// isBlank() - checks empty OR only whitespace  System.out.println(s1.isBlank());  // true  System.out.println(s2.isBlank());  // true (only spaces)  System.out.println(s3.isBlank());  // true (only whitespace)  System.out.println(s4.isBlank());  // false  
// Comparison table  // isEmpty()  | isBlank()  | String  // -----------|------------|--------  // true       | true       | ""  // false      | true       | "   "  // false      | true       | "\t\n"  // false      | false      | "Hello"` 

**Key Difference:** isEmpty() checks **length only**, isBlank() checks **length and whitespace**.[bootcamptoprod+1](https://bootcamptoprod.com/java-string-isempty-vs-isblank/)​

## How to check if one string is a rotation of another?

Check if **str2 is a substring** of **(str1 + str1)**. If lengths are equal and str2 exists in concatenated str1, it's a rotation.

**Interview Example:**

java

`// Method to check rotation  public  static  boolean  isRotation(String str1,  String str2)  {   // Check lengths are equal and not empty   if  (str1.length()  != str2.length()  || str1.isEmpty())  {   return  false;   }     
  // Concatenate str1 with itself   String concatenated = str1 + str1;     
  // Check if str2 is substring of concatenated   return concatenated.contains(str2);  }  
// Test cases  String s1 =  "waterbottle";  String s2 =  "erbottlewat";  String s3 =  "bottlewater";  
System.out.println(isRotation(s1, s2));  // true  System.out.println(isRotation(s1, s3));  // true  System.out.println(isRotation(s1,  "bottle"));  // false (different length)  
// How it works:  // s1 = "waterbottle"  // s1 + s1 = "waterbottlewaterbottle"  // s2 = "erbottlewat" is present in concatenated string ✓  
// Another example  System.out.println(isRotation("abcde",  "cdeab"));  // true  System.out.println(isRotation("abcde",  "abced"));  // false` 

## How to check if two strings are anagrams?

**Anagrams** have the same characters with same frequencies. **Sort both strings** and compare, or **count character frequencies** using arrays/maps.

**Interview Example:**

java

`// Method 1: Using sorting (easiest)  public  static  boolean  isAnagram1(String s1,  String s2)  {   if  (s1.length()  != s2.length())  {   return  false;   }     
  char[] arr1 = s1.toCharArray();   char[] arr2 = s2.toCharArray();     
  Arrays.sort(arr1);   Arrays.sort(arr2);     
  return  Arrays.equals(arr1, arr2);  }  
// Method 2: Using character frequency (more efficient)  public  static  boolean  isAnagram2(String s1,  String s2)  {   if  (s1.length()  != s2.length())  {   return  false;   }     
  int[] charCount =  new  int[256];  // ASCII     
  for  (int i =  0; i < s1.length(); i++)  {  charCount[s1.charAt(i)]++;  charCount[s2.charAt(i)]--;   }     
  for  (int count : charCount)  {   if  (count !=  0)  {   return  false;   }   }     
  return  true;  }  
// Test cases  System.out.println(isAnagram1("listen",  "silent"));  // true  System.out.println(isAnagram1("hello",  "world"));  // false  System.out.println(isAnagram1("triangle",  "integral"));  // true  
// Case-insensitive anagram check  String s1 =  "Listen";  String s2 =  "Silent";  System.out.println(isAnagram1(s1.toLowerCase(), s2.toLowerCase()));  // true` 

## How to check if a string is a palindrome?

A **palindrome** reads the same forwards and backwards. Compare string with its **reverse** or use **two-pointer technique**.

**Interview Example:**

java

`// Method 1: Using reverse  public  static  boolean  isPalindrome1(String str)  {   String reversed =  new  StringBuilder(str).reverse().toString();   return str.equals(reversed);  }  
// Method 2: Two-pointer approach (more efficient)  public  static  boolean  isPalindrome2(String str)  {   int left =  0;   int right = str.length()  -  1;     
  while  (left < right)  {   if  (str.charAt(left)  != str.charAt(right))  {   return  false;   }  left++;  right--;   }     
  return  true;  }  
// Test cases  System.out.println(isPalindrome1("racecar"));  // true  System.out.println(isPalindrome1("hello"));  // false  System.out.println(isPalindrome1("madam"));  // true  System.out.println(isPalindrome1("a"));  // true  System.out.println(isPalindrome1(""));  // true  
// Ignore case and spaces  public  static  boolean  isPalindromeIgnoreCase(String str)  {   String cleaned = str.toLowerCase().replaceAll("[^a-z0-9]",  "");   return  isPalindrome2(cleaned);  }  
System.out.println(isPalindromeIgnoreCase("A man a plan a canal Panama"));  // true  System.out.println(isPalindromeIgnoreCase("race a car"));  // false` 

## How to reverse words in a sentence?

**Split** the sentence into words, then **reverse the array** and **join** them back, or use a **stack/collections** approach.

**Interview Example:**

java

`// Method 1: Using split and reverse array  public  static  String  reverseWords1(String str)  {   String[] words = str.trim().split("\\s+");   StringBuilder result =  new  StringBuilder();     
  for  (int i = words.length -  1; i >=  0; i--)  {  result.append(words[i]);   if  (i !=  0)  {  result.append(" ");   }   }     
  return result.toString();  }  
// Method 2: Using Collections.reverse  public  static  String  reverseWords2(String str)  {   String[] words = str.trim().split("\\s+");   List<String> wordList =  Arrays.asList(words);   Collections.reverse(wordList);   return  String.join(" ", wordList);  }  
// Method 3: Using Stack  public  static  String  reverseWords3(String str)  {   String[] words = str.trim().split("\\s+");   Stack<String> stack =  new  Stack<>();     
  for  (String word : words)  {  stack.push(word);   }     
  StringBuilder result =  new  StringBuilder();   while  (!stack.isEmpty())  {  result.append(stack.pop());   if  (!stack.isEmpty())  {  result.append(" ");   }   }     
  return result.toString();  }  
// Test cases  String input =  "Java is awesome";  System.out.println(reverseWords1(input));  // "awesome is Java"  
String input2 =  "  Hello   World  ";  System.out.println(reverseWords2(input2));  // "World Hello"  
String input3 =  "One Two Three Four";  System.out.println(reverseWords3(input3));  // "Four Three Two One"` 

## How to count frequency of characters in a string?

Use **HashMap** or **array** (for ASCII/Unicode) to store character counts. HashMap is preferred for readability and non-ASCII characters.

**Interview Example:**

java

`// Method 1: Using HashMap  public  static  Map<Character,  Integer>  countFrequency1(String str)  {   Map<Character,  Integer> freqMap =  new  HashMap<>();     
  for  (char ch : str.toCharArray())  {  freqMap.put(ch, freqMap.getOrDefault(ch,  0)  +  1);   }     
  return freqMap;  }  
// Method 2: Using array (for ASCII only)  public  static  void  countFrequency2(String str)  {   int[] freq =  new  int[256];  // ASCII     
  for  (char ch : str.toCharArray())  {  freq[ch]++;   }     
  for  (int i =  0; i <  256; i++)  {   if  (freq[i]  >  0)  {   System.out.println((char)i +  ": "  + freq[i]);   }   }  }  
// Test case  String str =  "programming";  Map<Character,  Integer> result =  countFrequency1(str);  
for  (Map.Entry<Character,  Integer> entry : result.entrySet())  {   System.out.println(entry.getKey()  +  ": "  + entry.getValue());  }  // Output: p:1, r:2, o:1, g:2, a:1, m:2, i:1, n:1  
// Java 8+ using Streams  Map<Character,  Long> freqStream = str.chars()   .mapToObj(c ->  (char) c)   .collect(Collectors.groupingBy(c -> c,  Collectors.counting()));  
System.out.println(freqStream);  // {p=1, r=2, o=1, g=2, a=1, m=2, i=1, n=1}` 

## How to remove duplicate characters from a string?

Use **LinkedHashSet** to maintain insertion order while removing duplicates, or use **StringBuilder with contains check**.

**Interview Example:**

java

`// Method 1: Using LinkedHashSet (preserves order, best approach)  public  static  String  removeDuplicates1(String str)  {   LinkedHashSet<Character> set =  new  LinkedHashSet<>();     
  for  (char ch : str.toCharArray())  {  set.add(ch);   }     
  StringBuilder result =  new  StringBuilder();   for  (char ch : set)  {  result.append(ch);   }     
  return result.toString();  }  
// Method 2: Using StringBuilder with indexOf  public  static  String  removeDuplicates2(String str)  {   StringBuilder result =  new  StringBuilder();     
  for  (char ch : str.toCharArray())  {   if  (result.indexOf(String.valueOf(ch))  ==  -1)  {  result.append(ch);   }   }     
  return result.toString();  }  
// Method 3: Using Java 8 Streams  public  static  String  removeDuplicates3(String str)  {   return str.chars()   .distinct()   .mapToObj(c ->  String.valueOf((char) c))   .collect(Collectors.joining());  }  
// Test cases  String input =  "programming";  System.out.println(removeDuplicates1(input));  // "progamin"  
String input2 =  "aabbccdd";  System.out.println(removeDuplicates2(input2));  // "abcd"  
String input3 =  "hello world";  System.out.println(removeDuplicates3(input3));  // "helo wrd"  
// Preserve first occurrence  String test =  "banana";  System.out.println(removeDuplicates1(test));  // "ban"` 

## How to find the first non-repeating character in a string?

Use **LinkedHashMap** to maintain insertion order with frequency count, then find first character with count = 1.

**Interview Example:**

java

`// Method 1: Using LinkedHashMap (best for interview)  public  static  Character  firstNonRepeating1(String str)  {   Map<Character,  Integer> freqMap =  new  LinkedHashMap<>();     
  // Count frequencies   for  (char ch : str.toCharArray())  {  freqMap.put(ch, freqMap.getOrDefault(ch,  0)  +  1);   }     
  // Find first with count = 1   for  (Map.Entry<Character,  Integer> entry : freqMap.entrySet())  {   if  (entry.getValue()  ==  1)  {   return entry.getKey();   }   }     
  return  null;  // No non-repeating character  }  
// Method 2: Two-pass with array (efficient for ASCII)  public  static  Character  firstNonRepeating2(String str)  {   int[] freq =  new  int[256];     
  // First pass: count frequencies   for  (char ch : str.toCharArray())  {  freq[ch]++;   }     
  // Second pass: find first with count = 1   for  (char ch : str.toCharArray())  {   if  (freq[ch]  ==  1)  {   return ch;   }   }     
  return  null;  }  
// Method 3: Using Java 8 Streams  public  static  Character  firstNonRepeating3(String str)  {   return str.chars()   .mapToObj(c ->  (char) c)   .collect(Collectors.groupingBy(c -> c,  LinkedHashMap::new,   Collectors.counting()))   .entrySet()   .stream()   .filter(entry -> entry.getValue()  ==  1)   .map(Map.Entry::getKey)   .findFirst()   .orElse(null);  }  
// Test cases  String s1 =  "programming";  System.out.println(firstNonRepeating1(s1));  // 'p'  
String s2 =  "aabbcc";  System.out.println(firstNonRepeating2(s2));  // null  
String s3 =  "swiss";  System.out.println(firstNonRepeating1(s3));  // 'w'  
String s4 =  "aabbcdeff";  System.out.println(firstNonRepeating2(s4));  // 'c'  
// Get index of first non-repeating character  String test =  "leetcode";  Character result =  firstNonRepeating1(test);  if  (result !=  null)  {   System.out.println("Index: "  + test.indexOf(result));  // Index: 0 ('l')  }` 

