'use client';
import { timeAgo, formatNumber } from '@/lib/utils';

// Modale de comparaison côte à côte de 2 ou 3 serveurs sélectionnés depuis
// l'annuaire (voir bouton ⇄ sur les cartes dans DirectoryClient). Purement
// visuelle, aucune donnée envoyée au serveur.
const ROWS = [
  { label: 'Membres', get: (s) => formatNumber(s.memberCount) },
  { label: 'En ligne', get: (s) => formatNumber(s.presenceCount) },
  { label: 'Bumps totaux', get: (s) => s.bumpCount ?? '—' },
  { label: 'Bumps (semaine)', get: (s) => s.weeklyBumps ?? '—' },
  { label: 'Bumps (mois)', get: (s) => s.monthlyBumps ?? '—' },
  { label: 'Streak', get: (s) => `${s.bumpStreak ?? 0} j` },
  { label: 'Votes reçus', get: (s) => s.totalVotes ?? '—' },
  { label: 'Note moyenne', get: (s) => (s.averageRating ? `★ ${s.averageRating} (${s.reviewCount})` : '—') },
  { label: 'Dernier bump', get: (s) => timeAgo(s.lastBump) },
  { label: 'Langue', get: (s) => s.language || '—' },
  { label: 'NSFW', get: (s) => (s.nsfw ? 'Oui' : 'Non') },
];

// Détermine, pour une ligne donnée, quel(s) serveur(s) ont la "meilleure"
// valeur numérique — juste pour un petit surlignage visuel, purement indicatif.
function bestIndex(servers, numGetter) {
  const values = servers.map((s) => {
    const n = numGetter(s);
    return typeof n === 'number' && !Number.isNaN(n) ? n : null;
  });
  if (values.every((v) => v === null)) return -1;
  const max = Math.max(...values.map((v) => (v === null ? -Infinity : v)));
  if (max === -Infinity) return -1;
  return values.indexOf(max);
}

const NUMERIC_KEYS = {
  'Membres': (s) => s.memberCount || 0,
  'En ligne': (s) => s.presenceCount || 0,
  'Bumps totaux': (s) => s.bumpCount || 0,
  'Bumps (semaine)': (s) => s.weeklyBumps || 0,
  'Bumps (mois)': (s) => s.monthlyBumps || 0,
  'Streak': (s) => s.bumpStreak || 0,
  'Votes reçus': (s) => s.totalVotes || 0,
  'Note moyenne': (s) => s.averageRating || 0,
};

export default function CompareModal({ servers, onClose, onRemove }) {
  if (!servers || servers.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card compare-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 style={{ fontSize: 20, marginBottom: 18 }}>Comparer les serveurs</h2>

        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                {servers.map((s) => (
                  <th key={s.guildId}>
                    <div className="compare-col-head">
                      <div className="server-avatar" style={{ width: 40, height: 40, borderRadius: 10 }}>
                        {s.icon
                          ? <img src={`https://cdn.discordapp.com/icons/${s.guildId}/${s.icon}.png`} alt="" />
                          : s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="compare-col-name">{s.name}</div>
                      <button
                        className="filter-chip"
                        style={{ padding: '2px 8px', fontSize: 11 }}
                        onClick={() => onRemove(s.guildId)}
                        title="Retirer de la comparaison"
                      >
                        Retirer
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const numGetter = NUMERIC_KEYS[row.label];
                const best = numGetter ? bestIndex(servers, numGetter) : -1;
                return (
                  <tr key={row.label}>
                    <td className="compare-row-label">{row.label}</td>
                    {servers.map((s, i) => (
                      <td key={s.guildId} className={best === i && servers.length > 1 ? 'compare-cell-best' : ''}>
                        {row.get(s)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <td className="compare-row-label">Tags</td>
                {servers.map((s) => (
                  <td key={s.guildId}>
                    <div className="server-tags">
                      {(s.tags || []).slice(0, 4).map((t) => <span className="tag-pill" key={t}>{t}</span>)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="compare-row-label">Rejoindre</td>
                {servers.map((s) => (
                  <td key={s.guildId}>
                    {s.inviteLink
                      ? <a className="join-btn" href={s.inviteLink} target="_blank" rel="noopener noreferrer">Rejoindre</a>
                      : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
