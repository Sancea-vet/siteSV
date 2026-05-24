import { GITHUB_OAUTH_CLIENT_ID } from './github-config.js';

export async function onRequest(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/\bcsrf-token=([a-z-]+?)_([0-9a-f]{32})\b/);
  const [, provider, csrfToken] = match || [];

  if (!code || !state) {
    return outputHTML({ provider: 'github', error: 'Code manquant', errorCode: 'AUTH_CODE_REQUEST_FAILED' });
  }
  if (!csrfToken || state !== csrfToken) {
    return outputHTML({ provider: 'github', error: 'CSRF détecté', errorCode: 'CSRF_DETECTED' });
  }
  if (!env.GITHUB_CLIENT_SECRET) {
    return outputHTML({ provider: 'github', error: 'Credentials manquants', errorCode: 'MISCONFIGURED_CLIENT' });
  }

  let response;
  try {
    response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
      }),
    });
  } catch {
    return outputHTML({ provider: 'github', error: 'Échec requête token', errorCode: 'TOKEN_REQUEST_FAILED' });
  }

  let token = '', error = '';
  try {
    const data = await response.json();
    token = data.access_token;
    error = data.error;
  } catch {
    return outputHTML({ provider: 'github', error: 'Réponse invalide', errorCode: 'MALFORMED_RESPONSE' });
  }

  return outputHTML({ provider: provider || 'github', token, error });
}

function outputHTML({ provider = 'github', token, error, errorCode }) {
  // Format attendu par Sveltia/Decap/Netlify CMS :
  // "authorization:github:success:{...}" ou "authorization:github:error:{...}"
  const status = error ? 'error' : 'success';
  const content = error
    ? JSON.stringify({ error, errorCode })
    : JSON.stringify({ token, provider });

  const message = `authorization:${provider}:${status}:${content}`;

  return new Response(
    `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Auth</title></head>
<body>
<script>
  window.opener.postMessage(${JSON.stringify(message)}, '*');
  window.close();
</script>
</body>
</html>`,
    {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Set-Cookie': 'csrf-token=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure',
      },
    }
  );
}