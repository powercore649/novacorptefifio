'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { formatNumber, timeAgo, votes as votesStore } from '@/lib/utils';
import ReportModal from '@/components/ReportModal';
import ServerDescription from '@/components/ServerDescription';

export default function ServerDetailClient({ server }) {
  const { data: session, status } = useSession();
  const [voted,      setVoted]      = useState(() => votesStore.hasVoted(server.guildId));
  const [voteCount,  setVoteCount]  = useState(server.totalVotes || 0);
  const [copied,     setCopied]     = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Avis
  const [reviews, setReviews] = useState(null);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('idle'); // idle | sending | sent | error

  // Serveurs similaires (basé sur les tags en commun)
  const [similarServers, setSimilarServers] = useState(null);

  useEffect(() => {
    fetch('/api/servers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const myTags = new Set(server.tags || []);
        const scored = data
          .filter((s) => s.guildId !== server.guildId)
          .map((s) => ({ ...s, shared: (s.tags || []).filter((t) => myTags.has(t)).length }))
          .filter((s) => s.shared > 0)
          .sort((a, b) => b.shared - a.shared || b.bumpCount - a.bumpCount)
          .slice(0, 3);
        setSimilarServers(scored);
      })
      .catch(() => setSimilarServers([]));
  }, [server.guildId, server.tags]);

  useEffect(() => {
    fetch(`/api/reviews/${server.guildId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating);
        setReviewCount(data.count || 0);
        const mine = session?.user?.discordId && data.reviews?.find((r) => r.userId === session.user.discordId);
        if (mine) { setMyRating(mine.rating); setMyComment(mine.comment || ''); }
      })
      .catch(() => {});
  }, [server.guildId, session?.user?.discordId]);

  const icon = server.guildIcon
    ? `https://cdn.discordapp.com/icons/${server.guildId}/${server.guildIcon}.webp?size=128`
    : null;
  const initials = (server.guildName || '?').slice(0, 2).toUpperCase();
  const streakPct = Math.min(100, (server.bumpStreak || 0) / 30 * 100);

  const handleVote = async () => {
    if (voted) return;
    const added = votesStore.vote(server.guildId);
    if (!added) return;
    setVoted(true);
    setVoteCount(v => v + 1);
    await fetch('/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guildId: server.guildId }) }).catch(() => {});
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/server/${server.guildId}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeImgUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/badge/${server.guildId}`;
  const badgeMarkdown = `[![Bumpify](${badgeImgUrl})](${typeof window !== 'undefined' ? window.location.origin : ''}/server/${server.guildId})`;

  const handleCopyBadge = async () => {
    await navigator.clipboard.writeText(badgeMarkdown).catch(() => {});
    setBadgeCopied(true);
    setTimeout(() => setBadgeCopied(false), 2000);
  };

  const submitReview = async () => {
    if (status !== 'authenticated') { signIn('discord'); return; }
    if (myRating < 1) return;
    setReviewStatus('sending');
    try {
      const r = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: server.guildId, rating: myRating, comment: myComment }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'failed');
      setReviewStatus('sent');
      // Recharge les avis pour refléter le tien immédiatement
      const refreshed = await fetch(`/api/reviews/${server.guildId}`, { cache: 'no-store' }).then((res) => res.json());
      setReviews(refreshed.reviews || []);
      setAvgRating(refreshed.averageRating);
      setReviewCount(refreshed.count || 0);
      setTimeout(() => setReviewStatus('idle'), 1800);
    } catch {
      setReviewStatus('error');
    }
  };

  return (
    <main>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 6vw 0', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ color: 'var(--text-faint)', fontSize: 13, textDecoration: 'none' }}>← Annuaire</Link>
      </div>

      {/* Hero */}
      <div className="detail-hero">
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div className="detail-avatar">
            {icon
              ? <Image src={icon} alt={server.guildName} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 20 }} />
              : initials}
          </div>

          {/* Infos */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700 }}>{server.guildName}</h1>
              {server.featured && <span className="featured-badge">⭐ Featured</span>}
              {server.trending && <span className="trending-badge">🔥 Trending</span>}
              {server.isNew    && <span className="new-badge">✨ Nouveau</span>}
            </div>
            {server.description
              ? <div style={{ marginBottom: 16, maxWidth: 540 }}><ServerDescription text={server.description} /></div>
              : <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 16 }}>Aucune description.</p>}
            {(server.tags || []).length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {server.tags.map(t => (
                  <Link key={t} href={`/?tags=${t}`} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'var(--surface-3)', color: 'var(--text-dim)', textDecoration: 'none' }}>
                    {t}
                  </Link>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {server.inviteLink && (
                <a href={server.inviteLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                  Rejoindre →
                </a>
              )}
              <button className={`vote-btn ${voted ? 'voted' : ''}`} onClick={handleVote} disabled={voted}>
                👍 {voted ? 'Voté !' : 'Voter'} · {formatNumber(voteCount)}
              </button>
              <button className={`share-btn ${copied ? 'copied' : ''}`} onClick={handleShare}>
                {copied ? '✅ Lien copié !' : '🔗 Partager'}
              </button>
              <a
                className="share-btn"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvre ${server.guildName} sur Bumpify Directory 🚀`)}&url=${encodeURIComponent(`https://zyntra.dpdns.org/server/${server.guildId}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                𝕏 Partager
              </a>
              <button className="share-btn" onClick={() => setReportOpen(true)} style={{ marginLeft: 'auto' }}>
                🚩 Signaler
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale de signalement */}
      {reportOpen && <ReportModal guildId={server.guildId} onClose={() => setReportOpen(false)} />}

      {/* Stats */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
        <div className="detail-stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: '👥 Membres',     value: formatNumber(server.memberCount) },
            { label: '🚀 Bumps totaux',value: formatNumber(server.bumpCount)   },
            { label: '📅 Cette semaine',value: formatNumber(server.weeklyBumps)},
            { label: '👍 Votes',       value: formatNumber(voteCount)           },
            { label: '⭐ Score réseau', value: formatNumber(server.score)       },
            { label: '🏆 Rang',        value: `#${server.rank}`                },
          ].map(s => (
            <div key={s.label} className="detail-stat">
              <div className="detail-stat-num">{s.value}</div>
              <div className="detail-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Streak bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>🔥 Streak de bumps</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--line)' }}>
              {server.bumpStreak || 0} / 30 jours
            </span>
          </div>
          <div className="streak-bar">
            <div className="streak-fill" style={{ width: `${streakPct}%` }} />
          </div>
          {server.lastBump && (
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8 }}>
              Dernier bump {timeAgo(server.lastBump)}
            </p>
          )}
        </div>

        {/* Langue */}
        {server.language && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: 13.5, marginBottom: 24 }}>
            <span>🌍</span>
            <span>Langue : <strong style={{ color: 'var(--text)' }}>{server.language.toUpperCase()}</strong></span>
          </div>
        )}

        {/* Badge embarquable */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>🏷️ Badge embarquable</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 14 }}>
            Affiche les stats en direct de ton serveur sur ton propre site ou dans ton README GitHub.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={badgeImgUrl} alt="Badge Bumpify" style={{ marginBottom: 14, display: 'block' }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ fontSize: 11.5, background: 'var(--surface-3, #1a1c22)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--text-dim)', wordBreak: 'break-all' }}>
              {badgeMarkdown}
            </code>
            <button className={`share-btn ${badgeCopied ? 'copied' : ''}`} onClick={handleCopyBadge}>
              {badgeCopied ? '✅ Copié !' : '📋 Copier (Markdown)'}
            </button>
          </div>
        </div>

        {/* Serveurs similaires */}
        {similarServers?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>🧭 Serveurs similaires</div>
            <div className="directory-grid" style={{ padding: 0 }}>
              {similarServers.map((s) => (
                <a key={s.guildId} href={`/server/${s.guildId}`} className="server-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="server-card-head">
                    <div className="server-avatar">
                      {s.icon
                        ? <img src={`https://cdn.discordapp.com/icons/${s.guildId}/${s.icon}.png`} alt="" />
                        : s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="server-name">{s.name}</div>
                      <div className="server-meta">{s.memberCount ?? '—'} membres</div>
                    </div>
                  </div>
                  <div className="server-tags">
                    {s.tags.slice(0, 3).map((t) => <span className="tag-pill" key={t}>{t}</span>)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Avis et notes */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>⭐ Avis</div>
            {avgRating != null && (
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                <strong style={{ color: 'var(--text)' }}>{avgRating}</strong>/5 · {reviewCount} avis
              </div>
            )}
          </div>

          {/* Laisser un avis */}
          <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            {status !== 'authenticated' ? (
              <button className="discord-btn" onClick={() => signIn('discord')}>Se connecter pour laisser un avis</button>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMyRating(n)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, padding: 0, color: n <= myRating ? 'var(--accent-2)' : 'var(--border)' }}
                      aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value.slice(0, 500))}
                  placeholder="Ton avis (optionnel, 500 caractères max)"
                  rows={2}
                  className="search-input"
                  style={{ width: '100%', marginBottom: 10, resize: 'vertical' }}
                />
                <button className="share-btn" disabled={myRating < 1 || reviewStatus === 'sending'} onClick={submitReview}>
                  {reviewStatus === 'sending' ? 'Envoi…' : reviewStatus === 'sent' ? '✅ Avis publié !' : 'Publier mon avis'}
                </button>
              </>
            )}
          </div>

          {/* Liste des avis */}
          {reviews === null && <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Chargement des avis…</div>}
          {reviews?.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Aucun avis pour l'instant — sois le premier !</div>}
          {reviews?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 340, overflowY: 'auto' }}>
              {reviews.map((r) => (
                <div key={r.userId} style={{ display: 'flex', gap: 10 }}>
                  <div className="server-avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                    {r.avatar ? <img src={r.avatar} alt="" /> : (r.username || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.username || 'Utilisateur'}</span>
                      <span style={{ color: 'var(--accent-2)', fontSize: 12 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {r.comment && <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>{r.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
