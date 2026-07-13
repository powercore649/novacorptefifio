export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import AdvancedDirectoryClient from '@/components/AdvancedDirectoryClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Recherche avancée — Bumpify Directory' };

export default function RechercheAvanceePage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/recherche-avancee" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>🔬 Recherche avancée</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Combine plusieurs catégories, une plage précise de membres et de bumps, une langue —
          et sauvegarde ou partage ta recherche.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
        <Suspense fallback={null}>
          <AdvancedDirectoryClient />
        </Suspense>
      </div>

      <PublicFooter />
    </div>
  );
}
