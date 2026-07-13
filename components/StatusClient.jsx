'use client';
import { useEffect, useState } from 'react';

const STATUS_LABELS = {
  operational: 'Opérationnel',
  degraded: 'Performances dégradées',
  outage: 'Panne',
  unknown: 'Statut inconnu',
};

const OVERALL_LABELS = {
  operational: '✅ Tous les systèmes sont opérationnels',
  degraded: '⚠️ Certains services rencontrent des perturbations',
  outage: '🔴 Panne en cours sur au moins un service',
};

// Vérifie l'état des services en temps réel (bridge Bumpify + API Discord
// officielle) via /api/status, et se rafraîchit automatiquement.
export default function StatusClient() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const load = () => {
    fetch('/api/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { setData(d); setError(false); })
      .catch(() => setError(true));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // les statuts peuvent changer vite, on revérifie toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const checkedTime = data?.checkedAt
    ? new Date(data.checkedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <main>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '4vh 6vw 2vh', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>🟢 Statut des services</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
          Vérification en direct du bridge Bumpify et de l'API Discord officielle.
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 6vw 8vh', position: 'relative', zIndex: 1 }}>
        {error && <div className="empty-state">Impossible de vérifier le statut pour le moment.</div>}

        {!error && !data && <div className="empty-state">Vérification en cours…</div>}

        {data && (
          <>
            <div className={`status-overall status-overall-${data.overall}`}>
              {OVERALL_LABELS[data.overall] || OVERALL_LABELS.degraded}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
              {data.services.map((s) => (
                <div className="status-row" key={s.key}>
                  <span className={`status-dot status-dot-${s.status}`} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    {s.detail && <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>{s.detail}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className={`status-label status-label-${s.status}`}>{STATUS_LABELS[s.status] || s.status}</div>
                    {s.latencyMs != null && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{s.latencyMs} ms</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {checkedTime && (
              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 18, textAlign: 'center' }}>
                Dernière vérification à {checkedTime} · rafraîchi automatiquement toutes les 30 secondes
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
