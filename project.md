# Technical Architecture & Code Documentation: Resume Scanner Pro

This document provides a comprehensive technical breakdown of **Resume Scanner Pro & AI Developer Toolkit**. It details how each tool and algorithm operates, the unified Multi-AI dispatch layer, the client-side document parsers, the monetization pipeline, and the zero-backend deployment model.

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Document Parsing Pipeline (PDF, DOCX, TXT)](#2-document-parsing-pipeline-pdf-docx-txt)
3. [ATS Heuristic Scanner & Scoring Algorithm](#3-ats-heuristic-scanner--scoring-algorithm)
4. [Multi-AI Architecture (`UnifiedAIService`)](#4-multi-ai-architecture-unifiedaiservice)
5. [AI Career Feature Suite](#5-ai-career-feature-suite)
6. [AI Resume Architect (Builder)](#6-ai-resume-architect-builder)
7. [Developer Code Tools](#7-developer-code-tools)
8. [Prompt Engineering Studio](#8-prompt-engineering-studio)
9. [Monetization & Google AdSense Engine](#9-monetization--google-adsense-engine)
10. [State Management & Data Persistence](#10-state-management--data-persistence)
11. [Hosting & Deployment Architecture](#11-hosting--deployment-architecture)

---

## 1. System Architecture Overview

`Resume Scanner Pro` is engineered as a **100% client-side Single-Page Application (SPA)**. It requires no centralized database or backend server.

### Architecture Diagram:
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
   ├── Instant ATS Heuristic Engine (0ms Execution)
   │     ├── Tokenizer & Stop-Word Filter
   │     ├── Keyword Density & Match Calculator
   │     ├── Structural Section Detection (Regex)
   │     └── SVG Circular Gauge Renderer
   │
   ├── Multi-AI Unified Dispatcher (BYOK + Smart Demo)
   │     ├── Google Gemini API (SSE Streaming)
   │     ├── OpenAI / DeepSeek / Groq / OpenRouter (Chat Completions SSE)
   │     ├── Anthropic Claude API (Messages SSE)
   │     └── Built-In Offline Demo Engine (Contextual Fallback)
   │           │
   │           ▼
   ├── Feature Modules (Cover Letter, Interview Qs, Bullets, Builder, Code)
   │
   ├── Monetization & Ad Placement Engine
   │     ├── Google AdSense Dynamic Injection
   │     └── Fallback Sponsor Card Components
   │
   └── Local Storage (`localStorage`) for Keys & Settings
```

---

## 2. Document Parsing Pipeline (PDF, DOCX, TXT)

Unlike basic tools that only accept copy-pasted text, this platform extracts raw text from binary documents directly within the user's browser.

### Supported File Formats:
- **PDF (`.pdf`)**: Parsed via `PDF.js` (Mozilla).
- **Word (`.docx`)**: Parsed via `Mammoth.js`.
- **Text (`.txt`, `.md`)**: Parsed via the native `FileReader` API.

### Code Implementation:

#### A. PDF Extraction (`extractTextFromPDF`)
```javascript
async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer();
  if (!window.pdfjsLib) throw new Error('PDF reader engine is still initializing.');
  
  // Load document array buffer into PDF.js worker
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  let fullText = '';
  
  // Iterate through all pages sequentially
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getPageContent ? await page.getPageContent() : await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText.trim();
}
```

#### B. Word (.docx) Extraction (`extractTextFromDOCX`)
`Mammoth.js` unzips the `.docx` OpenXML archive client-side and extracts plain text elements without layout clutter:
```javascript
async function extractTextFromDOCX(file) {
  const buffer = await file.arrayBuffer();
  if (!window.mammoth) throw new Error('DOCX reader engine is not loaded.');
  const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}
```

#### C. Drag-and-Drop Feedback
The drop zone listens to `dragenter`, `dragover`, `dragleave`, and `drop` events on `.rs-panel`, toggling the `.drag-over` CSS border animation and feeding dropped files to `handleFile(file)`.

---

## 3. ATS Heuristic Scanner & Scoring Algorithm

The ATS Scanner evaluates how well a resume matches a job description **instantly without requiring an AI API call**, saving latency and API quotas.

### Algorithm Breakdown:

1. **Stop-Word Elimination & Tokenization**:
   - Removes common English words (`the`, `with`, `and`, etc.) and numbers.
   - Extracts technical terms, noun phrases, and role skills.
   - Ranks the top 18 highest-frequency keywords from the job description.

2. **Word-Boundary Regex Matching**:
   ```javascript
   function keywordPresent(kw, text) {
     const pattern = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
     return pattern.test(text);
   }
   ```
   Ensures substrings do not trigger false positives (e.g. `Java` will not match inside `JavaScript`).

3. **Core Section Detection**:
   Verifies standard ATS structural sections using regex:
   - Work Experience: `/\b(experience|employment|work history|career)\b/i`
   - Education: `/\b(education|degree|university|college|bachelor|master|phd)\b/i`
   - Skills: `/\b(skills|technologies|tools|competencies|stack)\b/i`
   - Contact Info: `/[\w.-]+@[\w.-]+\.\w+/`

4. **Weighted Score Computation**:
   $$\text{Match Score} = (\text{Keyword Coverage Ratio} \times 0.65) + (\text{Section Presence Ratio} \times 0.35)$$
   - Clamped between $20\%$ and $99\%$.
   - Classified into 3 tiers:
     - $\ge 70\%$: **Strong match** (Green)
     - $45\% - 69\%$: **Reasonable fit** (Yellow)
     - $< 45\%$: **Weak match / Real gaps** (Red)

5. **SVG Circular Gauge Rendering**:
   Computes stroke offset dynamically based on circle circumference:
   $$\text{Circumference} = 2 \times \pi \times 38 \approx 238.76$$
   $$\text{Offset} = \text{Circumference} - \left(\frac{\text{Score}}{100} \times \text{Circumference}\right)$$
   Animated with smooth CSS cubic-bezier transitions.

---

## 4. Multi-AI Architecture (`UnifiedAIService`)

The platform features an abstract AI dispatch layer that supports **6 top AI providers** plus a **Built-in Offline Demo Engine**.

### Supported Providers & API Protocols:

| Provider | Endpoint | Auth Header | Protocol |
|---|---|---|---|
| **Google Gemini** | `generativelanguage.googleapis.com` | `?key=${apiKey}` | Server-Sent Events (SSE) |
| **OpenAI** | `api.openai.com/v1/chat/completions` | `Bearer ${apiKey}` | Chat Completions SSE |
| **Anthropic Claude** | `api.anthropic.com/v1/messages` | `x-api-key: ${apiKey}` | Messages API SSE |
| **DeepSeek** | `api.deepseek.com/chat/completions` | `Bearer ${apiKey}` | OpenAI-compatible SSE |
| **Groq** | `api.groq.com/openai/v1/chat/completions` | `Bearer ${apiKey}` | Ultra-fast Llama 3.3 SSE |
| **OpenRouter** | `openrouter.ai/api/v1/chat/completions` | `Bearer ${apiKey}` | Universal multi-model SSE |
| **Smart Demo** | Client-side Simulator | None | Virtual word streamer |

### Core Unified Dispatcher:
All feature tabs call two high-level abstractions:
- `callClaude(prompt, onChunk, onDone)`: Streams tokens character-by-character or chunk-by-chunk to the UI.
- `callClaudeJSON(prompt)`: Returns a structured, parsed JSON object for programmatic components (Interview questions, Job compare).

### Smart Offline Demo Mode:
If a user does not have an API key, `simulateDemoStream` intercepts the prompt:
- Detects the requested task (Cover letter, Master prompt, Bullet rewrite, or Resume generation).
- Produces realistic domain-specific output.
- Emulates live streaming at $\sim 25\text{ms}$ per word using `setInterval`.
- Guarantees **100% uptime and testability for all visitors**.

---

## 5. AI Career Feature Suite

Located on the primary Scanner page below the results panel:

### 1. Cover Letter Generator
- Inputs: Current Resume + Target Job Description + Selected Tone.
- Tones: `Professional`, `Enthusiastic`, `Concise & Direct`, `Storytelling`.
- Outputs: Multi-paragraph cover letter highlighting candidate achievements matching the role's requirements.

### 2. ATS Hygiene Checker
Runs 5 automated client-side checks:
1. Contact info detected (email regex).
2. Work experience timeline detected.
3. Education section detected.
4. Skills & competencies section present.
5. Clean layout without complex table pipes (`||`).

### 3. Interview Question Predictor
- Sends job requirements to `callClaudeJSON`.
- Prompts AI to return 4 structured questions categorized by competency (e.g. *Technical Execution*, *Prioritization & Impact*).
- Supplies a STAR-method answer strategy for each question in an interactive accordion element.

### 4. Bullet Point Rewriter
- Takes user bullet points line-by-line.
- Transforms passive verbs (`"Was responsible for..."`) into active metric-driven achievements (`"Spearheaded...", "Cut latency by 38%..."`).
- Renders a side-by-side Before/After grid.

### 5. Multi-Job Description Comparison
- Evaluates candidate resume against up to 3 different postings (`Job A`, `Job B`, `Job C`).
- Ranks best fit with match percentages and justification.

---

## 6. AI Resume Architect (Builder)

Located on Page 2 (`#page-resume-gen`), this module enables building a resume from scratch:

1. **5-Step Form Wizard**:
   - Step 1: Personal Contact & Portfolio URLs.
   - Step 2: Professional Summary & Specialties.
   - Step 3: Work History & Quantified Metrics.
   - Step 4: Education & Technical Stack.
   - Step 5: Format (`Chronological`, `Functional`, `Hybrid`) & Optional Target JD.
2. **Real-time Live Stream**:
   Outputs a plain-text, ATS-compliant resume with standardized ALL-CAPS section headers.
3. **Actions**:
   - `Copy Text`: Copies output to clipboard.
   - `Print / PDF`: Triggers print stylesheet.
   - `→ Scan in ATS`: Injects generated resume directly into Scanner Page 1 for validation.

---

## 7. Developer Code Tools

Located on Page 3 (`#page-code-tools`):

1. **Language Matrix**:
   JavaScript, TypeScript, Python, Java, C++, Go, Rust, SQL.
2. **Code Debugger**:
   Analyzes broken code snippets, identifies the root cause (off-by-one errors, type coercion, null checks), and provides the fixed implementation.
3. **Code Generator**:
   Synthesizes production-ready Functions, Classes, API endpoints, Algorithms, and Unit Tests with defensive input handling.

---

## 8. Prompt Engineering Studio

Located on Page 4 (`#page-prompt-studio`):

### Mode 1: Master Prompt Generator
Transforms a brief task description into an enterprise-grade system prompt structured with:
- AI Persona & Role
- Primary Goal & Context
- Input Variables / Placeholders (`[Insert Details]`)
- Step-by-Step Execution Plan
- Constraints & Boundaries
- Expected Output Format

### Mode 2: Prompt Quality Analyzer
Performs a 6-stage structured prompt critique:
1. Initial Assessment & Quality Score (out of 10).
2. Structural Analysis (Clarity, Specificity, Completeness).
3. Key Strengths.
4. Areas for Improvement.
5. Enhanced Version.
6. Implementation Notes.

---

## 9. Monetization & Google AdSense Engine

The application is built to generate revenue while maintaining aesthetics:

### Ad Placement Architecture:
1. **Top Leaderboard Banner (`#adSlotTop`)**:
   Responsive container placed between top navigation and main content (`728x90` desktop / `320x50` mobile).
2. **In-Content Result Banner (`#adSlotResult`)**:
   Targeted banner placed directly beneath the ATS match gauge.
3. **Sticky Top Announcement Bar (`#stickyTopBar`)**:
   Non-intrusive alert with a dismiss button.

### Dual-Mode Ad System:
- **Live AdSense Mode**: Injects `page2.googlesyndication.com/pagead/js/adsbygoogle.js` with the user's `ca-pub-XXXXXXXXXXXXXXXX` publisher ID.
- **Preview / Sponsor Mode**: Displays sleek dark-mode placeholder sponsor cards so layout never collapses or looks broken before AdSense approval.

### AdSense Compliance Assets Included:
- **`ads.txt`**: Placed at root directory for domain verification.
- **Privacy Policy Modal**: Explains client-side processing, cookie usage, and third-party advertising.
- **Terms of Service Modal**: Standard software disclaimer.
- **About & Contact Modal**: Support contact info.

---

## 10. State Management & Data Persistence

All application states are persisted client-side in the browser's `localStorage`:

| Key | Type | Description |
|---|---|---|
| `ai_provider` | `string` | Selected provider (`demo`, `gemini`, `openai`, `anthropic`, `deepseek`, `groq`, `openrouter`) |
| `ai_model_<provider>` | `string` | Selected model ID for that provider |
| `api_key_<provider>` | `string` | Stored API key for that provider |
| `adsense_status` | `string` | `preview` or `live` |
| `adsense_pub_id` | `string` | Publisher ID (`ca-pub-...`) |
| `adsense_slot_top` | `string` | Slot ID for top banner |

No credentials, resumes, or user prompts are ever sent to tracking servers.

---

## 11. Hosting & Deployment Architecture

Because the project is 100% static (HTML, CSS, JavaScript), it can be deployed on global Edge CDNs for **$0/month**:

### 1. Vercel Configuration (`vercel.json`):
```json
{
  "version": 2,
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### 2. Netlify Configuration (`netlify.toml`):
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Access-Control-Allow-Origin = "*"
```

### 3. Deployment Methods:
- **GitHub → Vercel**: Import repo → Deploy in 30 seconds.
- **Netlify Drop**: Drag & drop project folder into [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages**: Turn on Pages under Repository Settings → Branch `main`.
