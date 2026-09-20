/**
 * Cloudflare Worker with Static Assets
 * Handles /api/ai and /api/usage, and serves static assets (index.html, ads.txt, etc.)
 */
import { onRequestPost as handleAiPost } from './functions/api/ai.js';
import { onRequestGet as handleUsageGet } from './functions/api/usage.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route /api/ai POST requests
    if (url.pathname === '/api/ai' && request.method === 'POST') {
      return handleAiPost({ request, env, waitUntil: ctx?.waitUntil?.bind(ctx) });
    }

    // Route /api/usage GET requests
    if (url.pathname === '/api/usage' && request.method === 'GET') {
      return handleUsageGet({ request, env });
    }

    // CORS preflight for /api/*
    if (url.pathname.startsWith('/api/') && request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Serve static assets (index.html, ads.txt, etc.)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
