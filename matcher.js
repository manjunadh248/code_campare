/**
 * matcher.js - Hybrid Matching Engine for CodeCompare
 * Combines API-based and static database matching with weighted scoring
 */

const CodeCompareMatcher = (() => {
    'use strict';

    const STORAGE_KEY = 'codecompare_data';
    const MIN_SCORE_THRESHOLD = 25;

    // Load stored data from localStorage
    function loadStoredData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : { feedback: {}, cache: {}, settings: { theme: 'dark', autoExpand: false } };
        } catch (e) {
            console.warn('[CodeCompare] Failed to load stored data:', e);
            return { feedback: {}, cache: {}, settings: {} };
        }
    }

    // Save data to localStorage
    function saveStoredData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[CodeCompare] Failed to save data:', e);
        }
    }

    // Generate feedback key for a problem pair
    function getFeedbackKey(problemA_id, problemB_id) {
        return [problemA_id, problemB_id].sort().join('_');
    }

    // Get feedback status for a problem pair
    function getFeedbackStatus(currentId, candidateId) {
        const data = loadStoredData();
        const key = getFeedbackKey(currentId, candidateId);
        return data.feedback[key] || null;
    }

    // Save feedback for a problem pair
    function saveFeedback(currentId, candidateId, status) {
        const data = loadStoredData();
        const key = getFeedbackKey(currentId, candidateId);
        data.feedback[key] = status;
        saveStoredData(data);
        console.log(`[CodeCompare] Saved feedback: ${key} = ${status}`);
    }

    // Cache a problem's extracted data
    function cacheProblem(problem) {
        const data = loadStoredData();
        data.cache[problem.id] = { ...problem, lastUpdated: Date.now() };
        saveStoredData(data);
    }

    // Score and rank candidates
    function scoreAndRankCandidates(currentProblem, candidates, semanticScores = {}) {
        const results = [];

        for (const candidate of candidates) {
            const feedbackStatus = getFeedbackStatus(currentProblem.id, candidate.id);

            // Skip rejected matches
            if (feedbackStatus === 'rejected') continue;

            // Get semantic score if available
            const semanticScore = semanticScores[candidate.id] || null;

            const { score, breakdown } = CodeCompareScorer.calculateSimilarity(
                currentProblem, candidate, feedbackStatus, semanticScore
            );

            if (score >= MIN_SCORE_THRESHOLD) {
                results.push({
                    problem: candidate,
                    score,
                    breakdown,
                    feedbackStatus,
                    classification: CodeCompareScorer.getScoreClassification(score),
                    source: candidate.source || 'local',
                    hasSemanticScore: semanticScore !== null
                });
            }
        }

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, 10);
    }

    // Find similar problems - HYBRID approach (ML + API + static database)
    async function findSimilarProblems(currentProblem) {
        if (!currentProblem || !currentProblem.title) {
            console.warn('[CodeCompare] No current problem provided');
            return [];
        }

        console.log('[CodeCompare] Finding similar problems for:', currentProblem.title);

        let allCandidates = [];
        let semanticScores = {};

        // 1. Try CLIST API first (if configured)
        if (typeof CodeCompareAPI !== 'undefined' && CodeCompareAPI.isConfigured()) {
            try {
                console.log('[CodeCompare] Fetching from CLIST API...');
                const apiResults = await CodeCompareAPI.findSimilarProblems(currentProblem);
                allCandidates = apiResults.map(p => ({ ...p, source: 'api' }));
                console.log(`[CodeCompare] CLIST API returned ${apiResults.length} candidates`);
            } catch (e) {
                console.warn('[CodeCompare] CLIST API fetch failed:', e);
            }
        }

        // 2. Also get candidates from static database (fallback + supplement)
        if (typeof CodeCompareProblemDB !== 'undefined') {
            const localCandidates = CodeCompareProblemDB.getOtherPlatforms(currentProblem.platform);
            const localWithSource = localCandidates.map(p => ({ ...p, source: 'local' }));

            // Merge - prefer API results for same problem, add unique local ones
            const seen = new Set(allCandidates.map(p => p.id));
            for (const local of localWithSource) {
                if (!seen.has(local.id)) {
                    allCandidates.push(local);
                    seen.add(local.id);
                }
            }
            console.log(`[CodeCompare] Total candidates after local merge: ${allCandidates.length}`);
        }

        // 3. Try ML semantic search (if configured) - this adds semantic scores
        if (typeof CodeCompareMLSearch !== 'undefined' && CodeCompareMLSearch.isConfigured() && allCandidates.length > 0) {
            try {
                console.log('[CodeCompare] Running ML semantic search...');
                const mlResults = await CodeCompareMLSearch.findSemanticMatches(
                    currentProblem.title,
                    allCandidates,
                    allCandidates.length // Score all candidates
                );

                // Build semantic scores map
                for (const result of mlResults) {
                    if (result.semanticScore > 0) {
                        semanticScores[result.problem.id] = result.semanticScore;
                    }
                }

                console.log(`[CodeCompare] ML scored ${Object.keys(semanticScores).length} candidates`);
            } catch (e) {
                console.warn('[CodeCompare] ML search failed, using standard scoring:', e);
            }
        } else if (typeof CodeCompareMLSearch !== 'undefined' && !CodeCompareMLSearch.isConfigured()) {
            console.log('[CodeCompare] ML search not configured (no HuggingFace API key)');
        }

        // 4. Score and rank all candidates (with semantic scores if available)
        return scoreAndRankCandidates(currentProblem, allCandidates, semanticScores);
    }

    // Synchronous version for backward compatibility (uses static DB only)
    function findSimilarProblemsSync(currentProblem) {
        if (!currentProblem || !currentProblem.title) {
            return [];
        }

        const candidates = typeof CodeCompareProblemDB !== 'undefined'
            ? CodeCompareProblemDB.getOtherPlatforms(currentProblem.platform)
            : [];

        return scoreAndRankCandidates(currentProblem, candidates);
    }

    // Build explanation text for a match
    function buildExplanation(breakdown) {
        const parts = [];

        if (breakdown.title.contribution > 0) {
            parts.push(`Title: +${breakdown.title.contribution}pts (${breakdown.title.score}% match)`);
        }
        if (breakdown.tags.contribution > 0) {
            parts.push(`Tags: +${breakdown.tags.contribution}pts (${breakdown.tags.score}% overlap)`);
        }
        if (breakdown.constraints.contribution > 0) {
            parts.push(`Constraints: +${breakdown.constraints.contribution}pts`);
        }
        if (breakdown.difficulty.contribution > 0) {
            parts.push(`Difficulty: +${breakdown.difficulty.contribution}pts`);
        }
        if (breakdown.ioStructure.contribution > 0) {
            parts.push(`I/O Structure: +${breakdown.ioStructure.contribution}pts`);
        }
        if (breakdown.feedbackBoost > 0) {
            parts.push(`User confirmed: +${breakdown.feedbackBoost}pts`);
        }

        return parts.join('\n');
    }

    // Get stored settings
    function getSettings() {
        return loadStoredData().settings || {};
    }

    // Update settings
    function updateSettings(newSettings) {
        const data = loadStoredData();
        data.settings = { ...data.settings, ...newSettings };
        saveStoredData(data);
    }

    // Clear all feedback data
    function clearAllFeedback() {
        const data = loadStoredData();
        data.feedback = {};
        saveStoredData(data);
        console.log('[CodeCompare] All feedback cleared');
    }

    // Get feedback stats
    function getFeedbackStats() {
        const data = loadStoredData();
        const feedback = data.feedback || {};
        const confirmed = Object.values(feedback).filter(v => v === 'confirmed').length;
        const rejected = Object.values(feedback).filter(v => v === 'rejected').length;
        return { confirmed, rejected, total: Object.keys(feedback).length };
    }

    // Check if API is available
    function isApiAvailable() {
        return typeof CodeCompareAPI !== 'undefined' && CodeCompareAPI.isConfigured();
    }

    return {
        findSimilarProblems,
        findSimilarProblemsSync,
        saveFeedback,
        getFeedbackStatus,
        buildExplanation,
        cacheProblem,
        getSettings,
        updateSettings,
        clearAllFeedback,
        getFeedbackStats,
        isApiAvailable,
        STORAGE_KEY,
        MIN_SCORE_THRESHOLD
    };
})();

if (typeof window !== 'undefined') window.CodeCompareMatcher = CodeCompareMatcher;
