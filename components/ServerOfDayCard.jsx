'use client';
import { useEffect, useState } from 'react';
import { formatNumber, stripMarkdown } from '@/lib/utils';

// Met en avant un serveur différent chaque jour (sélection déterministe et
// stable 24h, voir /api/server-of-day + lib/utils::pickServerOfDay). Visible
// par tous les visiteurs du site, connectés ou non — aucune dépendance au
// compte utilisateur.
export default function ServerOfDayCard() {
  const [server, setServer] = useState(undefined); // undefined = chargement, null = aucun

  useEffect(() => {
    fetch('/api/server-of-day', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setServer(d.server ?? null))
      .catch(() => setServer(null));
  }, []);

  if (server === undefined) {
    return <div className="server-of-day-card server-of-day-skeleton" />;
  }
  if (!server) return null; // pas de serveur éligible aujourd'hui (aucun serveur SFW avec description) — on masque simplement la section

  return (
    <div className="server-of-day-card">
      <div className="server-of-day-tag">⭐ Serveur du jour</div>
      <div className="server-of-day-body">
        <div className="server-avatar" style={{ width: 56, height: 56, fontSize: 20, flexShrink: 0 }}>
          {server.icon
            ? <img src={`https://cdn.discordapp.com/icons/${server.guildId}/${server.icon}.png`} alt="" />
            : server.name.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{server.name}</div>
          {server.description && (
            <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '4px 0 8px', lineHeight: 1.5 }}>
              {stripMarkdown(server.description).slice(0, 140)}
              {stripMarkdown(server.description).length > 140 ? '…' : ''}
            </p>
          )}
          {server.tags?.length > 0 && (
            <div className="server-tags" style={{ marginBottom: 4 }}>
              {server.tags.slice(0, 4).map((t) => <span className="tag-pill" key={t}>{t}</span>)}
            </div>
          )}
        </div>
        <div className="server-of-day-stats">
          <div className="stat-chip">
            <div className="stat-chip-num">{formatNumber(server.memberCount)}</div>
            <div className="stat-chip-label">Membres</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-num">{formatNumber(server.bumpCount)}</div>
            <div className="stat-chip-label">Bumps</div>
          </div>
        </div>
      </div>
      <div className="server-of-day-footer">
        <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
          Un serveur différent mis en avant chaque jour
        </span>
        <a className="join-btn" href={`/server/${server.guildId}`}>Découvrir →</a>
      </div>
    </div>
  );
}
