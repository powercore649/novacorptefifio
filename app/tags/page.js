export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { fetchServers } from '@/lib/bridge';
import { getTagStyle, CATEGORIES } from '@/lib/categories';
import { formatNumber } from '@/lib/utils';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const revalidate = 60;
export const metadata = { title: 'Tags & catégories — Bumpify Directory' };

export default async function TagsPage() {
  const servers = await fetchServers().catch(() => []);

  // Compte les occurrences de chaque tag réellement utilisé par les
  // serveurs, en incluant aussi les catégories curées à 0 pour garder une
  // structure de navigation stable même si personne ne les utilise encore.
  const counts = new Map(CATEGORIES.map((c) => [c, 0]));
  for (const s of servers) {
    for (const t of s.tags || []) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }

  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(1, ...entries.map(([, n]) => n));

  // Taille de police proportionnelle au nombre de serveurs (échelle simple,
  // plafonnée pour rester lisible même pour le tag le plus utilisé).
  const fontSizeFor = (n) => {
    const ratio = n / maxCount;
    return Math.round(13 + ratio * 22); // 13px → 35px
  };

  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/tags" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>🏷️ Tags & catégories</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Les tags les plus utilisés apparaissent en plus grand. Clique sur un tag pour voir tous les
          serveurs correspondants.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px', alignItems: 'center' }}>
          {entries.map(([tag, count]) => {
            const { emoji, color } = getTagStyle(tag);
            return (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                style={{
                  fontSize: fontSizeFor(count), fontWeight: count > maxCount * 0.5 ? 700 : 500,
                  color, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                  opacity: count === 0 ? 0.4 : 1,
                }}
                title={`${formatNumber(count)} serveur${count > 1 ? 's' : ''}`}
              >
                {emoji} {tag}
                <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 400 }}>
                  {formatNumber(count)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
