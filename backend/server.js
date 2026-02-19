require('dotenv').config();

/**
 * server.js – CodeCompare Backend Proxy
 *
 * 1. GFG Scraper   – GET  /api/scrape?url=<gfg-url>
 * 2. AI Mentor     – POST /api/mentor { mode, problem_statement }
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt, getValidModes } = require('./prompts');
const { sanitize } = require('./antiLeak');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Persistent Disk Cache (survives server restarts!) ────────────────
// Mentor responses are expensive (Gemini API quota). We persist them to
// a JSON file so a server restart does NOT wipe cached hints.
const DISK_CACHE_FILE = path.join(__dirname, '.mentor_cache.json');
const CACHE_TTL = 5 * 60 * 1000;              // 5 min  (scraping)
const MENTOR_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hrs (mentor)
const CACHE_MAX = 500;

// In-memory cache (for scraping — fast, not worth persisting)
const cache = new Map();

// Disk-backed mentor cache
let mentorDiskCache = {};

function loadDiskCache() {
    try {
        if (fs.existsSync(DISK_CACHE_FILE)) {
            mentorDiskCache = JSON.parse(fs.readFileSync(DISK_CACHE_FILE, 'utf8'));
            const count = Object.keys(mentorDiskCache).length;
            console.log(`[cache] Loaded ${count} mentor responses from disk cache`);
        }
    } catch (e) {
        console.warn('[cache] Could not load disk cache, starting fresh:', e.message);
        mentorDiskCache = {};
    }
}

function saveDiskCache() {
    try {
        // Prune expired entries before saving
        const now = Date.now();
        for (const key of Object.keys(mentorDiskCache)) {
            if (now - mentorDiskCache[key].ts > MENTOR_CACHE_TTL) {
                delete mentorDiskCache[key];
            }
        }
        fs.writeFileSync(DISK_CACHE_FILE, JSON.stringify(mentorDiskCache), 'utf8');
    } catch (e) {
        console.warn('[cache] Could not save disk cache:', e.message);
    }
}

function getMentorCached(key) {
    const entry = mentorDiskCache[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > MENTOR_CACHE_TTL) {
        delete mentorDiskCache[key];
        return null;
    }
    return entry.data;
}

function setMentorCache(key, data) {
    // Evict oldest if over limit
    const keys = Object.keys(mentorDiskCache);
    if (keys.length >= CACHE_MAX) {
        keys.sort((a, b) => mentorDiskCache[a].ts - mentorDiskCache[b].ts)
            .slice(0, 50)
            .forEach(k => delete mentorDiskCache[k]);
    }
    mentorDiskCache[key] = { data, ts: Date.now() };
    saveDiskCache(); // persist immediately
}

// Load disk cache on startup
loadDiskCache();

// In-memory cache helpers (for scraping)
function getCached(key, ttl = CACHE_TTL) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > ttl) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setCache(key, data) {
    if (cache.size >= CACHE_MAX) {
        const oldest = cache.keys().next().value;
        cache.delete(oldest);
    }
    cache.set(key, { data, ts: Date.now() });
}

// ─── Rate Limiters (express-rate-limit) ──────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 30,              // 30 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Rate limit exceeded. Max 30 requests per minute.' },
});

const mentorLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 10,              // 10 mentor requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Rate limit exceeded. Max 10 mentor requests per minute.' },
});

// Apply general rate limit to all /api/ routes
app.use('/api/', apiLimiter);

// ─── URL Validation ──────────────────────────────────────────────────
function isValidGFGUrl(url) {
    try {
        const parsed = new URL(url);
        return (
            (parsed.hostname === 'www.geeksforgeeks.org' ||
                parsed.hostname === 'geeksforgeeks.org' ||
                parsed.hostname === 'practice.geeksforgeeks.org') &&
            parsed.pathname.includes('/problems/')
        );
    } catch {
        return false;
    }
}

// ─── Cheerio Scraper ─────────────────────────────────────────────────
async function scrapeGFGProblem(url) {
    const { data: html } = await axios.get(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000,
    });

    const $ = cheerio.load(html);

    // ── Title ────────────────────────────────────────────────────────
    const title =
        $('meta[property="og:title"]').attr('content')?.trim() ||
        $('h1').first().text().trim() ||
        $('title').text().split('|')[0]?.trim() ||
        '';

    // ── Description / problem statement ──────────────────────────────
    // GFG wraps the problem statement in several possible containers
    const descriptionEl =
        $('[class*="problems_problem_content"]').first() ||
        $('[class*="problem-statement"]').first() ||
        $('[class*="problem-content"]').first() ||
        $('article').first();

    let description = '';
    if (descriptionEl.length) {
        // Remove code blocks, scripts, and style tags before extracting text
        descriptionEl.find('script, style, .code-block, pre').remove();
        description = descriptionEl.text().replace(/\s+/g, ' ').trim();
    }

    // Fallback: try meta description
    if (!description) {
        description =
            $('meta[property="og:description"]').attr('content')?.trim() ||
            $('meta[name="description"]').attr('content')?.trim() ||
            '';
    }

    // ── Difficulty ───────────────────────────────────────────────────
    let difficulty = 'medium';
    const diffEl =
        $('[class*="difficulty"]').first().text().toLowerCase() ||
        $('[class*="problemlevel"]').first().text().toLowerCase() ||
        '';
    if (diffEl.includes('easy') || diffEl.includes('basic') || diffEl.includes('school')) {
        difficulty = 'easy';
    } else if (diffEl.includes('hard') || diffEl.includes('expert')) {
        difficulty = 'hard';
    } else if (diffEl.includes('medium')) {
        difficulty = 'medium';
    }

    // Also check meta / JSON-LD / page body for difficulty
    const bodyText = $('body').text().toLowerCase();
    if (difficulty === 'medium') {
        if (/difficulty\s*:\s*easy/i.test(bodyText) || /\bbasic\b/.test(bodyText)) {
            difficulty = 'easy';
        } else if (/difficulty\s*:\s*hard/i.test(bodyText)) {
            difficulty = 'hard';
        }
    }

    // ── Tags ─────────────────────────────────────────────────────────
    const tags = [];
    $('[class*="problem-tag"], a[href*="/explore?category"]').each((_, el) => {
        const tag = $(el).text().trim().toLowerCase();
        if (tag && tag.length < 40 && !tags.includes(tag)) {
            tags.push(tag);
        }
    });

    // Fallback: try to extract tags from meta keywords
    if (tags.length === 0) {
        const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
        metaKeywords.split(',').forEach(k => {
            const tag = k.trim().toLowerCase();
            if (tag && tag.length < 40 && !tags.includes(tag)) {
                tags.push(tag);
            }
        });
    }

    // ── Embedding text (title + description snippet for vector encoding)
    const embeddingText = `${title} | ${description.substring(0, 500)}`;

    return {
        title,
        description: description.substring(0, 3000), // cap at 3 KB
        difficulty,
        tags,
        url,
        embeddingText,
    };
}

// ─── Routes ──────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
    const mentorEntries = Object.keys(mentorDiskCache).length;
    res.json({
        status: 'ok',
        scrape_cache_size: cache.size,
        mentor_cache_entries: mentorEntries,
        mentor_cache_file: DISK_CACHE_FILE
    });
});

// Main scrape endpoint
app.get('/api/scrape', async (req, res) => {

    const { url } = req.query;

    // Validate URL
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'Missing required query parameter: url',
        });
    }

    if (!isValidGFGUrl(url)) {
        return res.status(400).json({
            success: false,
            error:
                'Invalid URL. Only GeeksforGeeks problem URLs are accepted ' +
                '(e.g. https://www.geeksforgeeks.org/problems/two-sum/1).',
        });
    }

    // Check cache
    const cached = getCached(url);
    if (cached) {
        return res.json({ success: true, data: cached, cached: true });
    }

    // Scrape
    try {
        const data = await scrapeGFGProblem(url);

        if (!data.title) {
            return res.status(422).json({
                success: false,
                error: 'Could not extract problem title. The page structure may have changed.',
            });
        }

        setCache(url, data);

        return res.json({ success: true, data, cached: false });
    } catch (err) {
        console.error('[scrape] Error:', err.message);

        const status = err.response?.status || 500;
        return res.status(status).json({
            success: false,
            error: `Failed to fetch problem: ${err.message}`,
        });
    }
});

// ─── HuggingFace Embeddings Proxy ────────────────────────────────────
app.post('/api/embeddings', async (req, res) => {
    const { inputs, hf_api_key } = req.body;
    const apiKey = hf_api_key || process.env.HF_API_KEY;

    if (!apiKey) {
        return res.status(400).json({ success: false, error: 'HuggingFace API key required.' });
    }
    if (!inputs) {
        return res.status(400).json({ success: false, error: 'inputs is required.' });
    }

    try {
        const hfRes = await axios.post(
            'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2',
            { inputs, options: { wait_for_model: true } },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );
        return res.json(hfRes.data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.error || err.message;
        console.error('[embeddings] HF proxy error:', msg);
        return res.status(status).json({ success: false, error: msg });
    }
});

// ─── AI Mentor endpoint ──────────────────────────────────────────────
app.post('/api/mentor', mentorLimiter, async (req, res) => {

    const { mode, problem_statement } = req.body;

    // Validate mode
    const validModes = getValidModes();
    if (!mode || !validModes.includes(mode)) {
        return res.status(400).json({
            success: false,
            error: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
        });
    }

    // Validate problem statement
    if (!problem_statement || problem_statement.trim().length < 10) {
        return res.status(400).json({
            success: false,
            error: 'problem_statement is required (min 10 characters).',
        });
    }

    if (problem_statement.trim().length > 5000) {
        return res.status(400).json({
            success: false,
            error: 'problem_statement too long (max 5000 characters).',
        });
    }

    // 🔒 API key: Prioritize custom key from header, fallback to server .env
    const customKey = req.headers['x-gemini-api-key'];
    const apiKey = customKey || process.env.GEMINI_API_KEY;

    console.log('[mentor] Custom Key Header:', customKey ? `✅ Present (${customKey.slice(0, 4)}...)` : '❌ Missing');
    console.log('[mentor] Active Key Source:', customKey ? 'Client Custom Key' : 'Server Default Key');

    if (!apiKey) {
        return res.status(500).json({
            success: false,
            error: 'Server misconfiguration: GEMINI_API_KEY not set in .env',
        });
    }

    // Build prompt
    const prompt = buildPrompt(mode, problem_statement.trim());
    if (!prompt) {
        return res.status(400).json({ success: false, error: 'Failed to build prompt.' });
    }

    // ─── API Key Rotation Logic ──────────────────────────────────────────
    // Load all available keys from .env (GEMINI_API_KEY, GEMINI_API_KEY_2, etc.)
    const SERVER_KEYS = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5
    ].filter(k => !!k);

    console.log(`[mentor] Server Key Pool Size: ${SERVER_KEYS.length}`);

    async function tryGenerateWithRotation(userKey, prompt) {
        // If user provided a custom key, try ONLY that key
        if (userKey) {
            console.log('[mentor] Using custom user key only.');
            return await tryGenerate(userKey, prompt);
        }

        // Otherwise, rotate through server keys
        let lastError = null;

        // Try random start index to distribute load
        const startIndex = Math.floor(Math.random() * SERVER_KEYS.length);

        for (let i = 0; i < SERVER_KEYS.length; i++) {
            const keyIndex = (startIndex + i) % SERVER_KEYS.length;
            const currentKey = SERVER_KEYS[keyIndex];

            console.log(`[mentor] Attempting with Server Key #${keyIndex + 1}...`);

            try {
                return await tryGenerate(currentKey, prompt);
            } catch (err) {
                const is429 = err.message?.includes('429') || err.message?.includes('quota');
                lastError = err;

                console.error(`[mentor] Key #${keyIndex + 1} Error:`, err.message);

                if (is429) {
                    console.warn(`[mentor] Key #${keyIndex + 1} quota exceeded. Switching to next key...`);
                    continue; // Try next key
                } else {
                    console.error(`[mentor] Key #${keyIndex + 1} failed with non-quota error.`);
                    throw err; // Other errors (invalid request, etc.) enter normal error handling
                }
            }
        }

        console.error('[mentor] All server keys exhausted.');
        throw lastError || new Error('All server API keys exhausted quota.');
    }

    async function tryGenerate(apiKey, prompt) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];
        const MAX_RETRIES = 2;

        for (const modelName of MODELS) {
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        systemInstruction: prompt.system,
                    });
                    const result = await model.generateContent(prompt.user);
                    return { text: result.response.text(), model: modelName };
                } catch (err) {
                    const is429 = err.message?.includes('429') || err.message?.includes('quota');

                    if (is429 && attempt < MAX_RETRIES) {
                        const delay = attempt * 1500;
                        await new Promise(r => setTimeout(r, delay));
                    } else if (is429 && modelName !== MODELS[MODELS.length - 1]) {
                        break; // try next model
                    } else {
                        throw err;
                    }
                }
            }
        }
        throw new Error('All models exhausted for this key');
    }

    // ─── Check disk-persisted mentor cache (survives server restarts) ────
    const mentorCacheKey = `mentor:${mode}:${problem_statement.trim().substring(0, 300)}`;
    const cachedMentorResponse = getMentorCached(mentorCacheKey);
    if (cachedMentorResponse) {
        console.log(`[mentor] Disk cache HIT for mode="${mode}" — zero Gemini calls`);
        return res.json({ ...cachedMentorResponse, cached: true });
    }

    try {
        // Use rotation logic (passed customKey will be prioritized inside)
        const { text: rawText, model: usedModel } = await tryGenerateWithRotation(customKey, prompt);

        // Anti-leak post-processing
        const { safe, text, blocked } = sanitize(rawText);

        const responsePayload = {
            success: true,
            mode,
            response: text,
            safe,
            model: usedModel,
            blocked_patterns: blocked.length > 0 ? blocked : undefined,
        };

        // Persist to disk so server restarts don't re-fetch
        setMentorCache(mentorCacheKey, responsePayload);
        console.log(`[mentor] Saved to disk cache for mode="${mode}"`);

        return res.json(responsePayload);
    } catch (err) {
        console.error('[mentor] Error:', err.message);
        const msg = err.message || '';
        const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
        const isInvalidKey = msg.includes('API key not valid') || msg.includes('API_KEY_INVALID') || msg.includes('401');

        let status = 500;
        let error = `AI generation failed: ${msg}`;

        if (isInvalidKey) {
            status = 401;
            error = 'Invalid Gemini API key. Please go to Settings (⚙️) and enter a valid key from aistudio.google.com/apikey';
        } else if (is429) {
            status = 429;
            error = 'Gemini API quota exceeded. Please wait 60 seconds and try again, or use a different API key.';
        }

        return res.status(status).json({ success: false, error });
    }
});

// ─── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀  CodeCompare backend running on http://localhost:${PORT}`);
    console.log(`    GET  /health`);
    console.log(`    GET  /api/scrape?url=<gfg-problem-url>`);
    console.log(`    POST /api/mentor { mode, problem_statement }\n`);
});