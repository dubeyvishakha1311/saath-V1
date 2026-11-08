// Privileged credentials are supplied by the Supabase Edge runtime, never the app.
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return reply({ error: 'Authentication required' }, 401);
  try {
    const body = await request.json();
    if (body?.confirm !== 'DELETE') return reply({ error: 'Explicit confirmation required' }, 400);
    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anon || !service) return reply({ error: 'Service unavailable' }, 503);
    const identity = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: authorization, apikey: anon } });
    if (!identity.ok) return reply({ error: 'Authentication required' }, 401);
    const user = await identity.json();
    if (!user?.id || user.is_anonymous) return reply({ error: 'Account authentication required' }, 403);
    if (body.expected_user_id !== user.id) return reply({ error: 'Account identity changed; retry' }, 409);
    // Never accept a target user ID from the client. The FK cascades remove vaults.
    const result = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${service}`, apikey: service } });
    if (!result.ok) return reply({ error: 'Account deletion failed' }, 502);
    return reply({ deleted: true });
  } catch {
    // Do not log request bodies, authentication headers, provider responses or IDs.
    return reply({ error: 'Request could not be completed' }, 400);
  }
});
