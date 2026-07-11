'use client';
import { useEffect, useState } from 'react';

const ACCENTS = [
  { name: 'Violet', accent: '#7c6cf0', line: '#34e5c6' },
  { name: 'Émeraude', accent: '#22c58b', line: '#7c6cf0' },
  { name: 'Corail', accent: '#ef6a5f', line: '#f2c14e' },
  { name: 'Or', accent: '#e8b93b', line: '#7c6cf0' },
  { name: 'Rose', accent: '#e857a6', line: '#34e5c6' },
];

const STORAGE_KEY = 'bumpify-directory-theme-v1';

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-soft', theme.accent + '26');
  root.style.setProperty('--line', theme.line);
  root.style.setProperty('--radius', theme.compact ? '9px' : '14px');
  root.style.setProperty('--radius-sm', theme.compact ? '6px' : '9px');
  root.classList.toggle('density-compact', !!theme.compact);
}

export default function SiteCustomizer() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState({ accent: ACCENTS[0].accent, line: ACCENTS[0].line, compact: false });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        setTheme(saved);
        applyTheme(saved);
      }
    } catch {}
  }, []);

  const update = (patch) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const reset = () => {
    const base = { accent: ACCENTS[0].accent, line: ACCENTS[0].line, compact: false };
    setTheme(base);
    applyTheme(base);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <>
      <button className="customizer-fab" onClick={() => setOpen((v) => !v)} aria-label="Personnaliser l'interface">
        ⚙
      </button>

      {open && (
        <div className="customizer-panel">
          <div className="customizer-head">
            <span>Personnaliser l'interface</span>
            <button className="modal-close" style={{ position: 'static', width: 24, height: 24 }} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="customizer-label">Couleur d'accent</div>
          <div className="customizer-swatches">
            {ACCENTS.map((a) => (
              <button
                key={a.name}
                className={`swatch ${theme.accent === a.accent ? 'active' : ''}`}
                style={{ background: a.accent }}
                title={a.name}
                onClick={() => update({ accent: a.accent, line: a.line })}
              />
            ))}
          </div>

          <div className="customizer-label" style={{ marginTop: 16 }}>Densité</div>
          <div className="filters-bar" style={{ margin: 0, padding: 0, justifyContent: 'flex-start' }}>
            <button className={`filter-chip ${!theme.compact ? 'active' : ''}`} onClick={() => update({ compact: false })}>Confortable</button>
            <button className={`filter-chip ${theme.compact ? 'active' : ''}`} onClick={() => update({ compact: true })}>Compacte</button>
          </div>

          <button className="filter-chip" style={{ marginTop: 18, width: '100%' }} onClick={reset}>Réinitialiser</button>
        </div>
      )}
    </>
  );
}
