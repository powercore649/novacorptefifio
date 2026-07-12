import { NextResponse } from 'next/server';
import { fetchServers } from '@/lib/bridge';
import { computeScore } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';

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

    // Répartition du réseau par catégorie curée (lib/categories.js), basée sur
    // les tags déclarés par chaque serveur. Additif : ne modifie aucun champ existant.
    const categoryBreakdown = CATEGORIES
      .map((category) => ({
        category,
        count: servers.filter((s) => (s.tags || []).includes(category)).length,
      }))
      .sort((a, b) => b.count - a.count);

    // Top 3 serveurs par nombre de bumps, pour un aperçu rapide sur la page
    // stats (le classement complet reste sur /leaderboard).
    const topByBumps = [...servers]
      .sort((a, b) => (b.bumpCount || 0) - (a.bumpCount || 0))
      .slice(0, 3)
      .map((s) => ({
        guildId: s.guildId,
        name: s.guildName,
        icon: s.guildIcon,
        bumpCount: s.bumpCount || 0,
      }));

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
      categoryBreakdown,
      topByBumps,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
