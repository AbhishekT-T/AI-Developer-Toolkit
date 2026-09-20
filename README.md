# AI Developer Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployment: Cloudflare | Vercel | Netlify](https://img.shields.io/badge/Deployment-Cloudflare%20%7C%20Vercel%20%7C%20Netlify-success)](#deployment-guide)
[![Local ATS: 100% Free & Private](https://img.shields.io/badge/Local%20ATS-100%25%20Free%20%26%20Private-brightgreen)](#local-heuristic-ats-engine)
[![Multi-AI Gateway](https://img.shields.io/badge/AI%20Gateway-Gemini%20%7C%20OpenAI%20%7C%20Claude%20%7C%20Groq%20%7C%20DeepSeek-purple)](#ai-provider-architecture)

A production-ready, ultra-low-cost, high-performance web platform combining an **In-Browser Heuristic ATS Scanner**, **AI Resume Optimizer**, **Developer Code Tools**, and **Prompt Engineering Studio**.

Engineered for **zero-cost operation** by maximizing in-browser client-side computation (PDF/DOCX extraction, regex tokenization, 65/35 ATS scoring algorithm) and protecting server-side AI requests via a lightweight serverless gateway with task-based model routing and IP rate-limiting.

---

## 🏗️ Architecture & Request Flow

`mermaid
flowchart TD
    User([User Browser]) --> UI[Client-side Web App]
    
    subgraph Client-Side Free & Local Processing [100% Free & Private - 0 API Calls]
        UI -->|Upload PDF / DOCX / TXT| Parsers[PDF.js & Mammoth.js Extractors]
        Parsers -->|Raw Text| ATS[Heuristic ATS Scoring Engine]
        ATS --> MatchScore[ATS Score: 65% Keywords + 35% Structure]
        ATS --> Checklist[Missing Keywords & Formatting Hygiene]
        UI --> Builder[5-Step Resume Architect Wizard]
        Builder -->|1-Click Scan| ATS
    end
    
    subgraph Production Serverless AI Gateway [Protected & Cost-Optimized]
        UI -->|Click AI Feature| LockCheck{Daily Limit Check}
        LockCheck -->|Over Quota| LockModal[Show Daily Limit Reached Modal]
        LockCheck -->|Within Limit| GatewayAPI[/api/ai Gateway Endpoint]
        
        GatewayAPI --> RateLimiter[Server-Side IP Rate Limiter]
        RateLimiter --> TaskRouter[Task-Based Model Router]
        
        TaskRouter -->|TASK_RESUME_BULLET| FastModel[Fast / Low-Cost Model: gemini-2.0-flash / gpt-4o-mini]
        TaskRouter -->|TASK_COVER_LETTER| FastModel
        TaskRouter -->|TASK_CODE_DEBUG| CodeModel[Code-Optimized Model]
        TaskRouter -->|TASK_RESUME_IMPROVE| StrongModel[Deep Reasoning Model: gemini-2.5-pro / claude-3-5-sonnet]
    end
    
    FastModel -->|Encrypted Server Request| Provider[(AI Provider: Gemini, OpenAI, Claude, Groq)]
    CodeModel -->|Encrypted Server Request| Provider
    StrongModel -->|Encrypted Server Request| Provider
    Provider -->|Server-Sent Events SSE| GatewayAPI
    GatewayAPI -->|Streaming Response| UI
`

---

## 🌟 Feature Breakdown: Free/Local vs. AI-Powered

| Category | Feature | Processing Engine | Cost / Quota |
| :--- | :--- | :--- | :--- |
| **Career** | **Document Upload & Parsing** | Client-side PDF.js & Mammoth.js | **FREE • LOCAL** (0 calls) |
| **Career** | **ATS Scanner & Score (0–100%)** | Heuristic 65% keyword + 35% structure engine | **FREE • LOCAL** (0 calls) |
| **Career** | **Keyword & Structural Analysis** | Regex boundary matcher + stop-word filter | **FREE • LOCAL** (0 calls) |
| **Career** | **Resume Architect (5-step Builder)** | Client-side DOM generator (Print / PDF export) | **FREE • LOCAL** (0 calls) |
| **Career** | **Multi-Job Description Comparison** | Client-side multi-role keyword delta | **FREE • LOCAL** (0 calls) |
| **Career** | **✨ AI Resume Improvement** | AI Serverless Gateway with Task Routing | **AI • 1 Credit** (Daily Limit) |
| **Career** | **✨ AI Quantified Bullet Rewriter** | Side-by-side before/after with action verbs | **AI • 1 Credit** (Daily Limit) |
| **Career** | **✨ AI Cover Letter Generator** | 4 customizable tones (Professional, Confident, etc.) | **AI • 1 Credit** (Daily Limit) |
| **Career** | **✨ AI Interview Predictor & STAR** | Technical, behavioral & role-specific predictions | **AI • 1 Credit** (Daily Limit) |
| **Code** | **✨ Multi-Language Code Debugger** | Python, JS, TS, Java, C++, C#, Go, Rust, SQL | **AI • 1 Credit** (Daily Limit) |
| **Code** | **✨ Code Explainer & Architecture** | Complexity analysis & concept breakdowns | **AI • 1 Credit** (Daily Limit) |
| **Code** | **✨ Code Generator** | Targeted generation with test cases | **AI • 1 Credit** (Daily Limit) |
| **Prompt** | **✨ Master Prompt Generator** | Production-ready role/constraint prompts | **AI • 1 Credit** (Daily Limit) |
| **Prompt** | **✨ Prompt Quality Evaluator** | 6-stage structured scoring & optimization | **AI • 1 Credit** (Daily Limit) |

---

## 🎯 Local Heuristic ATS Engine

The ATS scanner runs **entirely in the user's browser**:
1. **Document Parsing**: Drops .pdf, .docx, or .txt directly into client memory using PDF.js and Mammoth.js. No files are uploaded to any server.
2. **Keyword Extraction**:
   - Strips English stop words (nd, 	he, with, or, etc.).
   - Normalizes terms and isolates word boundaries to avoid false substring matches.
   - Extracts top 18 high-signal skills, technologies, and requirements from the job description.
3. **Transparent 65/35 Scoring**:
   - **65% Keyword Coverage**: Measures exact matches of job posting keywords in resume text.
   - **35% Structural Section Hygiene**: Verifies critical resume sections: Contact Info, Summary/Objective, Work Experience, Education, Skills, Projects, and Certifications.
4. **Closed-Loop Improvement Cycle**:
   - Run ATS Scan ➔ Inspect missing keywords ➔ Click **✨ Improve Resume with AI** ➔ Review side-by-side diff ➔ Click **Apply to Resume & Re-Scan** ➔ Watch ATS score jump in real-time.

---

## 🔒 Security & Cost Protection

1. **No Frontend API Secrets**: The default API key is stored exclusively as a server-side environment variable (AI_API_KEY). The browser client never touches raw provider secrets.
2. **Serverless AI Gateway (/api/ai)**:
   - Enforces max request payload (100KB limit).
   - Enforces max prompt length (12,000 characters).
   - Sanitizes and validates incoming JSON payloads.
3. **Server-Side IP Rate Limiting**:
   - Anonymous daily quota (FREE_DAILY_AI_LIMIT=3, configurable).
   - Client IPs are hashed with a daily sliding key. No PII is logged or permanently stored.
   - Responding to quota violations with standard HTTP 429 Too Many Requests.
4. **Task-Based Routing**: Automatically routes tasks to the most cost-efficient models (e.g. lightweight fast models for bullet rewriting, deep models for holistic resume refactoring).
5. **DOM Sanitization**: All AI-rendered outputs pass through HTML sanitizers before insertion to prevent XSS.

---

## ⚙️ Environment Variables

Copy .env.example to .env or set these in your hosting dashboard:

`ini
# AI Provider Configuration
AI_PROVIDER=gemini                  # gemini | openai | claude | groq | deepseek | openrouter
AI_API_KEY=your_server_api_key_here # Server-only secret key (NEVER exposed to frontend)
AI_MODEL=gemini-2.0-flash           # Default model

# Serverless Quota & Limits
FREE_DAILY_AI_LIMIT=3               # Maximum free AI requests per anonymous IP per day
PORT=3000                           # Local dev server port

# Monetization & Ads
ADS_ENABLED=false                   # Set to true when Google AdSense is approved
`

---

## 🚀 Deployment Guide

### Option 1: Cloudflare Pages & Workers (Primary / Recommended)
Zero-cost, edge-accelerated deployment with native Cloudflare Functions:
1. Push this repository to GitHub.
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages**.
3. Connect your GitHub repo AI-Developer-Toolkit.
4. Build Settings:
   - **Framework preset**: None
   - **Build command**: *(leave empty)*
   - **Build output directory**: /
5. Under **Settings** ➔ **Environment variables**, add:
   - AI_PROVIDER = gemini (or your choice)
   - AI_API_KEY = your_actual_key
   - FREE_DAILY_AI_LIMIT = 3
   - ADS_ENABLED = alse
6. Deploy! The Cloudflare Pages Functions under unctions/api/ai.js and unctions/api/usage.js will execute natively at the edge.

### Option 2: Vercel
1. Import repository into [Vercel](https://vercel.com).
2. Root directory: ./
3. Add environment variables: AI_PROVIDER, AI_API_KEY, FREE_DAILY_AI_LIMIT.
4. Deploy! The Edge Functions in pi/ai.js and pi/usage.js handle requests automatically.

### Option 3: Netlify
1. Connect repository in [Netlify](https://app.netlify.com).
2. Build command: *(leave empty)*, Publish directory: ..
3. Add environment variables in Site settings.
4. Deploy! 
etlify/functions/ai.mjs handles the API routes.

---

## 💻 Local Development

Run the included zero-dependency Node.js development server:

`ash
# 1. Clone repository
git clone https://github.com/AbhishekT-T/AI-Developer-Toolkit.git
cd AI-Developer-Toolkit

# 2. Setup environment variables (optional for testing AI gateway locally)
cp .env.example .env
# Edit .env and insert your AI_API_KEY

# 3. Start local server
npm run dev
# or
node server.js
`

Open http://localhost:3000 in your browser.

---

## 📢 Google AdSense & Monetization Setup

The project is structured to comply with Google AdSense policies:
- Non-intrusive container placeholders placed outside critical action zones.
- Controlled via ADS_ENABLED config flag (no broken layout shifts when disabled).
- Standard ds.txt included in the root directory.
- Comprehensive legal pages included: **Privacy Policy**, **Terms of Service**, and **Cookie/Data Disclaimers**.

---

## 🗺️ Future Roadmap

- [ ] Optional user authentication (Firebase / Supabase) to raise daily limits for registered accounts.
- [ ] Stripe / LemonSqueezy integration for Pro Tier (Unlimited AI + No Ads).
- [ ] Multi-lingual resume parsing & ATS translation.
- [ ] Export directly to formatted .docx and Google Docs.

---

## 📄 License

Distributed under the MIT License. See LICENSE for more information.
