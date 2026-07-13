'use client';
import { useEffect, useRef, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

const NAV_GROUPS = [
  {
    key: 'decouvrir',
    label: 'Découvrir',
    icon: '🧭',
    items: [
      { href: '/', label: 'Accueil' },
      { href: '/annuaire', label: 'Annuaire' },
      { href: '/recherche-avancee', label: 'Recherche avancée' },
      { href: '/activite', label: 'Activité en direct' },
      { href: '/collections', label: 'Mes collections' },
      { href: '/leaderboard', label: 'Classement' },
      { href: '/trending', label: 'Tendances' },
      { href: '/new', label: 'Nouveaux' },
      { href: '/decouverte', label: 'Au hasard' },
      { href: '/stats', label: 'Statistiques' },
    ],
  },
  {
    key: 'ressources',
    label: 'Ressources',
    icon: '📚',
    items: [
      { href: '/templates', label: 'Templates' },
      { href: '/partenaires', label: 'Partenaires' },
      { href: '/faq', label: 'FAQ' },
      { href: '/documentation', label: 'Documentation' },
      { href: '/changelog', label: 'Changelog' },
      { href: '/status', label: 'Statut des services' },
      { href: '/a-propos', label: 'À propos' },
    ],
  },
];

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function AuthButton({ compact = false }) {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;

  if (session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {session.user?.image && (
          <img src={session.user.image} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
        )}
        {!compact && (
          <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{session.user?.name}</span>
        )}
        <button className="filter-chip" onClick={() => signOut()}>Déconnexion</button>
      </div>
    );
  }
  return (
    <button className="discord-btn" onClick={() => signIn('discord')}>
      <DiscordIcon />
      Se connecter
    </button>
  );
}

function NavDropdown({ group, current, openKey, setOpenKey }) {
  const ref = useRef(null);
  const isOpen = openKey === group.key;

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenKey(null); };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen, setOpenKey]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`filter-chip ${isOpen ? 'active' : ''}`}
        onClick={() => setOpenKey(isOpen ? null : group.key)}
        aria-expanded={isOpen}
      >
        {group.icon} {group.label} <span style={{ fontSize: 10, opacity: 0.7 }}>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="nav-dropdown-panel">
          {group.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-dropdown-item ${item.href === current ? 'active' : ''}`}
              onClick={() => setOpenKey(null)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Barre de navigation partagée par toutes les pages publiques du site.
// v3 : regroupée en menus déroulants (Découvrir / Ressources) au lieu d'une
// longue liste de liens à plat, pour rester lisible même avec de plus en
// plus de pages. `current` = chemin de la page en cours.
export default function PublicNav({ current = '/' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openKey, setOpenKey] = useState(null);

  return (
    <nav className="nav-public">
      <a className="brand" href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className="brand-mark">B</span> Bumpify Directory
        <span className="version-badge">Bêta 2.5</span>
      </a>

      <div className="nav-links-desktop" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
        {NAV_GROUPS.map((group) => (
          <NavDropdown key={group.key} group={group} current={current} openKey={openKey} setOpenKey={setOpenKey} />
        ))}
        <a href="/account" className={`filter-chip ${current === '/account' ? 'active' : ''}`}>👤 Mon compte</a>
        <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="live-dot" /> Données en direct
        </span>
        <span style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 2px' }} />
        <AuthButton compact />
      </div>

      <button
        className="nav-hamburger"
        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>

      {mobileOpen && (
        <div className="nav-mobile-panel">
          {NAV_GROUPS.map((group) => (
            <div key={group.key} style={{ width: '100%' }}>
              <div className="nav-mobile-group-label">{group.icon} {group.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {group.items.map((item) => (
                  <a key={item.href} href={item.href} className="filter-chip" onClick={() => setMobileOpen(false)}>{item.label}</a>
                ))}
              </div>
            </div>
          ))}
          <a href="/account" className="filter-chip" onClick={() => setMobileOpen(false)}>👤 Mon compte</a>
          <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className="live-dot" /> Données en direct
          </span>
          <div style={{ width: '100%', height: 1, background: 'var(--border)', margin: '6px 0' }} />
          <AuthButton />
        </div>
      )}
    </nav>
  );
}
