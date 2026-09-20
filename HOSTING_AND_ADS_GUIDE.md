# Complete Guide: 100% Free Hosting on Cloudflare Pages & Google AdSense

This guide walks you through **hosting your website for 100% free forever** on Cloudflare Pages, configuring your Gemini API serverless edge gateway, attaching a custom domain, and **setting up Google AdSense to generate revenue**.

---

## Table of Contents
1. [Why Cloudflare Pages is 100% Free & Superior](#1-why-cloudflare-pages-is-100-free--superior)
2. [Step-by-Step Deployment on Cloudflare Pages (2 Minutes)](#2-step-by-step-deployment-on-cloudflare-pages-2-minutes)
3. [Configuring Your Gemini API Secret (Server-Side Protection)](#3-configuring-your-gemini-api-secret-server-side-protection)
4. [Connecting a Custom Domain (Free SSL)](#4-connecting-a-custom-domain-free-ssl)
5. [Monetization: Google AdSense Setup](#5-monetization-google-adsense-setup)
6. [Local Testing with Cloudflare Functions](#6-local-testing-with-cloudflare-functions)

---

## 1. Why Cloudflare Pages is 100% Free & Superior

Unlike other hosting platforms that restrict commercial monetization on free tiers:
- **Zero Cost Forever ($0/month)**: Cloudflare Pages provides unlimited bandwidth and static asset requests for free. No credit card is required to deploy.
- **Commercial & AdSense Friendly**: Cloudflare explicitly permits ad-monetized websites on their free tier (unlike Vercel Hobby or GitHub Pages, which forbid commercial ads).
- **100,000 Free Edge Function Invocations/Day**: The included `/functions/api/ai.js` runs directly on Cloudflare's edge network, giving you 3,000,000 free requests per month.
- **Ironclad API Key Security**: Your Gemini API key is stored in Cloudflare's encrypted environment variables—never exposed in `index.html`, GitHub, or client browser network tabs.
- **Client-Side Heavy Architecture**: ATS parsing, PDF.js extraction, and Mammoth Word document analysis run locally inside the user's browser, consuming $0 server resources.

---

## 2. Step-by-Step Deployment on Cloudflare Pages (2 Minutes)

Because your code is already pushed to your GitHub repository (**[AbhishekT-T/AI-Developer-Toolkit](https://github.com/AbhishekT-T/AI-Developer-Toolkit)**), connecting to Cloudflare takes just a few clicks:

1. Go to **[dash.cloudflare.com](https://dash.cloudflare.com)** and create a free account (or log in).
2. In the left navigation, click **Compute (Workers & Pages)** → **Pages** → **Connect to Git**.
3. Select **GitHub** and authorize Cloudflare to access your repositories.
4. Select your repository: **`AbhishekT-T/AI-Developer-Toolkit`**.
5. Set up your build settings:
   - **Project name**: `ai-developer-toolkit` (or your choice)
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: *(Leave blank)*
   - **Build output directory**: `.` *(Just a single dot)*
   - **Root directory**: `/` *(Leave default)*
6. Click **Save and Deploy**.
7. In ~30 seconds, your site is live worldwide at:
   `https://ai-developer-toolkit.pages.dev`!

---

## 3. Configuring Your Gemini API Secret (Server-Side Protection)

To give visitors 3 free AI requests per day powered by your serverless gateway without exposing your key:

1. In your Cloudflare Dashboard, open your new Pages project (`ai-developer-toolkit`).
2. Go to **Settings** → **Environment variables**.
3. Under **Production**, click **Add variables**:
   - **Variable name**: `AI_PROVIDER`
     - **Value**: `gemini`
   - **Variable name**: `AI_API_KEY`
     - **Value**: *(Paste your free Gemini API Key from Google AI Studio: [aistudio.google.com](https://aistudio.google.com/))*
     - Click **Encrypt** to protect it as a secret.
   - **Variable name**: `FREE_DAILY_AI_LIMIT`
     - **Value**: `3`
4. Click **Save**.
5. Go to the **Deployments** tab, click the three dots `...` next to your latest deployment, and click **Retry deployment** (so the new environment variables take effect).

Now, any client request to `/api/ai` will automatically be routed through Gemini 2.0 Flash with daily rate limits and live streaming!

---

## 4. Connecting a Custom Domain (Free SSL)

For Google AdSense approval, a custom domain (e.g. `yourtool.com`) is strongly recommended.

1. Buy an affordable domain from Cloudflare Registrar, Namecheap, or GoDaddy ($8–$10/year).
2. In your Cloudflare Pages dashboard:
   - Go to **Custom domains** tab.
   - Click **Set up a custom domain**.
   - Enter your domain name (e.g., `resumetoolkit.com` or `www.resumetoolkit.com`).
3. If your domain's DNS is managed by Cloudflare, it automatically configures all DNS records in 1 click!
4. Free SSL/TLS certificates (HTTPS) are provisioned automatically.

---

## 5. Monetization: Google AdSense Setup

### Step 1: Submit Your Domain to AdSense
1. Go to [google.com/adsense](https://www.google.com/adsense/) and sign up.
2. Click **Sites → Add Site** and enter your custom domain (e.g. `https://resumetoolkit.com`).

### Step 2: Configure ads.txt
1. Google requires an `ads.txt` file at the root of your domain (`https://yourdomain.com/ads.txt`).
2. Open [ads.txt](file:///m:/coding/Project/ads.txt) in your project.
3. Replace `pub-0000000000000000` with your actual Google AdSense Publisher ID (found in AdSense Account Settings).
4. Commit and push to GitHub (Cloudflare will automatically redeploy in 30 seconds).

### Step 3: Enable Ads in the App
1. Open your live website.
2. Click **Ad Settings** in the top navigation bar.
3. Switch **AdSense Status** from `Preview Mode` to `Live Google AdSense Ads`.
4. Enter your Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).
5. Click **Save Ad Settings**.

---

## 6. Local Testing with Cloudflare Functions

To test your Cloudflare Pages Functions locally on your machine before deploying:

```bash
# Using Cloudflare Wrangler (Pages emulation)
npm run pages:dev

# Or using the zero-dependency Node server
npm start
```
Open `http://localhost:3000` or `http://localhost:8788` in your browser.
