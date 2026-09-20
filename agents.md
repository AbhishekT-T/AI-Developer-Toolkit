# AGENTS.md

## Project: AI Developer Toolkit

This repository contains a client-first AI productivity platform for developers and job seekers.

The application provides:

* Resume parsing
* ATS scanning
* Resume analysis
* Resume generation
* Cover letter generation
* Interview preparation
* Resume bullet rewriting
* Multi-job analysis
* Code debugging
* Code explanation
* Code generation
* SQL generation
* Prompt generation
* Prompt analysis
* Prompt optimization
* Multiple AI provider support
* AI streaming
* Offline/local functionality
* AdSense-ready monetization

The primary goal is to turn the project into a **real, stable, low-cost public web application**.

---

# 1. Core Development Principles

## DO

* Inspect existing code before modifying it.
* Preserve working functionality.
* Improve existing implementations instead of unnecessarily replacing them.
* Prefer simple solutions.
* Keep operating costs as close to zero as practical.
* Prefer client-side processing whenever possible.
* Use AI only when AI actually provides value.
* Keep the application usable without AI whenever possible.
* Keep the UI responsive and easy to understand.
* Handle errors properly.
* Keep security in mind at every stage.

## DO NOT

* Rewrite the entire project without a clear reason.
* Remove existing features without approval.
* Add unnecessary frameworks.
* Add unnecessary backend infrastructure.
* Add a database unless it is actually needed.
* Add Redis unless it is actually needed.
* Hardcode API keys.
* Commit secrets.
* Put server-side API keys in frontend JavaScript.
* Store production API keys in localStorage.
* Make fake AI requests.
* Pretend demo/offline responses are real AI responses.
* Make unlimited AI requests available by default.
* Add excessive advertisements.
* Break existing functionality while adding new features.

---

# 2. Architecture

The preferred architecture is:

```text
                         USER
                           |
                           v
                    FRONTEND / UI
                           |
             +-------------+-------------+
             |                           |
             v                           v
      LOCAL PROCESSING              AI GATEWAY
             |                           |
             |                  +--------+--------+
             |                  |        |        |
             |                  v        v        v
             |               Gemini   Groq    OpenRouter
             |                         ...
             |
             v
          RESULT
```

Local processing should be used whenever possible.

AI should only be called when necessary.

---

# 3. Local-First Rule

Before adding an AI call, ask:

> Can this feature be implemented reliably in the browser without AI?

If yes, implement it locally.

Examples:

### MUST be local where possible

* PDF parsing
* DOCX parsing
* TXT parsing
* Keyword extraction
* Stop-word filtering
* Keyword frequency
* Keyword matching
* Resume section detection
* Basic ATS scoring
* Resume statistics
* Basic prompt length analysis
* Basic structural checks
* Basic validation

These should NOT consume AI requests.

---

# 4. ATS Engine

The ATS engine is an important part of the product.

Do not replace the heuristic ATS engine with an AI-only system.

Current intended scoring:

```text
65% Keyword Coverage
35% Structural Section Hygiene
```

The engine should:

1. Extract resume text.
2. Normalize text.
3. Remove stop words.
4. Identify important keywords.
5. Select top keywords.
6. Compare against job description.
7. Use word-boundary matching where appropriate.
8. Detect important resume sections.
9. Calculate a transparent score.
10. Explain why the score was produced.

The user should be able to see:

```text
ATS Score: 78/100

Keyword Coverage: 48/65
Structure: 30/35

Missing Keywords:
- React
- AWS
- Docker
```

Do not make the score appear magical or unexplained.

---

# 5. Document Parsing

Supported formats:

* PDF
* DOCX
* TXT

Preferred libraries:

* PDF.js for PDF
* Mammoth.js for DOCX
* FileReader for TXT

Document processing should happen client-side whenever practical.

Do not upload a user's resume to a server just to extract text if it can be done locally.

Support:

* File picker
* Drag and drop
* File validation
* File size limits
* Loading state
* Error state
* Extracted-text preview

---

# 6. Unified AI Service

