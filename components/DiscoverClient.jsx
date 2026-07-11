'use client';
import { useEffect, useState } from 'react';
import LoadingLogo from '@/components/LoadingLogo';

export default function DiscoverClient() {
  const [servers, setServers] = useState(null);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]); // ids déjà tirés, pour éviter les répétitions immédiates

  useEffect(() => {
    fetch('/api/servers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setServers(data);
        pickRandom(data, []);
      })
      .catch(() => setError('network_error'));
  }, []);

  const pickRandom = (list, exclude) => {
    const pool = list.filter((s) => !exclude.includes(s.guildId));
    const source = pool.length > 0 ? pool : list; // si tout a été vu, on recommence
    if (source.length === 0) { setCurrent(null); return; }
    const pick = source[Math.floor(Math.random() * source.length)];
    setCurrent(pick);
  };

  const reroll = () => {
    if (!servers || servers.length === 0) return;
    const nextHistory = current ? [...history, current.guildId].slice(-Math.min(servers.length - 1, 20)) : history;
    setHistory(nextHistory);
    pickRandom(servers, nextHistory);
  };

  if (error) {
    return <div className="empty-state">Impossible de charger l'annuaire pour le moment.</div>;
  }

  if (!servers) {
    return <LoadingLogo label="Recherche d'un serveur au hasard…" />;
  }

  if (servers.length === 0) {
    return <div className="empty-state">Aucun serveur disponible pour le moment.</div>;
  }

  if (!current) return null;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
      <div className="server-card" style={{ cursor: 'default' }}>
        <div className="server-card-head">
          <div className="server-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
            {current.icon
              ? <img src={`https://cdn.discordapp.com/icons/${current.guildId}/${current.icon}.png`} alt="" />
              : current.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="server-name" style={{ fontSize: 18 }}>{current.name}</div>
            <div className="server-meta">{current.memberCount ?? '—'} membres · {current.presenceCount ?? '—'} en ligne</div>
          </div>
        </div>
        {current.description && <p className="server-desc">{current.description}</p>}
        {current.tags?.length > 0 && (
          <div className="server-tags">
            {current.tags.slice(0, 4).map((t) => <span className="tag-pill" key={t}>{t}</span>)}
          </div>
        )}
        <div className="server-footer">
          <span className="bump-badge"><span className="live-dot" /> {current.bumpCount} bumps</span>
          {current.inviteLink && (
            <a className="join-btn" href={current.inviteLink} target="_blank" rel="noopener noreferrer">Rejoindre</a>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <button className="filter-chip active" style={{ fontSize: 14, padding: '9px 20px' }} onClick={reroll}>
          🎲 Un autre serveur au hasard
        </button>
      </div>
    </div>
  );
}
