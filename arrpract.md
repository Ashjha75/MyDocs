---
title: array practice
---

```java
import java.util.Arrays;
import java.util.stream.IntStream;

class Main {
    public static void main(String[] args) {
        int[] arr1 = {1, 2, 6, 3, 0, 1, 4, 88};
        int[] arr2 = {1, 0, 7, 1, 1, 4, 9, 19};
        int[] result = new int[arr1.length + arr2.length];

        // -----------------------Concat-----------------------------
        // int[] result = IntStream.concat(Arrays.stream(arr1), Arrays.stream(arr2))
        //                         .toArray();

        // for(int i =0 ;i<arr1.length;i++){
        //     result[i]=arr1[i];
        // }
        //  for(int i =0 ;i<arr2.length;i++){
        //     result[arr1.length + i]=arr2[i];
        // }



        // Print result to verify
        System.out.println(Arrays.toString(result));
    }
}
```