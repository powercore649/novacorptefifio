import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Changelog — Bumpify Directory' };

const ENTRIES = [
  {
    version: 'Bêta 2.7',
    items: [
      'Serveur du jour sur la page d\'accueil : une mise en avant différente chaque jour, visible par tous les visiteurs',
      'Nouveaux paramètres : tri et vue par défaut de l\'annuaire, visibilité de la barre de profil',
      'Nouvelle section "Données locales" pour gérer/effacer favoris, historique et recherches sauvegardées',
    ],
  },
  {
    version: 'Bêta 2.6',
    items: [
      'Visite guidée (onboarding) au premier passage sur le site, rejouable à tout moment',
      'Page de compte entièrement repensée façon "Paramètres Discord" (sidebar + panneaux)',
      'Personnalisation de profil : pseudo, statut, pronoms, bio et couleur de bannière (stockés localement)',
      'Nouvelles préférences : réduction des animations (accessibilité) et masquage NSFW par défaut',
      'Pseudo personnalisé désormais visible et bien mis en avant dans la barre de navigation',
    ],
  },
  {
    version: 'Bêta 2.5',
    items: [
      'Nouveau thème visuel néon/cyberpunk sur l\'ensemble du site',
      'Flux d\'activité en direct : bumps et croissances de membres en temps réel',
      'Centre de documentation avec API publique et exemples basés sur de vraies données',
      'Page de statut des services, avec vérification en direct du bridge et de l\'API Discord',
    ],
  },
  {
    version: 'Bêta 2.4',
    items: [
      'Comparateur de serveurs côte à côte (jusqu\'à 3 à la fois)',
      'Pagination de l\'annuaire',
      'Recherche avancée : catégories multiples, plage de membres/bumps, recherches sauvegardées et liens partageables',
      'Partage rapide et badge embarquable directement depuis l\'aperçu d\'un serveur',
      'Refonte de la page d\'accueil, alimentée par les statistiques en direct du réseau',
    ],
  },
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

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '4vh 6vw 8vh', position: 'relative', zIndex: 1 }}>
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
