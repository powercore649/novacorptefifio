'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/lib/utils';
import ReportModal from '@/components/ReportModal';
import RatingBadge from '@/components/RatingBadge';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardClient({ servers }) {
  const router = useRouter();
  const [filter, setFilter] = useState('score');
  const [reportGuildId, setReportGuildId] = useState(null);

  const sorted = [...servers].sort((a, b) => {
    if (filter === 'members') return (b.memberCount || 0) - (a.memberCount || 0);
    if (filter === 'bumps')   return (b.bumpCount   || 0) - (a.bumpCount   || 0);
    if (filter === 'votes')   return (b.totalVotes  || 0) - (a.totalVotes  || 0);
    if (filter === 'weekly')  return (b.weeklyBumps || 0) - (a.weeklyBumps || 0);
    return (b.score || 0) - (a.score || 0);
  });

  return (
    <main>
      {/* Header */}
      <div className="lb-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>🏆 Classement</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Top {sorted.length} serveurs du réseau Bumpify</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'score',   label: '⭐ Score'    },
              { key: 'bumps',   label: '🚀 Bumps'    },
              { key: 'weekly',  label: '📅 Semaine'  },
              { key: 'members', label: '👥 Membres'  },
              { key: 'votes',   label: '👍 Votes'    },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`page-btn ${filter === f.key ? 'active' : ''}`}
                style={{ fontSize: 12.5, padding: '6px 12px' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="lb-table">
        <div className="lb-container">
          {sorted.map((server, i) => {
            const icon = server.guildIcon
              ? `https://cdn.discordapp.com/icons/${server.guildId}/${server.guildIcon}.webp?size=64`
              : null;
            const initials = (server.guildName || '?').slice(0, 2).toUpperCase();

            return (
              <div key={server.guildId} className="lb-row" onClick={() => router.push(`/server/${server.guildId}`)}>
                {/* Rank */}
                <div className={`lb-rank ${i === 0 ? 'lb-rank-1' : i === 1 ? 'lb-rank-2' : i === 2 ? 'lb-rank-3' : ''}`}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div className="lb-avatar">
                  {icon
                    ? <Image src={icon} alt={server.guildName} width={44} height={44} style={{ objectFit: 'cover' }} />
                    : initials}
                </div>

                {/* Info */}
                <div className="lb-info">
                  <div className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {server.guildName}
                    {server.featured  && <span className="featured-badge">⭐ Featured</span>}
                    {server.trending  && <span className="trending-badge">🔥 Trending</span>}
                    {server.isNew     && <span className="new-badge">✨ Nouveau</span>}
                  </div>
                  <div className="lb-tags">
                    {(server.tags || []).slice(0, 4).map(t => (
                      <span key={t} style={{ fontSize: 11, padding: '1px 7px', borderRadius: 999, background: 'var(--surface-3)', color: 'var(--text-dim)' }}>{t}</span>
                    ))}
                  </div>
                  <RatingBadge averageRating={server.averageRating} reviewCount={server.reviewCount} size={11} />
                </div>

                {/* Signaler */}
                <button
                  className="filter-chip"
                  style={{ padding: '3px 9px', fontSize: 11.5, flexShrink: 0 }}
                  title="Signaler ce serveur"
                  onClick={(e) => { e.stopPropagation(); setReportGuildId(server.guildId); }}
                >
                  🚩
                </button>

                {/* Score */}
                <div className="lb-score">
                  <div className="lb-score-num">
                    {filter === 'score'   ? formatNumber(server.score)       :
                     filter === 'bumps'   ? formatNumber(server.bumpCount)   :
                     filter === 'weekly'  ? formatNumber(server.weeklyBumps) :
                     filter === 'members' ? formatNumber(server.memberCount) :
                     formatNumber(server.totalVotes)}
                  </div>
                  <div className="lb-score-label">
                    {filter === 'score'   ? 'pts' :
                     filter === 'bumps'   ? 'bumps' :
                     filter === 'weekly'  ? 'cette semaine' :
                     filter === 'members' ? 'membres' :
                     'votes'}
                  </div>
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-faint)' }}>
              Aucun serveur dans le classement.
            </div>
          )}
        </div>
      </div>

      {reportGuildId && <ReportModal guildId={reportGuildId} onClose={() => setReportGuildId(null)} />}
    </main>
  );
}
