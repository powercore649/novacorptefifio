'use client';
import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/utils';

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
      </div>
    </main>
  );
}
