import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';

// Indispensable : cette route dépend de la session (cookies) et fait un
// fetch no-store vers le bridge — jamais de pré-génération statique.
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, must-revalidate' };

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const bridgeUrl = process.env.BRIDGE_URL;
  if (!bridgeUrl) {
    console.error('❌ /api/account : BRIDGE_URL manquant.');
    return NextResponse.json({ error: 'BRIDGE_URL manquant côté serveur' }, { status: 500, headers: NO_STORE_HEADERS });
  }

  try {
    // 1) Stats Bumpify (bumps, coins, XP...) pour cet utilisateur
    const res = await fetch(`${bridgeUrl}/public/user/${session.user.discordId}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'bridge_error');

    const bumpifyGuildIds = new Set((data.guilds || []).map((g) => g.guildId));

    // 2) Vraie liste des serveurs Discord de l'utilisateur (nécessite le
    // scope OAuth "guilds"). Le token d'accès reste côté serveur — on le lit
    // depuis le JWT, jamais depuis la session envoyée au navigateur.
    let discordGuilds = [];
    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (token?.accessToken) {
        const gRes = await fetch('https://discord.com/api/users/@me/guilds', {
          headers: { Authorization: `Bearer ${token.accessToken}` },
          cache: 'no-store',
        });
        if (gRes.ok) {
          const raw = await gRes.json();
          discordGuilds = raw.map((g) => ({
            guildId: g.id,
            name: g.name,
            icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
            owner: !!g.owner,
            onBumpify: bumpifyGuildIds.has(g.id),
          })).sort((a, b) => (b.onBumpify - a.onBumpify) || a.name.localeCompare(b.name));
        } else {
          console.error('❌ /api/account : /users/@me/guilds a répondu', gRes.status);
        }
      }
    } catch (err) {
      console.error('❌ /api/account : échec de récupération des serveurs Discord:', err);
      // On continue quand même : les stats Bumpify restent affichables sans la liste complète.
    }

    return NextResponse.json({ ...data, discordGuilds }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error('❌ /api/account a échoué. BRIDGE_URL =', bridgeUrl);
    console.error(err);
    return NextResponse.json({
      error: err.message,
      cause: err.cause ? String(err.cause) : null,
    }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
