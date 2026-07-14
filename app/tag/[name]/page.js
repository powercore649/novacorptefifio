export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { fetchServers } from '@/lib/bridge';
import { formatNumber, stripMarkdown } from '@/lib/utils';
import { getTagStyle } from '@/lib/categories';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import TagPill from '@/components/TagPill';

export const revalidate = 30;

const SITE_URL = 'https://zyntra.dpdns.org';

export async function generateMetadata({ params }) {
  const tag = decodeURIComponent(params.name);
  return {
    title: `${tag} — Serveurs Discord — Bumpify Directory`,
    description: `Tous les serveurs Discord du réseau Bumpify dans la catégorie "${tag}", classés par activité réelle.`,
    openGraph: {
      title: `${tag} — Bumpify Directory`,
      description: `Serveurs Discord actifs dans la catégorie "${tag}".`,
      url: `${SITE_URL}/tag/${params.name}`,
    },
  };
}

export default async function TagPage({ params }) {
  const tag = decodeURIComponent(params.name);
  const servers = await fetchServers().catch(() => []);
  const matching = servers
    .filter((s) => (s.tags || []).includes(tag))
    .sort((a, b) => (b.bumpCount || 0) - (a.bumpCount || 0));

  const { emoji, color } = getTagStyle(tag);

  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/tags" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/tags" style={{ fontSize: 12.5, color: 'var(--text-faint)', textDecoration: 'none' }}>
            ← Tous les tags
          </Link>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color }}>{emoji}</span> {tag}
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          {formatNumber(matching.length)} serveur{matching.length > 1 ? 's' : ''} dans cette catégorie, classé{matching.length > 1 ? 's' : ''} par activité.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
        {matching.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            Aucun serveur ne porte encore ce tag pour l'instant.
          </div>
        )}

        {matching.length > 0 && (
          <div className="directory-grid" style={{ padding: 0 }}>
            {matching.map((s) => (
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
                    <div className="server-meta">{formatNumber(s.memberCount)} membres</div>
                  </div>
                </div>
                {s.description && <p className="server-desc">{stripMarkdown(s.description)}</p>}
                {s.tags?.length > 0 && (
                  <div className="server-tags">
                    {s.tags.slice(0, 4).map((t) => <TagPill tag={t} link={false} key={t} />)}
                  </div>
                )}
                <div className="server-footer">
                  <span className="bump-badge"><span className="live-dot" /> {formatNumber(s.bumpCount)} bumps</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  );
}
