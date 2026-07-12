'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/lib/utils';

const MEDALS = ['🥇', '🥈', '🥉'];

const STAT_ITEMS = [
  { key:'totalServers',  label:'Serveurs dans le réseau', emoji:'🌐' },
  { key:'activeServers', label:'Serveurs actifs',          emoji:'🟢' },
  { key:'totalMembers',  label:'Membres représentés',      emoji:'👥' },
  { key:'totalBumps',    label:'Bumps au total',           emoji:'🚀' },
  { key:'weeklyBumps',   label:'Bumps cette semaine',      emoji:'📅' },
  { key:'totalVotes',    label:'Votes enregistrés',        emoji:'👍' },
  { key:'featured',      label:'Serveurs mis en avant',    emoji:'⭐' },
  { key:'avgStreak',     label:'Streak moyen (jours)',     emoji:'🔥' },
];

export default function StatsClient() {
  const router = useRouter();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'4vh 6vw 2vh', position:'relative', zIndex:1 }}>
        <h1 style={{ fontSize:26, fontWeight:700, marginBottom:6 }}>📊 Statistiques globales</h1>
        <p style={{ color:'var(--text-dim)', fontSize:14 }}>Vue d'ensemble du réseau Bumpify en temps réel.</p>
      </div>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 6vw 8vh', position:'relative', zIndex:1 }}>
        {stats?.topServer && (
          <div style={{ background:'var(--surface)', border:'1px solid var(--accent)', borderRadius:'var(--radius)', padding:'18px 24px', marginBottom:24, display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:28 }}>🏆</span>
            <div>
              <div style={{ fontSize:12, color:'var(--text-faint)', marginBottom:3 }}>Serveur #1 du réseau</div>
              <div style={{ fontWeight:700, fontSize:17 }}>{stats.topServer.name}</div>
            </div>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:12 }}>
          {STAT_ITEMS.map(s => (
            <div key={s.key} className="stat-chip">
              <div style={{ fontSize:22 }}>{s.emoji}</div>
              <div className="stat-chip-num">
                {loading ? '—' : formatNumber(stats?.[s.key] ?? 0)}
              </div>
              <div className="stat-chip-label">{s.label}</div>
            </div>
          ))}
        </div>

        {!loading && stats?.topByBumps?.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>🚀 Top 3 par bumps</h2>
              <button className="filter-chip" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => router.push('/leaderboard')}>
                Voir le classement complet →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.topByBumps.map((s, i) => (
                <div
                  key={s.guildId}
                  className="server-row"
                  onClick={() => router.push(`/server/${s.guildId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`lb-rank ${i === 0 ? 'lb-rank-1' : i === 1 ? 'lb-rank-2' : 'lb-rank-3'}`}>
                    {MEDALS[i]}
                  </div>
                  <div className="server-row-info">
                    <div className="server-row-name">{s.name}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                    {formatNumber(s.bumpCount)} bumps
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && stats?.categoryBreakdown?.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>🗂️ Répartition par catégorie</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(() => {
                const max = Math.max(1, ...stats.categoryBreakdown.map((c) => c.count));
                return stats.categoryBreakdown.map((c) => (
                  <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 130, fontSize: 13, color: 'var(--text-dim)', flexShrink: 0 }}>{c.category}</div>
                    <div className="streak-bar" style={{ flex: 1, height: 10 }}>
                      <div
                        style={{
                          width: `${(c.count / max) * 100}%`,
                          height: '100%',
                          background: 'var(--accent)',
                          borderRadius: 999,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <div style={{ width: 32, fontSize: 13, color: 'var(--text-faint)', textAlign: 'right', flexShrink: 0 }}>
                      {c.count}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
