// Implementation 1: Iterative approach using a for loop
var sum_to_n_a = function(n) {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) sum += i;
    return sum;
};

// Implementation 2: Mathematical formula approach
// Uses the formula: n * (n + 1) / 2
var sum_to_n_b = function(n) {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
};

// Implementation 3: Recursive approach with stack overflow protection
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    // For large numbers, use mathematical formula to avoid stack overflow
    if (n > 10000) {
        return (n * (n + 1)) / 2;
    }
    
    return n + sum_to_n_c(n - 1);
};

let n = -1;
console.log(sum_to_n_a(n));
console.log(sum_to_n_b(n));
console.log(sum_to_n_c(n));

n = 1000000000;
console.log(sum_to_n_a(n));
console.log(sum_to_n_b(n));
console.log(sum_to_n_c(n));