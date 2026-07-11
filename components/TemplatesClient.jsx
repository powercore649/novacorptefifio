'use client';
import { useMemo, useState } from 'react';
import { TEMPLATES, CATEGORIES } from '@/lib/templates';

export default function TemplatesClient() {
  const [category, setCategory] = useState(null);

  const filtered = useMemo(
    () => (category ? TEMPLATES.filter((t) => t.category === category) : TEMPLATES),
    [category]
  );

  return (
    <div>
      <div className="filters-bar">
        <button className={`filter-chip ${!category ? 'active' : ''}`} onClick={() => setCategory(null)}>Tous</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`filter-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="directory-grid">
        {filtered.map((t) => (
          <div className="server-card" key={t.code} style={{ cursor: 'default' }}>
            <div className="server-card-head">
              <div className="server-avatar">{t.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <div className="server-name">{t.name}</div>
                <div className="server-meta">{t.category}</div>
              </div>
            </div>
            <p className="server-desc">{t.description}</p>
            <div className="server-footer">
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>discord.new/{t.code}</span>
              <a className="join-btn" href={`https://discord.new/${t.code}`} target="_blank" rel="noopener noreferrer">
                Utiliser ce template
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
