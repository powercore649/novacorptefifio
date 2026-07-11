'use client';
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
  if (!server) return null;

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
