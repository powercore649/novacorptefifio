const SUPPORT_DISCORD = 'https://discord.gg/ts5mh326ew';

const COLUMNS = [
  {
    title: 'Découvrir',
    links: [
      { href: '/', label: 'Accueil' },
      { href: '/annuaire', label: 'Annuaire' },
      { href: '/collections', label: 'Mes collections' },
      { href: '/leaderboard', label: 'Classement' },
      { href: '/trending', label: 'Tendances' },
      { href: '/new', label: 'Nouveaux serveurs' },
      { href: '/decouverte', label: 'Découverte au hasard' },
      { href: '/stats', label: 'Statistiques' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { href: '/templates', label: 'Templates de serveur' },
      { href: '/partenaires', label: 'Partenaires' },
      { href: '/faq', label: 'FAQ' },
      { href: '/changelog', label: 'Changelog' },
      { href: '/status', label: 'Statut des services' },
      { href: '/stats', label: 'Statistiques' },
    ],
  },
  {
    title: 'À propos',
    links: [
      { href: '/a-propos', label: 'Le projet' },
      { href: '/cgu', label: 'CGU' },
      { href: '/reglement', label: 'Règlement' },
      { href: SUPPORT_DISCORD, label: 'Support Discord ↗', external: true },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="footer-pub-v2">
      <div className="footer-pub-v2-grid">
        <div className="footer-pub-v2-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            <span className="brand-mark" style={{ width: 24, height: 24, fontSize: 12 }}>B</span>
            Bumpify Directory
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-faint)', maxWidth: 260 }}>
            L'annuaire des serveurs Discord propulsés par Bumpify — données réelles, mises à jour en direct.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="footer-pub-v2-title">{col.title}</div>
            {col.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noopener noreferrer' : undefined}
                className="footer-pub-v2-link"
              >
                {l.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="footer-pub-v2-bottom">
        <span>Bumpify Directory — alimenté par de vraies données du réseau Bumpify</span>
        <span className="mono">Bêta 2.1</span>
      </div>
    </footer>
  );
}
