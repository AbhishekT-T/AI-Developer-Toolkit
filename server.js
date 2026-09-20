/**
 * Local Development Server (Zero-Dependency Node.js)
 * Serves static assets and provides local /api/ai and /api/usage endpoints.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      process.env[k.trim()] = v.join('=').trim();
    }
  }
}

const PORT = process.env.PORT || 3000;
const FREE_LIMIT = parseInt(process.env.FREE_DAILY_AI_LIMIT || '3', 10);
const usageMap = new Map();

function getClientId(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const today = new Date().toISOString().slice(0, 10);
  return `${today}:${ip}`;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // 1. API: /api/usage
  if (pathname === '/api/usage' && req.method === 'GET') {
    const clientId = getClientId(req);
    const used = usageMap.get(clientId) || 0;
    const remaining = Math.max(0, FREE_LIMIT - used);
    const now = new Date();
    const resetsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      limit: FREE_LIMIT,
      used,
      remaining,
      resetsAt: resetsAt.toISOString()
    }));
  }

  // 2. API: /api/ai
  if (pathname === '/api/ai' && req.method === 'POST') {
    const clientId = getClientId(req);
    const used = usageMap.get(clientId) || 0;

    if (used >= FREE_LIMIT) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Daily free AI limit reached. Please try again tomorrow or configure your own key in settings.',
        limit: FREE_LIMIT,
        remaining: 0,
        used
      }));
    }

    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
      if (rawBody.length > 102400) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large.' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const body = JSON.parse(rawBody);
        const { prompt, taskType } = body;
        if (!prompt || typeof prompt !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing prompt.' }));
        }

        const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
        const apiKey = process.env.AI_API_KEY || '';

        // If no server-side API key configured, return clean notice
        if (!apiKey) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'AI_API_KEY not configured on local server. Add it to .env or use BYOK in settings.'
          }));
        }

        // Increment usage
        usageMap.set(clientId, used + 1);

        // Model selection
        let model = process.env.AI_MODEL || 'gemini-2.0-flash';
        if (provider === 'gemini') {
          if (taskType === 'TASK_RESUME_IMPROVE' || taskType === 'TASK_PROMPT_STUDIO') {
            model = 'gemini-2.5-pro';
          }
        }

        // Stream from provider
        const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        const upstream = await fetch(upstreamUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!upstream.ok) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: `Provider error ${upstream.status}` }));
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

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
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
                }
              } catch {}
            }
          }
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err) {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Server error: ' + err.message }));
        }
      }
    });
    return;
  }

  // 3. Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }
    const contentType = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`AI Developer Toolkit running at http://localhost:${PORT}`);
  console.log(`Serverless Gateway ready at /api/ai (Daily Limit: ${FREE_LIMIT})`);
});
