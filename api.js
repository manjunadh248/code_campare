/**
 * api.js - CLIST.by API Client for CodeCompare
 * Provides dynamic problem fetching from 100+ competitive programming platforms
 */

const CodeCompareAPI = (() => {
    'use strict';

    const API_BASE = 'https://clist.by/api/v4';
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    const CACHE_KEY = 'codecompare_api_cache';
    const API_KEY_STORAGE = 'codecompare_api_key';

    // Platform resource IDs for CLIST.by
    const PLATFORM_RESOURCES = {
        leetcode: 102,
        codeforces: 1,
        codechef: 2,
        hackerrank: 63,
        geeksforgeeks: 126,
        atcoder: 93
    };

    // Reverse mapping for platform names
    const RESOURCE_TO_PLATFORM = {
        102: 'leetcode',
        1: 'codeforces',
        2: 'codechef',
        63: 'hackerrank',
        126: 'geeksforgeeks',
        93: 'atcoder'
    };

    let apiKey = null;

    // Initialize API key from storage
    async function init() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get(API_KEY_STORAGE);
                apiKey = result[API_KEY_STORAGE] || null;
            } else {
                apiKey = localStorage.getItem(API_KEY_STORAGE);
            }
            console.log('[CodeCompare API] Initialized, key:', apiKey ? 'present' : 'missing');
        } catch (e) {
            console.warn('[CodeCompare API] Init failed:', e);
        }
    }

    // Set API key
    async function setApiKey(key) {
        apiKey = key;
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({ [API_KEY_STORAGE]: key });
            } else {
                localStorage.setItem(API_KEY_STORAGE, key);
            }
            console.log('[CodeCompare API] API key saved');
            return true;
        } catch (e) {
            console.error('[CodeCompare API] Failed to save key:', e);
            return false;
        }
    }

    // Get API key
    function getApiKey() {
        return apiKey;
    }

    // Check if API is configured
    function isConfigured() {
        return !!apiKey;
    }

    // Load cache from storage
    function loadCache() {
        try {
            const data = localStorage.getItem(CACHE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    // Save cache to storage
    function saveCache(cache) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.warn('[CodeCompare API] Failed to save cache:', e);
        }
    }

    // Get cached result if valid
    function getCached(key) {
        const cache = loadCache();
        const entry = cache[key];
        if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
            console.log('[CodeCompare API] Cache hit:', key);
            return entry.data;
        }
        return null;
    }

    // Set cache entry
    function setCache(key, data) {
        const cache = loadCache();
        cache[key] = { data, timestamp: Date.now() };

        // Limit cache size (keep last 100 entries)
        const keys = Object.keys(cache);
        if (keys.length > 100) {
            const oldestKeys = keys
                .sort((a, b) => cache[a].timestamp - cache[b].timestamp)
                .slice(0, keys.length - 100);
            oldestKeys.forEach(k => delete cache[k]);
        }

        saveCache(cache);
    }

    // Clear all cache
    function clearCache() {
        localStorage.removeItem(CACHE_KEY);
        console.log('[CodeCompare API] Cache cleared');
    }

    // Make API request
    async function apiRequest(endpoint, params = {}) {
        if (!apiKey) {
            throw new Error('API key not configured');
        }

        const url = new URL(`${API_BASE}/json/${endpoint}/`);
        url.searchParams.set('username', apiKey.split(':')[0] || '');
        url.searchParams.set('api_key', apiKey.split(':')[1] || apiKey);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        });

        console.log('[CodeCompare API] Request:', endpoint, params);

        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    // Search problems by tags
    async function searchByTags(tags, excludePlatform = null) {
        const cacheKey = `tags:${tags.sort().join(',')}:${excludePlatform || 'all'}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        try {
            // Build resource filter (exclude current platform)
            const resources = Object.entries(PLATFORM_RESOURCES)
                .filter(([platform]) => platform !== excludePlatform)
                .map(([, id]) => id)
                .join(',');

            const result = await apiRequest('problem', {
                resource__id__in: resources,
                tag: tags.slice(0, 3).join(','), // CLIST supports comma-separated tags
                limit: 50,
                order_by: '-rating'
            });

            const problems = (result.objects || []).map(normalizeProblem);
            setCache(cacheKey, problems);
            return problems;
        } catch (e) {
            console.error('[CodeCompare API] searchByTags failed:', e);
            return [];
        }
    }

    // Search problems by title keywords
    async function searchByTitle(title, excludePlatform = null) {
        // Extract keywords from title
        const keywords = title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !['the', 'and', 'for', 'with'].includes(w))
            .slice(0, 3)
            .join(' ');

        if (!keywords) return [];

        const cacheKey = `title:${keywords}:${excludePlatform || 'all'}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        try {
            const resources = Object.entries(PLATFORM_RESOURCES)
                .filter(([platform]) => platform !== excludePlatform)
                .map(([, id]) => id)
                .join(',');

            const result = await apiRequest('problem', {
                resource__id__in: resources,
                search: keywords,
                limit: 30,
                order_by: '-rating'
            });

            const problems = (result.objects || []).map(normalizeProblem);
            setCache(cacheKey, problems);
            return problems;
        } catch (e) {
            console.error('[CodeCompare API] searchByTitle failed:', e);
            return [];
        }
    }

    // Normalize CLIST problem to CodeCompare format
    function normalizeProblem(clistProblem) {
        const resourceId = clistProblem.resource?.id || clistProblem.resource_id;
        const platform = RESOURCE_TO_PLATFORM[resourceId] || 'unknown';

        return {
            id: `${platform}_${clistProblem.id}`,
            platform: platform,
            title: clistProblem.name || clistProblem.title || '',
            url: clistProblem.url || '',
            tags: (clistProblem.tags || []).map(t => t.toLowerCase()),
            difficulty: normalizeDifficulty(clistProblem.rating, platform),
            constraints: {},
            source: 'api'
        };
    }

    // Normalize difficulty rating to Easy/Medium/Hard
    function normalizeDifficulty(rating, platform) {
        if (!rating) return 'Medium';

        // Codeforces rating
        if (platform === 'codeforces') {
            if (rating <= 1200) return 'Easy';
            if (rating <= 1800) return 'Medium';
            return 'Hard';
        }

        // Generic rating normalization
        if (rating <= 1000) return 'Easy';
        if (rating <= 2000) return 'Medium';
        return 'Hard';
    }

    // Main search function - finds similar problems from API
    async function findSimilarProblems(currentProblem) {
        if (!isConfigured()) {
            console.log('[CodeCompare API] Not configured, skipping API search');
            return [];
        }

        console.log('[CodeCompare API] Searching for:', currentProblem.title);

        try {
            // Parallel searches by title and tags
            const [byTitle, byTags] = await Promise.all([
                searchByTitle(currentProblem.title, currentProblem.platform),
                currentProblem.tags?.length
                    ? searchByTags(currentProblem.tags, currentProblem.platform)
                    : Promise.resolve([])
            ]);

            // Merge and deduplicate results
            const seen = new Set();
            const merged = [];

            for (const problem of [...byTitle, ...byTags]) {
                if (!seen.has(problem.id) && problem.platform !== currentProblem.platform) {
                    seen.add(problem.id);
                    merged.push(problem);
                }
            }

            console.log(`[CodeCompare API] Found ${merged.length} potential matches`);
            return merged;
        } catch (e) {
            console.error('[CodeCompare API] Search failed:', e);
            return [];
        }
    }

    // Get cache stats
    function getCacheStats() {
        const cache = loadCache();
        const keys = Object.keys(cache);
        const oldestTime = keys.length
            ? Math.min(...keys.map(k => cache[k].timestamp))
            : null;

        return {
            entries: keys.length,
            oldestAge: oldestTime ? Date.now() - oldestTime : 0
        };
    }

    // Initialize on load
    init();

    return {
        init,
        setApiKey,
        getApiKey,
        isConfigured,
        searchByTags,
        searchByTitle,
        findSimilarProblems,
        clearCache,
        getCacheStats,
        PLATFORM_RESOURCES
    };
})();

if (typeof window !== 'undefined') window.CodeCompareAPI = CodeCompareAPI;
