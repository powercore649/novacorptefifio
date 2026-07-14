// lib/utils.js — Utilitaires partagés

export function timeAgo(dateStr) {
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

export function formatNumber(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// Score réseau (même formule que le bot)
export function computeScore(server) {
  const streakBonus   = Math.min((server.bumpStreak || 0) * 2, 100);
  const weeklyScore   = (server.weeklyBumps || 0) * 5;
  const voteScore     = (server.totalVotes || 0) * 3;
  const featuredBonus = server.featured ? 200 : 0;
  return weeklyScore + streakBonus + voteScore + featuredBonus;
}

// Taille du serveur
export function serverSize(memberCount) {
  if (!memberCount) return 'unknown';
  if (memberCount < 100)  return 'small';
  if (memberCount < 1000) return 'medium';
  if (memberCount < 10000)return 'large';
  return 'huge';
}

export const SIZE_LABELS = { small: '< 100', medium: '100–1k', large: '1k–10k', huge: '10k+', unknown: '?' };

// Préférence d'affichage de l'annuaire (grille/liste), sans compte
export const viewPref = {
  get: () => {
    if (typeof window === 'undefined') return 'grid';
    return localStorage.getItem('bumpify_view') || 'grid';
  },
  set: (v) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bumpify_view', v);
  },
};

// Visite guidée (onboarding) — affichée une seule fois au premier visiteur,
// rejouable à tout moment depuis le menu de personnalisation (SiteCustomizer).
export const onboarding = {
  seen: () => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('bumpify_onboarding_seen') === '1';
  },
  markSeen: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bumpify_onboarding_seen', '1');
  },
};

// Personnalisation de profil (façon "Modifier mon profil" de Discord), mais
// stockée uniquement en localStorage : le site n'a pas de base de données
// propre pour synchroniser ça entre appareils ou l'afficher à d'autres
// visiteurs. C'est donc purement cosmétique et local à ce navigateur.
const PROFILE_KEY = 'bumpify_profile_custom';
export const profileCustom = {
  get: () => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); } catch { return {}; }
  },
  set: (patch) => {
    if (typeof window === 'undefined') return {};
    const next = { ...profileCustom.get(), ...patch };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return next;
  },
  reset: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PROFILE_KEY);
  },
};

export const PROFILE_BANNER_COLORS = [
  { name: 'Magenta', value: 'linear-gradient(135deg, #ff2bd6, #b026ff)' },
  { name: 'Cyan', value: 'linear-gradient(135deg, #00fff2, #2b6cff)' },
  { name: 'Vert néon', value: 'linear-gradient(135deg, #39ff14, #00fff2)' },
  { name: 'Orange plasma', value: 'linear-gradient(135deg, #ff9d00, #ff2bd6)' },
  { name: 'Violet profond', value: 'linear-gradient(135deg, #7c2bff, #1c1a30)' },
];

