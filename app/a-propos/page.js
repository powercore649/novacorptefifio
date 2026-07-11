import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'À propos — Bumpify Directory' };

export default function AProposPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/a-propos" />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4vh 6vw 8vh', position: 'relative', zIndex: 1, lineHeight: 1.7, fontSize: 14.5, color: 'var(--text-dim)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>À propos de Bumpify Directory</h1>
        <p style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 32 }}>Le projet, en quelques mots.</p>

        <h2 style={h2}>Le projet</h2>
        <p style={p}>
          Bumpify Directory est l'annuaire officiel du réseau Bumpify : un système de bump communautaire qui
          permet à des serveurs Discord de se faire connaître les uns les autres. Chaque donnée affichée sur
          ce site — membres, bumps, classement, avis — provient directement de la base du bot, en temps réel.
          Rien n'est simulé ou mis en cache indéfiniment.
        </p>

        <h2 style={h2}>Comment ça marche</h2>
        <p style={p}>
          Les serveurs qui installent le bot Bumpify peuvent être bumpés toutes les 2 heures par leurs membres.
          Chaque bump diffuse le serveur dans les salons "feed" de tout le réseau, et fait progresser son score
          (bumps de la semaine, streak, votes reçus). Ce site vient s'ajouter au bot : il donne une vitrine web
          consultable par n'importe qui, avec recherche, catégories, favoris, avis et un espace compte connecté
          à Discord pour suivre ses propres statistiques.
        </p>

        <h2 style={h2}>Une question, un problème ?</h2>
        <p style={p}>
          Le plus rapide est de passer par notre serveur de support — lien en bas de chaque page. On y répond
          aux questions techniques, aux signalements de serveurs, et aux suggestions d'amélioration du site
          comme du bot.
        </p>
      </div>

      <PublicFooter />
    </div>
  );
}

const h2 = { fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 8 };
const p = { marginBottom: 4 };
