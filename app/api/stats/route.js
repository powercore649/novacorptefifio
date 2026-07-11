import { NextResponse } from 'next/server';
import { fetchServers } from '@/lib/bridge';
import { computeScore } from '@/lib/utils';

export const revalidate = 60;

export async function GET() {
  try {
    const servers = await fetchServers();
    const active  = servers.filter(s => s.bumpCount > 0);

    const totalMembers  = servers.reduce((a, s) => a + (s.memberCount || 0), 0);
    const totalBumps    = servers.reduce((a, s) => a + (s.bumpCount   || 0), 0);
    const totalVotes    = servers.reduce((a, s) => a + (s.totalVotes  || 0), 0);
    const weeklyBumps   = servers.reduce((a, s) => a + (s.weeklyBumps || 0), 0);
    const featured      = servers.filter(s => s.featured).length;
    const avgStreak     = active.length > 0
      ? Math.round(active.reduce((a, s) => a + (s.bumpStreak || 0), 0) / active.length)
      : 0;

    const topServer = [...servers]
      .sort((a, b) => computeScore(b) - computeScore(a))[0];

    return NextResponse.json({
      totalServers:  servers.length,
      activeServers: active.length,
      totalMembers,
      totalBumps,
      totalVotes,
      weeklyBumps,
      featured,
      avgStreak,
      topServer: topServer ? { name: topServer.guildName, guildId: topServer.guildId, icon: topServer.guildIcon } : null,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
