/**
 * SanceaVet — API Cloudflare Pages Function
 * Auth déléguée à Cloudflare Access — aucune vérification de token ici.
 *
 * Routes :
 *   GET    /api/data      → charge toutes les données
 *   PUT    /api/data      → sauvegarde toutes les données
 *   DELETE /api/data      → efface toutes les données
 *   GET    /api/freepbx   → retourne le JSON de routing astreintes FreePBX
 *   PUT    /api/freepbx   → stocke le JSON de routing astreintes FreePBX
 */

const KV_KEY         = 'planning_data_v1';
const FREEPBX_KV_KEY = 'freepbx_config';

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
function text(msg, status = 200) {
  return new Response(msg, { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const path = new URL(request.url).pathname;

  if (path === '/api/data' && request.method === 'GET') {
    try {
      const raw = await env.PLANNING_KV.get(KV_KEY);
      return json(raw ? JSON.parse(raw) : {});
    } catch (err) {
      return text(`Erreur lecture: ${err.message}`, 500);
    }
  }

  if (path === '/api/data' && request.method === 'PUT') {
    try {
      const body = await request.text();
      JSON.parse(body); // validation
      await env.PLANNING_KV.put(KV_KEY, body);
      return text('OK');
    } catch (err) {
      return text(`Erreur écriture: ${err.message}`, 500);
    }
  }

  if (path === '/api/data' && request.method === 'DELETE') {
    try {
      await env.PLANNING_KV.delete(KV_KEY);
      return text('OK');
    } catch (err) {
      return text(`Erreur suppression: ${err.message}`, 500);
    }
  }

  if (path === '/api/freepbx' && request.method === 'GET') {
    try {
      const raw = await env.PLANNING_KV.get(FREEPBX_KV_KEY);
      return new Response(raw || '{}', {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return text(`Erreur lecture FreePBX: ${err.message}`, 500);
    }
  }

  if (path === '/api/freepbx' && request.method === 'PUT') {
    try {
      const body = await request.text();
      JSON.parse(body); // validation JSON
      await env.PLANNING_KV.put(FREEPBX_KV_KEY, body);
      return json({ ok: true });
    } catch (err) {
      return text(`Erreur écriture FreePBX: ${err.message}`, 500);
    }
  }

  return text('Not found', 404);
}