// Préférences générales du site (accessibilité, comportement par défaut) —
// localStorage, appliquées au chargement par PrefsApplier (voir layout.js).
const PREFS_KEY = 'bumpify_prefs';
const PREFS_DEFAULTS = { reduceMotion: false, defaultHideNsfw: true, defaultSort: 'bumps', showProfileBar: true };
export const prefs = {
  get: () => {
    if (typeof window === 'undefined') return PREFS_DEFAULTS;
    try { return { ...PREFS_DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch { return PREFS_DEFAULTS; }
  },
  set: (patch) => {
    if (typeof window === 'undefined') return PREFS_DEFAULTS;
    const next = { ...prefs.get(), ...patch };
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    return next;
  },
};

// Trending : serveur qui a beaucoup de bumps cette semaine par rapport à son total
export function isTrending(server) {
  if (!server.weeklyBumps || !server.bumpCount) return false;
  const ratio = server.weeklyBumps / Math.max(server.bumpCount, 1);
  return server.weeklyBumps >= 5 && ratio > 0.3;
}

// Nouveau serveur (moins de 7 jours dans le réseau)
export function isNew(server) {
  if (!server.createdAt) return false;
  return Date.now() - new Date(server.createdAt).getTime() < 7 * 24 * 3600 * 1000;
}

// Enlève la syntaxe Markdown pour un aperçu texte brut compact (cartes,
// listes) — le rendu Markdown complet se fait via <ServerDescription/>
// uniquement sur la fiche détail / la modale, pas sur les petites cartes.
export function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' ')           // blocs de code
    .replace(/`([^`]+)`/g, '$1')               // code inline
    .replace(/^#{1,6}\s+/gm, '')                // titres
    .replace(/^>\s?/gm, '')                     // citations
    .replace(/(\*\*|__)(.*?)\1/g, '$2')          // gras
    .replace(/(\*|_)(.*?)\1/g, '$2')             // italique
    .replace(/~~(.*?)~~/g, '$1')                // barré
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1')         // images -> texte alt
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')          // liens -> texte du lien
    .replace(/^\s*[-*+]\s+/gm, '')               // listes à puces
    .replace(/^\s*\d+\.\s+/gm, '')               // listes numérotées
    .replace(/\n{2,}/g, ' ')                      // sauts de ligne multiples
    .replace(/\n/g, ' ')
    .trim();
}

// Serveur du jour — sélection déterministe basée sur la date (même serveur
// pour tout le monde toute la journée, change automatiquement le lendemain,
// sans base de données ni tâche planifiée).
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function pickServerOfDay(servers, seedDate = new Date()) {
  const eligible = (servers || []).filter((s) => !s.nsfw && s.description);
  if (eligible.length === 0) return null;
  const dayKey = seedDate.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const seed = hashString(dayKey);
  return eligible[seed % eligible.length];
}

// Collections de favoris nommées (localStorage, sans compte) — permet de
// regrouper des serveurs par thème (ex: "Mes serveurs gaming"), en plus des
// favoris simples déjà existants (favorites, ci-dessus), sans les remplacer.
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const collections = {
  getAll: () => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('bumpify_collections') || '[]'); } catch { return []; }
  },
  _save: (list) => localStorage.setItem('bumpify_collections', JSON.stringify(list)),
  create: (name) => {
    const list = collections.getAll();
    const col = { id: uid(), name: name.trim() || 'Sans nom', guildIds: [] };
    list.push(col);
    collections._save(list);
    return col;
  },
  rename: (id, name) => {
    const list = collections.getAll().map((c) => (c.id === id ? { ...c, name: name.trim() || c.name } : c));
    collections._save(list);
    return list;
  },
  remove: (id) => {
    const list = collections.getAll().filter((c) => c.id !== id);
    collections._save(list);
    return list;
  },
  // Ajoute/retire un serveur d'une collection donnée. Retourne la liste à jour.
  toggleServer: (id, guildId) => {
    const list = collections.getAll().map((c) => {
      if (c.id !== id) return c;
      const has = c.guildIds.includes(guildId);
      return { ...c, guildIds: has ? c.guildIds.filter((g) => g !== guildId) : [...c.guildIds, guildId] };
    });
    collections._save(list);
    return list;
  },
  clearAll: () => localStorage.removeItem('bumpify_collections'),
};

// Recherches avancées sauvegardées (localStorage, sans compte) — même
// pattern que `collections` ci-dessus, mais pour un jeu de filtres nommé
// (utilisé par /recherche-avancee).
export const savedSearches = {
  getAll: () => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('bumpify_saved_searches') || '[]'); } catch { return []; }
  },
  save: (name, filters) => {
    const list = savedSearches.getAll();
    const entry = { id: uid(), name: name.trim() || 'Recherche sans nom', filters, createdAt: Date.now() };
    list.unshift(entry);
    localStorage.setItem('bumpify_saved_searches', JSON.stringify(list.slice(0, 20))); // 20 max, pas de croissance infinie
    return list;
  },
  remove: (id) => {
    const list = savedSearches.getAll().filter((s) => s.id !== id);
    localStorage.setItem('bumpify_saved_searches', JSON.stringify(list));
    return list;
  },
  clearAll: () => localStorage.removeItem('bumpify_saved_searches'),
};

// Favoris localStorage
export const favorites = {
  get: () => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('bumpify_favs') || '[]'); } catch { return []; }
  },
  toggle: (guildId) => {
    const favs = favorites.get();
    const idx  = favs.indexOf(guildId);
    if (idx >= 0) favs.splice(idx, 1); else favs.push(guildId);
    localStorage.setItem('bumpify_favs', JSON.stringify(favs));
    return idx < 0; // true = ajouté
  },
  has: (guildId) => favorites.get().includes(guildId),
  clear: () => localStorage.removeItem('bumpify_favs'),
};

// Historique de recherche
export const searchHistory = {
  get: () => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('bumpify_search_history') || '[]'); } catch { return []; }
  },
  add: (q) => {
    if (!q?.trim()) return;
    const hist = searchHistory.get().filter(h => h !== q).slice(0, 7);
    hist.unshift(q);
    localStorage.setItem('bumpify_search_history', JSON.stringify(hist));
  },
  clear: () => localStorage.removeItem('bumpify_search_history'),
};

// Comparateur de serveurs (localStorage, sans compte)
// Permet de sélectionner jusqu'à MAX_COMPARE serveurs pour les comparer
// côte à côte dans une modale dédiée (voir components/CompareModal.jsx).
export const MAX_COMPARE = 3;

export const compareList = {
  get: () => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('bumpify_compare') || '[]'); } catch { return []; }
  },
  has: (guildId) => compareList.get().includes(guildId),
  // Retourne { added: bool, list, full? } — added=false si déjà plein et guildId absent
  toggle: (guildId) => {
    const list = compareList.get();
    const idx = list.indexOf(guildId);
    if (idx >= 0) {
      list.splice(idx, 1);
      localStorage.setItem('bumpify_compare', JSON.stringify(list));
      return { added: false, list };
    }
    if (list.length >= MAX_COMPARE) {
      return { added: false, list, full: true };
    }
    list.push(guildId);
    localStorage.setItem('bumpify_compare', JSON.stringify(list));
    return { added: true, list };
  },
  clear: () => {
    localStorage.removeItem('bumpify_compare');
    return [];
  },
};

// Votes (cookie-based, sans compte)
export const votes = {
  get: () => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('bumpify_votes') || '[]'); } catch { return []; }
  },
  hasVoted: (guildId) => votes.get().includes(guildId),
  vote: (guildId) => {
    const v = votes.get();
    if (v.includes(guildId)) return false;
    v.push(guildId);
    localStorage.setItem('bumpify_votes', JSON.stringify(v));
    return true;
  },
};
