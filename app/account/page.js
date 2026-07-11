import AccountClient from '@/components/AccountClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Mon compte — Bumpify Directory' };

export default function AccountPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/account" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>👤 Mon compte</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Tes statistiques réelles sur chaque serveur du réseau Bumpify, synchronisées automatiquement.
        </p>
      </div>
      <AccountClient />
      <PublicFooter />
    </div>
  );
}
