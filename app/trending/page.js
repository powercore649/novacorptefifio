export const dynamic = 'force-dynamic';
import { fetchServers } from '@/lib/bridge';
import { computeScore, isTrending } from '@/lib/utils';
import DirectoryClient from '@/components/DirectoryClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const revalidate = 60;
export const metadata = { title: 'Tendances — Bumpify Directory' };

export default async function TrendingPage() {
  const servers  = await fetchServers().catch(() => []);
  const trending = servers
    .filter(isTrending)
    .map(s => ({ ...s, score: computeScore(s), trending: true }))
    .sort((a, b) => b.score - a.score);

  return (
    <>
      <div className="hex-field" />
      <PublicNav current="/trending" />
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'4vh 6vw 2vh', position:'relative', zIndex:1 }}>
        <h1 style={{ fontSize:26, fontWeight:700, marginBottom:6 }}>🔥 Tendances</h1>
        <p style={{ color:'var(--text-dim)', fontSize:14 }}>Serveurs avec la plus forte croissance cette semaine.</p>
      </div>
      <DirectoryClient initialServers={trending} hideBanner />
      <PublicFooter />
    </>
  );
}
