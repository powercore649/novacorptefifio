'use client';
import { useState } from 'react';
import ServerDescription from '@/components/ServerDescription';

function timeAgo(dateStr) {
  if (!dateStr) return 'jamais';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function ServerModal({ server, onClose }) {
  const [copied, setCopied] = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);

  if (!server) return null;

  const handleShare = async () => {
    const url = `${window.location.origin}/server/${server.guildId}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBadge = async () => {
    const origin = window.location.origin;
    const badgeMarkdown = `[![Bumpify](${origin}/api/badge/${server.guildId})](${origin}/server/${server.guildId})`;
    await navigator.clipboard.writeText(badgeMarkdown).catch(() => {});
    setBadgeCopied(true);
    setTimeout(() => setBadgeCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-head">
          <div className="server-avatar" style={{ width: 64, height: 64, borderRadius: 16 }}>
            {server.icon
              ? <img src={`https://cdn.discordapp.com/icons/${server.guildId}/${server.icon}.png`} alt="" />
              : server.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 22 }}>{server.name}</h2>
            <div className="server-meta">{server.memberCount ?? '—'} membres · {server.presenceCount ?? '—'} en ligne</div>
          </div>
        </div>

        {server.description && <div className="modal-desc"><ServerDescription text={server.description} compact /></div>}

        {server.tags?.length > 0 && (
          <div className="server-tags" style={{ marginBottom: 18 }}>
            {server.tags.map((t) => <span className="tag-pill" key={t}>{t}</span>)}
          </div>
        )}

        <div className="modal-stats-grid">
          <div className="modal-stat"><div className="modal-stat-num">{server.bumpCount}</div><div className="modal-stat-label">Bumps totaux</div></div>
          <div className="modal-stat"><div className="modal-stat-num">{server.weeklyBumps}</div><div className="modal-stat-label">Cette semaine</div></div>
          <div className="modal-stat"><div className="modal-stat-num">{server.monthlyBumps}</div><div className="modal-stat-label">Ce mois</div></div>
          <div className="modal-stat"><div className="modal-stat-num">{server.bumpStreak}</div><div className="modal-stat-label">Streak (jours)</div></div>
          <div className="modal-stat"><div className="modal-stat-num">{server.totalVotes}</div><div className="modal-stat-label">Votes reçus</div></div>
          <div className="modal-stat"><div className="modal-stat-num mono" style={{ fontSize: 15 }}>{timeAgo(server.lastBump)}</div><div className="modal-stat-label">Dernier bump</div></div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <button className={`share-btn ${copied ? 'copied' : ''}`} onClick={handleShare}>
            {copied ? '✅ Lien copié !' : '🔗 Partager'}
          </button>
          <button className={`share-btn ${badgeCopied ? 'copied' : ''}`} onClick={handleCopyBadge}>
            {badgeCopied ? '✅ Badge copié !' : '🏷️ Copier le badge'}
          </button>
        </div>

        <div className="modal-footer">
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            Langue : {server.language} {server.nsfw && '· NSFW'} {server.featured && '· ⭐ Mis en avant'}
          </span>
          {server.inviteLink && (
            <a className="join-btn" href={server.inviteLink} target="_blank" rel="noopener noreferrer">Rejoindre le serveur</a>
          )}
        </div>
      </div>
    </div>
  );
}
