export const config = { runtime: 'edge' };

const usageStore = new Map();

function getClientIdentifier(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const today = new Date().toISOString().slice(0, 10);
  return `${today}:${ip}`;
}

export function getUsage(clientId, limit) {
  const used = usageStore.get(clientId) || 0;
  return { limit, used, remaining: Math.max(0, limit - used) };
}

export function incrementUsage(clientId) {
  const current = usageStore.get(clientId) || 0;
  usageStore.set(clientId, current + 1);
  return current + 1;
}

export default async function handler(request) {
  const limit = parseInt(process?.env?.FREE_DAILY_AI_LIMIT || '3', 10);
  const clientId = getClientIdentifier(request);
  const usage = getUsage(clientId, limit);

  const now = new Date();
  const resetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));

  return new Response(JSON.stringify({
    limit: usage.limit,
    used: usage.used,
    remaining: usage.remaining,
    resetsAt: resetDate.toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      'X-RateLimit-Limit': String(usage.limit),
      'X-RateLimit-Remaining': String(usage.remaining)
    }
  });
}
