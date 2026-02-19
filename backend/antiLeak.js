/**
 * antiLeak.js – Post-processing safety guard
 *
 * Scans LLM output for accidental code snippets and blocks them.
 * This is the last line of defence before sending a response to the client.
 */

'use strict';

// Patterns that indicate code was generated
const CODE_PATTERNS = [
    /```[\s\S]*?```/g,                         // fenced code blocks
    /\bfunction\s*\w*\s*\(/g,                  // function declarations
    /\bconst\s+\w+\s*=/g,                      // const assignments
    /\blet\s+\w+\s*=/g,                        // let assignments
    /\bvar\s+\w+\s*=/g,                         // var assignments
    /\bfor\s*\(/g,                              // for loops
    /\bwhile\s*\(/g,                            // while loops
    /\breturn\s+[^.]/g,                         // return statements (not "return to")
    /\bdef\s+\w+\s*\(/g,                        // Python function def
    /\bclass\s+\w+\s*[{(]/g,                    // class declarations
    /=>\s*{/g,                                  // arrow functions
    /\bif\s*\(.*\)\s*{/g,                       // if blocks with braces
    /\bimport\s+.*from\s+['"]/g,               // ES6 imports
    /\b(System\.out|console\.log|print)\s*\(/g, // print statements
    /\bint\s+\w+\s*=\s*\d/g,                   // C/Java typed variable
];

// Phrases that strongly indicate solution leaking
const SOLUTION_PHRASES = [
    'here is the code',
    'here\'s the code',
    'here is the solution',
    'the implementation is',
    'the complete solution',
    'here is a working',
    'here\'s the implementation',
];

const BLOCKED_MESSAGE =
    '⚠️ Code generation is restricted in this mode. ' +
    'Please use the hints to guide your thinking instead.';

/**
 * Sanitize LLM output – remove or block code.
 * @param {string} text  Raw LLM response
 * @returns {{ safe: boolean, text: string, blocked: string[] }}
 */
function sanitize(text) {
    if (!text || typeof text !== 'string') {
        return { safe: true, text: '', blocked: [] };
    }

    const blocked = [];

    // 1. Check solution-leak phrases (case insensitive)
    const lower = text.toLowerCase();
    for (const phrase of SOLUTION_PHRASES) {
        if (lower.includes(phrase)) {
            blocked.push(`Phrase: "${phrase}"`);
        }
    }

    // 2. Check code patterns
    for (const pattern of CODE_PATTERNS) {
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
        if (pattern.test(text)) {
            blocked.push(`Pattern: ${pattern.source}`);
        }
    }

    // If anything was blocked, replace the entire response
    if (blocked.length > 0) {
        console.warn('[antiLeak] Blocked code in response:', blocked);
        return {
            safe: false,
            text: BLOCKED_MESSAGE,
            blocked,
        };
    }

    // 3. Strip any stray inline code (single backtick pairs > 30 chars)
    //    Short inline code like `O(n)` or `HashMap` is acceptable
    const cleaned = text.replace(/`[^`]{30,}`/g, '`[code removed]`');

    return { safe: true, text: cleaned, blocked: [] };
}

module.exports = { sanitize, BLOCKED_MESSAGE };
