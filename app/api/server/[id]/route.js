import { NextResponse } from 'next/server';
import { fetchServers } from '@/lib/bridge';
import { computeScore, isTrending, isNew } from '@/lib/utils';

export const revalidate = 30;

export async function GET(request, { params }) {
  try {
    const servers  = await fetchServers();
    const server   = servers.find(s => s.guildId === params.id);
    if (!server) return NextResponse.json({ error: 'Serveur introuvable' }, { status: 404 });

    const sorted = [...servers].sort((a, b) => computeScore(b) - computeScore(a));
    const rank   = sorted.findIndex(s => s.guildId === params.id) + 1;

    return NextResponse.json({
      ...server,
      rank,
      score:     computeScore(server),
      trending:  isTrending(server),
      isNew:     isNew(server),
    });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
