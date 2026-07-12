'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';

// Hero de la page d'accueil — inspiré des landing pages de bots Discord
// (pastille "vérifié", gros titre, CTA, bandeau de stats en direct) mais
// entièrement alimenté par les vraies données du réseau via /api/stats.
// Tout le style vit dans les classes hero-v2-* (voir app/globals.css),
// scopées pour ne jamais affecter .hero utilisé ailleurs sur le site.

export default function HomeHero() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const STATS_ROW = [
    { key: 'totalServers', label: 'Serveurs référencés' },
    { key: 'totalMembers', label: 'Membres représentés' },
    { key: 'totalBumps', label: 'Bumps effectués' },
    { key: 'weeklyBumps', label: 'Bumps cette semaine' },
  ];

  return (
    <div className="hero-v2">
      <div className="hero-v2-grid">
        <div>
          <span className="hero-eyebrow">
            <span style={{ color: 'var(--line)' }}>✓</span> Réseau Bumpify · données en direct
          </span>

          <h1>
            L'annuaire des serveurs Discord{' '}
            <span className="accent-word">qui bougent vraiment</span>
          </h1>

          <p className="lead">
            Parcourez, comparez et rejoignez des serveurs Discord actifs — classés par
            bumps, membres et activité réelle, mis à jour toutes les 15 secondes.
          </p>

          <div className="hero-v2-actions">
            <Link href="/annuaire" className="hero-cta-primary">
              🧭 Explorer l'annuaire
            </Link>
            <div className="hero-links-secondary">
              <Link href="/leaderboard" className="hero-link-secondary">🏆 Classement</Link>
              <Link href="/stats" className="hero-link-secondary">📊 Statistiques</Link>
              <Link href="/templates" className="hero-link-secondary">📄 Templates</Link>
            </div>
          </div>

          <div className="stat-strip">
            {STATS_ROW.map((s) => (
              <div className="stat-strip-item" key={s.key}>
                <div className="stat-strip-num">
                  {stats ? formatNumber(stats[s.key] ?? 0) : '—'}
                </div>
                <div className="stat-strip-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <svg className="hero-network" viewBox="0 0 440 380" xmlns="http://www.w3.org/2000/svg">
          <g stroke="var(--border)" strokeWidth="1.5" fill="none">
            <path d="M220 190 L90 100" />
            <path d="M220 190 L350 90" />
            <path d="M220 190 L70 280" />
            <path d="M220 190 L360 290" />
            <path d="M220 190 L220 40" />
            <path d="M90 100 L220 40" />
            <path d="M350 90 L220 40" />
            <path d="M70 280 L360 290" />
          </g>

          {/* Nœud central — représente le réseau lui-même */}
          <circle cx="220" cy="190" r="15" fill="var(--accent)" />

          {/* Nœuds satellites */}
          <circle cx="90" cy="100" r="9" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="350" cy="90" r="9" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="70" cy="280" r="9" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="360" cy="290" r="9" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="220" cy="40" r="9" fill="var(--surface-3)" stroke="var(--border)" strokeWidth="1.5" />

          {/* Deux nœuds "actifs" qui pulsent, pour symboliser un bump en cours */}
          <circle cx="350" cy="90" r="6" fill="var(--line)" />
          <circle className="node-pulse-ring" cx="350" cy="90" r="6" fill="none" stroke="var(--line)" strokeWidth="2" />

          <circle cx="70" cy="280" r="6" fill="var(--line)" />
          <circle className="node-pulse-ring delay" cx="70" cy="280" r="6" fill="none" stroke="var(--line)" strokeWidth="2" />
        </svg>
      </div>

      {stats?.topByBumps?.length > 0 && (
        <>
          <div className="section-label">🔥 En ce moment sur le réseau</div>
          <div className="directory-grid" style={{ padding: 0 }}>
            {stats.topByBumps.map((s) => (
              <Link
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
                  </div>
                </div>
                <div className="server-footer">
                  <span className="bump-badge"><span className="live-dot" /> {formatNumber(s.bumpCount)} bumps</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
