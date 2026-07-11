import { NextResponse } from 'next/server';
import { fetchServers } from '@/lib/bridge';

const API_URL = process.env.BRIDGE_URL || 'http://de-01.rrhosting.eu:7536';

export async function POST(request) {
  try {
    const { guildId } = await request.json();
    if (!guildId) return NextResponse.json({ error: 'guildId manquant' }, { status: 400 });

    // Forward au bot
    const res = await fetch(`${API_URL}/api/public/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guildId }),
    }).catch(() => null);

    if (!res || !res.ok) {
      // Si le bot n'est pas disponible, on accepte quand même côté client
      return NextResponse.json({ success: true, offline: true });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, offline: true });
  }
}
