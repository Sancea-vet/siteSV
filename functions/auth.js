import { GITHUB_OAUTH_CLIENT_ID } from './github-config.js';

export async function onRequest(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'github';

  if (!env.GITHUB_CLIENT_SECRET) {
    return new Response('Credentials manquants', { status: 500 });
  }

  const csrfToken = crypto.randomUUID().replaceAll('-', '');
  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CLIENT_ID,
    scope: 'repo,user',
    state: csrfToken,
  });

  return new Response('', {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      'Set-Cookie': `csrf-token=github_${csrfToken}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`,
    },
  });
}