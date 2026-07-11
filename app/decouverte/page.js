import DiscoverClient from '@/components/DiscoverClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Découverte aléatoire — Bumpify Directory' };

export default function DiscoverPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/decouverte" />
      <header className="hero" style={{ paddingBottom: '2vh' }}>
        <h1>🎲 Un <span>serveur au hasard</span>.</h1>
        <p className="lead">
          Pas envie de chercher ? On te propose un serveur du réseau au hasard à chaque clic.
        </p>
      </header>
      <DiscoverClient />
      <PublicFooter />
    </div>
  );
}
