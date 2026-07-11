import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, must-revalidate' };

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const bridgeUrl = process.env.BRIDGE_URL;
  if (!bridgeUrl) {
    return NextResponse.json({ error: 'BRIDGE_URL manquant côté serveur' }, { status: 500, headers: NO_STORE_HEADERS });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  try {
    const res = await fetch(`${bridgeUrl}/api/public/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guildId: body.guildId,
        userId: session.user.discordId, // jamais fourni par le client
        username: session.user.name || '',
        avatar: session.user.image || null,
        rating: body.rating,
        comment: body.comment || '',
      }),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error('❌ /api/review a échoué:', err);
    return NextResponse.json({ error: err.message, cause: err.cause ? String(err.cause) : null }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
