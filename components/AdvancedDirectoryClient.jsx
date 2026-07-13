'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { favorites, stripMarkdown, savedSearches, formatNumber } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';
import ServerModal from '@/components/ServerModal';
import LoadingLogo from '@/components/LoadingLogo';
import RatingBadge from '@/components/RatingBadge';

// Recherche avancée : sélection de PLUSIEURS tags à la fois (logique ET —
// un serveur doit avoir tous les tags cochés, contrairement à l'annuaire
// standard qui ne filtre que sur un seul tag), une plage précise de membres
// et de bumps, et des recherches sauvegardées en local. L'état des filtres
// est aussi reflété dans l'URL pour pouvoir partager un lien de recherche.
export default function AdvancedDirectoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [servers, setServers] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(() => searchParams?.get('q') || '');
  const [tags, setTags] = useState(() => (searchParams?.get('tags') || '').split(',').filter(Boolean));
  const [minMembers, setMinMembers] = useState(() => searchParams?.get('minM') || '');
  const [maxMembers, setMaxMembers] = useState(() => searchParams?.get('maxM') || '');
  const [minBumps, setMinBumps] = useState(() => searchParams?.get('minB') || '');
  const [langFilter, setLangFilter] = useState(() => searchParams?.get('lang') || '');
  const [sort, setSort] = useState(() => searchParams?.get('sort') || 'bumps');
  const [favIds, setFavIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    setFavIds(favorites.get());
    setSaved(savedSearches.getAll());
  }, []);

  useEffect(() => {
    fetch('/api/servers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setServers(data);
      })
      .catch(() => setError('network_error'));
  }, []);

  // Reflète les filtres actifs dans l'URL (sans recharger la page) pour que
  // la recherche soit copiable/partageable telle quelle.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (tags.length) params.set('tags', tags.join(','));
    if (minMembers) params.set('minM', minMembers);
    if (maxMembers) params.set('maxM', maxMembers);
    if (minBumps) params.set('minB', minBumps);
    if (langFilter) params.set('lang', langFilter);
    if (sort !== 'bumps') params.set('sort', sort);
    const qs = params.toString();
    router.replace(qs ? `/recherche-avancee?${qs}` : '/recherche-avancee', { scroll: false });
  }, [query, tags, minMembers, maxMembers, minBumps, langFilter, sort, router]);

  const toggleTag = (t) => {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const toggleFavorite = (e, guildId) => {
    e.stopPropagation();
    favorites.toggle(guildId);
    setFavIds(favorites.get());
  };

  const resetFilters = () => {
    setQuery(''); setTags([]); setMinMembers(''); setMaxMembers(''); setMinBumps(''); setLangFilter(''); setSort('bumps');
  };

  const availableLangs = useMemo(() => {
    const set = new Set();
    (servers || []).forEach((s) => { if (s.language) set.add(s.language); });
    return Array.from(set).sort();
  }, [servers]);

  const filtered = useMemo(() => {
    if (!servers) return [];
    let list = servers.filter((s) => !s.nsfw);
    if (tags.length) list = list.filter((s) => tags.every((t) => (s.tags || []).includes(t)));
    if (minMembers) list = list.filter((s) => (s.memberCount || 0) >= Number(minMembers));
    if (maxMembers) list = list.filter((s) => (s.memberCount || 0) <= Number(maxMembers));
    if (minBumps) list = list.filter((s) => (s.bumpCount || 0) >= Number(minBumps));
    if (langFilter) list = list.filter((s) => s.language === langFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === 'bumps') sorted.sort((a, b) => (b.bumpCount || 0) - (a.bumpCount || 0));
    else if (sort === 'members') sorted.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
    else if (sort === 'alpha') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [servers, query, tags, minMembers, maxMembers, minBumps, langFilter, sort]);

  const selectedServer = useMemo(
    () => (servers || []).find((s) => s.guildId === selectedId) || null,
    [servers, selectedId]
  );

  const currentFilters = { query, tags, minMembers, maxMembers, minBumps, langFilter, sort };
  const hasActiveFilters = query || tags.length || minMembers || maxMembers || minBumps || langFilter;

  const handleSave = () => {
    if (!saveName.trim()) return;
    setSaved(savedSearches.save(saveName, currentFilters));
    setSaveName('');
  };

  const loadSaved = (s) => {
    const f = s.filters || {};
    setQuery(f.query || ''); setTags(f.tags || []); setMinMembers(f.minMembers || '');
    setMaxMembers(f.maxMembers || ''); setMinBumps(f.minBumps || ''); setLangFilter(f.langFilter || '');
    setSort(f.sort || 'bumps');
  };

  const removeSaved = (id) => setSaved(savedSearches.remove(id));

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  return (
    <div>
      <div className="adv-search-panel">
        <div className="adv-search-row">
          <input
            className="search-input"
            placeholder="Nom ou description du serveur…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="bumps">Plus bumpés</option>
            <option value="members">Plus de membres</option>
            <option value="alpha">Ordre alphabétique</option>
          </select>
        </div>

        <div className="adv-search-row">
          <label className="adv-field">
            <span>Membres — min</span>
            <input type="number" min="0" className="filter-select" value={minMembers} onChange={(e) => setMinMembers(e.target.value)} placeholder="0" />
          </label>
          <label className="adv-field">
            <span>Membres — max</span>
            <input type="number" min="0" className="filter-select" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} placeholder="Illimité" />
          </label>
          <label className="adv-field">
            <span>Bumps — min</span>
            <input type="number" min="0" className="filter-select" value={minBumps} onChange={(e) => setMinBumps(e.target.value)} placeholder="0" />
          </label>
          <label className="adv-field">
            <span>Langue</span>
            <select className="filter-select" value={langFilter} onChange={(e) => setLangFilter(e.target.value)}>
              <option value="">Toutes</option>
              {availableLangs.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </label>
        </div>

        <div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 8 }}>
            Catégories (plusieurs sélectionnables — le serveur doit correspondre à toutes)
          </div>
          <div className="filters-bar" style={{ margin: 0 }}>
            {CATEGORIES.map((c) => (
              <button key={c} className={`filter-chip ${tags.includes(c) ? 'active' : ''}`} onClick={() => toggleTag(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="adv-search-actions">
          <button className="filter-chip" onClick={resetFilters}>♻️ Réinitialiser</button>
          <button className="filter-chip" onClick={copyLink}>🔗 Copier le lien de cette recherche</button>
          <div style={{ flex: 1 }} />
          <input
            className="search-input"
            placeholder="Nom de la recherche…"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            style={{ maxWidth: 220 }}
          />
          <button className="join-btn" style={{ padding: '8px 14px' }} disabled={!saveName.trim()} onClick={handleSave}>
            💾 Sauvegarder
          </button>
        </div>

        {saved.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-faint)', margin: '4px 0 8px' }}>Recherches sauvegardées</div>
            <div className="filters-bar" style={{ margin: 0 }}>
              {saved.map((s) => (
                <div key={s.id} className="adv-saved-chip">
                  <button className="filter-chip" style={{ border: 'none', padding: '4px 6px' }} onClick={() => loadSaved(s)}>
                    {s.name}
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '0 6px' }}
                    title="Supprimer cette recherche"
                    onClick={() => removeSaved(s.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ margin: '18px 0 10px', fontSize: 13, color: 'var(--text-dim)' }}>
        {servers === null && !error ? 'Chargement…' : `${formatNumber(filtered.length)} serveur${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`}
        {hasActiveFilters && servers !== null && ' (filtres actifs)'}
      </div>

      <div className="directory-grid">
        {error && <div className="empty-state">Impossible de charger l'annuaire pour le moment.</div>}
        {!error && servers === null && <LoadingLogo label="Chargement des serveurs…" />}
        {!error && servers !== null && filtered.length === 0 && (
          <div className="empty-state">Aucun serveur ne correspond à ces critères. Essaie d'élargir ta recherche.</div>
        )}
        {filtered.map((s) => (
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
                <RatingBadge averageRating={s.averageRating} reviewCount={s.reviewCount} />
              </div>
              <button
                className="filter-chip"
                style={{ marginLeft: 'auto', padding: '4px 10px' }}
                title={favIds.includes(s.guildId) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                onClick={(e) => toggleFavorite(e, s.guildId)}
              >
                {favIds.includes(s.guildId) ? '★' : '☆'}
              </button>
            </div>
            {s.description && <p className="server-desc">{stripMarkdown(s.description)}</p>}
            {s.tags?.length > 0 && (
              <div className="server-tags">
                {s.tags.slice(0, 4).map((t) => (
                  <span className={`tag-pill ${tags.includes(t) ? 'active' : ''}`} key={t}>{t}</span>
                ))}
              </div>
            )}
            <div className="server-footer">
              <span className="bump-badge"><span className="live-dot" /> {s.bumpCount} bumps</span>
              {s.inviteLink && (
                <a className="join-btn" href={s.inviteLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Rejoindre</a>
              )}
            </div>
          </div>
        ))}
      </div>

      <ServerModal server={selectedServer} onClose={() => setSelectedId(null)} />
    </div>
  );
}
