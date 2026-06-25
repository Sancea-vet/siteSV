/**
 * SanceaVet — API Cloudflare Pages Function
 * Auth déléguée à Cloudflare Access — aucune vérification de token ici.
 *
 * Routes :
 *   GET    /api/data         → charge toutes les données
 *   PUT    /api/data         → sauvegarde toutes les données
 *   DELETE /api/data         → efface toutes les données
 *   GET    /api/freepbx      → retourne le JSON de routing astreintes FreePBX
 *   PUT    /api/freepbx      → MERGE le mois publié dans le routing existant
 *                              (ne remplace plus, cumule les mois)
 *   DELETE /api/freepbx      → efface tout le routing FreePBX
 *   GET    /api/freepbx/day  → routing du jour courant uniquement (pour n8n)
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
      const body  = await request.text();
      const incoming = JSON.parse(body); // validation JSON

      if (!Array.isArray(incoming.routing)) {
        return text('Erreur : champ "routing" manquant ou invalide', 400);
      }

      // ── Lire l'existant dans le KV ─────────────────────────────
      const raw      = await env.PLANNING_KV.get(FREEPBX_KV_KEY);
      const existing = raw ? JSON.parse(raw) : { routing: [] };

      // ── Purger les dates trop anciennes (> 7 jours en arrière) ─
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = cutoff.toISOString().slice(0, 10); // YYYY-MM-DD

      // Dates du mois entrant → elles remplaceront les entrées existantes
      const incomingDates = new Set(incoming.routing.map(r => r.date));

      const kept = (existing.routing || []).filter(r =>
        r.date >= cutoffStr && !incomingDates.has(r.date)
      );

      // ── Merger et trier chronologiquement ───────────────────────
      const merged = [...kept, ...incoming.routing]
        .sort((a, b) => a.date.localeCompare(b.date));

      const payload = {
        generated : new Date().toISOString(),
        routing   : merged,
      };

      await env.PLANNING_KV.put(FREEPBX_KV_KEY, JSON.stringify(payload));

      return json({
        ok     : true,
        total  : merged.length,
        added  : incoming.routing.length,
        kept   : kept.length,
        purged : (existing.routing || []).length - kept.length - incomingDates.size,
      });
    } catch (err) {
      return text(`Erreur écriture FreePBX: ${err.message}`, 500);
    }
  }

  // ── DELETE /api/freepbx : reset complet du routing ─────────────
  if (path === '/api/freepbx' && request.method === 'DELETE') {
    try {
      await env.PLANNING_KV.delete(FREEPBX_KV_KEY);
      return text('OK');
    } catch (err) {
      return text(`Erreur suppression FreePBX: ${err.message}`, 500);
    }
  }

  // ── GET /api/freepbx/day : routing du jour en Europe/Paris ─────
  // Usage : n8n → GET /api/freepbx/day → { date, midi, soir }
  // Paramètre optionnel ?date=YYYY-MM-DD pour tester un jour précis
  if (path === '/api/freepbx/day' && request.method === 'GET') {
    try {
      const raw = await env.PLANNING_KV.get(FREEPBX_KV_KEY);
      if (!raw) return json({ date: null, midi: null, soir: null });

      const store = JSON.parse(raw);

      // Lire ?date=YYYY-MM-DD depuis la query string, sinon aujourd'hui Paris
      const qDate = new URL(request.url).searchParams.get('date');
      const today = qDate || new Intl.DateTimeFormat('fr-CA', {
        timeZone : 'Europe/Paris',
        year     : 'numeric',
        month    : '2-digit',
        day      : '2-digit',
      }).format(new Date());

      const entry = (store.routing || []).find(r => r.date === today) || null;

      return json(entry
        ? { date: entry.date, midi: entry.midi, soir: entry.soir }
        : { date: today, midi: null, soir: null }
      );
    } catch (err) {
      return text(`Erreur lecture FreePBX/day: ${err.message}`, 500);
    }
  }

  return text('Not found', 404);
}
