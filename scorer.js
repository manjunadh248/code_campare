/**
 * scorer.js - Weighted Scoring Logic for CodeCompare
 */

const CodeCompareScorer = (() => {
  'use strict';

  const WEIGHTS = { title: 0.40, tags: 0.25, constraints: 0.20, difficulty: 0.10, ioStructure: 0.05 };
  const FEEDBACK_BOOST = { confirmed: 15, rejected: -100 };

  const TAG_SYNONYMS = {
    'dp': 'dynamic-programming', 'dynamic programming': 'dynamic-programming',
    'bfs': 'breadth-first-search', 'dfs': 'depth-first-search',
    'binary search': 'binary-search', 'two pointers': 'two-pointers',
    'hash table': 'hash-table', 'hash map': 'hash-table', 'hashmap': 'hash-table', 'hashing': 'hash-table',
    'linked list': 'linked-list', 'divide and conquer': 'divide-and-conquer',
    'greedy algorithm': 'greedy', 'sorting algorithm': 'sorting',
    'graph theory': 'graph', 'tree traversal': 'tree',
    'sliding window': 'sliding-window', 'priority queue': 'heap',
    'math': 'mathematics', 'maths': 'mathematics',
    'string manipulation': 'string', 'strings': 'string', 'arrays': 'array',
    'matrix': 'matrix', '2d array': 'matrix', 'bit manipulation': 'bit-manipulation',
    // Extended synonyms for better matching
    'palindrome': 'palindrome', 'palindromic': 'palindrome',
    'subarray': 'subarray', 'contiguous': 'subarray', 'kadane': 'subarray',
    'subsequence': 'subsequence', 'lis': 'subsequence', 'lcs': 'subsequence',
    'intervals': 'intervals', 'merge intervals': 'intervals', 'overlapping': 'intervals',
    'islands': 'islands', 'connected components': 'islands', 'flood fill': 'islands',
    'cycle': 'cycle', 'cycle detection': 'cycle', 'loop': 'cycle',
    'anagram': 'anagram', 'anagrams': 'anagram', 'permutation': 'permutation',
    'stock': 'stock', 'buy sell': 'stock', 'trading': 'stock',
    'path sum': 'path-sum', 'path': 'path-sum',
    'topological': 'topological-sort', 'topo sort': 'topological-sort',
    'backtrack': 'backtracking', 'recursion': 'backtracking',
    'prefix': 'prefix-sum', 'prefix sum': 'prefix-sum', 'cumulative': 'prefix-sum',
    'monotonic': 'monotonic-stack', 'monotone': 'monotonic-stack',
    'union find': 'union-find', 'disjoint set': 'union-find', 'dsu': 'union-find',
    'cache': 'design', 'lru': 'design', 'lfu': 'design',
    // Zigzag / simulation synonyms
    'zigzag': 'zigzag', 'zig-zag': 'zigzag', 'zig zag': 'zigzag', 'z-shape': 'zigzag',
    'simulation': 'simulation', 'simulate': 'simulation', 'pattern': 'pattern'
  };

  const DIFFICULTY_MAP = {
    'easy': 1, 'medium': 3, 'hard': 5, 'school': 1, 'basic': 1, 'beginner': 1,
    '800': 1, '900': 1, '1000': 1, '1100': 2, '1200': 2, '1300': 2,
    '1400': 3, '1500': 3, '1600': 3, '1700': 4, '1800': 4, '1900': 4,
    '2000': 5, '2100': 5, '2200': 5
  };

  function tokenize(str) {
    if (!str) return [];
    return str.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\d+/g, '').split(/\s+/)
      .filter(t => t.length > 1 && !['the', 'a', 'an', 'of', 'in', 'to', 'for', 'problem'].includes(t));
  }

  function jaccardSimilarity(setA, setB) {
    if (setA.size === 0 && setB.size === 0) return 1;
    if (setA.size === 0 || setB.size === 0) return 0;
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return intersection.size / new Set([...setA, ...setB]).size;
  }

  function levenshteinDistance(a, b) {
    if (!a || !b) return Math.max(a?.length || 0, b?.length || 0);
    const m = [];
    for (let i = 0; i <= b.length; i++) m[i] = [i];
    for (let j = 0; j <= a.length; j++) m[0][j] = j;
    for (let i = 1; i <= b.length; i++)
      for (let j = 1; j <= a.length; j++)
        m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    return m[b.length][a.length];
  }

  function levenshteinSimilarity(a, b) {
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    return 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length);
  }

  function normalizeTag(tag) {
    const lower = tag.toLowerCase().trim();
    return TAG_SYNONYMS[lower] || lower.replace(/\s+/g, '-');
  }

  function normalizeDifficulty(diff) {
    if (!diff) return 3;
    const s = String(diff).toLowerCase().trim();
    if (DIFFICULTY_MAP[s]) return DIFFICULTY_MAP[s];
    const n = parseInt(s);
    if (!isNaN(n)) return n <= 1000 ? 1 : n <= 1300 ? 2 : n <= 1600 ? 3 : n <= 1900 ? 4 : 5;
    return 3;
  }

  function extractConstraints(text) {
    if (!text) return {};
    const c = {};
    for (const m of text.matchAll(/(\w)\s*[≤<]=?\s*10\^(\d+)/gi)) c[m[1].toLowerCase()] = Math.pow(10, parseInt(m[2]));
    for (const m of text.matchAll(/(\w)\s*[≤<]=?\s*1e(\d+)/gi)) c[m[1].toLowerCase()] = Math.pow(10, parseInt(m[2]));
    for (const m of text.matchAll(/(\w)\s*[≤<]=?\s*(\d{3,})/gi)) if (!c[m[1].toLowerCase()]) c[m[1].toLowerCase()] = parseInt(m[2]);
    return c;
  }

  function extractIOStructure(text) {
    if (!text) return new Set();
    const lower = text.toLowerCase(), s = new Set();
    if (/\barray\b|\blist\b/.test(lower)) s.add('array');
    if (/\bmatrix\b|\bgrid\b/.test(lower)) s.add('matrix');
    if (/\bstring\b/.test(lower)) s.add('string');
    if (/\binteger\b|\bnumber\b/.test(lower)) s.add('integer');
    if (/\btree\b/.test(lower)) s.add('tree');
    if (/\bgraph\b|\bedges?\b/.test(lower)) s.add('graph');
    return s;
  }

  function titleSimilarity(a, b) {
    const tA = tokenize(a), tB = tokenize(b);
    const jaccard = jaccardSimilarity(new Set(tA), new Set(tB));
    const lev = levenshteinSimilarity(tA.sort().join(' '), tB.sort().join(' '));
    return jaccard * 0.6 + lev * 0.4;
  }

  function tagSimilarity(a, b) {
    return jaccardSimilarity(new Set((a || []).map(normalizeTag)), new Set((b || []).map(normalizeTag)));
  }

  function constraintSimilarity(a, b) {
    const cA = typeof a === 'string' ? extractConstraints(a) : (a || {});
    const cB = typeof b === 'string' ? extractConstraints(b) : (b || {});
    if (!Object.keys(cA).length && !Object.keys(cB).length) return 0.5;
    const nA = cA.n || cA.N || Math.max(...Object.values(cA), 1);
    const nB = cB.n || cB.N || Math.max(...Object.values(cB), 1);
    if (!nA || !nB) return 0.3;
    return Math.max(0, 1 - Math.abs(Math.log10(nA) - Math.log10(nB)) / Math.max(Math.log10(nA), Math.log10(nB), 1));
  }

  function difficultySimilarity(a, b) { return 1 - Math.abs(normalizeDifficulty(a) - normalizeDifficulty(b)) / 4; }

  function ioStructureSimilarity(a, b) {
    const sA = typeof a === 'string' ? extractIOStructure(a) : new Set(a || []);
    const sB = typeof b === 'string' ? extractIOStructure(b) : new Set(b || []);
    return jaccardSimilarity(sA, sB);
  }

  function calculateSimilarity(pA, pB, feedback = null, semanticScore = null) {
    const ts = titleSimilarity(pA.title, pB.title);
    const tg = tagSimilarity(pA.tags, pB.tags);
    const cs = constraintSimilarity(pA.constraints, pB.constraints);
    const ds = difficultySimilarity(pA.difficulty, pB.difficulty);
    const io = ioStructureSimilarity(pA.ioStructure || pA.description, pB.ioStructure || pB.description);

    let score;
    let breakdown;

    // If semantic score is provided (from ML), use hybrid scoring
    if (semanticScore !== null && semanticScore > 0) {
      // Semantic score has higher weight when available
      const semanticWeight = 0.45;
      const adjustedWeights = {
        title: 0.20,
        tags: 0.15,
        semantic: semanticWeight,
        constraints: 0.10,
        difficulty: 0.05,
        ioStructure: 0.05
      };

      const ss = semanticScore / 100;
      score = Math.round((
        ts * adjustedWeights.title +
        tg * adjustedWeights.tags +
        ss * adjustedWeights.semantic +
        cs * adjustedWeights.constraints +
        ds * adjustedWeights.difficulty +
        io * adjustedWeights.ioStructure
      ) * 100);

      breakdown = {
        title: { score: Math.round(ts * 100), weight: adjustedWeights.title, contribution: Math.round(ts * adjustedWeights.title * 100) },
        tags: { score: Math.round(tg * 100), weight: adjustedWeights.tags, contribution: Math.round(tg * adjustedWeights.tags * 100) },
        semantic: { score: semanticScore, weight: adjustedWeights.semantic, contribution: Math.round(ss * adjustedWeights.semantic * 100) },
        constraints: { score: Math.round(cs * 100), weight: adjustedWeights.constraints, contribution: Math.round(cs * adjustedWeights.constraints * 100) },
        difficulty: { score: Math.round(ds * 100), weight: adjustedWeights.difficulty, contribution: Math.round(ds * adjustedWeights.difficulty * 100) },
        ioStructure: { score: Math.round(io * 100), weight: adjustedWeights.ioStructure, contribution: Math.round(io * adjustedWeights.ioStructure * 100) },
        feedbackBoost: 0
      };
    } else {
      // Standard scoring without semantic
      score = Math.round((ts * WEIGHTS.title + tg * WEIGHTS.tags + cs * WEIGHTS.constraints + ds * WEIGHTS.difficulty + io * WEIGHTS.ioStructure) * 100);
      breakdown = {
        title: { score: Math.round(ts * 100), weight: WEIGHTS.title, contribution: Math.round(ts * WEIGHTS.title * 100) },
        tags: { score: Math.round(tg * 100), weight: WEIGHTS.tags, contribution: Math.round(tg * WEIGHTS.tags * 100) },
        constraints: { score: Math.round(cs * 100), weight: WEIGHTS.constraints, contribution: Math.round(cs * WEIGHTS.constraints * 100) },
        difficulty: { score: Math.round(ds * 100), weight: WEIGHTS.difficulty, contribution: Math.round(ds * WEIGHTS.difficulty * 100) },
        ioStructure: { score: Math.round(io * 100), weight: WEIGHTS.ioStructure, contribution: Math.round(io * WEIGHTS.ioStructure * 100) },
        feedbackBoost: 0
      };
    }

    const fb = feedback === 'confirmed' ? 15 : feedback === 'rejected' ? -100 : 0;
    score = Math.max(0, Math.min(100, score + fb));
    breakdown.feedbackBoost = fb;

    return { score, breakdown };
  }

  function getScoreClassification(score) {
    if (score >= 85) return { label: 'Same Problem', className: 'cc-score-same', emoji: '✅' };
    if (score >= 65) return { label: 'Highly Similar', className: 'cc-score-similar', emoji: '⚠️' };
    if (score >= 40) return { label: 'Related Variant', className: 'cc-score-related', emoji: '🔵' };
    return { label: 'Low Match', className: 'cc-score-low', emoji: '⚪' };
  }

  return {
    WEIGHTS, FEEDBACK_BOOST, titleSimilarity, tagSimilarity, constraintSimilarity, difficultySimilarity,
    ioStructureSimilarity, calculateSimilarity, getScoreClassification, normalizeTag, normalizeDifficulty,
    extractConstraints, extractIOStructure, tokenize
  };
})();

if (typeof window !== 'undefined') window.CodeCompareScorer = CodeCompareScorer;
