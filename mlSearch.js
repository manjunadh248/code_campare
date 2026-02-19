/**
 * mlSearch.js - ML-Based Semantic Search for CodeCompare
 * Uses Hugging Face Inference API for semantic similarity matching
 */

const CodeCompareMLSearch = (() => {
    'use strict';

    const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2';
    const BACKEND_URL = 'http://localhost:3001';
    const HF_KEY_STORAGE = 'codecompare_hf_api_key';
    const EMBEDDING_CACHE_KEY = 'codecompare_embeddings_cache';
    const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

    let hfApiKey = null;

    // Initialize API key from storage
    async function init() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get(HF_KEY_STORAGE);
                hfApiKey = result[HF_KEY_STORAGE] || null;
            } else {
                hfApiKey = localStorage.getItem(HF_KEY_STORAGE);
            }
            console.log('[CodeCompare ML] Initialized, HF key:', hfApiKey ? 'present' : 'missing');
        } catch (e) {
            console.warn('[CodeCompare ML] Init failed:', e);
        }
    }

    // Set Hugging Face API key
    async function setApiKey(key) {
        hfApiKey = key;
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({ [HF_KEY_STORAGE]: key });
            } else {
                localStorage.setItem(HF_KEY_STORAGE, key);
            }
            console.log('[CodeCompare ML] API key saved');
            return true;
        } catch (e) {
            console.error('[CodeCompare ML] Failed to save key:', e);
            return false;
        }
    }

    // Get API key
    function getApiKey() {
        return hfApiKey;
    }

    // Check if ML search is configured
    function isConfigured() {
        return !!hfApiKey;
    }

    // Load embedding cache
    function loadEmbeddingCache() {
        try {
            const data = localStorage.getItem(EMBEDDING_CACHE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    // Save embedding cache
    function saveEmbeddingCache(cache) {
        try {
            // Limit cache size
            const keys = Object.keys(cache);
            if (keys.length > 500) {
                const sortedKeys = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
                sortedKeys.slice(0, keys.length - 400).forEach(k => delete cache[k]);
            }
            localStorage.setItem(EMBEDDING_CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.warn('[CodeCompare ML] Failed to save cache:', e);
        }
    }

    // Get cached embedding
    function getCachedEmbedding(text) {
        const cache = loadEmbeddingCache();
        const key = text.toLowerCase().trim();
        const entry = cache[key];
        if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
            return entry.embedding;
        }
        return null;
    }

    // Cache embedding
    function cacheEmbedding(text, embedding) {
        const cache = loadEmbeddingCache();
        const key = text.toLowerCase().trim();
        cache[key] = { embedding, timestamp: Date.now() };
        saveEmbeddingCache(cache);
    }

    // Generate embedding using backend proxy (avoids CSP/CORS issues)
    async function generateEmbedding(text) {
        if (!hfApiKey) {
            throw new Error('Hugging Face API key not configured');
        }

        // Check cache first
        const cached = getCachedEmbedding(text);
        if (cached) {
            console.log('[CodeCompare ML] Cache hit for:', text.substring(0, 30));
            return cached;
        }

        const response = await fetch(`${BACKEND_URL}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs: text,
                hf_api_key: hfApiKey,
            })
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || `HF API error: ${response.status}`);
        }

        const embedding = await response.json();

        // Cache the result
        cacheEmbedding(text, embedding);

        return embedding;
    }

    // Generate embeddings for multiple texts (batch)
    async function generateEmbeddings(texts) {
        if (!hfApiKey) {
            throw new Error('Hugging Face API key not configured');
        }

        // Check cache for each text
        const results = [];
        const uncached = [];
        const uncachedIndices = [];

        for (let i = 0; i < texts.length; i++) {
            const cached = getCachedEmbedding(texts[i]);
            if (cached) {
                results[i] = cached;
            } else {
                uncached.push(texts[i]);
                uncachedIndices.push(i);
            }
        }

        // Fetch uncached embeddings via backend proxy
        if (uncached.length > 0) {
            const response = await fetch(`${BACKEND_URL}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputs: uncached,
                    hf_api_key: hfApiKey,
                })
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody.error || `HF API error: ${response.status}`);
            }

            const embeddings = await response.json();

            // Fill in results and cache
            for (let i = 0; i < uncached.length; i++) {
                const embedding = embeddings[i];
                results[uncachedIndices[i]] = embedding;
                cacheEmbedding(uncached[i], embedding);
            }
        }

        return results;
    }

    // Calculate cosine similarity between two embeddings
    function cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) {
            return 0;
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Calculate semantic similarity between two problem titles
    async function calculateSemanticSimilarity(titleA, titleB) {
        try {
            const [embA, embB] = await generateEmbeddings([titleA, titleB]);
            const similarity = cosineSimilarity(embA, embB);
            return Math.round(similarity * 100);
        } catch (e) {
            console.error('[CodeCompare ML] Similarity calculation failed:', e);
            return null;
        }
    }

    // Find semantically similar problems from a list
    async function findSemanticMatches(sourceTitle, candidates, topK = 10) {
        if (!isConfigured() || candidates.length === 0) {
            return [];
        }

        try {
            console.log('[CodeCompare ML] Finding semantic matches for:', sourceTitle);

            // Prepare all texts
            const allTexts = [sourceTitle, ...candidates.map(c => c.title)];

            // Get embeddings for all
            const embeddings = await generateEmbeddings(allTexts);
            const sourceEmbedding = embeddings[0];

            // Calculate similarities
            const results = candidates.map((candidate, i) => {
                const candidateEmbedding = embeddings[i + 1];
                const similarity = cosineSimilarity(sourceEmbedding, candidateEmbedding);
                return {
                    problem: candidate,
                    semanticScore: Math.round(similarity * 100),
                    source: 'ml'
                };
            });

            // Sort by semantic score and return top K
            results.sort((a, b) => b.semanticScore - a.semanticScore);

            console.log(`[CodeCompare ML] Found ${results.length} matches, top score: ${results[0]?.semanticScore}%`);

            return results.slice(0, topK);
        } catch (e) {
            console.error('[CodeCompare ML] Semantic search failed:', e);
            return [];
        }
    }

    // Test API connection
    async function testConnection() {
        if (!hfApiKey) {
            return { success: false, error: 'API key not configured' };
        }

        try {
            const embedding = await generateEmbedding('test problem two sum array');
            if (embedding && embedding.length > 0) {
                return { success: true, dimensions: embedding.length };
            }
            return { success: false, error: 'Invalid response' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // Clear embedding cache
    function clearCache() {
        localStorage.removeItem(EMBEDDING_CACHE_KEY);
        console.log('[CodeCompare ML] Embedding cache cleared');
    }

    // Get cache stats
    function getCacheStats() {
        const cache = loadEmbeddingCache();
        return {
            entries: Object.keys(cache).length,
            sizeKB: Math.round(JSON.stringify(cache).length / 1024)
        };
    }

    // Initialize on load
    init();

    return {
        init,
        setApiKey,
        getApiKey,
        isConfigured,
        generateEmbedding,
        generateEmbeddings,
        cosineSimilarity,
        calculateSemanticSimilarity,
        findSemanticMatches,
        testConnection,
        clearCache,
        getCacheStats
    };
})();

if (typeof window !== 'undefined') window.CodeCompareMLSearch = CodeCompareMLSearch;
