// Affichage compact et en lecture seule d'une note moyenne, utilisé sur
// toutes les cartes/lignes serveur du site.
export default function RatingBadge({ averageRating, reviewCount, size = 12 }) {
  if (!averageRating || !reviewCount) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: size, color: 'var(--text-dim)' }}>
      <span style={{ color: '#fbbf24' }}>★</span>
      {averageRating}
      <span style={{ color: 'var(--text-faint)' }}>({reviewCount})</span>
    </span>
  );
}
