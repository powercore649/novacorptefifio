'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import LoadingLogo from '@/components/LoadingLogo';
import { formatNumber, profileCustom, PROFILE_BANNER_COLORS, prefs } from '@/lib/utils';

const DISCORD_GUILDS_PREVIEW_COUNT = 12;

export default function AccountClient() {
  const { data: session, status } = useSession();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [showAllGuilds, setShowAllGuilds] = useState(false);
  const [openMembersFor, setOpenMembersFor] = useState(null);
  const [membersCache, setMembersCache] = useState({}); // guildId -> { loading, error, members }
  const [section, setSection] = useState('profil'); // 'profil' | 'serveurs' | 'discord' | 'personnaliser'
  const [idCopied, setIdCopied] = useState(false);
  const [customProfile, setCustomProfile] = useState({});
  const [form, setForm] = useState({ displayName: '', status: '', bio: '', pronouns: '', bannerColor: '' });
  const [sitePrefs, setSitePrefs] = useState({ reduceMotion: false, defaultHideNsfw: true });

  useEffect(() => {
    setSitePrefs(prefs.get());
  }, []);

  const togglePref = (key) => {
    const next = prefs.set({ [key]: !sitePrefs[key] });
    setSitePrefs(next);
    window.dispatchEvent(new Event('bumpify:prefs-updated'));
  };

  useEffect(() => {
    const c = profileCustom.get();
    setCustomProfile(c);
    setForm({
      displayName: c.displayName || '',
      status: c.status || '',
      bio: c.bio || '',
      pronouns: c.pronouns || '',
      bannerColor: c.bannerColor || '',
    });
  }, []);

  const saveProfile = () => {
    const next = profileCustom.set(form);
    setCustomProfile(next);
    window.dispatchEvent(new Event('bumpify:profile-updated'));
  };

  const resetProfile = () => {
    profileCustom.reset();
    setCustomProfile({});
    setForm({ displayName: '', status: '', bio: '', pronouns: '', bannerColor: '' });
    window.dispatchEvent(new Event('bumpify:profile-updated'));
  };

  const copyId = async () => {
    if (!session?.user?.discordId) return;
    await navigator.clipboard.writeText(session.user.discordId).catch(() => {});
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  };

  const toggleMembers = async (guildId) => {
    if (openMembersFor === guildId) { setOpenMembersFor(null); return; }
    setOpenMembersFor(guildId);
    if (membersCache[guildId]) return; // déjà chargé

    setMembersCache((c) => ({ ...c, [guildId]: { loading: true, error: null, members: [] } }));
    try {
      const r = await fetch(`/api/account/members/${guildId}`, { cache: 'no-store' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'fetch_failed');
      setMembersCache((c) => ({ ...c, [guildId]: { loading: false, error: null, members: data.members || [] } }));
    } catch (err) {
      setMembersCache((c) => ({ ...c, [guildId]: { loading: false, error: err.message, members: [] } }));
    }
  };

  const load = () => {
    fetch('/api/account', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setAccount(data);
        setError(null);
        setLastSync(new Date());
      })
      .catch(() => setError('network_error'));
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [status]);

  const sortedGuilds = useMemo(
    () => account?.guilds ? [...account.guilds].sort((a, b) => b.bumps - a.bumps) : [],
    [account]
  );

  const exportData = () => {
    if (!account) return;
    const blob = new Blob([JSON.stringify(account, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bumpify-mes-donnees-${session?.user?.discordId || 'compte'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => {
    if (!account?.guilds?.length) return null;
    return account.guilds.reduce(
      (acc, g) => ({
        bumps: acc.bumps + g.bumps,
        coins: acc.coins + g.coins,
        totalXp: acc.totalXp + g.totalXp,
        reputation: acc.reputation + g.reputation,
        badges: acc.badges + (g.badges?.length || 0),
        bestStreak: Math.max(acc.bestStreak, g.streak),
      }),
      { bumps: 0, coins: 0, totalXp: 0, reputation: 0, badges: 0, bestStreak: 0 }
    );
  }, [account]);

  if (status === 'loading') {
    return <LoadingLogo label="Chargement de la session…" />;
  }

  if (status !== 'authenticated') {
    return (
      <div className="empty-state" style={{ maxWidth: 480, margin: '10vh auto', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
        <p style={{ marginBottom: 16 }}>Connecte-toi avec Discord pour voir ton compte.</p>
        <button className="discord-btn" style={{ margin: '0 auto' }} onClick={() => signIn('discord')}>
          Se connecter avec Discord
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
      {/* En-tête profil — bannière + avatar, façon carte de profil Discord */}
      <div
        style={{
          marginBottom: 28, borderRadius: 'var(--radius)', overflow: 'hidden',
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            height: 120,
            background: customProfile.bannerColor
              ? customProfile.bannerColor
              : (session.user?.bannerUrl
                ? `url(${session.user.bannerUrl}) center/cover no-repeat`
                : (session.user?.accentColor || 'var(--accent)')),
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px 20px', marginTop: -32, flexWrap: 'wrap' }}>
          {session.user?.image && (
            <img
              src={session.user.image}
              alt=""
              className="account-avatar-ring"
              style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 180, paddingTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {customProfile.displayName || session.user?.name}
              {customProfile.pronouns && (
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-faint)' }}>· {customProfile.pronouns}</span>
              )}
            </div>
            {customProfile.status && (
              <div style={{ fontSize: 13, color: 'var(--line)', marginTop: 2 }}>{customProfile.status}</div>
            )}
            {session.user?.email && (
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>{session.user.email}</div>
            )}
            {session.user?.discordId && (
              <button
                className="mono"
                onClick={copyId}
                style={{
                  fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6,
                }}
                title="Copier l'ID"
              >
                ID Discord : {session.user.discordId} {idCopied ? '✅' : '📋'}
              </button>
            )}
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span className={`live-dot ${error ? 'feed-dot-off' : ''}`} />
              {error
                ? 'Statistiques Bumpify indisponibles pour le moment'
                : (lastSync ? `Synchronisé à ${lastSync.toLocaleTimeString('fr-FR')}` : 'Synchronisation…')}
            </div>
          </div>
          {totals && (
            <div style={{ fontSize: 13, color: 'var(--text-dim)', paddingTop: 8 }}>
              Actif sur <strong style={{ color: 'var(--accent)' }}>{account.guilds.length}</strong> serveur{account.guilds.length > 1 ? 's' : ''} du réseau
            </div>
          )}
        </div>
      </div>

      {/* Mise en page façon "Paramètres Discord" : sidebar de navigation + panneau de contenu.
          Toujours affichée dès qu'on est connecté — indépendante du chargement/de la
          disponibilité des statistiques Bumpify (bridge), qui ne concernent que
          certaines sections (Mes serveurs, Serveurs Discord). */}
      <div className="account-layout">
        <nav className="account-sidebar">
          <div className="account-sidebar-label">Mon compte</div>
          <button className={`account-sidebar-item ${section === 'profil' ? 'active' : ''}`} onClick={() => setSection('profil')}>
            👤 Profil
          </button>
          <button className={`account-sidebar-item ${section === 'serveurs' ? 'active' : ''}`} onClick={() => setSection('serveurs')}>
            🚀 Mes serveurs Bumpify
          </button>
          <button className={`account-sidebar-item ${section === 'discord' ? 'active' : ''}`} onClick={() => setSection('discord')}>
            💬 Serveurs Discord
          </button>
          <div className="account-sidebar-label">Personnalisation</div>
          <button className={`account-sidebar-item ${section === 'personnaliser' ? 'active' : ''}`} onClick={() => setSection('personnaliser')}>
            🎨 Personnaliser mon profil
          </button>
          <div className="account-sidebar-label">Données</div>
          <button className="account-sidebar-item" onClick={exportData} disabled={!account}>
            ⬇️ Exporter mes données
          </button>
        </nav>

        <div className="account-content">
          {(section === 'serveurs' || section === 'discord') && error && (
            <div className="empty-state">
              Impossible de charger tes statistiques Bumpify pour le moment. Nouvel essai automatique dans 15s.
              <br />Le reste de ton profil reste disponible normalement pendant ce temps.
            </div>
          )}

          {(section === 'serveurs' || section === 'discord') && !error && account === null && (
            <LoadingLogo label="Chargement de tes statistiques…" />
          )}

          {account?.guilds?.length === 0 && section === 'serveurs' && (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              Aucune activité détectée sur un serveur du réseau Bumpify pour l'instant.
                <br />Bump un serveur ou discute un peu pour voir apparaître tes stats ici.
              </div>
            )}

            {section === 'profil' && (
              <div>
                {customProfile.bio && (
                  <div className="account-info-row">
                    <div style={{ flex: 1 }}>
                      <div className="account-info-row-label">À propos de moi</div>
                      <div className="account-info-row-value" style={{ whiteSpace: 'pre-wrap' }}>{customProfile.bio}</div>
                    </div>
                  </div>
                )}
                <div className="account-info-row">
                  <div style={{ flex: 1 }}>
                    <div className="account-info-row-label">Nom d'utilisateur Discord</div>
                    <div className="account-info-row-value">{session.user?.name}</div>
                  </div>
                </div>
                {session.user?.email && (
                  <div className="account-info-row">
                    <div style={{ flex: 1 }}>
                      <div className="account-info-row-label">Email</div>
                      <div className="account-info-row-value">{session.user.email}</div>
                    </div>
                  </div>
                )}
                <div className="account-info-row">
                  <div style={{ flex: 1 }}>
                    <div className="account-info-row-label">ID Discord</div>
                    <div className="account-info-row-value mono">{session.user?.discordId}</div>
                  </div>
                  <button className="filter-chip" onClick={copyId}>{idCopied ? '✅ Copié' : '📋 Copier'}</button>
                </div>

                {totals && (
                  <>
                    <div style={{ marginTop: 26, marginBottom: 14, fontSize: 13, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Statistiques cumulées sur le réseau
                    </div>
                    <div className="stats-banner" style={{ padding: 0, maxWidth: 'none' }}>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{formatNumber(totals.bumps)}</div>
                        <div className="stat-chip-label">🚀 Bumps au total</div>
                      </div>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{formatNumber(totals.coins)}</div>
                        <div className="stat-chip-label">🪙 Coins au total</div>
                      </div>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{formatNumber(totals.totalXp)}</div>
                        <div className="stat-chip-label">⚡ XP cumulée</div>
                      </div>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{totals.bestStreak}</div>
                        <div className="stat-chip-label">🔥 Meilleur streak</div>
                      </div>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{totals.badges}</div>
                        <div className="stat-chip-label">🏅 Badges obtenus</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {section === 'serveurs' && sortedGuilds.length > 0 && (
              <div className="directory-grid" style={{ padding: 0 }}>
                {sortedGuilds.map((g) => (
                  <div className="server-card" key={g.guildId} style={{ cursor: 'default' }}>
                    <div className="server-card-head">
                      <div className="server-avatar">
                        {g.guildIcon
                          ? <img src={`https://cdn.discordapp.com/icons/${g.guildId}/${g.guildIcon}.png`} alt="" />
                          : g.guildName.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="server-name">{g.guildName}</div>
                        <div className="server-meta">{formatNumber(g.totalXp)} XP</div>
                      </div>
                      <span
                        className="filter-chip active"
                        style={{ cursor: 'default', flexShrink: 0, padding: '4px 12px' }}
                        title="Niveau"
                      >
                        Niv. {g.level}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{formatNumber(g.bumps)}</div>
                        <div className="stat-chip-label">🚀 Bumps {g.rank ? `· #${g.rank}` : ''}</div>
                      </div>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{g.streak}</div>
                        <div className="stat-chip-label">🔥 Streak</div>
                      </div>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{formatNumber(g.coins)}</div>
                        <div className="stat-chip-label">🪙 Coins</div>
                      </div>
                      <div className="stat-chip">
                        <div className="stat-chip-num">{formatNumber(g.reputation)}</div>
                        <div className="stat-chip-label">⭐ Réputation</div>
                      </div>
                    </div>

                    {g.lastBump && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 8 }}>
                        Dernier bump : {new Date(g.lastBump).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}

                    {g.badges?.length > 0 && (
                      <div className="server-tags" style={{ marginTop: 10 }}>
                        {g.badges.map((b) => (
                          <span
                            key={b.name}
                            className="tag-pill"
                            style={{ borderColor: b.color, color: b.color }}
                            title={b.name}
                          >
                            {b.emoji} {b.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="server-footer">
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        {g.weeklyBumps} bump{g.weeklyBumps !== 1 ? 's' : ''} cette semaine
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="filter-chip" style={{ fontSize: 12 }} onClick={() => toggleMembers(g.guildId)}>
                          {openMembersFor === g.guildId ? 'Masquer les membres' : '👥 Voir les membres'}
                        </button>
                        <a className="join-btn" href={`/server/${g.guildId}`}>Voir le serveur →</a>
                      </div>
                    </div>

                    {openMembersFor === g.guildId && (
                      <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                        {membersCache[g.guildId]?.loading && (
                          <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Chargement des membres…</div>
                        )}
                        {membersCache[g.guildId]?.error === 'missing_intent' && (
                          <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
                            La liste des membres n'est pas disponible pour ce serveur (intent Discord requis non activé côté bot).
                          </div>
                        )}
                        {membersCache[g.guildId]?.error && membersCache[g.guildId]?.error !== 'missing_intent' && (
                          <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
                            Impossible de charger les membres pour le moment.
                          </div>
                        )}
                        {membersCache[g.guildId]?.members?.length > 0 && (
                          <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginBottom: 4 }}>
                              {membersCache[g.guildId].members.length} membre{membersCache[g.guildId].members.length !== 1 ? 's' : ''}
                            </div>
                            {membersCache[g.guildId].members.map((m) => (
                              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="server-avatar" style={{ width: 26, height: 26, fontSize: 10, flexShrink: 0 }}>
                                  {m.avatar ? <img src={m.avatar} alt="" /> : (m.globalName || m.username).slice(0, 2).toUpperCase()}
                                </div>
                                <span style={{ fontSize: 13 }}>{m.nickname || m.globalName || m.username}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section === 'discord' && account?.discordGuilds?.length > 0 && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Tes serveurs Discord ({account.discordGuilds.length})
                </h2>
                <div className="directory-list" style={{ padding: 0, maxWidth: 'none', margin: 0 }}>
                  {(showAllGuilds ? account.discordGuilds : account.discordGuilds.slice(0, DISCORD_GUILDS_PREVIEW_COUNT)).map((g) => (
                    <div className="server-row" style={{ cursor: g.onBumpify ? 'pointer' : 'default' }} key={g.guildId}
                      onClick={() => { if (g.onBumpify) window.location.href = `/server/${g.guildId}`; }}
                    >
                      <div className="server-avatar" style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}>
                        {g.icon ? <img src={g.icon} alt="" /> : g.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="server-row-info">
                        <div className="server-row-name">{g.name}</div>
                        {g.owner && <div className="server-row-desc">Tu es propriétaire de ce serveur</div>}
                      </div>
                      <span
                        className={`filter-chip ${g.onBumpify ? 'active' : ''}`}
                        style={{ cursor: 'default', flexShrink: 0, fontSize: 11.5, padding: '4px 10px' }}
                      >
                        {g.onBumpify ? '✅ Sur Bumpify' : 'Pas encore sur Bumpify'}
                      </span>
                    </div>
                  ))}
                </div>
                {account.discordGuilds.length > DISCORD_GUILDS_PREVIEW_COUNT && (
                  <button
                    className="filter-chip"
                    style={{ marginTop: 14 }}
                    onClick={() => setShowAllGuilds((v) => !v)}
                  >
                    {showAllGuilds ? 'Réduire' : `Voir les ${account.discordGuilds.length - DISCORD_GUILDS_PREVIEW_COUNT} autres serveurs`}
                  </button>
                )}
              </div>
            )}
            {section === 'personnaliser' && (
              <div>
                <div className="empty-state" style={{ textAlign: 'left', marginBottom: 20, padding: '14px 18px' }}>
                  ℹ️ Ces informations sont enregistrées uniquement sur cet appareil (ton navigateur). Elles ne
                  modifient pas ton vrai profil Discord et ne sont visibles par personne d'autre.
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 14 }}>
                  Profil affiché sur le site
                </div>

                <label style={{ display: 'block', marginBottom: 16 }}>
                  <div className="account-info-row-label" style={{ marginBottom: 6 }}>Pseudo affiché sur le site</div>
                  <input
                    className="search-input"
                    style={{ width: '100%' }}
                    placeholder={session.user?.name}
                    value={form.displayName}
                    maxLength={32}
                    onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  />
                </label>

                <label style={{ display: 'block', marginBottom: 16 }}>
                  <div className="account-info-row-label" style={{ marginBottom: 6 }}>Statut personnalisé</div>
                  <input
                    className="search-input"
                    style={{ width: '100%' }}
                    placeholder="Ex : 🚀 En train de bump mes serveurs préférés"
                    value={form.status}
                    maxLength={60}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  />
                </label>

                <label style={{ display: 'block', marginBottom: 16 }}>
                  <div className="account-info-row-label" style={{ marginBottom: 6 }}>Pronoms</div>
                  <input
                    className="search-input"
                    style={{ width: '100%', maxWidth: 240 }}
                    placeholder="Ex : elle/il/iel"
                    value={form.pronouns}
                    maxLength={20}
                    onChange={(e) => setForm((f) => ({ ...f, pronouns: e.target.value }))}
                  />
                </label>

                <label style={{ display: 'block', marginBottom: 20 }}>
                  <div className="account-info-row-label" style={{ marginBottom: 6 }}>
                    À propos de moi ({form.bio.length}/190)
                  </div>
                  <textarea
                    className="search-input"
                    style={{ width: '100%', minHeight: 90, resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Quelques mots sur toi…"
                    value={form.bio}
                    maxLength={190}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                </label>

                <div style={{ marginBottom: 24 }}>
                  <div className="account-info-row-label" style={{ marginBottom: 8 }}>Couleur de bannière</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {PROFILE_BANNER_COLORS.map((c) => (
                      <button
                        key={c.name}
                        title={c.name}
                        onClick={() => setForm((f) => ({ ...f, bannerColor: c.value }))}
                        style={{
                          width: 40, height: 40, borderRadius: '50%', background: c.value, cursor: 'pointer',
                          border: form.bannerColor === c.value ? '3px solid var(--text)' : '3px solid transparent',
                        }}
                      />
                    ))}
                    <button
                      title="Utiliser la bannière Discord d'origine"
                      onClick={() => setForm((f) => ({ ...f, bannerColor: '' }))}
                      className="filter-chip"
                      style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 30, marginBottom: 14, fontSize: 13, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Préférences du site
                </div>

                <div className="account-info-row" style={{ cursor: 'pointer' }} onClick={() => togglePref('reduceMotion')}>
                  <div style={{ flex: 1 }}>
                    <div className="account-info-row-label">Réduire les animations</div>
                    <div className="account-info-row-value" style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
                      Désactive les effets de glow et transitions (accessibilité)
                    </div>
                  </div>
                  <span className={`filter-chip ${sitePrefs.reduceMotion ? 'active' : ''}`}>
                    {sitePrefs.reduceMotion ? 'Activé' : 'Désactivé'}
                  </span>
                </div>

                <div className="account-info-row" style={{ cursor: 'pointer' }} onClick={() => togglePref('defaultHideNsfw')}>
                  <div style={{ flex: 1 }}>
                    <div className="account-info-row-label">Masquer le contenu NSFW par défaut</div>
                    <div className="account-info-row-value" style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
                      S'applique à chaque nouvelle visite de l'annuaire
                    </div>
                  </div>
                  <span className={`filter-chip ${sitePrefs.defaultHideNsfw ? 'active' : ''}`}>
                    {sitePrefs.defaultHideNsfw ? 'Activé' : 'Désactivé'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button className="join-btn" onClick={saveProfile}>💾 Enregistrer le profil</button>
                  <button className="filter-chip" onClick={resetProfile}>♻️ Réinitialiser le profil</button>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
