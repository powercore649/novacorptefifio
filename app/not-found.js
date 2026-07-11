import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Page introuvable — Bumpify Directory' };

export default function NotFound() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="__404__" />

      <header className="hero" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🧭</div>
        <h1>404 — <span>Serveur introuvable.</span></h1>
        <p className="lead">
          Cette page n'existe pas, ou le serveur que tu cherches n'est plus référencé dans l'annuaire.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <Link href="/" className="filter-chip active">← Retour à l'annuaire</Link>
          <Link href="/leaderboard" className="filter-chip">Voir le classement</Link>
        </div>
      </header>

      <PublicFooter />
    </div>
  );
}
