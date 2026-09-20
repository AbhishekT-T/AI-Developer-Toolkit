/**
 * Cloudflare Pages Function: /api/ai
 * Secure serverless AI gateway with task routing, rate limiting, and SSE streaming.
 * Protects default API keys on the server and prevents client key exposure.
 */

import { getUsage, incrementUsage } from './usage.js';

// Task-based model routing: maps tasks to optimal cost/quality models
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
  },
  deepseek: {
    DEFAULT: 'deepseek-chat',
    TASK_PROMPT_STUDIO: 'deepseek-reasoner'
  },
  anthropic: {
    TASK_RESUME_BULLET: 'claude-3-5-haiku-20241022',
    DEFAULT: 'claude-3-5-sonnet-20241022'
  }
};

function getClientIdentifier(request) {
  const ip = request.headers.get('cf-connecting-ip') ||
             request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             '127.0.0.1';
  const today = new Date().toISOString().slice(0, 10);
  return `${today}:${ip}`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Validate request payload size (100KB limit)
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 102400) {
    return new Response(JSON.stringify({ error: 'Payload too large. Maximum request size is 100KB.' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { prompt, taskType = 'DEFAULT', isJson = false } = body;

  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid "prompt" parameter.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (prompt.length > 25000) {
    return new Response(JSON.stringify({ error: 'Prompt exceeds maximum length of 25,000 characters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Server-side Rate Limiting check
  const limit = parseInt(env.FREE_DAILY_AI_LIMIT || '3', 10);
  const clientId = getClientIdentifier(request);
  const usage = getUsage(clientId, limit);

  if (usage.remaining <= 0) {
    return new Response(JSON.stringify({
      error: 'Daily free AI limit reached. Please try again tomorrow or configure your own key.',
      limit: usage.limit,
      remaining: 0,
      used: usage.used
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(usage.limit),
        'X-RateLimit-Remaining': '0'
      }
    });
  }

  // 3. Provider Configuration & Task Routing
  const provider = (env.AI_PROVIDER || 'gemini').toLowerCase();
  const apiKey = env.AI_API_KEY || '';

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'AI service is currently unconfigured on this server. Contact administrator or use BYOK in settings.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const modelMap = TASK_MODELS[provider] || {};
  const selectedModel = env.AI_MODEL || modelMap[taskType] || modelMap.DEFAULT || 'gemini-2.0-flash';

  // Increment usage upon verified start of request
  incrementUsage(clientId);

  // 4. Dispatch to Provider with Streaming
  try {
    if (provider === 'gemini') {
      return await handleGeminiStream(prompt, selectedModel, apiKey, isJson);
    } else if (provider === 'anthropic') {
      return await handleAnthropicStream(prompt, selectedModel, apiKey);
    } else {
      // OpenAI, DeepSeek, Groq, OpenRouter share Chat Completions SSE
      return await handleOpenAICompatibleStream(provider, prompt, selectedModel, apiKey);
    }
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Failed to communicate with AI provider. Please try again later.'
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/* Provider handlers */
async function handleGeminiStream(prompt, model, apiKey, isJson) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!response.ok) {
    throw new Error(`Gemini upstream error: ${response.status}`);
  }

  // Transform Gemini stream to standard SSE format
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = response.body.getReader();
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
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`));
              }
            } catch {}
          }
        }
      }
      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch (e) {
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
}

async function handleOpenAICompatibleStream(provider, prompt, model, apiKey) {
  let endpoint = 'https://api.openai.com/v1/chat/completions';
  if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';
  if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  if (provider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Upstream error ${response.status}`);
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = response.body.getReader();
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
            if (dataStr === '[DONE]') {
              await writer.write(encoder.encode('data: [DONE]\n\n'));
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`));
              }
            } catch {}
          }
        }
      }
    } catch {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
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
}

async function handleAnthropicStream(prompt, model, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) throw new Error(`Claude upstream error: ${response.status}`);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = response.body.getReader();
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
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk: parsed.delta.text })}\n\n`));
              }
            } catch {}
          }
        }
      }
      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
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
}
