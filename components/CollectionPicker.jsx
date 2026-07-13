'use client';
import { useState } from 'react';
import { collections as collectionsUtil } from '@/lib/utils';

// Petite modale permettant d'ajouter/retirer un serveur d'une ou plusieurs
// collections nommées (ex: "Mes serveurs gaming"). Complète le système de
// favoris simple déjà existant, sans le remplacer.
export default function CollectionPicker({ guildId, onClose }) {
  const [list, setList] = useState(() => collectionsUtil.getAll());
  const [newName, setNewName] = useState('');

  const handleToggle = (id) => {
    setList(collectionsUtil.toggleServer(id, guildId));
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const col = collectionsUtil.create(newName);
    setList(collectionsUtil.toggleServer(col.id, guildId));
    setNewName('');
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, maxWidth: 380, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>📁 Ajouter à une collection</div>

        {list.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 14 }}>
            Tu n'as encore aucune collection. Crée-en une ci-dessous.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, maxHeight: 220, overflowY: 'auto' }}>
          {list.map((c) => (
            <label
              key={c.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={c.guildIds.includes(guildId)}
                onChange={() => handleToggle(c.id)}
              />
              <span style={{ fontSize: 13.5, flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{c.guildIds.length}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="search-input"
            style={{ flex: 1 }}
            placeholder="Nouvelle collection…"
            value={newName}
            onChange={(e) => setNewName(e.target.value.slice(0, 40))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          />
          <button className="share-btn" onClick={handleCreate}>Créer</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="filter-chip" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
