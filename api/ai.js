export const config = { runtime: 'edge' };

import { getUsage, incrementUsage } from './usage.js';

const TASK_MODELS = {
  gemini: {
    TASK_RESUME_BULLET: 'gemini-1.5-flash',
    TASK_COVER_LETTER: 'gemini-2.0-flash',
    TASK_RESUME_IMPROVE: 'gemini-2.5-pro',
    TASK_INTERVIEW_PREP: 'gemini-2.0-flash',
    TASK_CODE_DEBUG: 'gemini-2.5-flash',
    TASK_CODE_GEN: 'gemini-2.5-flash',
    TASK_PROMPT_STUDIO: 'gemini-2.5-pro',
    DEFAULT: 'gemini-2.0-flash'
  },
  openai: {
    TASK_RESUME_BULLET: 'gpt-4o-mini',
    TASK_COVER_LETTER: 'gpt-4o-mini',
    TASK_RESUME_IMPROVE: 'gpt-4o',
    TASK_INTERVIEW_PREP: 'gpt-4o-mini',
    TASK_CODE_DEBUG: 'gpt-4o',
    TASK_CODE_GEN: 'gpt-4o',
    TASK_PROMPT_STUDIO: 'gpt-4o',
    DEFAULT: 'gpt-4o-mini'
  },
  groq: {
    TASK_RESUME_BULLET: 'llama-3.1-8b-instant',
    TASK_COVER_LETTER: 'llama-3.3-70b-versatile',
    TASK_RESUME_IMPROVE: 'llama-3.3-70b-versatile',
    TASK_INTERVIEW_PREP: 'llama-3.3-70b-versatile',
    TASK_CODE_DEBUG: 'llama-3.3-70b-versatile',
    TASK_CODE_GEN: 'llama-3.3-70b-versatile',
    TASK_PROMPT_STUDIO: 'llama-3.3-70b-versatile',
    DEFAULT: 'llama-3.3-70b-versatile'
  }
};

function getClientIdentifier(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const today = new Date().toISOString().slice(0, 10);
  return `${today}:${ip}`;
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 102400) {
    return new Response(JSON.stringify({ error: 'Payload exceeds 100KB limit.' }), { status: 413 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), { status: 400 });
  }

  const { prompt, taskType = 'DEFAULT' } = body;
  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing prompt parameter.' }), { status: 400 });
  }
  if (prompt.length > 25000) {
    return new Response(JSON.stringify({ error: 'Prompt exceeds 25,000 characters limit.' }), { status: 400 });
  }

  const limit = parseInt(process?.env?.FREE_DAILY_AI_LIMIT || '3', 10);
  const clientId = getClientIdentifier(request);
  const usage = getUsage(clientId, limit);

  if (usage.remaining <= 0) {
    return new Response(JSON.stringify({
      error: 'Daily free AI limit reached. Please try again tomorrow.',
      limit: usage.limit,
      remaining: 0
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '0' }
    });
  }

  const provider = (process?.env?.AI_PROVIDER || 'gemini').toLowerCase();
  const apiKey = process?.env?.AI_API_KEY || '';

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'AI service is currently unconfigured on this deployment.'
    }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

  incrementUsage(clientId);

  const modelMap = TASK_MODELS[provider] || {};
  const selectedModel = process?.env?.AI_MODEL || modelMap[taskType] || modelMap.DEFAULT || 'gemini-2.0-flash';

  try {
    let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:streamGenerateContent?alt=sse&key=${apiKey}`;
    let headers = { 'Content-Type': 'application/json' };
    let reqBody = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });

    if (provider === 'openai') {
      endpoint = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      reqBody = JSON.stringify({ model: selectedModel, stream: true, messages: [{ role: 'user', content: prompt }] });
    } else if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      reqBody = JSON.stringify({ model: selectedModel, stream: true, messages: [{ role: 'user', content: prompt }] });
    }

    const upstream = await fetch(endpoint, { method: 'POST', headers, body: reqBody });
    if (!upstream.ok) throw new Error(`Upstream error ${upstream.status}`);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    (async () => {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text ||
                              parsed.choices?.[0]?.delta?.content;
                if (chunk) {
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
                }
              } catch {}
            }
          }
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to communicate with AI provider.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
