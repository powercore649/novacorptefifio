'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import ServerModal from '@/components/ServerModal';
import LoadingLogo from '@/components/LoadingLogo';
import { favorites, searchHistory, stripMarkdown, compareList, MAX_COMPARE } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';
import ReportModal from '@/components/ReportModal';
import RatingBadge from '@/components/RatingBadge';
import CompareModal from '@/components/CompareModal';

const SORTS = {
  bumps: (a, b) => b.bumpCount - a.bumpCount,
  members: (a, b) => (b.memberCount || 0) - (a.memberCount || 0),
  recent: () => 0,
};

const PAGE_SIZE = 24; // 24 cartes par page (8 rangées de 3 sur grand écran)

// `initialServers` : liste déjà filtrée/triée côté serveur (utilisé par les
// pages Tendances/Nouveaux). Quand elle est fournie, on l'utilise telle
// quelle au lieu de re-fetch /api/servers, sinon ces pages affichaient la
// liste complète de l'annuaire au lieu de leur propre sélection.
// `hideBanner` : masque la barre de recherche/tri (les pages Tendances et
// Nouveaux ont déjà leur propre tri côté serveur).
export default function DirectoryClient({ initialServers = null, hideBanner = false }) {
  const [servers, setServers] = useState(initialServers);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState(null);
  const [sort, setSort] = useState('bumps');
  const [hideNsfw, setHideNsfw] = useState(true);
  const [favOnly, setFavOnly] = useState(false);
  const [favIds, setFavIds] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [reportGuildId, setReportGuildId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [page, setPage] = useState(1);
  const gridRef = useRef(null);
  const isFirstRender = useRef(true);
  const selectedServer = useMemo(
    () => (servers || []).find((s) => s.guildId === selectedId) || null,
    [servers, selectedId]
  );
  const compareServers = useMemo(
    () => compareIds.map((id) => (servers || []).find((s) => s.guildId === id)).filter(Boolean),
    [servers, compareIds]
  );

  useEffect(() => {
    setFavIds(favorites.get());
    setHistory(searchHistory.get());
    setCompareIds(compareList.get());
  }, []);

  const toggleFavorite = (e, guildId) => {
    e.stopPropagation();
    favorites.toggle(guildId);
    setFavIds(favorites.get());
  };

  const toggleCompare = (e, guildId) => {
    e.stopPropagation();
    const result = compareList.toggle(guildId);
    setCompareIds(result.list);
  };

  const clearCompare = () => {
    setCompareIds(compareList.clear());
    setShowCompare(false);
  };

  const removeFromCompare = (guildId) => {
    const result = compareList.toggle(guildId);
    setCompareIds(result.list);
    if (result.list.length === 0) setShowCompare(false);
  };

  const load = () => {
    fetch('/api/servers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setServers(data);
        setError(null);
      })
      .catch(() => setError('network_error'));
  };

  useEffect(() => {
    if (initialServers) return; // déjà fourni par la page, pas de re-fetch de la liste complète
    load();
    const interval = setInterval(load, 15000); // les compteurs de bump évoluent vite : on rafraîchit l'annuaire régulièrement
    return () => clearInterval(interval);
  }, [initialServers]);

  const allTags = useMemo(() => {
    const real = new Set();
    (servers || []).forEach((s) => (s.tags || []).forEach((t) => real.add(t)));
    const extras = Array.from(real).filter((t) => !CATEGORIES.includes(t));
    return [...CATEGORIES, ...extras];
  }, [servers]);

  const filtered = useMemo(() => {
    if (!servers) return [];
    let list = servers;
    if (hideNsfw) list = list.filter((s) => !s.nsfw);
    if (favOnly) list = list.filter((s) => favIds.includes(s.guildId));
    if (tag) list = list.filter((s) => (s.tags || []).includes(tag));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort(SORTS[sort]);
  }, [servers, query, tag, sort, hideNsfw, favOnly, favIds]);

  // Retour à la page 1 dès que la recherche/les filtres/le tri changent, sinon
  // on pourrait se retrouver sur une page vide après un nouveau filtrage.
  useEffect(() => {
    setPage(1);
  }, [query, tag, sort, hideNsfw, favOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Si la liste rétrécit (nouveau filtre, rafraîchissement des données) et que
  // la page courante n'existe plus, on revient à la dernière page valide.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

  return (
    <div>
      {!hideBanner && (
        <div className="search-bar" style={{ position: 'relative' }}>
          <input
            className="search-input"
            placeholder="Rechercher un serveur (nom ou description)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                searchHistory.add(query.trim());
                setHistory(searchHistory.get());
                setShowHistory(false);
              }
            }}
          />
          {showHistory && !query && history.length > 0 && (
            <div
              style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 5,
                background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
                padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: '100%',
              }}
            >
              {history.map((h) => (
                <button
                  key={h}
                  className="filter-chip"
                  style={{ padding: '3px 10px', fontSize: 12.5 }}
                  onMouseDown={() => { setQuery(h); setShowHistory(false); }}
                >
                  {h}
                </button>
              ))}
              <button
                className="filter-chip"
                style={{ padding: '3px 10px', fontSize: 12.5, opacity: 0.6 }}
                onMouseDown={() => { searchHistory.clear(); setHistory([]); }}
              >
                Effacer
              </button>
            </div>
          )}
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="bumps">Plus bumpés</option>
            <option value="members">Plus de membres</option>
          </select>
        </div>
      )}

      <div className="filters-bar">
        <button className={`filter-chip ${!tag && !favOnly ? 'active' : ''}`} onClick={() => { setTag(null); setFavOnly(false); }}>Tous</button>
        {allTags.map((t) => (
          <button key={t} className={`filter-chip ${tag === t ? 'active' : ''}`} onClick={() => setTag(t)}>{t}</button>
        ))}
        <button className={`filter-chip ${hideNsfw ? 'active' : ''}`} onClick={() => setHideNsfw((v) => !v)}>
          {hideNsfw ? 'NSFW masqué' : 'Afficher NSFW'}
        </button>
        <button className={`filter-chip ${favOnly ? 'active' : ''}`} onClick={() => setFavOnly((v) => !v)}>
          {favOnly ? '★ Favoris' : '☆ Favoris'} {favIds.length > 0 ? `(${favIds.length})` : ''}
        </button>
      </div>

      <div className="directory-grid" ref={gridRef}>
        {error && <div className="empty-state">Impossible de charger l'annuaire pour le moment.</div>}
        {!error && servers === null && <LoadingLogo label="Chargement des serveurs…" />}
        {!error && servers !== null && filtered.length === 0 && (
          <div className="empty-state">
            {favOnly ? "Tu n'as encore aucun serveur en favoris." : 'Aucun serveur ne correspond à votre recherche.'}
          </div>
        )}
        {pageItems.map((s) => (
          <div className="server-card" key={s.guildId} onClick={() => setSelectedId(s.guildId)}>
            <div className="server-card-head">
              <div className="server-avatar">
                {s.icon
                  ? <img src={`https://cdn.discordapp.com/icons/${s.guildId}/${s.icon}.png`} alt="" />
                  : s.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="server-name">{s.name}</div>
                <div className="server-meta">{s.memberCount ?? '—'} membres · {s.presenceCount ?? '—'} en ligne</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <RatingBadge averageRating={s.averageRating} reviewCount={s.reviewCount} />
                  <img
                    src={`/api/badge/${s.guildId}`}
                    alt={`Badge Bumpify de ${s.name}`}
                    height={20}
                    style={{ display: 'block' }}
                    loading="lazy"
                    onClick={(e) => e.stopPropagation()}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
              <button
                className={`filter-chip ${compareIds.includes(s.guildId) ? 'active' : ''}`}
                style={{ marginLeft: 'auto', padding: '4px 10px' }}
                title={
                  compareIds.includes(s.guildId)
                    ? 'Retirer du comparateur'
                    : compareIds.length >= MAX_COMPARE
                      ? `Maximum ${MAX_COMPARE} serveurs à comparer`
                      : 'Ajouter au comparateur'
                }
                onClick={(e) => toggleCompare(e, s.guildId)}
              >
                ⇄
              </button>
              <button
                className="filter-chip"
                style={{ padding: '4px 10px' }}
                title={favIds.includes(s.guildId) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                onClick={(e) => toggleFavorite(e, s.guildId)}
              >
                {favIds.includes(s.guildId) ? '★' : '☆'}
              </button>
            </div>
            {s.description && <p className="server-desc">{stripMarkdown(s.description)}</p>}
            {s.tags?.length > 0 && (
              <div className="server-tags">
                {s.tags.slice(0, 4).map((t) => <span className="tag-pill" key={t}>{t}</span>)}
              </div>
            )}
            <div className="server-footer">
              <span className="bump-badge"><span className="live-dot" /> {s.bumpCount} bumps</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="filter-chip"
                  style={{ padding: '3px 9px', fontSize: 11.5 }}
                  title="Signaler ce serveur"
                  onClick={(e) => { e.stopPropagation(); setReportGuildId(s.guildId); }}
                >
                  🚩
                </button>
                {s.inviteLink && (
                  <a className="join-btn" href={s.inviteLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Rejoindre</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Précédent
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} style={{ color: 'var(--text-faint)', padding: '0 4px' }}>…</span>
              ) : (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              )
            )}
          <button className="page-btn" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
            Suivant →
          </button>
        </div>
      )}

      <ServerModal server={selectedServer} onClose={() => setSelectedId(null)} />
      {reportGuildId && <ReportModal guildId={reportGuildId} onClose={() => setReportGuildId(null)} />}

      {compareIds.length > 0 && !showCompare && (
        <div className="compare-tray">
          <span className="compare-tray-label">
            {compareIds.length} serveur{compareIds.length > 1 ? 's' : ''} à comparer
          </span>
          <button
            className="join-btn"
            style={{ padding: '7px 14px' }}
            disabled={compareIds.length < 2}
            title={compareIds.length < 2 ? 'Sélectionne au moins 2 serveurs' : ''}
            onClick={() => setShowCompare(true)}
          >
            Comparer
          </button>
          <button className="filter-chip" style={{ padding: '6px 10px' }} onClick={clearCompare}>Effacer</button>
        </div>
      )}

      {showCompare && (
        <CompareModal
          servers={compareServers}
          onClose={() => setShowCompare(false)}
          onRemove={removeFromCompare}
        />
      )}
    </div>
  );
}
