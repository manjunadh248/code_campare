/**
 * prompts.js – Prompt Templates for the AI Interview Mentor
 *
 * Each mode returns a { system, user } pair.  The system prompt enforces
 * strict "no-code" safety; the user prompt is mode-specific.
 */

'use strict';

// ─── Global system instruction (shared by every mode) ────────────────

const SYSTEM_PROMPT = `You are an interview mentor helping students think better.

STRICT RULES:
- Do NOT provide full code.
- Do NOT provide complete step-by-step solution.
- Do NOT reveal final algorithm implementation.
- Do NOT provide direct answer.
- Do NOT use code fences or pseudo-code.

You may:
- Identify problem-solving pattern
- Provide hints
- Explain intuition
- Explain high-level approach
- Explain time and space complexity idea
- Explain why brute force fails

Always respond in structured markdown format.
Keep explanations concise and interview-focused.

If you accidentally generate code, immediately stop and respond:
"⚠️ Code generation is restricted in this mode."`;

// ─── Mode-specific prompt builders ────────────────────────────────────

function hint1(problem) {
    return {
        system: SYSTEM_PROMPT,
        user: `Provide a small directional hint for this coding problem.

Rules:
- Do NOT reveal approach.
- Do NOT mention exact algorithm name directly.
- Just guide thinking direction.
- Keep it 2–3 sentences.

Problem:
${problem}`,
    };
}

function hint2(problem) {
    return {
        system: SYSTEM_PROMPT,
        user: `Provide a stronger hint for this coding problem.

Rules:
- You may mention possible pattern (e.g., sliding window, DP, graph).
- Do NOT give full steps.
- Do NOT give pseudo code.
- Do NOT give solution.
- Guide toward correct data structure or technique.

Problem:
${problem}`,
    };
}

function hint3(problem) {
    return {
        system: SYSTEM_PROMPT,
        user: `Explain the high-level approach for solving this problem.

Rules:
- Do NOT provide code.
- Do NOT provide exact implementation steps.
- Do NOT provide final optimized formula.
- Explain logic clearly.
- Include time complexity idea.
- Include why brute force is inefficient.

Output Format:
**Pattern:**
**Core Idea:**
**Why Brute Force Fails:**
**Time Complexity Idea:**
**Space Complexity Idea:**

Problem:
${problem}`,
    };
}

function analysis(problem) {
    return {
        system: SYSTEM_PROMPT,
        user: `Analyze the following coding problem and identify:

- Most likely DSA pattern
- Secondary possible pattern (if any)
- Difficulty level (Easy / Medium / Hard)
- Required data structures
- Key observation needed

Do NOT provide solution.
Do NOT provide steps.
Only analysis.

Problem:
${problem}`,
    };
}

function logic(problem) {
    return {
        system: SYSTEM_PROMPT,
        user: `Explain the thinking process behind solving this coding problem.

STRICT RULES:
- Do NOT provide code.
- Do NOT provide complete step-by-step solution.
- Do NOT reveal final implementation.
- Do NOT provide example walkthrough solving it fully.

Focus only on:
- Pattern recognition
- Intuition
- Strategy
- Optimization idea
- Complexity reasoning

Output Format:
**Pattern:**
**Core Intuition:**
**Step Strategy (High-Level Only):**
**Optimization Insight:**
**Time Complexity (Idea):**
**Space Complexity (Idea):**
**Interview Insight:**

Problem:
${problem}`,
    };
}

function brute_force(problem) {
    return {
        system: SYSTEM_PROMPT,
        user: `Explain why a naive brute force approach would fail for this problem.

Include:
- Estimated brute force time complexity
- Why it will cause TLE
- What type of optimization is needed (without solving it)

Do NOT provide optimized solution.

Problem:
${problem}`,
    };
}

// ─── Mode dispatcher ─────────────────────────────────────────────────

const MODES = { hint1, hint2, hint3, analysis, logic, brute_force };

function buildPrompt(mode, problemStatement) {
    const builder = MODES[mode];
    if (!builder) return null;
    return builder(problemStatement);
}

function getValidModes() {
    return Object.keys(MODES);
}

module.exports = { buildPrompt, getValidModes, SYSTEM_PROMPT };
