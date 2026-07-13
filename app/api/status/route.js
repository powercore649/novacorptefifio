import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, must-revalidate' };

// Interroge une URL avec un timeout et renvoie l'état + la latence mesurée.
// Utilisé pour vérifier en direct que le bridge Bumpify répond bien, sans
// dépendre du cache habituel de /api/servers (on veut la latence réelle).
async function checkEndpoint(url, options = {}, timeoutMs = 6000) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    return { ok: res.ok, httpStatus: res.status, latencyMs: Date.now() - start };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, httpStatus: null, latencyMs: Date.now() - start, error: err.name === 'AbortError' ? 'timeout' : 'network_error' };
  }
}

// Traduit l'indicateur Discord Status (statuspage.io) vers notre échelle
// commune operational / degraded / outage / unknown.
function mapDiscordIndicator(indicator) {
  switch (indicator) {
    case 'none': return 'operational';
    case 'minor': return 'degraded';
    case 'major':
    case 'critical': return 'outage';
    default: return 'unknown';
  }
}

// Interroge le résumé public de Discord Status (statuspage.io) et renvoie
// à la fois l'indicateur global et la latence mesurée, en un seul appel.
async function checkDiscordStatus(timeoutMs = 6000) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('https://discordstatus.com/api/v2/summary.json', { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    if (!res.ok) return { status: 'unknown', description: 'Statut indisponible', latencyMs };
    const data = await res.json();
    return {
      status: mapDiscordIndicator(data?.status?.indicator),
      description: data?.status?.description || 'Statut indisponible',
      latencyMs,
    };
  } catch (err) {
    clearTimeout(timer);
    return { status: 'unknown', description: 'Statut indisponible', latencyMs: Date.now() - start };
  }
}

export async function GET() {
  const bridgeUrl = process.env.BRIDGE_URL;
  const checkedAt = new Date().toISOString();

  // Les 2 vérifications tournent en parallèle pour ne pas cumuler les latences.
  const [bridgeCheck, discordCheck] = await Promise.allSettled([
    bridgeUrl
      ? checkEndpoint(`${bridgeUrl}/public/servers`, { headers: { Accept: 'application/json' } })
      : Promise.resolve({ ok: false, error: 'not_configured' }),
    checkDiscordStatus(),
  ]);

  const bridge = bridgeCheck.status === 'fulfilled' ? bridgeCheck.value : { ok: false, error: 'network_error' };
  const discord = discordCheck.status === 'fulfilled'
    ? discordCheck.value
    : { status: 'unknown', description: 'Statut indisponible', latencyMs: null };

  const services = [
    {
      key: 'bridge',
      name: 'Bridge Bumpify (réseau & bumps)',
      status: bridge.ok ? 'operational' : 'outage',
      latencyMs: bridge.latencyMs ?? null,
      detail: bridge.ok ? null : (bridge.error === 'not_configured' ? 'BRIDGE_URL non configuré' : "Le bridge ne répond pas"),
    },
    {
      key: 'directory',
      name: 'Annuaire Bumpify Directory (ce site)',
      status: bridge.ok ? 'operational' : 'degraded',
      latencyMs: null,
      detail: bridge.ok ? null : "Dépend du bridge, actuellement perturbé",
    },
    {
      key: 'discord',
      name: 'Discord (API officielle)',
      status: discord.status,
      latencyMs: discord.latencyMs,
      detail: discord.description,
    },
  ];

  const overall = services.some((s) => s.status === 'outage')
    ? 'outage'
    : services.some((s) => s.status === 'degraded' || s.status === 'unknown')
      ? 'degraded'
      : 'operational';

  return NextResponse.json({ overall, services, checkedAt }, { headers: NO_STORE_HEADERS });
}
