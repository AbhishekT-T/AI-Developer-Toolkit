# Technical Architecture & Code Documentation: AI Developer Toolkit

This document provides a comprehensive technical breakdown of **AI Developer Toolkit**. It details how each tool and algorithm operates, the serverless Multi-AI gateway layer, the client-side document parsers, the heuristic ATS engine, the closed-loop resume improvement workflow, rate limiting and cost protection, and zero-cost serverless deployment.

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Document Parsing Pipeline (PDF, DOCX, TXT)](#2-document-parsing-pipeline-pdf-docx-txt)
3. [ATS Heuristic Scanner & Scoring Algorithm](#3-ats-heuristic-scanner--scoring-algorithm)
4. [Closed-Loop AI Resume Improvement](#4-closed-loop-ai-resume-improvement)
5. [Serverless AI Gateway & Provider Architecture](#5-serverless-ai-gateway--provider-architecture)
6. [Rate Limiting & Cost Protection](#6-rate-limiting--cost-protection)
7. [Career Feature Suite](#7-career-feature-suite)
8. [Resume Architect (5-Step Builder)](#8-resume-architect-5-step-builder)
9. [Developer Code Tools](#9-developer-code-tools)
10. [Prompt Engineering Studio](#10-prompt-engineering-studio)
11. [Legal, Privacy, and AdSense Architecture](#11-legal-privacy-and-adsense-architecture)
12. [Hosting & Deployment Architecture](#12-hosting--deployment-architecture)

---

## 1. System Architecture Overview

`AI Developer Toolkit` is engineered as an **edge-accelerated hybrid application**:
- **100% Free & Local Processing**: Binary document parsing, keyword tokenization, structural section hygiene checks, 65/35 ATS scoring, and resume generation operate entirely inside the client's browser with 0 API calls and zero latency.
- **Serverless AI Gateway (`/api/ai`)**: Advanced AI tasks (holistic resume refactoring, bullet point rewriting, cover letter generation, interview predictions, and code debugging) route through a lightweight serverless gateway. The serverless layer securely injects provider API secrets, enforces sliding-window daily rate limits per anonymous IP, and handles task-based model optimization.

### Architecture Flow:
```
[User Browser]
   │
   ├── Drag & Drop / File Upload (.pdf, .docx, .txt)
   │     │
   │     ├── PDF.js (Client-side Canvas/Text Extraction)
   │     ├── Mammoth.js (Client-side DOCX XML Parsing)
   │     └── FileReader API (Plain Text / Markdown)
   │           │
   │           ▼
   ├── Instant Local ATS Engine (100% Free & Private)
   │     ├── Tokenizer & Stop-Word Filter
   │     ├── Top 18 High-Signal Keyword Extraction
   │     ├── Regex Word-Boundary Matcher (\b)
   │     ├── Structural Section Detection
   │     └── Transparent 65% Keyword + 35% Structure Scoring
   │
   ├── AI Feature Request (e.g. "✨ Improve Resume with AI")
   │     │
   │     ▼
   │  [Client Limit Check & Live Badge Indicator]
   │     │
   │     ├── Daily Limit Exceeded? ──> Display Clean Lock Modal (#lockModal)
   │     │
   │     └── Within Daily Limit ──> POST /api/ai
   │                                  │
   │                                  ▼
   │                    [Serverless Edge Function]
   │                    (Cloudflare / Vercel / Netlify / Node.js)
   │                          │
   │                          ├── IP Hash Rate Limiter (Max 3/day default)
   │                          ├── Request Size & Prompt Sanitizer (<100KB)
   │                          ├── Task Router (Fast vs Strong Model selection)
   │                          └── Injects Server-Side AI_API_KEY
   │                                  │
   │                                  ▼
   │                     [AI Provider: Gemini, Claude, OpenAI, Groq]
   │                                  │
   │                                  ▼ (SSE Stream)
   │                    [Client SSE Consumer with DOM Sanitization]
   │                          │
   │                          ▼
   └── [Closed-Loop UI]: 1-Click "Apply to Resume & Re-Scan" in ATS
```

---

## 2. Document Parsing Pipeline (PDF, DOCX, TXT)

Documents are parsed directly in the user's browser memory using WebAssembly / JavaScript without uploading files to any remote server:

### Supported File Formats:
- **PDF (`.pdf`)**: Parsed via `PDF.js` (Mozilla). Iterates through pages and reconstructs plain text from text content items.
- **Word (`.docx`)**: Parsed via `Mammoth.js`. Unzips OpenXML content and extracts plain text while preserving paragraph boundaries.
- **Text (`.txt`, `.md`)**: Parsed via the browser's native `FileReader.readAsText()` API.

---

## 3. ATS Heuristic Scanner & Scoring Algorithm

The ATS Scanner evaluates how well a resume matches a job description **instantly without requiring an AI API call**, eliminating operating costs and preserving user privacy.

### Scoring Breakdown:
1. **Stop-Word Elimination & Tokenization**:
   - Strips common grammatical stop words (`and`, `the`, `with`, `for`, `about`, etc.) and numbers.
   - Extracts technical skills, frameworks, and job requirements.
   - Ranks the top 18 highest-frequency keywords from the job description.

2. **Word-Boundary Regex Matching**:
   ```javascript
   function keywordPresent(kw, text) {
     const pattern = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
     return pattern.test(text);
   }
   ```
   Prevents false positives (e.g. `Java` will not match inside `JavaScript`).

3. **Core Section Detection**:
   Verifies standard ATS structural sections using regex:
   - Work Experience: `/\b(experience|employment|work history|career)\b/i`
   - Education: `/\b(education|degree|university|college|bachelor|master|phd)\b/i`
   - Skills: `/\b(skills|technologies|tools|competencies|stack)\b/i`
   - Contact Info: `/[\w.-]+@[\w.-]+\.\w+/`
   - Summary / Objective: `/\b(summary|profile|about|objective)\b/i`
   - Projects / Certifications: `/\b(projects|certifications|credentials)\b/i`

4. **Transparent 65/35 Score Computation**:
   $$\text{Match Score} = (\text{Keyword Coverage Ratio} \times 0.65) + (\text{Section Presence Ratio} \times 0.35)$$
   - Clamped between $20\%$ and $99\%$.
   - Transparently displays matched keywords, missing keywords, and structural checklist.

---

## 4. Closed-Loop AI Resume Improvement

Rather than a disconnected AI generator, the platform provides a **tight feedback loop**:
1. User uploads resume and target job description ➔ Runs free local ATS scan.
2. System identifies specific keyword gaps and structural weaknesses.
3. User clicks **✨ Improve Resume with AI** (`AI • 1 CREDIT`).
4. Serverless gateway streams an optimized resume incorporating missing keywords while preserving authentic user facts.
5. User clicks **Apply to Resume & Re-Scan** ➔ Injects the improved resume directly into the ATS scanner and automatically re-executes the heuristic audit to verify score gains.

---

## 5. Serverless AI Gateway & Provider Architecture

### Multi-Cloud Support:
- **Cloudflare Pages / Workers**: `functions/api/ai.js` and `functions/api/usage.js`
- **Vercel Edge Functions**: `api/ai.js` and `api/usage.js`
- **Netlify Functions**: `netlify/functions/ai.mjs`
- **Native Node.js Server**: `server.js` for local development and self-hosting.

### Task-Based Model Routing:
The serverless gateway inspects the incoming `task` parameter and routes to the most cost-effective model:
- `TASK_RESUME_BULLET`: Fast, low-cost model (`gemini-2.0-flash` / `gpt-4o-mini`).
- `TASK_COVER_LETTER`: Fast model (`gemini-2.0-flash` / `gpt-4o-mini`).
- `TASK_CODE_DEBUG`: Coding model with structured reasoning.
- `TASK_RESUME_IMPROVE`: High-capability model (`gemini-2.5-pro` / `claude-3-5-sonnet`).

---

## 6. Rate Limiting & Cost Protection

1. **Anonymous IP Rate Limiting**:
   - The serverless gateway hashes `Client-IP + Date` into an in-memory sliding bucket.
   - Limit: `FREE_DAILY_AI_LIMIT` (default 3 requests/day).
   - Once depleted, responds with HTTP `429 Too Many Requests`.
2. **Frontend Quota Display**:
   - Fetches current quota from `/api/usage` on load and updates the header badge (`⚡ AI: 3 Left Today`).
   - If quota hits zero, AI buttons open a clean modal explanation without broken UI states.
3. **Payload Protection**:
   - Rejects payloads exceeding 100KB.
   - Enforces max prompt length of 12,000 characters.
   - Sanitizes DOM outputs to eliminate XSS risks.

---

## 7. Career Feature Suite
- **Cover Letter Generator**: 4 tones (Professional, Confident, Concise, Storytelling).
- **Quantified Bullet Rewriter**: Side-by-side Before/After grid with active verbs and measurable outcomes.
- **Interview Question Predictor**: Generates role-specific questions with STAR-method answer frameworks.
- **Multi-Job Description Comparison**: Compares a single resume across up to 3 job descriptions.

---

## 8. Resume Architect (5-Step Builder)
- Step-by-step guided form: Personal, Summary, Experience, Education + Skills, Style.
- Formats: Chronological, Functional, Hybrid.
- Actions: Copy Text, Print / PDF Export, and **1-Click "Scan in ATS"**.

---

## 9. Developer Code Tools
- Multi-Language Support: Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, SQL.
- **Code Debugger**: Pinpoints bugs, explains the error mechanism, and provides verified fixes.
- **Code Explainer**: Details algorithmic concepts and time/space complexity.
- **Code Generator**: Generates production-ready implementations with edge-case handling.

---

## 10. Prompt Engineering Studio
- **Master Prompt Generator**: Converts simple tasks into structured system prompts with persona, context, constraints, and output schema.
- **Prompt Quality Analyzer**: 6-stage evaluation rating clarity, specificity, and constraints.

---

## 11. Legal, Privacy, and AdSense Architecture
- **Zero Document Retention**: Resumes are parsed locally in browser RAM and never stored.
- **Privacy Policy & Terms of Service**: Built-in modal dialogs documenting local processing, IP rate-limiting, and AI provider terms.
- **AdSense Readiness**: Pre-configured layout slots, `ads.txt`, and toggled via `ADS_ENABLED`.

---

## 12. Hosting & Deployment Architecture

Zero-cost deployment on any major edge platform:
- **Cloudflare Pages**: Connect GitHub repo, build output `/`, set environment variables.
- **Vercel**: Import repository, Edge functions auto-configured in `api/`.
- **Netlify**: Connect repository, `netlify/functions/` auto-configured.
- **Self-Hosted / VPS**: Run `node server.js` with `PORT=3000`.