All AI providers should be accessed through a common abstraction.

Use:

```text
UnifiedAIService
```

Possible providers:

```text
Gemini
OpenAI
Claude
DeepSeek
Groq
OpenRouter
```

The UI and feature code should not contain provider-specific API logic.

Preferred interface:

```javascript
generate()
stream()
generateJSON()
```

Example conceptual usage:

```javascript
UnifiedAIService.generate({
    task: "resume_improvement",
    prompt,
    model
});
```

The resume feature should not care whether Gemini or Claude handled the request.

---

# 7. AI Provider Architecture

Use provider adapters.

Example:

```text
ai/
├── UnifiedAIService
├── GeminiProvider
├── OpenAIProvider
├── ClaudeProvider
├── DeepSeekProvider
├── GroqProvider
└── OpenRouterProvider
```

Adding a new provider should not require rewriting the application.

---

# 8. API Key Security

Production API keys are secrets.

NEVER put them in:

* HTML
* CSS
* public JavaScript
* GitHub
* localStorage
* URL parameters
* frontend environment variables exposed to the browser

Use:

```text
Frontend
   |
   v
Serverless / API Gateway
   |
   v
Environment variable
   |
   v
AI Provider
```

Example environment variables:

```text
AI_PROVIDER=
AI_MODEL=
AI_API_KEY=
FREE_DAILY_AI_LIMIT=
ADS_ENABLED=
```

Never commit actual values.

If a secret is accidentally exposed, treat it as compromised and replace it.

---

# 9. AI Usage Limits

The application uses a default application-provided AI key.

Therefore API usage must be controlled.

Initial defaults may be:

```text
Anonymous user:
3–5 AI requests/day

Authenticated user:
10 AI requests/day
```

These values must be configurable.

Example:

```text
FREE_DAILY_AI_LIMIT=5
```

The backend must enforce limits.

Frontend locks are NOT security.

The server must reject requests after the quota is reached.

---

# 10. Feature Lock System

AI features should have a clear locked/unlocked state.

Example:

```text
FREE • LOCAL
ATS Scanner

AI • LIMITED
🔒 AI Resume Improvement
```

The lock is a UX feature.

Actual quota enforcement happens server-side.

Do not hide local features behind unnecessary AI locks.

---

# 11. AI Cost Optimization

The main objective is to minimize operating cost.

Prefer:

```text
Local computation
      ↓
No API cost
```

over:

```text
Local computation
      ↓
AI API
```

Do not call AI for:

* Simple keyword matching
* ATS score
* File parsing
* Section detection
* Simple validation
* Basic formatting

Use AI for:

* Resume rewriting
* Cover letters
* Interview generation
* Advanced resume analysis
* Code debugging
* Code generation
* Code explanation
* Complex prompt optimization

---

# 12. AI Routing

Do not automatically use the most expensive model for every task.

Tasks should be configurable.

Example:

```text
Simple rewriting
→ cheap/fast model

Cover letter
→ cheap/fast model

Complex resume analysis
→ stronger model

Complex code debugging
→ coding-capable model
```

Keep model selection configurable.

---

# 13. Streaming

Use streaming where supported.

Preferred flow:

```text
Request
 ↓
Connection established
 ↓
Chunk
 ↓
Chunk
 ↓
Chunk
 ↓
Final response
```

Support:

* SSE
* Streaming text decoding
* Loading indicators
* Partial response rendering
* Connection failures
* Timeout
* Cancellation where practical

Never display an incomplete response as if it were final without indicating that streaming stopped.

---

# 14. Offline Demo Engine

The application may contain an offline/demo AI engine.

It must be clearly identified as:

```text
Demo Mode
```

or:

```text
Offline Demo
```

Never claim simulated output is generated by a real AI model.

The demo engine can simulate streaming for UI testing.

---

# 15. Resume Tools

Preserve all existing resume features.

Required tools:

* Resume Scanner
* Resume Builder
* Resume Architect
* AI Resume Improvement
* Bullet Rewriter
* Cover Letter Generator
* Interview Predictor
* ATS Format Checker
* Multi-Job Analysis

