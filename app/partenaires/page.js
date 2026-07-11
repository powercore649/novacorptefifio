import { fetchServers } from '@/lib/bridge';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const revalidate = 60;
export const metadata = { title: 'Partenaires — Bumpify Directory' };

export default async function PartenairesPage() {
  const servers = await fetchServers().catch(() => []);
  let featured = servers.filter((s) => s.featured);
  let usingFallback = false;
  if (featured.length === 0) {
    // Repli : pas de serveur "mis en avant" pour le moment -> on montre les
    // plus actifs plutôt qu'une page vide.
    featured = [...servers].sort((a, b) => b.bumpCount - a.bumpCount).slice(0, 6);
    usingFallback = true;
  }

  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/partenaires" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>🤝 Partenaires</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          {usingFallback
            ? 'Aucun serveur mis en avant pour le moment — voici les plus actifs du réseau.'
            : 'Serveurs mis en avant par l\'équipe Bumpify.'}
        </p>
      </div>

      <div className="directory-grid">
        {featured.length === 0 && <div className="empty-state">Aucun serveur disponible pour le moment.</div>}
        {featured.map((s) => (
          <a key={s.guildId} href={`/server/${s.guildId}`} className="server-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="server-card-head">
              <div className="server-avatar">
                {s.icon
                  ? <img src={`https://cdn.discordapp.com/icons/${s.guildId}/${s.icon}.png`} alt="" />
                  : s.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="server-name">{s.name}</div>
                <div className="server-meta">{s.memberCount ?? '—'} membres · {s.presenceCount ?? '—'} en ligne</div>
              </div>
              {s.featured && <span className="featured-badge" style={{ marginLeft: 'auto' }}>⭐ Partenaire</span>}
            </div>
            {s.tags?.length > 0 && (
              <div className="server-tags">
                {s.tags.slice(0, 4).map((t) => <span className="tag-pill" key={t}>{t}</span>)}
              </div>
            )}
            <div className="server-footer">
              <span className="bump-badge"><span className="live-dot" /> {s.bumpCount} bumps</span>
            </div>
          </a>
        ))}
      </div>

      <div style={{ maxWidth: 780, margin: '40px auto 0', padding: '0 6vw 6vh', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 12 }}>
          Envie de voir ton serveur mis en avant ici ?
        </p>
        <a href="/faq" className="filter-chip">En savoir plus dans la FAQ</a>
      </div>

      <PublicFooter />
    </div>
  );
}
