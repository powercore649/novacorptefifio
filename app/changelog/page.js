import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Changelog — Bumpify Directory' };

const ENTRIES = [
  {
    version: 'Bêta 2.3',
    items: [
      'Navigation regroupée en menus déroulants (Découvrir / Ressources)',
      'Nouveau footer multi-colonnes',
      'Pages À propos, Changelog et Partenaires',
      'Descriptions de serveur en Markdown (gras, listes, liens, citations…)',
      'Section "Serveurs similaires" sur chaque fiche, basée sur les tags en commun',
      'Partage direct vers X (Twitter)',
    ],
  },
  {
    version: 'Bêta 2.2',
    items: [
      'Système d\'avis et de notes (1 à 5 étoiles) sur chaque serveur',
      'Bouton de signalement, avec notification en direct sur Discord',
      'Note moyenne visible sur toutes les cartes serveur du site',
      'Badge embarquable (image en direct pour README/site externe)',
    ],
  },
  {
    version: 'Bêta 2.1',
    items: [
      'Connexion avec Discord (compte, avatar, bannière de profil)',
      'Gestionnaire de compte : bumps, coins, XP, réputation, badges par serveur',
      'Liste des vrais serveurs Discord de l\'utilisateur connecté',
      'Page 404 personnalisée, favoris, historique de recherche',
      'Catégories de navigation, menu hamburger mobile',
      'Référencement Google (sitemap, robots.txt, Open Graph)',
    ],
  },
  {
    version: 'Bêta 2.0',
    items: [
      'Lancement de l\'annuaire public : recherche, filtres, tags',
      'Classement, tendances, nouveaux serveurs',
      'Statistiques globales du réseau',
      'Templates de serveur',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/changelog" />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4vh 6vw 8vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>📜 Changelog</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 32 }}>
          Tout ce qui a changé sur Bumpify Directory, dans l'ordre.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {ENTRIES.map((entry) => (
            <div key={entry.version} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span className="filter-chip active" style={{ cursor: 'default' }}>{entry.version}</span>
              </div>
              <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.8 }}>
                {entry.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
