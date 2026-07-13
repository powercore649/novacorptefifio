'use client';
import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '@/lib/utils';

const POLL_MS = 15000; // même cadence que le reste du site (annuaire, badge, etc.)
const MAX_EVENTS = 40;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Flux d'activité en direct : ne dépend d'aucune nouvelle route côté serveur.
// On compare simplement chaque nouveau relevé de /api/servers au précédent,
// et toute variation réelle (bumpCount ou memberCount qui augmente) devient
// un événement affiché — donc 100% de vraies données, jamais simulées.
export default function ActivityFeedClient() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);
  const previousRef = useRef(null); // Map guildId -> { bumpCount, memberCount }
  const isFirstLoad = useRef(true);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch('/api/servers', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (data.error) { setError(true); return; }
        setError(false);
        setConnected(true);

        const prev = previousRef.current;

        if (prev && !isFirstLoad.current) {
          const newEvents = [];
          for (const s of data) {
            const before = prev.get(s.guildId);
            if (!before) continue; // nouveau serveur détecté depuis le dernier relevé : pas d'historique de comparaison, on ignore ce tour-ci
            const bumpDelta = (s.bumpCount || 0) - (before.bumpCount || 0);
            const memberDelta = (s.memberCount || 0) - (before.memberCount || 0);
            if (bumpDelta > 0) {
              newEvents.push({
                id: uid(), type: 'bump', name: s.name, guildId: s.guildId, delta: bumpDelta, at: Date.now(),
              });
            }
            if (memberDelta > 0) {
              newEvents.push({
                id: uid(), type: 'members', name: s.name, guildId: s.guildId, delta: memberDelta, at: Date.now(),
              });
            }
          }
          if (newEvents.length > 0) {
            setEvents((cur) => [...newEvents.reverse(), ...cur].slice(0, MAX_EVENTS));
          }
        }

        isFirstLoad.current = false;
        previousRef.current = new Map(data.map((s) => [s.guildId, { bumpCount: s.bumpCount, memberCount: s.memberCount }]));
      } catch {
        if (!cancelled) setError(true);
      }
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="feed-terminal">
      <div className="feed-terminal-head">
        <span className={`live-dot ${connected ? '' : 'feed-dot-off'}`} />
        <span>{connected ? 'Connecté au réseau Bumpify' : 'Connexion…'}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-faint)', fontSize: 11.5 }}>
          rafraîchi toutes les {POLL_MS / 1000}s
        </span>
      </div>

      <div className="feed-terminal-body">
        {error && <div className="feed-line feed-line-error">// impossible de contacter le réseau pour le moment…</div>}

        {!error && events.length === 0 && (
          <div className="feed-line feed-line-dim">// en écoute — le prochain bump ou nouveau membre apparaîtra ici en direct…</div>
        )}

        {events.map((e) => (
          <div className="feed-line" key={e.id}>
            <span className="feed-time">{new Date(e.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            {e.type === 'bump' ? (
              <span>
                <span className="feed-arrow">▸</span> <b className="feed-name">{e.name}</b> vient d'être bumpé
                {e.delta > 1 ? ` (+${e.delta})` : ''} <span className="feed-tag feed-tag-bump">BUMP</span>
              </span>
            ) : (
              <span>
                <span className="feed-arrow">▸</span> <b className="feed-name">{e.name}</b> a gagné {formatNumber(e.delta)} membre{e.delta > 1 ? 's' : ''}{' '}
                <span className="feed-tag feed-tag-members">CROISSANCE</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
