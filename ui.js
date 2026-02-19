/**
 * ui.js - BuyHatke-style Floating Panel for CodeCompare
 * Handles UI rendering, feedback interactions, settings, and panel state
 */

const CodeCompareUI = (() => {
  'use strict';

  let currentProblem = null;
  let matches = [];
  let isOpen = false;
  let isLoading = false;
  let activeTab = 'matches'; // 'matches' or 'mentor'

  // Platform display info
  const PLATFORM_INFO = {
    leetcode: { name: 'LeetCode', emoji: '🟠' },
    geeksforgeeks: { name: 'GeeksforGeeks', emoji: '🟢' },
    codeforces: { name: 'Codeforces', emoji: '🔵' },
    hackerrank: { name: 'HackerRank', emoji: '🟩' },
    codechef: { name: 'CodeChef', emoji: '🟤' },
    atcoder: { name: 'AtCoder', emoji: '⚪' }
  };

  // Create the main container
  function createContainer() {
    const existing = document.getElementById('codecompare-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'codecompare-container';
    container.innerHTML = `
      <button id="codecompare-toggle" title="CodeCompare - Find similar problems">
        <span class="cc-badge" style="display: none;">0</span>
      </button>
      <div id="codecompare-panel">
        <div class="cc-header">
          <div class="cc-header-title">
            CodeCompare
            <button id="cc-refresh-btn" class="cc-header-btn" title="Refresh matches">🔄</button>
            <button id="cc-settings-btn" class="cc-header-btn" title="Settings">⚙️</button>
          </div>
          <div class="cc-header-stats"></div>
        </div>
        <div class="cc-tabs">
          <button class="cc-tab active" data-tab="matches">🔍 Matches</button>
          <button class="cc-tab" data-tab="mentor">🧠 Mentor</button>
        </div>
        <div class="cc-current">
          <div class="cc-current-label">Current Problem</div>
          <div class="cc-current-title">Loading...</div>
        </div>
        <div id="cc-tab-matches">
          <div class="cc-api-status"></div>
          <div class="cc-matches"></div>
        </div>
        <div id="cc-tab-mentor" style="display:none;"></div>
        <div id="cc-settings-panel" class="cc-settings-panel" style="display: none;">
          <div class="cc-settings-header">
            <span>API Settings</span>
            <button id="cc-settings-close" class="cc-settings-close">×</button>
          </div>
          <div class="cc-settings-content">
            <label class="cc-settings-label">
              🧠 Gemini API Key (AI Mentor)
              <span class="cc-settings-hint">Get free key at <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com</a></span>
            </label>
            <input type="text" id="cc-gemini-settings-key" class="cc-settings-input" placeholder="AIzaSy...">
            <button id="cc-save-gemini-key-settings" class="cc-btn cc-btn-primary">Save Gemini Key</button>
            <div id="cc-gemini-status" class="cc-hf-status"></div>
            <div class="cc-settings-divider"></div>
            <label class="cc-settings-label">
              🤖 Hugging Face API Key (ML Search)
              <span class="cc-settings-hint">Get free key at <a href="https://huggingface.co/settings/tokens" target="_blank">huggingface.co</a></span>
            </label>
            <input type="text" id="cc-hf-api-key-input" class="cc-settings-input" placeholder="hf_xxxxxxxxxxxx">
            <button id="cc-save-hf-api-key" class="cc-btn cc-btn-primary">Save HF Key & Enable ML</button>
            <button id="cc-test-hf-api" class="cc-btn cc-btn-secondary">Test Connection</button>
            <div id="cc-hf-status" class="cc-hf-status"></div>
            <div class="cc-settings-divider"></div>
            <label class="cc-settings-label">
              🌐 CLIST.by API Key (Optional)
              <span class="cc-settings-hint">Get free key at <a href="https://clist.by/api/v4/doc/" target="_blank">clist.by</a></span>
            </label>
            <input type="text" id="cc-api-key-input" class="cc-settings-input" placeholder="username:api_key">
            <button id="cc-save-api-key" class="cc-btn cc-btn-secondary">Save CLIST Key</button>
            <div class="cc-settings-divider"></div>
            <button id="cc-clear-cache" class="cc-btn cc-btn-secondary">Clear All Cache</button>
            <div id="cc-cache-stats" class="cc-cache-stats"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(container);
    return container;
  }

  // Toggle panel visibility
  function togglePanel() {
    isOpen = !isOpen;
    const panel = document.getElementById('codecompare-panel');
    const toggle = document.getElementById('codecompare-toggle');

    if (isOpen) {
      panel.classList.add('open');
      toggle.classList.add('active');
    } else {
      panel.classList.remove('open');
      toggle.classList.remove('active');
    }
  }

  // Toggle settings panel
  function toggleSettings() {
    const settingsPanel = document.getElementById('cc-settings-panel');
    const isVisible = settingsPanel.style.display !== 'none';
    settingsPanel.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
      // Load current API keys and cache stats
      const apiKeyInput = document.getElementById('cc-api-key-input');
      const hfKeyInput = document.getElementById('cc-hf-api-key-input');

      if (typeof CodeCompareAPI !== 'undefined') {
        apiKeyInput.value = CodeCompareAPI.getApiKey() || '';
      }

      if (typeof CodeCompareMLSearch !== 'undefined') {
        hfKeyInput.value = CodeCompareMLSearch.getApiKey() || '';
        updateHFStatus();
      }

      updateCacheStats();
    }
  }

  // Update HuggingFace status display
  function updateHFStatus() {
    const statusEl = document.getElementById('cc-hf-status');
    if (!statusEl) return;

    if (typeof CodeCompareMLSearch !== 'undefined' && CodeCompareMLSearch.isConfigured()) {
      const stats = CodeCompareMLSearch.getCacheStats();
      statusEl.innerHTML = `<span class="cc-status-ok">✅ ML Search Active</span> (${stats.entries} cached embeddings)`;
    } else {
      statusEl.innerHTML = `<span class="cc-status-inactive">⚠️ ML Search Disabled</span>`;
    }
  }

  // Update cache stats display
  function updateCacheStats() {
    const statsEl = document.getElementById('cc-cache-stats');
    if (statsEl && typeof CodeCompareAPI !== 'undefined') {
      const stats = CodeCompareAPI.getCacheStats();
      statsEl.textContent = `Cache: ${stats.entries} entries`;
    }
  }

  // Update the badge count
  function updateBadge(count) {
    const badge = document.querySelector('.cc-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // Update header stats
  function updateStats() {
    const stats = CodeCompareMatcher.getFeedbackStats();
    const statsEl = document.querySelector('.cc-header-stats');
    if (statsEl && stats.total > 0) {
      statsEl.textContent = `${stats.confirmed}✓ ${stats.rejected}✗`;
    }
  }

  // Update API status display
  function updateApiStatus() {
    const statusEl = document.querySelector('.cc-api-status');
    if (!statusEl) return;

    const badges = [];

    // Check ML Search (HuggingFace)
    if (typeof CodeCompareMLSearch !== 'undefined' && CodeCompareMLSearch.isConfigured()) {
      badges.push('<span class="cc-api-badge cc-api-ml">🤖 ML Active</span>');
    }

    // Check CLIST API
    if (typeof CodeCompareAPI !== 'undefined' && CodeCompareAPI.isConfigured()) {
      badges.push('<span class="cc-api-badge cc-api-connected">🌐 API</span>');
    }

    if (badges.length > 0) {
      statusEl.innerHTML = badges.join(' ');
    } else {
      statusEl.innerHTML = '<span class="cc-api-badge cc-api-local">📦 Local Only</span>';
    }
  }

  // Build tooltip content from breakdown
  function buildTooltip(breakdown) {
    const lines = [];
    lines.push(`Title: ${breakdown.title.score}% → +${breakdown.title.contribution}`);
    lines.push(`Tags: ${breakdown.tags.score}% → +${breakdown.tags.contribution}`);
    lines.push(`Constraints: ${breakdown.constraints.score}% → +${breakdown.constraints.contribution}`);
    lines.push(`Difficulty: ${breakdown.difficulty.score}% → +${breakdown.difficulty.contribution}`);
    lines.push(`I/O: ${breakdown.ioStructure.score}% → +${breakdown.ioStructure.contribution}`);
    if (breakdown.feedbackBoost !== 0) {
      lines.push(`Feedback: ${breakdown.feedbackBoost > 0 ? '+' : ''}${breakdown.feedbackBoost}`);
    }
    return lines.join('\n');
  }

  // Render loading state
  function renderLoading() {
    const container = document.querySelector('.cc-matches');
    if (!container) return;

    container.innerHTML = `
      <div class="cc-loading">
        <div class="cc-spinner"></div>
        <div class="cc-loading-text">Searching for similar problems...</div>
      </div>
    `;
  }

  // Render a single match card
  function renderMatchCard(match, index) {
    const { problem, score, breakdown, feedbackStatus, classification, source } = match;
    const platform = PLATFORM_INFO[problem.platform] || { name: problem.platform, emoji: '⚪' };
    const tooltip = buildTooltip(breakdown);
    const confirmActive = feedbackStatus === 'confirmed' ? 'active' : '';
    const rejectActive = feedbackStatus === 'rejected' ? 'active' : '';
    const sourceLabel = source === 'api' ? '🌐' : '📦';
    const sourceTitle = source === 'api' ? 'From CLIST.by API' : 'From local database';

    return `
      <div class="cc-card" data-index="${index}" data-problem-id="${problem.id}">
        <div class="cc-card-header">
          <div class="cc-platform-logo ${problem.platform}">${platform.emoji}</div>
          <div class="cc-problem-info">
            <div class="cc-problem-title">${escapeHtml(problem.title)}</div>
            <div class="cc-problem-meta">
              <span class="cc-difficulty ${problem.difficulty?.toString().toLowerCase()}">${problem.difficulty || 'N/A'}</span>
              <span class="cc-platform-name">${platform.name}</span>
              <span class="cc-source-badge" title="${sourceTitle}">${sourceLabel}</span>
            </div>
          </div>
        </div>
        <div class="cc-score-section">
          <div class="cc-score-header">
            <span class="cc-score-label cc-tooltip" data-tooltip="${tooltip}">
              ${classification.emoji} ${classification.label}
              <span style="opacity:0.5;margin-left:4px">ⓘ</span>
            </span>
            <span class="cc-score-value ${classification.className}">${score}%</span>
          </div>
          <div class="cc-progress">
            <div class="cc-progress-bar ${classification.className}" style="width: ${score}%"></div>
          </div>
        </div>
        <div class="cc-card-actions">
          <a href="${problem.url}" target="_blank" class="cc-btn cc-btn-visit">
            Visit Problem →
          </a>
          <button class="cc-btn cc-btn-feedback confirm ${confirmActive}" data-action="confirm" title="Correct match">
            ✓
          </button>
          <button class="cc-btn cc-btn-feedback reject ${rejectActive}" data-action="reject" title="Not the same problem">
            ✗
          </button>
        </div>
      </div>
    `;
  }

  // Render all matches
  function renderMatches() {
    const container = document.querySelector('.cc-matches');
    if (!container) return;

    if (isLoading) {
      renderLoading();
      return;
    }

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="cc-empty">
          <div class="cc-empty-icon">🔍</div>
          <div class="cc-empty-text">No similar problems found</div>
          <div class="cc-empty-hint">Try configuring your API key in settings for more results</div>
        </div>
      `;
      return;
    }

    container.innerHTML = matches.map((m, i) => renderMatchCard(m, i)).join('');
    attachFeedbackListeners();
  }

  // Handle feedback button clicks
  function handleFeedback(cardEl, action) {
    const problemId = cardEl.dataset.problemId;
    const status = action === 'confirm' ? 'confirmed' : 'rejected';

    CodeCompareMatcher.saveFeedback(currentProblem.id, problemId, status);

    const confirmBtn = cardEl.querySelector('.cc-btn-feedback.confirm');
    const rejectBtn = cardEl.querySelector('.cc-btn-feedback.reject');

    confirmBtn.classList.remove('active');
    rejectBtn.classList.remove('active');

    if (action === 'confirm') {
      confirmBtn.classList.add('active');
    } else {
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        cardEl.remove();
        updateBadge(document.querySelectorAll('.cc-card').length);
      }, 300);
    }

    updateStats();
  }

  // Attach feedback button listeners
  function attachFeedbackListeners() {
    const cards = document.querySelectorAll('.cc-card');
    cards.forEach(card => {
      const confirmBtn = card.querySelector('.cc-btn-feedback.confirm');
      const rejectBtn = card.querySelector('.cc-btn-feedback.reject');

      confirmBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        handleFeedback(card, 'confirm');
      });

      rejectBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        handleFeedback(card, 'reject');
      });
    });
  }

  // Attach settings listeners
  function attachSettingsListeners() {
    // Refresh button
    document.getElementById('cc-refresh-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('[CodeCompare UI] Manual refresh triggered');
      if (typeof window.CodeCompareRefresh === 'function') {
        window.CodeCompareRefresh();
      } else {
        refresh();
      }
    });

    // Settings button
    document.getElementById('cc-settings-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSettings();
    });

    // Close settings
    document.getElementById('cc-settings-close')?.addEventListener('click', toggleSettings);

    // Save Gemini API key from settings
    const geminiSaveBtn = document.getElementById('cc-save-gemini-key-settings');
    console.log('[CodeCompare UI] Gemini save btn found:', !!geminiSaveBtn);
    geminiSaveBtn?.addEventListener('click', async () => {
      console.log('[CodeCompare UI] Gemini save clicked');
      const input = document.getElementById('cc-gemini-settings-key');
      const statusEl = document.getElementById('cc-gemini-status');
      const key = input?.value?.trim();
      console.log('[CodeCompare UI] Key value:', key ? key.substring(0, 8) + '...' : 'empty');
      if (!key) {
        if (statusEl) statusEl.innerHTML = '<span class="cc-status-error">❌ Please enter a key first</span>';
        return;
      }

      // Save via CodeCompareMentor if available
      if (typeof CodeCompareMentor !== 'undefined') {
        await CodeCompareMentor.setApiKey(key);
      }
      // Also save directly to storage as backup
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await chrome.storage.local.set({ 'codecompare_gemini_key': key });
        } else {
          localStorage.setItem('codecompare_gemini_key', key);
        }
      } catch (e) { console.warn('[CodeCompare UI] Storage fallback error:', e); }

      if (statusEl) {
        statusEl.innerHTML = '<span class="cc-status-ok">✅ Gemini key saved! AI Mentor is enabled.</span>';
      }
      alert('Gemini API key saved! Switch to the Mentor tab to use it.');
    });

    // Save HuggingFace API key
    document.getElementById('cc-save-hf-api-key')?.addEventListener('click', async () => {
      const input = document.getElementById('cc-hf-api-key-input');
      const key = input.value.trim();

      if (typeof CodeCompareMLSearch !== 'undefined') {
        const saved = await CodeCompareMLSearch.setApiKey(key);
        if (saved) {
          updateHFStatus();
          updateApiStatus();
          alert('HuggingFace API key saved! ML semantic search is now enabled.');
        }
      }
    });

    // Test HuggingFace connection
    document.getElementById('cc-test-hf-api')?.addEventListener('click', async () => {
      const statusEl = document.getElementById('cc-hf-status');
      if (!statusEl) return;

      statusEl.innerHTML = '<span class="cc-status-loading">🔄 Testing connection...</span>';

      if (typeof CodeCompareMLSearch !== 'undefined') {
        const result = await CodeCompareMLSearch.testConnection();
        if (result.success) {
          statusEl.innerHTML = `<span class="cc-status-ok">✅ Connected! (${result.dimensions}D embeddings)</span>`;
        } else {
          statusEl.innerHTML = `<span class="cc-status-error">❌ Failed: ${result.error}</span>`;
        }
      }
    });

    // Save CLIST API key
    document.getElementById('cc-save-api-key')?.addEventListener('click', async () => {
      const input = document.getElementById('cc-api-key-input');
      const key = input.value.trim();

      if (typeof CodeCompareAPI !== 'undefined') {
        const saved = await CodeCompareAPI.setApiKey(key);
        if (saved) {
          updateApiStatus();
          alert('CLIST API key saved!');
        }
      }
    });

    // Clear all cache
    document.getElementById('cc-clear-cache')?.addEventListener('click', () => {
      if (typeof CodeCompareAPI !== 'undefined') {
        CodeCompareAPI.clearCache();
      }
      if (typeof CodeCompareMLSearch !== 'undefined') {
        CodeCompareMLSearch.clearCache();
      }
      updateCacheStats();
      updateHFStatus();
      alert('All cache cleared!');
    });
  }

  // Escape HTML entities
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize the UI
  function init(problem, matchResults, loading = false) {
    console.log('[CodeCompare UI] Initializing', loading ? '(loading)' : `with ${matchResults.length} matches`);

    currentProblem = problem;
    matches = matchResults;
    isLoading = loading;

    // Create container
    const container = createContainer();

    // Set up toggle
    const toggle = document.getElementById('codecompare-toggle');
    toggle.addEventListener('click', togglePanel);

    // Update current problem display
    const currentTitle = document.querySelector('.cc-current-title');
    if (currentTitle && problem) {
      currentTitle.textContent = problem.title;
    }

    // Update badge
    updateBadge(matches.length);

    // Update stats
    updateStats();

    // Update API status
    updateApiStatus();

    // Render matches (or loading)
    renderMatches();

    // Attach settings listeners
    attachSettingsListeners();

    // Attach tab listeners
    attachTabListeners();

    // Initialize mentor panel
    if (typeof CodeCompareMentor !== 'undefined') {
      CodeCompareMentor.setProblem(problem);
      const mentorTab = document.getElementById('cc-tab-mentor');
      if (mentorTab) {
        mentorTab.innerHTML = CodeCompareMentor.renderMentorPanel();
        CodeCompareMentor.attachListeners();
      }
    }

    // Auto-open if there are matches (or loading)
    if (matches.length > 0 || isLoading) {
      setTimeout(() => {
        if (!isOpen) togglePanel();
      }, 2000);
    }

    console.log('[CodeCompare UI] Initialized successfully');
  }

  // Update matches after async load
  function updateMatches(newMatches) {
    console.log('[CodeCompare UI] Updating with', newMatches.length, 'matches');
    matches = newMatches;
    isLoading = false;
    updateBadge(matches.length);
    renderMatches();
  }

  // Refresh matches (call after feedback changes)
  function refresh() {
    if (currentProblem) {
      isLoading = true;
      renderMatches();

      CodeCompareMatcher.findSimilarProblems(currentProblem)
        .then(results => {
          matches = results;
          isLoading = false;
          renderMatches();
          updateBadge(matches.length);
          updateStats();
        })
        .catch(e => {
          console.error('[CodeCompare UI] Refresh failed:', e);
          matches = CodeCompareMatcher.findSimilarProblemsSync(currentProblem);
          isLoading = false;
          renderMatches();
        });
    }
  }

  // ─── Tab switching ─────────────────────────────────────────────
  function switchTab(tab) {
    activeTab = tab;
    const matchesTab = document.getElementById('cc-tab-matches');
    const mentorTab = document.getElementById('cc-tab-mentor');
    const tabs = document.querySelectorAll('.cc-tab');

    tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    if (matchesTab) matchesTab.style.display = tab === 'matches' ? '' : 'none';
    if (mentorTab) mentorTab.style.display = tab === 'mentor' ? '' : 'none';
  }

  function attachTabListeners() {
    document.querySelectorAll('.cc-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
  }

  return { init, updateMatches, refresh, togglePanel, switchTab };
})();

if (typeof window !== 'undefined') window.CodeCompareUI = CodeCompareUI;
