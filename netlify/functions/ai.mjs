/**
 * Netlify Function: /api/ai
 */

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = Netlify.env.get('AI_API_KEY');
  const provider = (Netlify.env.get('AI_PROVIDER') || 'gemini').toLowerCase();
  const limit = parseInt(Netlify.env.get('FREE_DAILY_AI_LIMIT') || '3', 10);

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI service unconfigured on this deployment.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
  }

  const model = Netlify.env.get('AI_MODEL') || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!upstream.ok) throw new Error(`Upstream error ${upstream.status}`);

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'AI provider communication failed.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/ai'
};
