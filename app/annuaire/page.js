export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import DirectoryClient from '@/components/DirectoryClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Annuaire — Bumpify Directory' };

export default function AnnuairePage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/annuaire" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>🔍 Annuaire</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Recherchez, filtrez par catégorie et triez tous les serveurs du réseau Bumpify.
        </p>
      </div>

      {/* Suspense requis par Next.js : DirectoryClient lit le paramètre ?tag=
          de l'URL via useSearchParams (utilisé par les liens catégories de
          l'accueil). */}
      <Suspense fallback={null}>
        <DirectoryClient />
      </Suspense>

      <PublicFooter />
    </div>
  );
}
