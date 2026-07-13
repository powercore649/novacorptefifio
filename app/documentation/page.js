export const dynamic = 'force-dynamic';
import { fetchServers } from '@/lib/bridge';
import { formatNumber } from '@/lib/utils';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import CodeBlock from '@/components/CodeBlock';
import { CATEGORIES } from '@/lib/categories';

export const revalidate = 60;
export const metadata = { title: 'Centre de documentation — Bumpify Directory' };

const SITE_URL = 'https://zyntra.dpdns.org';

export default async function DocumentationPage() {
  const servers = await fetchServers().catch(() => []);

  // Un vrai serveur du réseau sert d'exemple concret dans les extraits de
  // code ci-dessous (le plus actif, pour avoir des chiffres parlants) —
  // aucune donnée factice : ce qui est affiché est réellement en ligne.
  const sample = [...servers].sort((a, b) => (b.bumpCount || 0) - (a.bumpCount || 0))[0] || null;
  const totalServers = servers.length;
  const totalMembers = servers.reduce((a, s) => a + (s.memberCount || 0), 0);
  const totalBumps = servers.reduce((a, s) => a + (s.bumpCount || 0), 0);

  const sampleName = sample?.name || sample?.guildName || 'NomDuServeur';
  const sampleId = sample?.guildId || '000000000000000000';

  const serversExample = sample
    ? JSON.stringify(
        [{
          guildId: sample.guildId,
          name: sampleName,
          memberCount: sample.memberCount ?? 0,
          bumpCount: sample.bumpCount ?? 0,
          tags: (sample.tags || []).slice(0, 3),
          language: sample.language || 'fr',
          nsfw: !!sample.nsfw,
        }],
        null,
        2
      )
    : '[]';

  const statsExample = JSON.stringify(
    {
      totalServers,
      totalMembers,
      totalBumps,
      weeklyBumps: servers.reduce((a, s) => a + (s.weeklyBumps || 0), 0),
    },
    null,
    2
  );

  const badgeMarkdown = `[![Bumpify](${SITE_URL}/api/badge/${sampleId})](${SITE_URL}/server/${sampleId})`;
  const badgeHtml = `<img src="${SITE_URL}/api/badge/${sampleId}" alt="Badge Bumpify de ${sampleName}" />`;

  const ENDPOINTS = [
    {
      method: 'GET',
      path: '/api/servers',
      desc: `Liste tous les serveurs actuellement référencés (${formatNumber(totalServers)} en ce moment).`,
      example: serversExample,
    },
    {
      method: 'GET',
      path: '/api/stats',
      desc: 'Statistiques globales du réseau, recalculées toutes les 60 secondes.',
      example: statsExample,
    },
    {
      method: 'GET',
      path: `/api/badge/${sampleId}`,
      desc: `Badge SVG dynamique d'un serveur — s'intègre dans un README ou un site externe. Exemple avec ${sampleName}, le serveur le plus actif du réseau en ce moment.`,
      example: null,
    },
    {
      method: 'GET',
      path: '/api/status',
      desc: "Statut en temps réel du bridge Bumpify et de l'API Discord officielle.",
      example: null,
    },
    {
      method: 'GET',
      path: '/api/server-of-day',
      desc: 'Le serveur mis en avant du jour (sélection déterministe, stable 24h).',
      example: null,
    },
    {
      method: 'GET',
      path: '/api/reviews/{guildId}',
      desc: "Les avis publiés pour un serveur donné.",
      example: null,
    },
  ];

  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/documentation" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>📚 Centre de documentation</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Comment fonctionne le réseau Bumpify, et comment utiliser son API publique — avec de vrais
          exemples tirés des {formatNumber(totalServers)} serveurs actuellement référencés.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>🌐 Aperçu du réseau</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12 }}>
            <div className="stat-chip">
              <div className="stat-chip-num">{formatNumber(totalServers)}</div>
              <div className="stat-chip-label">Serveurs référencés</div>
            </div>
            <div className="stat-chip">
              <div className="stat-chip-num">{formatNumber(totalMembers)}</div>
              <div className="stat-chip-label">Membres représentés</div>
            </div>
            <div className="stat-chip">
              <div className="stat-chip-num">{formatNumber(totalBumps)}</div>
              <div className="stat-chip-label">Bumps effectués</div>
            </div>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-dim)', marginTop: 14, lineHeight: 1.65 }}>
            Bumpify Directory indexe des serveurs Discord classés par activité réelle (bumps, membres,
            votes). Chaque serveur peut appartenir à une ou plusieurs catégories :{' '}
            {CATEGORIES.join(', ')}.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>🔌 API publique</h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-dim)', marginBottom: 20, lineHeight: 1.65 }}>
            Ces routes sont accessibles publiquement en lecture seule (GET), sans clé d'API, et
            renvoient toujours des données réelles et à jour — jamais de valeurs statiques.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="doc-endpoint">
                <div className="doc-endpoint-head">
                  <span className="tag-pill" style={{ fontFamily: 'var(--font-mono), monospace' }}>{ep.method}</span>
                  <code className="mono" style={{ fontSize: 13.5 }}>{ep.path}</code>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '8px 0 12px' }}>{ep.desc}</p>
                {ep.example && <CodeBlock code={ep.example} language="json" />}
                {ep.path.startsWith('/api/badge/') && (
                  <>
                    <img
                      src={`/api/badge/${sampleId}`}
                      alt={`Badge Bumpify de ${sampleName}`}
                      height={20}
                      style={{ display: 'block', marginBottom: 10 }}
                    />
                    <CodeBlock code={badgeMarkdown} language="markdown" />
                    <div style={{ height: 8 }} />
                    <CodeBlock code={badgeHtml} language="html" />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>🔗 Aller plus loin</h2>
          <div className="filters-bar" style={{ margin: 0 }}>
            <a className="filter-chip" href="/status">🟢 Statut des services</a>
            <a className="filter-chip" href="/stats">📊 Statistiques</a>
            <a className="filter-chip" href="/faq">❓ FAQ</a>
            <a className="filter-chip" href="/changelog">🗒️ Changelog</a>
            <a className="filter-chip" href="/reglement">📜 Règlement</a>
          </div>
        </section>

      </div>

      <PublicFooter />
    </div>
  );
}
