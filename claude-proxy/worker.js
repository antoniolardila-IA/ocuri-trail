/**
 * claude-proxy — Worker Cloudflare genérico
 * Reenvía llamadas a api.anthropic.com desde cualquier app frontend.
 * Requiere header: X-App-Token: <PROXY_SECRET>
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-App-Token',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Solo POST /
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // Autenticación ligera con token de app
    const token = request.headers.get('X-App-Token') || '';
    if (!env.PROXY_SECRET || token !== env.PROXY_SECRET) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // Leer body: { model, system, messages, max_tokens }
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const {
      model       = 'claude-haiku-4-5-20251001',
      system      = '',
      messages    = [],
      max_tokens  = 1024,
    } = body;

    if (!messages.length) {
      return json({ error: 'messages array required' }, 400);
    }

    // Llamada a Anthropic
    const anthropicBody = { model, max_tokens, messages };
    if (system) anthropicBody.system = system;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(anthropicBody),
      });

      const data = await resp.json();

      if (!resp.ok) {
        return json({ error: data?.error?.message || 'Anthropic error', status: resp.status }, resp.status);
      }

      return json(data);

    } catch (err) {
      return json({ error: `Fetch failed: ${err.message}` }, 502);
    }
  },
};
