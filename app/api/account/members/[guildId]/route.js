import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, must-revalidate' };

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const { guildId } = params;
  const bridgeUrl = process.env.BRIDGE_URL;
  const dashboardSecret = process.env.DASHBOARD_API_SECRET;

  if (!bridgeUrl || !dashboardSecret) {
    console.error('❌ /api/account/members : BRIDGE_URL ou DASHBOARD_API_SECRET manquant.');
    return NextResponse.json({ error: 'server_config_missing' }, { status: 500, headers: NO_STORE_HEADERS });
  }

  try {
    // 1) Vérifier que l'utilisateur est RÉELLEMENT membre de ce serveur avant
    // de renvoyer quoi que ce soit — jamais de liste de membres pour un
    // serveur auquel l'utilisateur n'appartient pas.
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json({ error: 'missing_discord_scope' }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      cache: 'no-store',
    });
    if (!guildsRes.ok) {
      return NextResponse.json({ error: 'discord_guilds_fetch_failed' }, { status: 502, headers: NO_STORE_HEADERS });
    }
    const myGuilds = await guildsRes.json();
    const isMember = myGuilds.some((g) => g.id === guildId);
    if (!isMember) {
      return NextResponse.json({ error: 'not_a_member_of_this_guild' }, { status: 403, headers: NO_STORE_HEADERS });
    }

    // 2) Appel protégé au bridge, avec le secret partagé (jamais exposé au navigateur)
    const membersRes = await fetch(`${bridgeUrl}/api/guilds/${guildId}/members?limit=1000`, {
      headers: { Authorization: `Bearer ${dashboardSecret}` },
      cache: 'no-store',
    });
    const members = await membersRes.json();
    if (!membersRes.ok) {
      return NextResponse.json(members, { status: membersRes.status, headers: NO_STORE_HEADERS });
    }

    return NextResponse.json({ guildId, members }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error('❌ /api/account/members a échoué:', err);
    return NextResponse.json({
      error: err.message,
      cause: err.cause ? String(err.cause) : null,
    }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
