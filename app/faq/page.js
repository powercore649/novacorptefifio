'use client';
import { useState } from 'react';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

const SUPPORT_DISCORD = 'https://discord.gg/ts5mh326ew';

const FAQ_ITEMS = [
  {
    q: "Qu'est-ce que Bumpify Directory ?",
    a: "C'est l'annuaire public des serveurs Discord qui utilisent le bot Bumpify pour se faire connaître via un système de bump communautaire. Les données affichées (membres, description, bumps...) sont réelles et mises à jour en direct.",
  },
  {
    q: 'Comment mon serveur peut apparaître dans l\'annuaire ?',
    a: "Ton serveur doit avoir le bot Bumpify actif, avec au moins une description ou un lien d'invitation renseigné dans sa configuration. Une fois ça fait, il apparaît automatiquement dans l'annuaire.",
  },
  {
    q: 'Comment fonctionne le classement ?',
    a: 'Le score prend en compte le nombre de bumps de la semaine, ton streak de bump (jours consécutifs), les votes reçus, et un bonus si le serveur est mis en avant ("featured"). Plus ton serveur est actif, plus il grimpe.',
  },
  {
    q: 'À quoi servent les favoris et l\'historique de recherche ?',
    a: "Les favoris te permettent de marquer d'un ☆ les serveurs qui t'intéressent pour les retrouver rapidement via le filtre dédié. L'historique de recherche garde tes dernières recherches en suggestion. Les deux sont stockés uniquement dans ton navigateur, pas sur nos serveurs.",
  },
  {
    q: 'Que voit-on dans "Mon compte" ?',
    a: "Une fois connecté avec Discord, tu vois tes vraies statistiques Bumpify (bumps, coins, XP, niveau, réputation, badges) sur chaque serveur du réseau où tu es actif, ainsi que la liste de tous tes serveurs Discord avec une pastille indiquant lesquels utilisent déjà Bumpify.",
  },
  {
    q: 'Un serveur NSFW peut-il être listé ?',
    a: "Oui, à condition d'être correctement déclaré comme tel dans la configuration du bot. Le filtre \"NSFW masqué\" est activé par défaut sur l'annuaire. Un serveur NSFW non déclaré est passible de blacklist — voir le règlement pour les détails.",
  },
  {
    q: 'Je pense qu\'un serveur enfreint les règles, que faire ?',
    a: 'Rejoins notre serveur de support et signale-le avec autant de détails que possible (nom du serveur, capture d\'écran si pertinent). L\'équipe vérifie et applique les sanctions prévues par le règlement.',
  },
  {
    q: "Le site affiche une erreur ou des données qui semblent fausses, à qui le dire ?",
    a: 'Passe par notre serveur de support Discord — c\'est le moyen le plus rapide d\'obtenir de l\'aide.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="server-row" style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{q}</span>
        <span className="mono" style={{ color: 'var(--text-faint)', flexShrink: 0, marginLeft: 12 }}>{open ? '−' : '+'}</span>
      </div>
      {open && <p style={{ marginTop: 10, color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.6 }}>{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/faq" />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>❓ Questions fréquentes</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Tout ce qu'il faut savoir sur l'annuaire, le classement, et ton compte.
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 6vw 6vh', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FAQ_ITEMS.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: 13.5, marginBottom: 14 }}>Une autre question ?</p>
        <a
          href={SUPPORT_DISCORD}
          target="_blank"
          rel="noopener noreferrer"
          className="filter-chip active"
          style={{ padding: '9px 20px', fontSize: 14 }}
        >
          Rejoindre le support Discord ↗
        </a>
      </div>

      <PublicFooter />
    </div>
  );
}
