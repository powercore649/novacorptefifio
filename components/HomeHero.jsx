'use client';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import { formatNumber } from '@/lib/utils';

function useCountUp(target, durationMs = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (typeof target !== 'number') return;
    startRef.current = null;
    let raf;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function StatCounter({ value, label, emoji }) {
  const animated = useCountUp(value ?? 0);
  return (
    <div className="stat-chip">
      <div className="stat-chip-num">{value == null ? '—' : formatNumber(animated)}</div>
      <div className="stat-chip-label">{emoji} {label}</div>
    </div>
  );
}

export default function HomeHero() {
  const [stats, setStats] = useState(null);
  const [topServers, setTopServers] = useState([]);

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {});
    fetch('/api/servers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopServers([...data].sort((a, b) => b.bumpCount - a.bumpCount).slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <header className="hero">
        <h1>Trouvez votre prochain <span>serveur Discord</span>.</h1>
        <p className="lead">
          L'annuaire des serveurs propulsés par Bumpify — données réelles, mises à jour en direct
          depuis le réseau de bump : membres, description, tags et nombre de bumps.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          <a href="/annuaire" className="filter-chip active" style={{ padding: '10px 22px', fontSize: 14.5 }}>
            🔍 Parcourir l'annuaire
          </a>
          <a href="/decouverte" className="filter-chip" style={{ padding: '10px 22px', fontSize: 14.5 }}>
            🎲 Découverte aléatoire
          </a>
          <a href="/leaderboard" className="filter-chip" style={{ padding: '10px 22px', fontSize: 14.5 }}>
            🏆 Classement
          </a>
          <a href="/stats" className="filter-chip" style={{ padding: '10px 22px', fontSize: 14.5 }}>
            📊 Statistiques
          </a>
        </div>
      </header>

      {/* Stats animées */}
      {stats && (
        <div className="stats-banner" style={{ marginBottom: 8 }}>
          <StatCounter value={stats.totalServers} label="Serveurs" emoji="🌐" />
          <StatCounter value={stats.totalMembers} label="Membres" emoji="👥" />
          <StatCounter value={stats.totalBumps} label="Bumps au total" emoji="🚀" />
          <StatCounter value={stats.weeklyBumps} label="Bumps cette semaine" emoji="📅" />
        </div>
      )}

      {/* Catégories rapides */}
      <div style={{ maxWidth: 1280, margin: '40px auto 0', padding: '0 6vw', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 10, textAlign: 'center' }}>
          Parcourir par catégorie
        </div>
        <div className="filters-bar" style={{ margin: 0 }}>
          {CATEGORIES.slice(0, 10).map((c) => (
            <a key={c} href={`/annuaire?tag=${encodeURIComponent(c)}`} className="filter-chip">{c}</a>
          ))}
        </div>
      </div>

      {/* Top 3 serveurs en vedette */}
      {topServers.length > 0 && (
        <div style={{ maxWidth: 1280, margin: '40px auto 0', padding: '0 6vw', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 14, textAlign: 'center' }}>
            🔥 En ce moment sur le réseau
          </div>
          <div className="directory-grid" style={{ padding: 0 }}>
            {topServers.map((s) => (
              <a
                key={s.guildId}
                href={`/server/${s.guildId}`}
                className="server-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="server-card-head">
                  <div className="server-avatar">
                    {s.icon
                      ? <img src={`https://cdn.discordapp.com/icons/${s.guildId}/${s.icon}.png`} alt="" />
                      : s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="server-name">{s.name}</div>
                    <div className="server-meta">{s.memberCount ?? '—'} membres</div>
                  </div>
                </div>
                <div className="server-footer">
                  <span className="bump-badge"><span className="live-dot" /> {s.bumpCount} bumps</span>
                </div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <a href="/annuaire" className="filter-chip" style={{ padding: '8px 18px', fontSize: 13.5 }}>
              Voir tout l'annuaire →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
