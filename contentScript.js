/**
 * contentScript.js - Platform Detection & DOM Extraction for CodeCompare
 * Extracts problem data from LeetCode, GeeksforGeeks, Codeforces, HackerRank
 */

const CodeCompareExtractor = (() => {
    'use strict';

    // Detect current platform based on URL
    function detectPlatform() {
        const host = window.location.hostname;
        if (host.includes('leetcode.com')) return 'leetcode';
        if (host.includes('geeksforgeeks.org')) return 'geeksforgeeks';
        if (host.includes('codeforces.com')) return 'codeforces';
        if (host.includes('hackerrank.com')) return 'hackerrank';
        return null;
    }

    // Generate unique problem ID from URL
    function generateId(platform) {
        const path = window.location.pathname;
        switch (platform) {
            case 'leetcode':
                const lcMatch = path.match(/\/problems\/([^\/]+)/);
                return lcMatch ? `leetcode:${lcMatch[1]}` : null;
            case 'geeksforgeeks':
                const gfgMatch = path.match(/\/problems\/([^\/]+)/);
                return gfgMatch ? `gfg:${gfgMatch[1]}` : null;
            case 'codeforces':
                const cfMatch = path.match(/\/problem\/(\d+)\/([A-Z]\d?)/i) || path.match(/\/problemset\/problem\/(\d+)\/([A-Z]\d?)/i);
                return cfMatch ? `codeforces:${cfMatch[1]}${cfMatch[2]}` : null;
            case 'hackerrank':
                const hrMatch = path.match(/\/challenges\/([^\/]+)/);
                return hrMatch ? `hackerrank:${hrMatch[1]}` : null;
            default:
                return null;
        }
    }

    // Extract from LeetCode
    function extractLeetCode() {
        const problem = { platform: 'leetcode', url: window.location.href };

        // Title - try multiple selectors
        const titleEl = document.querySelector('[data-cy="question-title"]')
            || document.querySelector('.text-title-large')
            || document.querySelector('div[class*="text-title"]')
            || document.querySelector('h1');
        problem.title = titleEl?.textContent?.trim()?.replace(/^\d+\.\s*/, '') || '';

        // Difficulty
        const diffEl = document.querySelector('[data-cy="question-difficulty"]')
            || document.querySelector('div[class*="text-difficulty"]')
            || document.querySelector('[class*="text-green"]')
            || document.querySelector('[class*="text-yellow"]')
            || document.querySelector('[class*="text-red"]');
        const diffText = diffEl?.textContent?.toLowerCase()?.trim() || '';
        if (diffText.includes('easy')) problem.difficulty = 'easy';
        else if (diffText.includes('medium')) problem.difficulty = 'medium';
        else if (diffText.includes('hard')) problem.difficulty = 'hard';
        else problem.difficulty = 'medium';

        // Tags
        const tagEls = document.querySelectorAll('a[href*="/tag/"]');
        problem.tags = [...tagEls].map(el => el.textContent.trim()).filter(t => t);

        // Constraints - look in problem description
        const descEl = document.querySelector('[data-cy="question-content"]')
            || document.querySelector('.elfjS')
            || document.querySelector('[class*="description"]');
        problem.description = descEl?.textContent || '';

        // Parse constraints from description
        const constraintMatch = problem.description.match(/constraints[:\s]*([\s\S]*?)(?:\n\n|$)/i);
        problem.constraints = constraintMatch ? constraintMatch[1] : problem.description;

        problem.id = generateId('leetcode');
        return problem;
    }

    // Extract from GeeksforGeeks
    function extractGeeksForGeeks() {
        const problem = { platform: 'geeksforgeeks', url: window.location.href };

        // Title
        const titleEl = document.querySelector('.problem-tab__name')
            || document.querySelector('h3.problem-name')
            || document.querySelector('.problems_header_content__title')
            || document.querySelector('h1');
        problem.title = titleEl?.textContent?.trim() || '';

        // Difficulty
        const diffEl = document.querySelector('.problem-tab__difficulty')
            || document.querySelector('.problemlevel')
            || document.querySelector('[class*="difficulty"]');
        problem.difficulty = diffEl?.textContent?.toLowerCase()?.trim() || 'medium';

        // Tags
        const tagEls = document.querySelectorAll('.problem-tag')
            || document.querySelectorAll('a[href*="/explore?category"]');
        problem.tags = [...tagEls].map(el => el.textContent.trim()).filter(t => t);

        // Description & Constraints
        const descEl = document.querySelector('.problems_problem_content')
            || document.querySelector('.problem-statement')
            || document.querySelector('.problem-content');
        problem.description = descEl?.textContent || '';
        problem.constraints = problem.description;

        problem.id = generateId('geeksforgeeks');
        return problem;
    }

    // Extract from Codeforces
    function extractCodeforces() {
        const problem = { platform: 'codeforces', url: window.location.href };

        // Title
        const titleEl = document.querySelector('.title')
            || document.querySelector('.problem-statement .header .title');
        problem.title = titleEl?.textContent?.trim()?.replace(/^[A-Z]\d?\.\s*/, '') || '';

        // Difficulty (rating) - look in problem tags
        const ratingEl = document.querySelector('.tag-box[title*="difficulty"]')
            || document.querySelector('span[title*="Difficulty"]');
        const ratingMatch = ratingEl?.textContent?.match(/\d+/)
            || document.body.innerHTML.match(/data-tag="\*(\d+)"/);
        problem.difficulty = ratingMatch ? ratingMatch[0] || ratingMatch[1] : '1400';

        // Tags
        const tagEls = document.querySelectorAll('.tag-box:not([title*="difficulty"])');
        problem.tags = [...tagEls].map(el => el.textContent.trim().replace(/\*\d+/, '')).filter(t => t);

        // Description
        const descEl = document.querySelector('.problem-statement');
        problem.description = descEl?.textContent || '';

        // Constraints from input specification
        const inputSpec = document.querySelector('.input-specification');
        problem.constraints = inputSpec?.textContent || problem.description;

        problem.id = generateId('codeforces');
        return problem;
    }

    // Extract from HackerRank
    function extractHackerRank() {
        const problem = { platform: 'hackerrank', url: window.location.href };

        // Title
        const titleEl = document.querySelector('.challenge-page-label-wrapper h1')
            || document.querySelector('.ui-icon-label.page-label')
            || document.querySelector('h1.page-label')
            || document.querySelector('h2.hr-fs-5');
        problem.title = titleEl?.textContent?.trim() || '';

        // Difficulty
        const diffEl = document.querySelector('.challenge-page-label-wrapper .difficulty')
            || document.querySelector('.difficulty-block')
            || document.querySelector('[class*="difficulty"]');
        problem.difficulty = diffEl?.textContent?.toLowerCase()?.trim() || 'medium';

        // Tags
        const tagEls = document.querySelectorAll('.challenge-topic')
            || document.querySelectorAll('a[href*="/domains/"]');
        problem.tags = [...tagEls].map(el => el.textContent.trim()).filter(t => t);

        // Description
        const descEl = document.querySelector('.challenge-body-html')
            || document.querySelector('.problem-statement');
        problem.description = descEl?.textContent || '';
        problem.constraints = problem.description;

        problem.id = generateId('hackerrank');
        return problem;
    }

    // Main extraction function
    function extractCurrentProblem() {
        const platform = detectPlatform();
        if (!platform) return null;

        let problem;
        switch (platform) {
            case 'leetcode': problem = extractLeetCode(); break;
            case 'geeksforgeeks': problem = extractGeeksForGeeks(); break;
            case 'codeforces': problem = extractCodeforces(); break;
            case 'hackerrank': problem = extractHackerRank(); break;
            default: return null;
        }

        // Validate extraction
        if (!problem.title || !problem.id) {
            console.warn('[CodeCompare] Could not extract problem data');
            return null;
        }

        console.log('[CodeCompare] Extracted problem:', problem.title, problem);
        return problem;
    }

    return { detectPlatform, extractCurrentProblem, generateId };
})();

