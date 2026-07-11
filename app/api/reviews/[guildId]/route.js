import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, must-revalidate' };

export async function GET(request, { params }) {
  const bridgeUrl = process.env.BRIDGE_URL;
  if (!bridgeUrl) {
    return NextResponse.json({ error: 'BRIDGE_URL manquant côté serveur' }, { status: 500, headers: NO_STORE_HEADERS });
  }

  try {
    const res = await fetch(`${bridgeUrl}/public/reviews/${params.guildId}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status, headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error('❌ /api/reviews a échoué:', err);
    return NextResponse.json({ error: err.message, cause: err.cause ? String(err.cause) : null }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
