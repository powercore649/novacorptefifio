import ActivityFeedClient from '@/components/ActivityFeedClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Activité en direct — Bumpify Directory' };

export default function ActivitePage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/activite" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>📡 Activité en direct</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Chaque ligne ci-dessous est un vrai événement détecté sur le réseau — aucune simulation.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
        <ActivityFeedClient />
      </div>

      <PublicFooter />
    </div>
  );
}