The resume workflow should support:

```text
Upload
 ↓
Extract
 ↓
Local ATS Scan
 ↓
Show Issues
 ↓
AI Improvement
 ↓
Rescan
```

---

# 16. Resume Builder

Maintain the 5-step architecture:

```text
1. Personal Information
2. Professional Summary
3. Experience
4. Education + Skills
5. Style + Target Job
```

Supported styles:

* Chronological
* Functional
* Hybrid

Generated resumes should be directly scannable by the local ATS engine.

Avoid unnecessary AI calls.

---

# 17. AI Resume Improvement

AI should:

* Improve wording.
* Preserve facts.
* Improve clarity.
* Use action verbs.
* Improve relevance to the job description.
* Avoid unnecessary verbosity.

AI MUST NOT:

* Invent jobs.
* Invent companies.
* Invent degrees.
* Invent certifications.
* Invent achievements.
* Invent numerical results.

If metrics are not provided, do not fabricate them.

---

# 18. Bullet Rewriter

Show:

```text
BEFORE
↓
AFTER
```

Preserve factual accuracy.

Do not create fake metrics.

Example:

Bad:

> Increased sales by 400%.

if the user never provided that information.

Better:

> Improved the sales workflow by optimizing customer follow-up processes.

---

# 19. Cover Letters

Supported tones:

* Professional
* Confident
* Concise
* Friendly

The AI must use information from the user's resume and job description.

Do not invent qualifications.

---

# 20. Interview Predictor

Generate:

* Technical questions
* Behavioral questions
* Resume-specific questions
* Job-specific questions

Where appropriate, provide:

```text
Situation
Task
Action
Result
```

Use interactive accordions/cards.

---

# 21. Developer Tools

Supported languages should include:

* Python
* JavaScript
* TypeScript
* Java
* C++
* C#
* Go
* Rust
* SQL

Tools:

```text
Code Debugger
Code Explainer
Code Generator
SQL Generator
```

AI should receive:

```text
Language
Code
Error
Requirement
Additional Context
```

depending on the tool.

---

# 22. Prompt Studio

Required:

* Prompt Generator
* Prompt Analyzer
* Prompt Optimizer
* Master Prompt Generator
* Structured Prompt Evaluator

Analyze:

* Goal
* Context
* Specificity
* Constraints
* Output format
* Ambiguity
* Missing information

Preserve the user's intent when optimizing prompts.

---

# 23. Security

Audit all user-controlled content.

Pay special attention to:

* XSS
* `innerHTML`
* AI-generated HTML
* File uploads
* Prompt injection
* Request injection
* API abuse
* Rate-limit bypass
* Oversized input
* Malicious documents

Never blindly insert AI-generated HTML into the DOM.

Prefer safe text rendering.

Sanitize HTML whenever HTML rendering is genuinely required.

---

# 24. File Security

Uploaded files are untrusted input.

Validate:

* Extension
* MIME type where practical
* File size

Do not execute uploaded content.

Do not store uploaded files permanently unless explicitly required.

Prefer client-side parsing.

---

# 25. Ads / AdSense

The application is intended to be monetized through advertisements.

Possible placements:

```text
Top banner
In-content ad
Result-page ad
Optional sticky area
```

Ads must not:

* Cover controls.
* Cause accidental clicks.
* Block important functionality.
* Become excessive.

Use:

```text
ADS_ENABLED=true
```

or equivalent configuration.

During development, ads should be disabled.

---

# 26. Legal Pages

Maintain:

* Privacy Policy
* Terms of Service
* Contact
* About

Do not make claims that are technically untrue.

Privacy documentation should accurately describe:

* Resume processing
* AI provider processing
* Analytics
* Advertising
* Cookies
* Local storage
* Data retention

---

# 27. Local Storage

localStorage can be used for non-sensitive preferences.

Examples:

```text
theme
selectedProvider
selectedModel
uiPreferences
recentLocalResults
```

Do NOT store production API secrets.

Do NOT st
