'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collections as collectionsUtil, formatNumber } from '@/lib/utils';

// Page "Mes collections" — regroupe les serveurs favoris par thème choisi
// par le visiteur (ex: "Gaming", "Anime"). `servers` = liste complète du
// réseau (pré-chargée côté serveur) pour résoudre les guildIds stockés en
// localStorage vers de vraies infos serveur (nom, icône, membres…).
export default function CollectionsClient({ servers }) {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    setList(collectionsUtil.getAll());
  }, []);

  const serverMap = new Map((servers || []).map((s) => [s.guildId, s]));

  const handleRemoveCollection = (id) => {
    if (!confirm('Supprimer cette collection ? Les serveurs ne seront pas affectés.')) return;
    setList(collectionsUtil.remove(id));
  };

  const handleRemoveServer = (colId, guildId) => {
    setList(collectionsUtil.toggleServer(colId, guildId));
  };

  const startRename = (c) => {
    setRenamingId(c.id);
    setRenameValue(c.name);
  };

  const confirmRename = (id) => {
    setList(collectionsUtil.rename(id, renameValue));
    setRenamingId(null);
  };

  return (
    <main>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>📁 Mes collections</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Regroupe tes serveurs favoris par thème. Stocké uniquement dans ton navigateur, sans compte.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
        {list.length === 0 && (
          <div className="empty-state">
            Aucune collection pour l'instant. Ouvre un serveur dans l'annuaire et clique sur 📁 pour en créer une.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {list.map((c) => (
            <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                {renamingId === c.id ? (
                  <>
                    <input
                      className="search-input"
                      style={{ flex: 1, maxWidth: 260 }}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value.slice(0, 40))}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(c.id); }}
                      autoFocus
                    />
                    <button className="share-btn" onClick={() => confirmRename(c.id)}>OK</button>
                  </>
                ) : (
                  <>
                    <h2 style={{ fontSize: 17, fontWeight: 700, flex: 1 }}>{c.name}</h2>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{c.guildIds.length} serveur{c.guildIds.length !== 1 ? 's' : ''}</span>
                    <button className="filter-chip" style={{ padding: '3px 9px', fontSize: 12 }} onClick={() => startRename(c)}>✏️</button>
                    <button className="filter-chip" style={{ padding: '3px 9px', fontSize: 12 }} onClick={() => handleRemoveCollection(c.id)}>🗑️</button>
                  </>
                )}
              </div>

              {c.guildIds.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Collection vide pour l'instant.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {c.guildIds.map((guildId) => {
                    const s = serverMap.get(guildId);
                    if (!s) return null;
                    return (
                      <div key={guildId} className="server-row" onClick={() => router.push(`/server/${guildId}`)} style={{ cursor: 'pointer' }}>
                        <div className="server-avatar" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }}>
                          {s.icon
                            ? <img src={`https://cdn.discordapp.com/icons/${s.guildId}/${s.icon}.png`} alt="" />
                            : s.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="server-row-info">
                          <div className="server-row-name">{s.name}</div>
                        </div>
                        <div className="server-row-stats">
                          <div className="server-row-stat">
                            <div className="server-row-stat-num">{formatNumber(s.memberCount)}</div>
                            <div className="server-row-stat-label">membres</div>
                          </div>
                        </div>
                        <button
                          className="filter-chip"
                          style={{ padding: '4px 10px', flexShrink: 0 }}
                          onClick={(e) => { e.stopPropagation(); handleRemoveServer(c.id, guildId); }}
                        >
                          Retirer
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
