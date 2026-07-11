export const dynamic = 'force-dynamic';
import { fetchServers } from '@/lib/bridge';
import { computeScore, isNew } from '@/lib/utils';
import DirectoryClient from '@/components/DirectoryClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const revalidate = 60;
export const metadata = { title: 'Nouveaux serveurs — Bumpify Directory' };

export default async function NewPage() {
  const servers  = await fetchServers().catch(() => []);
  const newSrvs  = servers
    .filter(isNew)
    .map(s => ({ ...s, score: computeScore(s), isNew: true }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <div className="hex-field" />
      <PublicNav current="/new" />
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'4vh 6vw 2vh', position:'relative', zIndex:1 }}>
        <h1 style={{ fontSize:26, fontWeight:700, marginBottom:6 }}>✨ Nouveaux serveurs</h1>
        <p style={{ color:'var(--text-dim)', fontSize:14 }}>Serveurs ajoutés au réseau ces 7 derniers jours.</p>
      </div>
      <DirectoryClient initialServers={newSrvs} hideBanner />
      <PublicFooter />
    </>
  );
}