// ============================================
// MAIN INITIALIZATION WITH SPA SUPPORT
// ============================================
(async function init() {
    'use strict';

    let currentUrl = window.location.href;
    let isProcessing = false;

    // Main function to load/reload extension for current problem
    async function loadExtension() {
        if (isProcessing) return;
        isProcessing = true;

        console.log('[CodeCompare] Loading extension for:', window.location.pathname);

        // Wait for content to be available
        let attempts = 0;
        const maxAttempts = 15;

        const tryExtract = async () => {
            attempts++;
            const problem = CodeCompareExtractor.extractCurrentProblem();

            if (problem && problem.title) {
                console.log('[CodeCompare] Extracted:', problem.title);

                // Initialize UI with loading state
                if (typeof CodeCompareUI !== 'undefined') {
                    CodeCompareUI.init(problem, [], true);
                }

                // Find similar problems
                try {
                    const matches = await CodeCompareMatcher.findSimilarProblems(problem);
                    console.log('[CodeCompare] Found', matches.length, 'matches');

                    if (typeof CodeCompareUI !== 'undefined') {
                        CodeCompareUI.updateMatches(matches);
                    }
                } catch (e) {
                    console.error('[CodeCompare] Match search failed:', e);
                    const syncMatches = CodeCompareMatcher.findSimilarProblemsSync(problem);
                    if (typeof CodeCompareUI !== 'undefined') {
                        CodeCompareUI.updateMatches(syncMatches);
                    }
                }

                isProcessing = false;
            } else if (attempts < maxAttempts) {
                setTimeout(tryExtract, 800);
            } else {
                console.log('[CodeCompare] Could not extract problem after', maxAttempts, 'attempts');
                isProcessing = false;
            }
        };

        tryExtract();
    }

    // Detect URL changes (for SPA navigation)
    function setupUrlChangeDetection() {
        // Method 1: Poll for URL changes
        setInterval(() => {
            if (window.location.href !== currentUrl) {
                console.log('[CodeCompare] URL changed:', currentUrl, '->', window.location.href);
                currentUrl = window.location.href;

                // Small delay to let the new page content load
                setTimeout(loadExtension, 1000);
            }
        }, 500);

        // Method 2: Listen for popstate (back/forward navigation)
        window.addEventListener('popstate', () => {
            console.log('[CodeCompare] Popstate event detected');
            setTimeout(loadExtension, 1000);
        });

        // Method 3: Observer for DOM changes that might indicate navigation
        const observer = new MutationObserver((mutations) => {
            // Check if URL has changed
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                setTimeout(loadExtension, 1000);
            }
        });

        // Observe changes to the main content area
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Expose refresh function globally for UI to call
    window.CodeCompareRefresh = loadExtension;

    // Initial load
    setTimeout(loadExtension, 1500);

    // Setup URL change detection for SPA
    setupUrlChangeDetection();
})();

if (typeof window !== 'undefined') window.CodeCompareExtractor = CodeCompareExtractor;

