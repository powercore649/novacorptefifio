// Catégories curées pour parcourir l'annuaire. Toujours affichées, même si
// aucun serveur ne les utilise encore — ça donne une structure de navigation
// stable, contrairement aux tags 100% dynamiques qui dépendent de ce que les
// propriétaires de serveur ont tapé.
export const CATEGORIES = [
  'Gaming',
  'Musique',
  'Art & Design',
  'Anime & Manga',
  'Technologie',
  'Éducation',
  'Communauté',
  'Rôleplay',
  'Cuisine',
  'Sport',
  'Crypto & Finance',
  'Bien-être',
  'Cinéma & Séries',
  'Autre',
];

// v2 des tags : une couleur et une icône par catégorie curée, pour que les
// pastilles de tag soient identifiables au premier coup d'œil plutôt que
// toutes grises. Les tags libres (non listés ici, tapés par les propriétaires
// de serveur) retombent sur un style neutre par défaut.
export const CATEGORY_STYLES = {
  'Gaming': { emoji: '🎮', color: '#ff2bd6' },
  'Musique': { emoji: '🎵', color: '#00fff2' },
  'Art & Design': { emoji: '🎨', color: '#ff9d00' },
  'Anime & Manga': { emoji: '⛩️', color: '#b026ff' },
  'Technologie': { emoji: '💻', color: '#2b6cff' },
  'Éducation': { emoji: '📚', color: '#39ff14' },
  'Communauté': { emoji: '🤝', color: '#00fff2' },
  'Rôleplay': { emoji: '🎭', color: '#ff2bd6' },
  'Cuisine': { emoji: '🍳', color: '#ff9d00' },
  'Sport': { emoji: '⚽', color: '#39ff14' },
  'Crypto & Finance': { emoji: '💰', color: '#ffe14d' },
  'Bien-être': { emoji: '🧘', color: '#00ffab' },
  'Cinéma & Séries': { emoji: '🎬', color: '#b026ff' },
  'Autre': { emoji: '🏷️', color: '#9a9a9a' },
};

const DEFAULT_TAG_STYLE = { emoji: '🏷️', color: '#9a9a9a' };

// Renvoie {emoji, color} pour un tag donné — utilisé par <TagPill> pour
// coloriser dynamiquement les pastilles sans dupliquer la logique partout.
export function getTagStyle(tag) {
  return CATEGORY_STYLES[tag] || DEFAULT_TAG_STYLE;
}
