
const arr = Array.apply(null, new Array(10));

for (const i in arr) 
    arr[i] = "abc";
console.log(arr);