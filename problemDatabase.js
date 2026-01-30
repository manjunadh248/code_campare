/**
 * problemDatabase.js - Static Problem Mappings for CodeCompare
 * Contains curated problem data across platforms for matching
 */

const CodeCompareProblemDB = (() => {
    'use strict';

    // Platform identifiers
    const PLATFORMS = {
        LEETCODE: 'leetcode',
        GFG: 'geeksforgeeks',
        CODEFORCES: 'codeforces',
        HACKERRANK: 'hackerrank'
    };

    // Curated problem database with equivalent/similar problems across platforms
    const PROBLEMS = [
        // === TWO SUM FAMILY ===
        {
            id: 'leetcode:1', platform: 'leetcode', title: 'Two Sum',
            url: 'https://leetcode.com/problems/two-sum/',
            tags: ['array', 'hash-table'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:key-pair', platform: 'geeksforgeeks', title: 'Key Pair',
            url: 'https://www.geeksforgeeks.org/problems/key-pair/1',
            tags: ['array', 'hashing', 'searching'], difficulty: 'basic',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'hackerrank:pairs', platform: 'hackerrank', title: 'Pairs',
            url: 'https://www.hackerrank.com/challenges/pairs/problem',
            tags: ['search', 'arrays'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === MERGE SORTED ARRAYS ===
        {
            id: 'leetcode:88', platform: 'leetcode', title: 'Merge Sorted Array',
            url: 'https://leetcode.com/problems/merge-sorted-array/',
            tags: ['array', 'two-pointers', 'sorting'], difficulty: 'easy',
            constraints: { n: 200 }, ioStructure: ['array']
        },
        {
            id: 'gfg:merge-two-sorted-arrays', platform: 'geeksforgeeks', title: 'Merge Two Sorted Arrays',
            url: 'https://www.geeksforgeeks.org/problems/merge-two-sorted-arrays/1',
            tags: ['array', 'sorting'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array']
        },

        // === BINARY SEARCH ===
        {
            id: 'leetcode:704', platform: 'leetcode', title: 'Binary Search',
            url: 'https://leetcode.com/problems/binary-search/',
            tags: ['array', 'binary-search'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:binary-search', platform: 'geeksforgeeks', title: 'Binary Search',
            url: 'https://www.geeksforgeeks.org/problems/binary-search/1',
            tags: ['array', 'binary-search', 'divide-and-conquer'], difficulty: 'basic',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'codeforces:1201C', platform: 'codeforces', title: 'Maximum Median',
            url: 'https://codeforces.com/problemset/problem/1201/C',
            tags: ['binary-search', 'greedy', 'math'], difficulty: '1400',
            constraints: { n: 200000 }, ioStructure: ['array', 'integer']
        },

        // === CLIMBING STAIRS / FIBONACCI ===
        {
            id: 'leetcode:70', platform: 'leetcode', title: 'Climbing Stairs',
            url: 'https://leetcode.com/problems/climbing-stairs/',
            tags: ['dynamic-programming', 'math', 'memoization'], difficulty: 'easy',
            constraints: { n: 45 }, ioStructure: ['integer']
        },
        {
            id: 'gfg:count-ways-to-reach-nth-stair', platform: 'geeksforgeeks', title: 'Count ways to reach the nth stair',
            url: 'https://www.geeksforgeeks.org/problems/count-ways-to-reach-the-nth-stair/1',
            tags: ['dynamic-programming', 'mathematical'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['integer']
        },
        {
            id: 'hackerrank:climbing-the-leaderboard', platform: 'hackerrank', title: 'Climbing the Leaderboard',
            url: 'https://www.hackerrank.com/challenges/climbing-the-leaderboard/problem',
            tags: ['implementation', 'binary-search'], difficulty: 'medium',
            constraints: { n: 200000 }, ioStructure: ['array', 'integer']
        },

        // === REVERSE LINKED LIST ===
        {
            id: 'leetcode:206', platform: 'leetcode', title: 'Reverse Linked List',
            url: 'https://leetcode.com/problems/reverse-linked-list/',
            tags: ['linked-list', 'recursion'], difficulty: 'easy',
            constraints: { n: 5000 }, ioStructure: ['linked-list']
        },
        {
            id: 'gfg:reverse-a-linked-list', platform: 'geeksforgeeks', title: 'Reverse a Linked List',
            url: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1',
            tags: ['linked-list', 'data-structures'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['linked-list']
        },

        // === MAXIMUM SUBARRAY / KADANE ===
        {
            id: 'leetcode:53', platform: 'leetcode', title: 'Maximum Subarray',
            url: 'https://leetcode.com/problems/maximum-subarray/',
            tags: ['array', 'divide-and-conquer', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:kadanes-algorithm', platform: 'geeksforgeeks', title: "Kadane's Algorithm",
            url: 'https://www.geeksforgeeks.org/problems/kadanes-algorithm/1',
            tags: ['array', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 1000000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'hackerrank:maxsubarray', platform: 'hackerrank', title: 'The Maximum Subarray',
            url: 'https://www.hackerrank.com/challenges/maxsubarray/problem',
            tags: ['dynamic-programming', 'greedy'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === VALID PARENTHESES ===
        {
            id: 'leetcode:20', platform: 'leetcode', title: 'Valid Parentheses',
            url: 'https://leetcode.com/problems/valid-parentheses/',
            tags: ['string', 'stack'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['string']
        },
        {
            id: 'gfg:parenthesis-checker', platform: 'geeksforgeeks', title: 'Parenthesis Checker',
            url: 'https://www.geeksforgeeks.org/problems/parenthesis-checker/1',
            tags: ['string', 'stack'], difficulty: 'easy',
            constraints: { n: 100 }, ioStructure: ['string']
        },
        {
            id: 'hackerrank:balanced-brackets', platform: 'hackerrank', title: 'Balanced Brackets',
            url: 'https://www.hackerrank.com/challenges/balanced-brackets/problem',
            tags: ['stacks'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['string']
        },

        // === LONGEST COMMON SUBSEQUENCE ===
        {
            id: 'leetcode:1143', platform: 'leetcode', title: 'Longest Common Subsequence',
            url: 'https://leetcode.com/problems/longest-common-subsequence/',
            tags: ['string', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['string']
        },
        {
            id: 'gfg:longest-common-subsequence', platform: 'geeksforgeeks', title: 'Longest Common Subsequence',
            url: 'https://www.geeksforgeeks.org/problems/longest-common-subsequence/1',
            tags: ['string', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['string']
        },
        {
            id: 'hackerrank:common-child', platform: 'hackerrank', title: 'Common Child',
            url: 'https://www.hackerrank.com/challenges/common-child/problem',
            tags: ['strings', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 5000 }, ioStructure: ['string']
        },

        // === COIN CHANGE ===
        {
            id: 'leetcode:322', platform: 'leetcode', title: 'Coin Change',
            url: 'https://leetcode.com/problems/coin-change/',
            tags: ['array', 'dynamic-programming', 'bfs'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:coin-change', platform: 'geeksforgeeks', title: 'Coin Change (Minimum Coins)',
            url: 'https://www.geeksforgeeks.org/problems/coin-change/1',
            tags: ['dynamic-programming'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'hackerrank:coin-change', platform: 'hackerrank', title: 'The Coin Change Problem',
            url: 'https://www.hackerrank.com/challenges/coin-change/problem',
            tags: ['dynamic-programming'], difficulty: 'medium',
            constraints: { n: 250 }, ioStructure: ['array', 'integer']
        },

        // === MERGE INTERVALS ===
        {
            id: 'leetcode:56', platform: 'leetcode', title: 'Merge Intervals',
            url: 'https://leetcode.com/problems/merge-intervals/',
            tags: ['array', 'sorting'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['array', 'pair']
        },
        {
            id: 'gfg:overlapping-intervals', platform: 'geeksforgeeks', title: 'Overlapping Intervals',
            url: 'https://www.geeksforgeeks.org/problems/overlapping-intervals/1',
            tags: ['array', 'sorting'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'pair']
        },

        // === LEVEL ORDER TRAVERSAL ===
        {
            id: 'leetcode:102', platform: 'leetcode', title: 'Binary Tree Level Order Traversal',
            url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
            tags: ['tree', 'bfs', 'binary-tree'], difficulty: 'medium',
            constraints: { n: 2000 }, ioStructure: ['tree']
        },
        {
            id: 'gfg:level-order-traversal', platform: 'geeksforgeeks', title: 'Level order traversal',
            url: 'https://www.geeksforgeeks.org/problems/level-order-traversal/1',
            tags: ['tree', 'bfs'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['tree']
        },

        // === DIJKSTRA ===
        {
            id: 'leetcode:743', platform: 'leetcode', title: 'Network Delay Time',
            url: 'https://leetcode.com/problems/network-delay-time/',
            tags: ['graph', 'heap', 'shortest-path'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['graph', 'integer']
        },
        {
            id: 'gfg:implementing-dijkstra', platform: 'geeksforgeeks', title: "Implementing Dijkstra's Algorithm",
            url: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1',
            tags: ['graph', 'shortest-path'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['graph', 'integer']
        },
        {
            id: 'codeforces:20C', platform: 'codeforces', title: 'Dijkstra?',
            url: 'https://codeforces.com/problemset/problem/20/C',
            tags: ['graphs', 'shortest-paths'], difficulty: '1900',
            constraints: { n: 100000 }, ioStructure: ['graph']
        },

        // === WATERFALL / TRAPPING RAIN WATER ===
        {
            id: 'leetcode:42', platform: 'leetcode', title: 'Trapping Rain Water',
            url: 'https://leetcode.com/problems/trapping-rain-water/',
            tags: ['array', 'two-pointers', 'dynamic-programming', 'stack'], difficulty: 'hard',
            constraints: { n: 20000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:trapping-rain-water', platform: 'geeksforgeeks', title: 'Trapping Rain Water',
            url: 'https://www.geeksforgeeks.org/problems/trapping-rain-water/1',
            tags: ['array', 'stack'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === ROTATE ARRAY ===
        {
            id: 'leetcode:189', platform: 'leetcode', title: 'Rotate Array',
            url: 'https://leetcode.com/problems/rotate-array/',
            tags: ['array', 'math', 'two-pointers'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:rotate-array', platform: 'geeksforgeeks', title: 'Rotate Array',
            url: 'https://www.geeksforgeeks.org/problems/rotate-array-by-n-elements/1',
            tags: ['array'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === FIRST AND LAST POSITION ===
        {
            id: 'leetcode:34', platform: 'leetcode', title: 'Find First and Last Position of Element in Sorted Array',
            url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/',
            tags: ['array', 'binary-search'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:first-and-last-occurrences', platform: 'geeksforgeeks', title: 'First and last occurrences of x',
            url: 'https://www.geeksforgeeks.org/problems/first-and-last-occurrences-of-x/1',
            tags: ['array', 'binary-search'], difficulty: 'easy',
            constraints: { n: 1000000 }, ioStructure: ['array', 'integer']
        },

        // === PALINDROME PROBLEMS ===
        {
            id: 'leetcode:9', platform: 'leetcode', title: 'Palindrome Number',
            url: 'https://leetcode.com/problems/palindrome-number/',
            tags: ['math'], difficulty: 'easy',
            constraints: { n: 2147483647 }, ioStructure: ['integer']
        },
        {
            id: 'gfg:palindrome-number', platform: 'geeksforgeeks', title: 'Palindrome Number',
            url: 'https://www.geeksforgeeks.org/problems/palindrome0746/1',
            tags: ['math', 'number-theory'], difficulty: 'easy',
            constraints: { n: 1000000000 }, ioStructure: ['integer']
        },
        {
            id: 'leetcode:125', platform: 'leetcode', title: 'Valid Palindrome',
            url: 'https://leetcode.com/problems/valid-palindrome/',
            tags: ['string', 'two-pointers'], difficulty: 'easy',
            constraints: { n: 200000 }, ioStructure: ['string']
        },
        {
            id: 'gfg:valid-palindrome', platform: 'geeksforgeeks', title: 'Check if a string is palindrome',
            url: 'https://www.geeksforgeeks.org/problems/palindrome-string0817/1',
            tags: ['string'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['string']
        },
        {
            id: 'hackerrank:palindrome-index', platform: 'hackerrank', title: 'Palindrome Index',
            url: 'https://www.hackerrank.com/challenges/palindrome-index/problem',
            tags: ['strings'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['string']
        },
        {
            id: 'leetcode:5', platform: 'leetcode', title: 'Longest Palindromic Substring',
            url: 'https://leetcode.com/problems/longest-palindromic-substring/',
            tags: ['string', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['string']
        },
        {
            id: 'gfg:longest-palindrome-substring', platform: 'geeksforgeeks', title: 'Longest Palindrome in a String',
            url: 'https://www.geeksforgeeks.org/problems/longest-palindrome-in-a-string/1',
            tags: ['string', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['string']
        },
        {
            id: 'leetcode:234', platform: 'leetcode', title: 'Palindrome Linked List',
            url: 'https://leetcode.com/problems/palindrome-linked-list/',
            tags: ['linked-list', 'two-pointers', 'stack', 'recursion'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['linked-list']
        },
        {
            id: 'gfg:check-if-linked-list-is-palindrome', platform: 'geeksforgeeks', title: 'Check if Linked List is Palindrome',
            url: 'https://www.geeksforgeeks.org/problems/check-if-linked-list-is-pallindrome/1',
            tags: ['linked-list'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['linked-list']
        },

        // === LONGEST SUBSTRING ===
        {
            id: 'leetcode:3', platform: 'leetcode', title: 'Longest Substring Without Repeating Characters',
            url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
            tags: ['hash-table', 'string', 'sliding-window'], difficulty: 'medium',
            constraints: { n: 50000 }, ioStructure: ['string', 'integer']
        },
        {
            id: 'gfg:longest-distinct-characters-substring', platform: 'geeksforgeeks', title: 'Longest Distinct Characters in String',
            url: 'https://www.geeksforgeeks.org/problems/longest-distinct-characters-in-string/1',
            tags: ['string', 'sliding-window', 'hash-table'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['string', 'integer']
        },
        {
            id: 'hackerrank:non-repeat-substring', platform: 'hackerrank', title: 'Non-Repeating Substring',
            url: 'https://www.hackerrank.com/challenges/non-repeating-substring/problem',
            tags: ['strings', 'sliding-window'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['string', 'integer']
        },

        // === 3SUM / 4SUM ===
        {
            id: 'leetcode:15', platform: 'leetcode', title: '3Sum',
            url: 'https://leetcode.com/problems/3sum/',
            tags: ['array', 'two-pointers', 'sorting'], difficulty: 'medium',
            constraints: { n: 3000 }, ioStructure: ['array']
        },
        {
            id: 'gfg:triplet-sum-in-array', platform: 'geeksforgeeks', title: 'Find triplets with zero sum',
            url: 'https://www.geeksforgeeks.org/problems/find-triplets-with-zero-sum/1',
            tags: ['array', 'two-pointers', 'sorting'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['array']
        },
        {
            id: 'leetcode:18', platform: 'leetcode', title: '4Sum',
            url: 'https://leetcode.com/problems/4sum/',
            tags: ['array', 'two-pointers', 'sorting'], difficulty: 'medium',
            constraints: { n: 200 }, ioStructure: ['array']
        },
        {
            id: 'gfg:4sum', platform: 'geeksforgeeks', title: 'Find All Four Sum Numbers',
            url: 'https://www.geeksforgeeks.org/problems/find-all-four-sum-numbers/1',
            tags: ['array', 'sorting', 'two-pointers'], difficulty: 'medium',
            constraints: { n: 200 }, ioStructure: ['array']
        },

        // === BEST TIME TO BUY/SELL STOCK ===
        {
            id: 'leetcode:121', platform: 'leetcode', title: 'Best Time to Buy and Sell Stock',
            url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
            tags: ['array', 'dynamic-programming'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:stock-buy-and-sell', platform: 'geeksforgeeks', title: 'Stock Buy and Sell - Max one transaction',
            url: 'https://www.geeksforgeeks.org/problems/buy-stock-2/1',
            tags: ['array', 'dynamic-programming'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'hackerrank:stockmax', platform: 'hackerrank', title: 'Stock Maximize',
            url: 'https://www.hackerrank.com/challenges/stockmax/problem',
            tags: ['dynamic-programming', 'greedy'], difficulty: 'medium',
            constraints: { n: 50000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'leetcode:122', platform: 'leetcode', title: 'Best Time to Buy and Sell Stock II',
            url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/',
            tags: ['array', 'dynamic-programming', 'greedy'], difficulty: 'medium',
            constraints: { n: 30000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:stock-buy-and-sell2', platform: 'geeksforgeeks', title: 'Stock Buy and Sell - Multiple transactions',
            url: 'https://www.geeksforgeeks.org/problems/stock-buy-and-sell-1587115630/1',
            tags: ['array', 'greedy'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === SORT COLORS / DUTCH FLAG ===
        {
            id: 'leetcode:75', platform: 'leetcode', title: 'Sort Colors',
            url: 'https://leetcode.com/problems/sort-colors/',
            tags: ['array', 'two-pointers', 'sorting'], difficulty: 'medium',
            constraints: { n: 300 }, ioStructure: ['array']
        },
        {
            id: 'gfg:sort-an-array-of-0s-1s-and-2s', platform: 'geeksforgeeks', title: 'Sort an array of 0s, 1s and 2s',
            url: 'https://www.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s/1',
            tags: ['array', 'sorting'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array']
        },

        // === SEARCH IN ROTATED ARRAY ===
        {
            id: 'leetcode:33', platform: 'leetcode', title: 'Search in Rotated Sorted Array',
            url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
            tags: ['array', 'binary-search'], difficulty: 'medium',
            constraints: { n: 5000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:search-in-rotated-array', platform: 'geeksforgeeks', title: 'Search in Rotated Sorted Array',
            url: 'https://www.geeksforgeeks.org/problems/search-in-a-rotated-array/1',
            tags: ['array', 'binary-search'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'leetcode:153', platform: 'leetcode', title: 'Find Minimum in Rotated Sorted Array',
            url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
            tags: ['array', 'binary-search'], difficulty: 'medium',
            constraints: { n: 5000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:minimum-element-rotated', platform: 'geeksforgeeks', title: 'Minimum element in a sorted and rotated array',
            url: 'https://www.geeksforgeeks.org/problems/minimum-element-in-a-sorted-and-rotated-array/1',
            tags: ['array', 'binary-search'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === SUBSETS / PERMUTATIONS ===
        {
            id: 'leetcode:78', platform: 'leetcode', title: 'Subsets',
            url: 'https://leetcode.com/problems/subsets/',
            tags: ['array', 'backtracking', 'bit-manipulation'], difficulty: 'medium',
            constraints: { n: 10 }, ioStructure: ['array']
        },
        {
            id: 'gfg:subsets', platform: 'geeksforgeeks', title: 'Subsets',
            url: 'https://www.geeksforgeeks.org/problems/subsets/1',
            tags: ['array', 'backtracking'], difficulty: 'medium',
            constraints: { n: 10 }, ioStructure: ['array']
        },
        {
            id: 'leetcode:46', platform: 'leetcode', title: 'Permutations',
            url: 'https://leetcode.com/problems/permutations/',
            tags: ['array', 'backtracking'], difficulty: 'medium',
            constraints: { n: 6 }, ioStructure: ['array']
        },
        {
            id: 'gfg:permutations-of-array', platform: 'geeksforgeeks', title: 'Permutations of a given string',
            url: 'https://www.geeksforgeeks.org/problems/permutations-of-a-given-string2041/1',
            tags: ['string', 'backtracking'], difficulty: 'medium',
            constraints: { n: 10 }, ioStructure: ['string', 'array']
        },
        {
            id: 'hackerrank:permutations', platform: 'hackerrank', title: 'Permutations',
            url: 'https://www.hackerrank.com/challenges/permutations-of-strings/problem',
            tags: ['strings', 'backtracking'], difficulty: 'medium',
            constraints: { n: 9 }, ioStructure: ['array']
        },

        // === WORD BREAK ===
        {
            id: 'leetcode:139', platform: 'leetcode', title: 'Word Break',
            url: 'https://leetcode.com/problems/word-break/',
            tags: ['hash-table', 'string', 'dynamic-programming', 'trie', 'memoization'], difficulty: 'medium',
            constraints: { n: 300 }, ioStructure: ['string', 'array']
        },
        {
            id: 'gfg:word-break', platform: 'geeksforgeeks', title: 'Word Break',
            url: 'https://www.geeksforgeeks.org/problems/word-break1352/1',
            tags: ['dynamic-programming', 'string'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['string', 'array']
        },

        // === NUMBER OF ISLANDS ===
        {
            id: 'leetcode:200', platform: 'leetcode', title: 'Number of Islands',
            url: 'https://leetcode.com/problems/number-of-islands/',
            tags: ['array', 'dfs', 'bfs', 'union-find', 'matrix'], difficulty: 'medium',
            constraints: { n: 300 }, ioStructure: ['matrix', 'integer']
        },
        {
            id: 'gfg:find-number-of-islands', platform: 'geeksforgeeks', title: 'Find the number of islands',
            url: 'https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1',
            tags: ['graph', 'dfs', 'bfs'], difficulty: 'medium',
            constraints: { n: 500 }, ioStructure: ['matrix', 'integer']
        },
        {
            id: 'hackerrank:connected-cells', platform: 'hackerrank', title: 'Connected Cells in a Grid',
            url: 'https://www.hackerrank.com/challenges/connected-cell-in-a-grid/problem',
            tags: ['dfs', 'graph'], difficulty: 'medium',
            constraints: { n: 10 }, ioStructure: ['matrix', 'integer']
        },

        // === COURSE SCHEDULE / TOPOLOGICAL SORT ===
        {
            id: 'leetcode:207', platform: 'leetcode', title: 'Course Schedule',
            url: 'https://leetcode.com/problems/course-schedule/',
            tags: ['dfs', 'bfs', 'graph', 'topological-sort'], difficulty: 'medium',
            constraints: { n: 2000 }, ioStructure: ['array', 'graph']
        },
        {
            id: 'gfg:prerequisite-tasks', platform: 'geeksforgeeks', title: 'Prerequisite Tasks',
            url: 'https://www.geeksforgeeks.org/problems/prerequisite-tasks/1',
            tags: ['graph', 'topological-sort'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['array', 'graph']
        },
        {
            id: 'leetcode:210', platform: 'leetcode', title: 'Course Schedule II',
            url: 'https://leetcode.com/problems/course-schedule-ii/',
            tags: ['dfs', 'bfs', 'graph', 'topological-sort'], difficulty: 'medium',
            constraints: { n: 2000 }, ioStructure: ['array', 'graph']
        },
        {
            id: 'gfg:topological-sort', platform: 'geeksforgeeks', title: 'Topological Sort',
            url: 'https://www.geeksforgeeks.org/problems/topological-sort/1',
            tags: ['graph', 'topological-sort'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['array', 'graph']
        },

        // === LRU CACHE ===
        {
            id: 'leetcode:146', platform: 'leetcode', title: 'LRU Cache',
            url: 'https://leetcode.com/problems/lru-cache/',
            tags: ['hash-table', 'linked-list', 'design'], difficulty: 'medium',
            constraints: { n: 3000 }, ioStructure: ['array']
        },
        {
            id: 'gfg:lru-cache', platform: 'geeksforgeeks', title: 'LRU Cache',
            url: 'https://www.geeksforgeeks.org/problems/lru-cache/1',
            tags: ['design', 'hash-table', 'linked-list'], difficulty: 'hard',
            constraints: { n: 10000 }, ioStructure: ['array']
        },

        // === MINIMUM PATH SUM ===
        {
            id: 'leetcode:64', platform: 'leetcode', title: 'Minimum Path Sum',
            url: 'https://leetcode.com/problems/minimum-path-sum/',
            tags: ['array', 'dynamic-programming', 'matrix'], difficulty: 'medium',
            constraints: { n: 200 }, ioStructure: ['matrix', 'integer']
        },
        {
            id: 'gfg:minimum-cost-path', platform: 'geeksforgeeks', title: 'Minimum Cost Path',
            url: 'https://www.geeksforgeeks.org/problems/minimum-cost-path/1',
            tags: ['dynamic-programming', 'matrix'], difficulty: 'medium',
            constraints: { n: 500 }, ioStructure: ['matrix', 'integer']
        },

        // === HOUSE ROBBER ===
        {
            id: 'leetcode:198', platform: 'leetcode', title: 'House Robber',
            url: 'https://leetcode.com/problems/house-robber/',
            tags: ['array', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:stickler-thief', platform: 'geeksforgeeks', title: 'Stickler Thief',
            url: 'https://www.geeksforgeeks.org/problems/stickler-theif/1',
            tags: ['dynamic-programming'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'leetcode:213', platform: 'leetcode', title: 'House Robber II',
            url: 'https://leetcode.com/problems/house-robber-ii/',
            tags: ['array', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['array', 'integer']
        },

        // === UNIQUE PATHS ===
        {
            id: 'leetcode:62', platform: 'leetcode', title: 'Unique Paths',
            url: 'https://leetcode.com/problems/unique-paths/',
            tags: ['math', 'dynamic-programming', 'combinatorics'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['integer']
        },
        {
            id: 'gfg:unique-paths', platform: 'geeksforgeeks', title: 'Unique Paths in a Grid',
            url: 'https://www.geeksforgeeks.org/problems/unique-paths/1',
            tags: ['dynamic-programming', 'combinatorics'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['integer']
        },
        {
            id: 'leetcode:63', platform: 'leetcode', title: 'Unique Paths II',
            url: 'https://leetcode.com/problems/unique-paths-ii/',
            tags: ['array', 'dynamic-programming', 'matrix'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['matrix', 'integer']
        },

        // === EDIT DISTANCE ===
        {
            id: 'leetcode:72', platform: 'leetcode', title: 'Edit Distance',
            url: 'https://leetcode.com/problems/edit-distance/',
            tags: ['string', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 500 }, ioStructure: ['string', 'integer']
        },
        {
            id: 'gfg:edit-distance', platform: 'geeksforgeeks', title: 'Edit Distance',
            url: 'https://www.geeksforgeeks.org/problems/edit-distance3702/1',
            tags: ['string', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 500 }, ioStructure: ['string', 'integer']
        },

        // === CONTAINER WITH MOST WATER ===
        {
            id: 'leetcode:11', platform: 'leetcode', title: 'Container With Most Water',
            url: 'https://leetcode.com/problems/container-with-most-water/',
            tags: ['array', 'two-pointers', 'greedy'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:container-with-most-water', platform: 'geeksforgeeks', title: 'Container With Most Water',
            url: 'https://www.geeksforgeeks.org/problems/container-with-most-water/1',
            tags: ['array', 'two-pointers'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === PRODUCT OF ARRAY EXCEPT SELF ===
        {
            id: 'leetcode:238', platform: 'leetcode', title: 'Product of Array Except Self',
            url: 'https://leetcode.com/problems/product-of-array-except-self/',
            tags: ['array', 'prefix-sum'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array']
        },
        {
            id: 'gfg:product-array-puzzle', platform: 'geeksforgeeks', title: 'Product array puzzle',
            url: 'https://www.geeksforgeeks.org/problems/product-array-puzzle/1',
            tags: ['array', 'prefix-sum'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array']
        },

        // === LONGEST INCREASING SUBSEQUENCE ===
        {
            id: 'leetcode:300', platform: 'leetcode', title: 'Longest Increasing Subsequence',
            url: 'https://leetcode.com/problems/longest-increasing-subsequence/',
            tags: ['array', 'binary-search', 'dynamic-programming'], difficulty: 'medium',
            constraints: { n: 2500 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:longest-increasing-subsequence', platform: 'geeksforgeeks', title: 'Longest Increasing Subsequence',
            url: 'https://www.geeksforgeeks.org/problems/longest-increasing-subsequence/1',
            tags: ['dynamic-programming', 'binary-search'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'hackerrank:longest-increasing-subsequent', platform: 'hackerrank', title: 'The Longest Increasing Subsequence',
            url: 'https://www.hackerrank.com/challenges/longest-increasing-subsequent/problem',
            tags: ['dynamic-programming'], difficulty: 'hard',
            constraints: { n: 1000000 }, ioStructure: ['array', 'integer']
        },

        // === LINKED LIST CYCLE ===
        {
            id: 'leetcode:141', platform: 'leetcode', title: 'Linked List Cycle',
            url: 'https://leetcode.com/problems/linked-list-cycle/',
            tags: ['hash-table', 'linked-list', 'two-pointers'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['linked-list']
        },
        {
            id: 'gfg:detect-loop', platform: 'geeksforgeeks', title: 'Detect Loop in linked list',
            url: 'https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1',
            tags: ['linked-list', 'two-pointers'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['linked-list']
        },
        {
            id: 'leetcode:142', platform: 'leetcode', title: 'Linked List Cycle II',
            url: 'https://leetcode.com/problems/linked-list-cycle-ii/',
            tags: ['hash-table', 'linked-list', 'two-pointers'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['linked-list']
        },

        // === MERGE K SORTED LISTS ===
        {
            id: 'leetcode:23', platform: 'leetcode', title: 'Merge k Sorted Lists',
            url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
            tags: ['linked-list', 'divide-and-conquer', 'heap', 'merge-sort'], difficulty: 'hard',
            constraints: { n: 10000 }, ioStructure: ['linked-list', 'array']
        },
        {
            id: 'gfg:merge-k-sorted-lists', platform: 'geeksforgeeks', title: 'Merge K sorted linked lists',
            url: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-linked-lists/1',
            tags: ['linked-list', 'heap', 'divide-and-conquer'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['linked-list', 'array']
        },

        // === ADD TWO NUMBERS ===
        {
            id: 'leetcode:2', platform: 'leetcode', title: 'Add Two Numbers',
            url: 'https://leetcode.com/problems/add-two-numbers/',
            tags: ['linked-list', 'math', 'recursion'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['linked-list']
        },
        {
            id: 'gfg:add-two-numbers', platform: 'geeksforgeeks', title: 'Add two numbers represented by Linked List',
            url: 'https://www.geeksforgeeks.org/problems/add-two-numbers-represented-by-linked-lists/1',
            tags: ['linked-list', 'math'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['linked-list']
        },

        // === GROUP ANAGRAMS ===
        {
            id: 'leetcode:49', platform: 'leetcode', title: 'Group Anagrams',
            url: 'https://leetcode.com/problems/group-anagrams/',
            tags: ['array', 'hash-table', 'string', 'sorting'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['array', 'string']
        },
        {
            id: 'gfg:print-anagrams-together', platform: 'geeksforgeeks', title: 'Print Anagrams Together',
            url: 'https://www.geeksforgeeks.org/problems/print-anagrams-together/1',
            tags: ['string', 'hash-table', 'sorting'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['array', 'string']
        },

        // === FLATTEN BINARY TREE ===
        {
            id: 'leetcode:114', platform: 'leetcode', title: 'Flatten Binary Tree to Linked List',
            url: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/',
            tags: ['linked-list', 'stack', 'tree', 'dfs', 'binary-tree'], difficulty: 'medium',
            constraints: { n: 2000 }, ioStructure: ['tree']
        },
        {
            id: 'gfg:flatten-binary-tree', platform: 'geeksforgeeks', title: 'Flatten Binary Tree to Linked List',
            url: 'https://www.geeksforgeeks.org/problems/flatten-binary-tree-to-linked-list/1',
            tags: ['tree', 'linked-list'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['tree']
        },

        // === LOWEST COMMON ANCESTOR ===
        {
            id: 'leetcode:236', platform: 'leetcode', title: 'Lowest Common Ancestor of a Binary Tree',
            url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
            tags: ['tree', 'dfs', 'binary-tree'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['tree']
        },
        {
            id: 'gfg:lowest-common-ancestor', platform: 'geeksforgeeks', title: 'Lowest Common Ancestor in a Binary Tree',
            url: 'https://www.geeksforgeeks.org/problems/lowest-common-ancestor-in-a-binary-tree/1',
            tags: ['tree', 'dfs'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['tree']
        },

        // === BINARY TREE MAXIMUM PATH SUM ===
        {
            id: 'leetcode:124', platform: 'leetcode', title: 'Binary Tree Maximum Path Sum',
            url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
            tags: ['dynamic-programming', 'tree', 'dfs', 'binary-tree'], difficulty: 'hard',
            constraints: { n: 30000 }, ioStructure: ['tree', 'integer']
        },
        {
            id: 'gfg:maximum-path-sum', platform: 'geeksforgeeks', title: 'Maximum path sum from any node',
            url: 'https://www.geeksforgeeks.org/problems/maximum-path-sum-from-any-node/1',
            tags: ['tree', 'dynamic-programming'], difficulty: 'hard',
            constraints: { n: 100000 }, ioStructure: ['tree', 'integer']
        },

        // === SERIALIZE/DESERIALIZE BINARY TREE ===
        {
            id: 'leetcode:297', platform: 'leetcode', title: 'Serialize and Deserialize Binary Tree',
            url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
            tags: ['string', 'tree', 'dfs', 'bfs', 'design', 'binary-tree'], difficulty: 'hard',
            constraints: { n: 10000 }, ioStructure: ['tree', 'string']
        },
        {
            id: 'gfg:serialize-deserialize', platform: 'geeksforgeeks', title: 'Serialize and Deserialize a Binary Tree',
            url: 'https://www.geeksforgeeks.org/problems/serialize-and-deserialize-a-binary-tree/1',
            tags: ['tree', 'design'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['tree', 'string']
        },

        // === WORD LADDER ===
        {
            id: 'leetcode:127', platform: 'leetcode', title: 'Word Ladder',
            url: 'https://leetcode.com/problems/word-ladder/',
            tags: ['hash-table', 'string', 'bfs'], difficulty: 'hard',
            constraints: { n: 5000 }, ioStructure: ['string', 'array', 'integer']
        },
        {
            id: 'gfg:word-ladder', platform: 'geeksforgeeks', title: 'Word Ladder I',
            url: 'https://www.geeksforgeeks.org/problems/word-ladder/1',
            tags: ['string', 'bfs'], difficulty: 'hard',
            constraints: { n: 500 }, ioStructure: ['string', 'array', 'integer']
        },

        // === SLIDING WINDOW MAXIMUM ===
        {
            id: 'leetcode:239', platform: 'leetcode', title: 'Sliding Window Maximum',
            url: 'https://leetcode.com/problems/sliding-window-maximum/',
            tags: ['array', 'queue', 'sliding-window', 'heap', 'monotonic-queue'], difficulty: 'hard',
            constraints: { n: 100000 }, ioStructure: ['array']
        },
        {
            id: 'gfg:maximum-of-all-subarrays', platform: 'geeksforgeeks', title: 'Maximum of all subarrays of size k',
            url: 'https://www.geeksforgeeks.org/problems/maximum-of-all-subarrays-of-size-k/1',
            tags: ['array', 'sliding-window', 'queue'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array']
        },

        // === MEDIAN FINDER ===
        {
            id: 'leetcode:295', platform: 'leetcode', title: 'Find Median from Data Stream',
            url: 'https://leetcode.com/problems/find-median-from-data-stream/',
            tags: ['two-pointers', 'design', 'sorting', 'heap', 'data-stream'], difficulty: 'hard',
            constraints: { n: 50000 }, ioStructure: ['integer']
        },
        {
            id: 'gfg:find-median-data-stream', platform: 'geeksforgeeks', title: 'Find median in a stream',
            url: 'https://www.geeksforgeeks.org/problems/find-median-in-a-stream/1',
            tags: ['heap', 'design'], difficulty: 'hard',
            constraints: { n: 100000 }, ioStructure: ['integer']
        },

        // === KTH LARGEST ===
        {
            id: 'leetcode:215', platform: 'leetcode', title: 'Kth Largest Element in an Array',
            url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
            tags: ['array', 'divide-and-conquer', 'sorting', 'heap', 'quickselect'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:kth-largest', platform: 'geeksforgeeks', title: 'Kth largest element',
            url: 'https://www.geeksforgeeks.org/problems/kth-largest-element/1',
            tags: ['array', 'heap', 'sorting'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === NEXT PERMUTATION ===
        {
            id: 'leetcode:31', platform: 'leetcode', title: 'Next Permutation',
            url: 'https://leetcode.com/problems/next-permutation/',
            tags: ['array', 'two-pointers'], difficulty: 'medium',
            constraints: { n: 100 }, ioStructure: ['array']
        },
        {
            id: 'gfg:next-permutation', platform: 'geeksforgeeks', title: 'Next Permutation',
            url: 'https://www.geeksforgeeks.org/problems/next-permutation/1',
            tags: ['array', 'two-pointers'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array']
        },

        // === REVERSE INTEGER ===
        {
            id: 'leetcode:7', platform: 'leetcode', title: 'Reverse Integer',
            url: 'https://leetcode.com/problems/reverse-integer/',
            tags: ['math'], difficulty: 'medium',
            constraints: { n: 2147483647 }, ioStructure: ['integer']
        },
        {
            id: 'gfg:reverse-digits', platform: 'geeksforgeeks', title: 'Reverse digit of a number',
            url: 'https://www.geeksforgeeks.org/problems/reverse-digit0316/1',
            tags: ['math'], difficulty: 'easy',
            constraints: { n: 1000000000 }, ioStructure: ['integer']
        },

        // === ROMAN TO INTEGER ===
        {
            id: 'leetcode:13', platform: 'leetcode', title: 'Roman to Integer',
            url: 'https://leetcode.com/problems/roman-to-integer/',
            tags: ['hash-table', 'math', 'string'], difficulty: 'easy',
            constraints: { n: 15 }, ioStructure: ['string', 'integer']
        },
        {
            id: 'gfg:roman-to-integer', platform: 'geeksforgeeks', title: 'Roman Number to Integer',
            url: 'https://www.geeksforgeeks.org/problems/roman-number-to-integer/1',
            tags: ['string', 'math'], difficulty: 'easy',
            constraints: { n: 15 }, ioStructure: ['string', 'integer']
        },

        // === LONGEST COMMON PREFIX ===
        {
            id: 'leetcode:14', platform: 'leetcode', title: 'Longest Common Prefix',
            url: 'https://leetcode.com/problems/longest-common-prefix/',
            tags: ['string', 'trie'], difficulty: 'easy',
            constraints: { n: 200 }, ioStructure: ['string', 'array']
        },
        {
            id: 'gfg:longest-common-prefix', platform: 'geeksforgeeks', title: 'Longest Common Prefix in an Array',
            url: 'https://www.geeksforgeeks.org/problems/longest-common-prefix-in-an-array/1',
            tags: ['string', 'trie'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['string', 'array']
        },

        // === ZIGZAG CONVERSION ===
        {
            id: 'leetcode:6', platform: 'leetcode', title: 'Zigzag Conversion',
            url: 'https://leetcode.com/problems/zigzag-conversion/',
            tags: ['string', 'simulation'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['string', 'integer']
        },
        {
            id: 'gfg:zigzag-string', platform: 'geeksforgeeks', title: 'Concatenation of Zig-Zag String in n Rows',
            url: 'https://www.geeksforgeeks.org/problems/concatenation-of-zig-zag-string-in-n-rows/1',
            tags: ['string', 'simulation', 'pattern'], difficulty: 'medium',
            constraints: { n: 10000 }, ioStructure: ['string', 'integer']
        },

        // === REMOVE DUPLICATES FROM SORTED ARRAY ===
        {
            id: 'leetcode:26', platform: 'leetcode', title: 'Remove Duplicates from Sorted Array',
            url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
            tags: ['array', 'two-pointers'], difficulty: 'easy',
            constraints: { n: 30000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:remove-duplicates-sorted', platform: 'geeksforgeeks', title: 'Remove duplicate elements from sorted Array',
            url: 'https://www.geeksforgeeks.org/problems/remove-duplicate-elements-from-sorted-array/1',
            tags: ['array', 'two-pointers'], difficulty: 'easy',
            constraints: { n: 1000000 }, ioStructure: ['array', 'integer']
        },

        // === MOVE ZEROES ===
        {
            id: 'leetcode:283', platform: 'leetcode', title: 'Move Zeroes',
            url: 'https://leetcode.com/problems/move-zeroes/',
            tags: ['array', 'two-pointers'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['array']
        },
        {
            id: 'gfg:move-zeroes', platform: 'geeksforgeeks', title: 'Move all zeroes to end of array',
            url: 'https://www.geeksforgeeks.org/problems/move-all-zeroes-to-end-of-array/1',
            tags: ['array'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array']
        },

        // === FIND PEAK ELEMENT ===
        {
            id: 'leetcode:162', platform: 'leetcode', title: 'Find Peak Element',
            url: 'https://leetcode.com/problems/find-peak-element/',
            tags: ['array', 'binary-search'], difficulty: 'medium',
            constraints: { n: 1000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:peak-element', platform: 'geeksforgeeks', title: 'Peak element',
            url: 'https://www.geeksforgeeks.org/problems/peak-element/1',
            tags: ['array', 'binary-search'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === MAJORITY ELEMENT ===
        {
            id: 'leetcode:169', platform: 'leetcode', title: 'Majority Element',
            url: 'https://leetcode.com/problems/majority-element/',
            tags: ['array', 'hash-table', 'divide-and-conquer', 'sorting', 'counting'], difficulty: 'easy',
            constraints: { n: 50000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:majority-element', platform: 'geeksforgeeks', title: 'Majority Element',
            url: 'https://www.geeksforgeeks.org/problems/majority-element/1',
            tags: ['array', 'hash-table'], difficulty: 'medium',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        },

        // === N-QUEENS ===
        {
            id: 'leetcode:51', platform: 'leetcode', title: 'N-Queens',
            url: 'https://leetcode.com/problems/n-queens/',
            tags: ['array', 'backtracking'], difficulty: 'hard',
            constraints: { n: 9 }, ioStructure: ['integer', 'matrix']
        },
        {
            id: 'gfg:n-queen', platform: 'geeksforgeeks', title: 'N-Queen Problem',
            url: 'https://www.geeksforgeeks.org/problems/n-queen-problem0315/1',
            tags: ['backtracking'], difficulty: 'hard',
            constraints: { n: 10 }, ioStructure: ['integer', 'matrix']
        },

        // === SUDOKU SOLVER ===
        {
            id: 'leetcode:37', platform: 'leetcode', title: 'Sudoku Solver',
            url: 'https://leetcode.com/problems/sudoku-solver/',
            tags: ['array', 'hash-table', 'backtracking', 'matrix'], difficulty: 'hard',
            constraints: { n: 81 }, ioStructure: ['matrix']
        },
        {
            id: 'gfg:solve-the-sudoku', platform: 'geeksforgeeks', title: 'Solve the Sudoku',
            url: 'https://www.geeksforgeeks.org/problems/solve-the-sudoku/1',
            tags: ['backtracking', 'matrix'], difficulty: 'hard',
            constraints: { n: 81 }, ioStructure: ['matrix']
        },

        // === MISSING NUMBER ===
        {
            id: 'leetcode:268', platform: 'leetcode', title: 'Missing Number',
            url: 'https://leetcode.com/problems/missing-number/',
            tags: ['array', 'hash-table', 'math', 'binary-search', 'bit-manipulation', 'sorting'], difficulty: 'easy',
            constraints: { n: 10000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:missing-number-array', platform: 'geeksforgeeks', title: 'Missing number in array',
            url: 'https://www.geeksforgeeks.org/problems/missing-number-in-array/1',
            tags: ['array', 'math'], difficulty: 'easy',
            constraints: { n: 1000000 }, ioStructure: ['array', 'integer']
        },

        // === SINGLE NUMBER ===
        {
            id: 'leetcode:136', platform: 'leetcode', title: 'Single Number',
            url: 'https://leetcode.com/problems/single-number/',
            tags: ['array', 'bit-manipulation'], difficulty: 'easy',
            constraints: { n: 30000 }, ioStructure: ['array', 'integer']
        },
        {
            id: 'gfg:single-number', platform: 'geeksforgeeks', title: 'Find the element that appears once',
            url: 'https://www.geeksforgeeks.org/problems/element-appearing-once/1',
            tags: ['array', 'bit-manipulation'], difficulty: 'easy',
            constraints: { n: 100000 }, ioStructure: ['array', 'integer']
        }
    ];

    // Get problems by platform
    function getByPlatform(platform) {
        return PROBLEMS.filter(p => p.platform === platform);
    }

    // Get problem by ID
    function getById(id) {
        return PROBLEMS.find(p => p.id === id);
    }

    // Get all problems except given platform
    function getOtherPlatforms(excludePlatform) {
        return PROBLEMS.filter(p => p.platform !== excludePlatform);
    }

    // Search by title (basic substring match)
    function searchByTitle(query) {
        const q = query.toLowerCase();
        return PROBLEMS.filter(p => p.title.toLowerCase().includes(q));
    }

    return { PLATFORMS, PROBLEMS, getByPlatform, getById, getOtherPlatforms, searchByTitle };
})();

if (typeof window !== 'undefined') window.CodeCompareProblemDB = CodeCompareProblemDB;
