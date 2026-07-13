'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboarding } from '@/lib/utils';

const STEPS = [
  {
    emoji: '👋',
    title: 'Bienvenue sur Bumpify Directory',
    text: "L'annuaire des serveurs Discord du réseau Bumpify. Tout ce que tu vois ici — membres, bumps, classement — provient de vraies données mises à jour en direct, jamais simulées.",
  },
  {
    emoji: '🔬',
    title: 'Trouve le bon serveur',
    text: "L'annuaire propose recherche, catégories et tri. Pour aller plus loin, la Recherche avancée permet de combiner plusieurs catégories à la fois, une plage précise de membres/bumps, et de sauvegarder tes recherches.",
  },
  {
    emoji: '⇄',
    title: 'Compare, favorise, organise',
    text: "Le bouton ⇄ sur une carte permet de comparer jusqu'à 3 serveurs côte à côte. Le ☆ ajoute un serveur à tes favoris, et tu peux créer des collections thématiques — tout est gardé sur ton appareil, sans compte requis.",
  },
  {
    emoji: '📡',
    title: 'Transparence en direct',
    text: "La page Activité en direct affiche les vrais bumps et croissances du réseau en temps réel. La page Statut des services vérifie en continu que tout fonctionne. Rien n'est caché.",
  },
  {
    emoji: '🚀',
    title: 'Prêt à explorer ?',
    text: "Tu peux revoir cette visite guidée à tout moment depuis le menu ⚙️ en bas de l'écran.",
    cta: true,
  },
];

// Visite guidée affichée automatiquement au premier visiteur (une seule fois,
// mémorisé en localStorage), et rejouable via un événement custom déclenché
// par SiteCustomizer ("bumpify:show-onboarding").
export default function OnboardingTour() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!onboarding.seen()) {
      const t = setTimeout(() => setOpen(true), 600); // petit délai pour laisser la page se charger d'abord
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const handler = () => { setStep(0); setOpen(true); };
    window.addEventListener('bumpify:show-onboarding', handler);
    return () => window.removeEventListener('bumpify:show-onboarding', handler);
  }, []);

  const close = () => {
    onboarding.markSeen();
    setOpen(false);
  };

  const finish = () => {
    onboarding.markSeen();
    setOpen(false);
    router.push('/annuaire');
  };

  if (!open) return null;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="onboarding-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close}>✕</button>

        <div className="onboarding-emoji">{current.emoji}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-text">{current.text}</p>

        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-actions">
          {!isLast && <button className="filter-chip" onClick={close}>Passer</button>}
          <div style={{ flex: 1 }} />
          {step > 0 && !isLast && (
            <button className="filter-chip" onClick={() => setStep((s) => s - 1)}>← Précédent</button>
          )}
          {!isLast ? (
            <button className="join-btn" onClick={() => setStep((s) => s + 1)}>Suivant →</button>
          ) : (
            <button className="join-btn" onClick={finish}>🧭 Explorer l'annuaire</button>
          )}
        </div>
      </div>
    </div>
  );
}
