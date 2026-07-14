import Link from 'next/link';
import { getTagStyle } from '@/lib/categories';

// Pastille de tag "v2" : couleur + icône selon la catégorie, et cliquable
// vers la page dédiée /tag/[nom] par défaut. Utilisé partout où un tag est
// affiché en lecture seule (cartes, fiches serveur, comparateur…).
// Passer `link={false}` pour un usage purement informatif (pas de navigation).
export default function TagPill({ tag, link = true, active = false }) {
  const { emoji, color } = getTagStyle(tag);
  const style = active
    ? { background: color, borderColor: color, color: '#05050a' }
    : { borderColor: color, color };

  const content = <>{emoji} {tag}</>;

  if (!link) {
    return <span className="tag-pill" style={style}>{content}</span>;
  }

  return (
    <Link
      href={`/tag/${encodeURIComponent(tag)}`}
      className="tag-pill"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </Link>
  );
}
