# Resume Scanner Pro & AI Developer Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Hosting: Vercel / Netlify](https://img.shields.io/badge/Hosting-Vercel%20%7C%20Netlify-success)](HOSTING_AND_ADS_GUIDE.md)
[![AI Providers](https://img.shields.io/badge/Multi--AI-OpenAI%20%7C%20Gemini%20%7C%20Claude%20%7C%20DeepSeek%20%7C%20Groq-purple)](index.html)

A production-ready, client-side web platform that combines an **ATS Resume Scanner**, **AI Resume Builder**, **Developer Code Tools**, and **Prompt Engineering Studio**. Fully equipped with **Multiple AI Models**, **In-Browser PDF & DOCX File Extraction**, **Google AdSense Monetization**, and zero-cost hosting support.

---

## 🌟 Key Features

### 1. ATS Resume Scanner & Match Optimizer
- **Instant Match Score (0–100%)**: Evaluates keyword density, experience timeline, and mandatory requirements against target job descriptions.
- **In-Browser PDF & Word (.docx) Parsing**: Drop real `.pdf` and `.docx` files — text is extracted locally using `PDF.js` and `Mammoth.js` without uploading sensitive data to any server.
- **1-Click Test Samples**: Preloaded realistic resumes & JDs (Full-Stack SWE, Product Manager, Data Analyst, Growth Lead).
- **Export & Print**: One-click formatted print / PDF export of audit results.

### 2. Multi-AI Career Feature Suite
- **Cover Letter Generator**: Generates 4 custom tones (Professional, Enthusiastic, Concise, Storytelling).
- **ATS Format & Hygiene Checker**: Scans for table formatting traps, section headers, and email contact indicators.
- **Interview Question Predictor**: Generates STAR-method interview questions based on job description requirements.
- **High-Impact Bullet Rewriter**: Upgrades passive bullet points into quantified impact statements with action verbs.
- **Multi-Job Description Comparison**: Ranks match probability across 3 roles side-by-side.

### 3. AI Resume Architect (Builder)
- 5-step guided wizard for candidate details, career highlights, metrics, and education.
- Generates ATS-optimized **Chronological**, **Functional**, or **Hybrid** resumes.

### 4. Developer Code Tools & Prompt Studio
- **Code Debugger & Generator**: Supports JavaScript, TypeScript, Python, Java, C++, Go, Rust, and SQL.
- **Master Prompt Generator & Quality Analyzer**: Production-ready prompts and 6-stage structured prompt evaluations.

---

## 🤖 Supported AI Providers (BYOK + Free Demo)

Users can use the built-in **Smart Free Demo Mode** (no API key needed) or plug in their own keys:
- **Google Gemini**: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-2.5-pro`
- **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `o3-mini`, `gpt-3.5-turbo`
- **Anthropic Claude**: `claude-3-5-sonnet`, `claude-3-5-haiku`, `claude-3-opus`
- **DeepSeek**: `deepseek-chat` (V3), `deepseek-reasoner` (R1)
- **Groq**: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`
- **OpenRouter**: Access to 200+ models with a single unified key.

*All credentials and resumes are stored securely inside the client's `localStorage`.*

---

## 🚀 Free 1-Click Hosting

This app is 100% static and zero-backend, making it free to host forever on:
- **Vercel** (`vercel.json` included)
- **Netlify** (`netlify.toml` included)
- **GitHub Pages**

For complete step-by-step instructions, see **[HOSTING_AND_ADS_GUIDE.md](HOSTING_AND_ADS_GUIDE.md)**.

### Running Locally:
```bash
# Using Node.js:
npx serve .

# Or using Python:
python -m http.server 3000
```
Open `http://localhost:3000` in your web browser.

---

## 📄 License
MIT License. Open source and free to customize.
