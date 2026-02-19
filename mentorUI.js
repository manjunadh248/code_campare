/**
 * mentorUI.js – AI Interview Mentor Panel for CodeCompare
 *
 * Renders a "Mentor" tab inside the existing CodeCompare panel with:
 *  - Progressive hint buttons (🟢 → 🟡 → 🔴)
 *  - Pattern analysis, logic explanation, brute force analysis
 *
 * 🔒 Security: API key is NEVER stored or sent from the frontend.
 *    The backend reads it from its own .env file.
 */

const CodeCompareMentor = (() => {
  'use strict';

  const BACKEND_URL = 'http://localhost:3001';
  const DEBOUNCE_MS = 3000; // 3-second cooldown between requests

  let currentProblem = null;

  let lastRequestTime = 0; // debounce tracker
  let userGeminiKey = null; // Custom user API key

  // ─── Persistent response cache key ──────────────────────────────────
  const RESPONSE_CACHE_STORAGE = 'codecompare_mentor_cache';

  // Build a cache key from the current problem + mode
  function buildCacheKey(problemId, mode) {
    return `${problemId || 'unknown'}:${mode}`;
  }

  // Load all cached responses from storage
  async function loadResponseCache() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(RESPONSE_CACHE_STORAGE);
        return result[RESPONSE_CACHE_STORAGE] || {};
      }
      const raw = localStorage.getItem(RESPONSE_CACHE_STORAGE);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  // Save a response to persistent cache (keyed by problemId + mode)
  async function saveToResponseCache(problemId, mode, responseText) {
    try {
      const cache = await loadResponseCache();
      const key = buildCacheKey(problemId, mode);
      cache[key] = { response: responseText, ts: Date.now() };

      // Keep cache size under control (max 200 entries)
      const keys = Object.keys(cache);
      if (keys.length > 200) {
        keys.sort((a, b) => cache[a].ts - cache[b].ts)
          .slice(0, keys.length - 200)
          .forEach(k => delete cache[k]);
      }

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [RESPONSE_CACHE_STORAGE]: cache });
      } else {
        localStorage.setItem(RESPONSE_CACHE_STORAGE, JSON.stringify(cache));
      }
    } catch (e) { console.warn('[Mentor] Failed to save response cache:', e); }
  }

  // Get a cached response for the current problem + mode
  async function getCachedResponse(problemId, mode) {
    try {
      const cache = await loadResponseCache();
      const key = buildCacheKey(problemId, mode);
      const entry = cache[key];
      // Cache valid for 24 hours
      if (entry && Date.now() - entry.ts < 24 * 60 * 60 * 1000) {
        return entry.response;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  // ─── Initialize: Load saved key ──────────────────────────────────
  (async function initKey() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get('codecompare_gemini_key');
        userGeminiKey = result.codecompare_gemini_key || null;
      } else {
        userGeminiKey = localStorage.getItem('codecompare_gemini_key');
      }
      if (userGeminiKey) console.log('[CodeCompare Mentor] Loaded custom API key');
    } catch (e) { /* ignore */ }
  })();

  // ─── Set Custom API Key ──────────────────────────────────────────
  async function setApiKey(key) {
    userGeminiKey = key;
    // Clear persistent cache when key changes (fresh responses with new key)
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(RESPONSE_CACHE_STORAGE);
      } else {
        localStorage.removeItem(RESPONSE_CACHE_STORAGE);
      }
    } catch (e) { /* ignore */ }
    console.log('[CodeCompare Mentor] Custom key set, cache cleared');
  }

  // ─── Set the current problem from contentScript ──────────────────
  function setProblem(problem) {
    currentProblem = problem;
    // No need to clear persistent cache — it's keyed per problem
  }

  // ─── Debounce check ──────────────────────────────────────────────
  function canRequest() {
    return Date.now() - lastRequestTime >= DEBOUNCE_MS;
  }

  // ─── Call backend /api/mentor (no API key sent!) ─────────────────
  async function askMentor(mode) {
    if (!currentProblem) {
      return { success: false, error: 'No problem detected on this page.' };
    }

    // Check persistent cache first (survives page reloads)
    const problemId = currentProblem.id || currentProblem.title;
    const cachedResponse = await getCachedResponse(problemId, mode);
    if (cachedResponse) {
      console.log(`[Mentor] Persistent cache hit for ${mode}`);
      return { success: true, response: cachedResponse, cached: true };
    }

    // Debounce: prevent rapid-fire requests
    if (!canRequest()) {
      const waitSec = Math.ceil((DEBOUNCE_MS - (Date.now() - lastRequestTime)) / 1000);
      return { success: false, error: `Please wait ${waitSec}s before the next request.` };
    }

    const problemText = `${currentProblem.title}\n\n${currentProblem.description || currentProblem.constraints || ''}`;

    lastRequestTime = Date.now();

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (userGeminiKey) {
        headers['x-gemini-api-key'] = userGeminiKey;
        console.log('[CodeCompare Mentor] Sending custom key:', userGeminiKey.substring(0, 8) + '...');
      } else {
        console.log('[CodeCompare Mentor] No custom key found, using default.');
      }

      const res = await fetch(`${BACKEND_URL}/api/mentor`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mode,
          problem_statement: problemText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Save to persistent cache so page reloads don't re-fetch
        await saveToResponseCache(problemId, mode, data.response);
      }
      // Check for rate limit error specifically
      if (!data.success && (data.error || '').toLowerCase().includes('quota exceeded')) {
        return { success: false, error: data.error, quotaExceeded: true };
      }
      return data;
    } catch (e) {
      return { success: false, error: `Backend unreachable: ${e.message}` };
    }
  }

  // ─── Render mentor content area ─────────────────────────────────
  function renderMentorPanel() {
    return `
      <div class="cc-mentor-panel" id="cc-mentor-panel">
        ${renderCurrentProblem()}
        ${renderButtons()}
        <div class="cc-mentor-response" id="cc-mentor-response"></div>
      </div>
    `;
  }

  function renderCurrentProblem() {
    if (!currentProblem) {
      return `
        <div class="cc-mentor-no-problem">
          <div style="opacity:0.6; text-align:center; padding:8px;">Navigate to a problem page to use AI Mentor</div>
        </div>
      `;
    }
    return `
      <div class="cc-mentor-current-problem">
        <div class="cc-mentor-problem-label">CURRENT PROBLEM</div>
        <div class="cc-mentor-problem-title">${escapeHtml(currentProblem.title)}</div>
      </div>
    `;
  }

  function renderButtons() {
    return `
      <div class="cc-mentor-buttons">
        <div class="cc-mentor-hint-row">
          <button class="cc-mentor-btn cc-mentor-hint1" data-mode="hint1" title="Light directional hint">
            🟢 Hint 1
          </button>
          <button class="cc-mentor-btn cc-mentor-hint2" data-mode="hint2" title="Stronger hint with pattern name">
            🟡 Hint 2
          </button>
          <button class="cc-mentor-btn cc-mentor-hint3" data-mode="hint3" title="High-level approach (no code)">
            🔴 Hint 3
          </button>
        </div>
        <div class="cc-mentor-action-row">
          <button class="cc-mentor-btn cc-mentor-analysis" data-mode="analysis" title="Pattern detection & analysis">
            🧩 Analysis
          </button>
          <button class="cc-mentor-btn cc-mentor-logic" data-mode="logic" title="Full thinking process">
            🏆 Logic
          </button>
          <button class="cc-mentor-btn cc-mentor-bf" data-mode="brute_force" title="Why brute force fails">
            🔥 Brute Force
          </button>
        </div>
      </div>
    `;
  }

  // ─── Render a response ──────────────────────────────────────────
  function renderResponse(text) {
    // Simple markdown-to-HTML: bold, line breaks, bullets
    let html = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- /g, '\n• ')
      .replace(/\n/g, '<br>');
    return html;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;

    return div.innerHTML;
  }

  // ─── Countdown Timer ─────────────────────────────────────────────
  function startCountdown(seconds) {
    const responseEl = document.getElementById('cc-mentor-response');
    const buttons = document.querySelectorAll('.cc-mentor-btn');

    if (!responseEl) return;

    let remaining = seconds;

    // Disable all buttons
    buttons.forEach(b => {
      b.disabled = true;
      b.classList.add('cc-disabled');
    });

    // Update UI function
    const updateUI = () => {
      responseEl.innerHTML = `
        <div class="cc-mentor-error">
          ⚠️ API Quota Exceeded. Please wait <strong>${remaining}s</strong>...
        </div>
      `;
    };

    updateUI();

    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        // Re-enable buttons
        buttons.forEach(b => {
          b.disabled = false;
          b.classList.remove('cc-disabled');
        });
        responseEl.innerHTML = `<div class="cc-mentor-no-problem" style="color: #4ade80;">Ready for new request!</div>`;
      } else {
        updateUI();
      }
    }, 1000);
  }

  // ─── Attach event listeners ─────────────────────────────────────
  function attachListeners() {
    attachMentorButtonListeners();
  }

  function attachMentorButtonListeners() {
    document.querySelectorAll('.cc-mentor-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mode = btn.dataset.mode;
        const responseEl = document.getElementById('cc-mentor-response');
        if (!responseEl) return;

        // Show loading
        responseEl.innerHTML = `
          <div class="cc-mentor-loading">
            <div class="cc-spinner"></div>
            <div class="cc-loading-text">Thinking...</div>
          </div>
        `;

        // Disable buttons during request
        document.querySelectorAll('.cc-mentor-btn').forEach(b => b.disabled = true);

        const result = await askMentor(mode);

        // Re-enable buttons
        document.querySelectorAll('.cc-mentor-btn').forEach(b => b.disabled = false);

        // Highlight active button
        document.querySelectorAll('.cc-mentor-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (result.success) {
          responseEl.innerHTML = `
            <div class="cc-mentor-result ${result.safe === false ? 'cc-mentor-blocked' : ''}">
              ${renderResponse(result.response)}
            </div>
          `;
        } else if (result.quotaExceeded) {
          // Trigger countdown for 60 seconds
          startCountdown(60);
        } else {
          responseEl.innerHTML = `
            <div class="cc-mentor-error">
              ❌ ${escapeHtml(result.error)}
            </div>
          `;
        }
      });
    });
  }

  // ─── Public API ─────────────────────────────────────────────────
  return {
    setProblem,
    setApiKey,
    askMentor,
    renderMentorPanel,
    attachListeners,
  };
})();

if (typeof window !== 'undefined') window.CodeCompareMentor = CodeCompareMentor;