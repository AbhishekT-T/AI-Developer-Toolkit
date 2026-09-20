# Complete Guide: Hosting for Free & Running Ads on Resume Scanner Pro

This guide walks you through **hosting your website for 100% free** on Vercel, Netlify, or GitHub Pages, attaching a custom domain, and **setting up Google AdSense to generate ad revenue**.

---

## Table of Contents
1. [Why This Project Is 100% Free to Host](#1-why-this-project-is-100-free-to-host)
2. [Hosting Option A: Vercel (Recommended - 60 Seconds)](#2-hosting-option-a-vercel-recommended)
3. [Hosting Option B: Netlify (Drag & Drop)](#3-hosting-option-b-netlify-drag--drop)
4. [Hosting Option C: GitHub Pages](#4-hosting-option-c-github-pages)
5. [Connecting a Custom Domain](#5-connecting-a-custom-domain)
6. [Monetization: Google AdSense Setup](#6-monetization-google-adsense-setup)
7. [Testing & Validating AI Features](#7-testing--validating-ai-features)

---

## 1. Why This Project Is 100% Free to Host

`Resume Scanner Pro` is designed as a modern, client-side web application:
- **Zero Server Costs**: The entire application (ATS heuristics, PDF.js file parsing, Mammoth.js Word doc parsing, multi-AI API streaming) runs directly in the user's web browser.
- **Privacy & Security**: Users' resumes, job descriptions, and API keys remain safe in their browser's local storage (`localStorage`).
- **Free Static Hosting**: Because there is no heavy backend server, you can host unlimited users for $0/month on Vercel, Netlify, or GitHub Pages.

---

## 2. Hosting Option A: Vercel (Recommended)

Vercel provides blazing-fast global edge hosting with automatic SSL (HTTPS).

### Steps:
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Launch Resume Scanner Pro"
   ```
2. Push your project to a new repository on [GitHub](https://github.com).
3. Open [vercel.com](https://vercel.com) and log in with GitHub.
4. Click **Add New... → Project**.
5. Select your GitHub repository.
6. Under **Build & Development Settings**, leave everything at default (Root directory `./`, Framework preset: Other).
7. Click **Deploy**.
8. Within 30 seconds, your site is live at `https://your-project-name.vercel.app`!

---

## 3. Hosting Option B: Netlify (Drag & Drop)

If you do not want to use Git, you can deploy using Netlify's web drop tool:

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop) (sign in or create a free account).
2. Drag and drop this entire project folder (`m:\coding\Project`) into the designated browser drop area.
3. Netlify will instantly upload and publish your site with a live URL (e.g., `https://relaxed-curie-12345.netlify.app`).
4. Go to **Site Settings → Change site name** to choose your own free subdomain (e.g., `https://my-resume-scanner.netlify.app`).

---

## 4. Hosting Option C: GitHub Pages

1. Push your code to a GitHub repository named `resume-scanner` (or your chosen name).
2. In GitHub, open your repository and click on **Settings** (top tab).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment → Branch**, choose `main` (or `master`) and folder `/ (root)`.
5. Click **Save**.
6. In ~1 minute, your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

---

## 5. Connecting a Custom Domain

For Google AdSense approval, a custom top-level domain (e.g. `www.myresumescan.com`) is strongly recommended.

1. Buy a domain from Namecheap, Cloudflare Registrar, Google Domains/Squarespace, or GoDaddy ($8–$12/year).
2. In your Vercel or Netlify project dashboard:
   - Go to **Settings → Domains**.
   - Type your domain name (e.g., `myresumescan.com`).
3. Log into your domain registrar and update your DNS records:
   - **A Record**: Point `@` to Vercel/Netlify's IP (e.g., `76.76.21.21` for Vercel).
   - **CNAME Record**: Point `www` to `cname.vercel-dns.com` (or `your-site.netlify.app`).
4. SSL certificates (HTTPS) will automatically generate within 15 minutes.

---

## 6. Monetization: Google AdSense Setup

### Step 1: Submit Your Domain to AdSense
1. Go to [google.com/adsense](https://www.google.com/adsense/) and sign up with your Google account.
2. Click **Sites → Add Site** and enter your custom domain (e.g. `https://myresumescan.com`).

### Step 2: Configure ads.txt
1. Google requires an `ads.txt` file at the root of your domain (`https://yourdomain.com/ads.txt`).
2. Open [ads.txt](file:///m:/coding/Project/ads.txt) in your project.
3. Replace `pub-0000000000000000` with your actual Google AdSense Publisher ID (found in AdSense Account Settings).
4. Commit and redeploy your site.

### Step 3: Enable Ads in the App
1. Open your live website.
2. Click **Ad Settings** in the top navigation bar.
3. Switch **AdSense Status** from `Preview Mode` to `Live Google AdSense Ads`.
4. Enter your Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).
5. (Optional) Enter your specific ad slot IDs if using manual ad units.
6. Click **Save Ad Settings**.

> **Note while waiting for AdSense review**: The app comes with sleek built-in sponsor placeholder cards that keep your UI looking professional and high-converting until your AdSense account is approved.

---

## 7. Testing & Validating AI Features

The app comes configured with **✨ Free Smart Demo Mode** as the default, allowing any visitor to test:
- **Instant ATS Keyword Scan**: Analyzes keyword density, section headers, and gives a 0–100% eligibility score immediately.
- **Cover Letter Generation**: Generates 4 tones of tailored cover letters.
- **Interview Question Predictor**: Predicts STAR-method questions based on the job posting.
- **Bullet Point Rewriter**: Converts weak bullets into quantified impact statements.
- **AI Resume Builder**: 5-step guided wizard that builds a complete ATS resume.
- **Developer Code Tools**: Debugger, code generator, and language converter.
- **Prompt Studio**: Master prompt generator and 6-part optimization evaluator.

### Adding Your Own API Keys:
Click **AI Settings** on the top navigation bar:
- Choose your provider: **Google Gemini**, **OpenAI (GPT-4o)**, **Anthropic Claude**, **DeepSeek (V3/R1)**, or **Groq (Llama 3.3)**.
- Paste your API key and click **Test Connection**.
- Click **Save AI Settings**.
- Your key is saved locally in your browser and used for all AI generations.
