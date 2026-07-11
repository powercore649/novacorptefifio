'use client';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

const REPORT_REASONS = [
  { value: 'nsfw_not_tagged', label: 'Contenu NSFW non déclaré' },
  { value: 'scam', label: 'Arnaque / phishing' },
  { value: 'hate_speech', label: 'Haine / harcèlement' },
  { value: 'illegal', label: 'Contenu illégal' },
  { value: 'fake_description', label: 'Description trompeuse' },
  { value: 'other', label: 'Autre' },
];

// Modale de signalement partagée par toutes les cartes/fiches serveur du
// site. `guildId` = serveur concerné, `onClose` = callback de fermeture.
export default function ReportModal({ guildId, onClose }) {
  const { status } = useSession();
  const [reason, setReason] = useState(REPORT_REASONS[0].value);
  const [details, setDetails] = useState('');
  const [reportStatus, setReportStatus] = useState('idle'); // idle | sending | sent | error

  const submit = async () => {
    if (status !== 'authenticated') { signIn('discord'); return; }
    setReportStatus('sending');
    try {
      const r = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, reason, details }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'failed');
      setReportStatus('sent');
      setTimeout(() => onClose(), 1800);
    } catch {
      setReportStatus('error');
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, maxWidth: 440, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>🚩 Signaler ce serveur</div>
        {status !== 'authenticated' ? (
          <>
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', marginBottom: 16 }}>
              Connecte-toi avec Discord pour signaler un serveur.
            </p>
            <button className="discord-btn" onClick={() => signIn('discord')}>Se connecter avec Discord</button>
          </>
        ) : reportStatus === 'sent' ? (
          <p style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>✅ Signalement envoyé, merci — l'équipe va l'examiner.</p>
        ) : (
          <>
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', marginBottom: 14 }}>
              Explique ce qui ne va pas sur ce serveur. Vois aussi le{' '}
              <a href="/reglement" style={{ color: 'var(--accent)' }}>règlement</a> pour ce qui est concerné.
            </p>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="sort-select"
              style={{ width: '100%', marginBottom: 10 }}
            >
              {REPORT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 500))}
              placeholder="Détails (optionnel, 500 caractères max)"
              rows={3}
              className="search-input"
              style={{ width: '100%', marginBottom: 14, resize: 'vertical' }}
            />
            {reportStatus === 'error' && (
              <p style={{ fontSize: 12.5, color: '#f87171', marginBottom: 10 }}>
                Une erreur est survenue (peut-être un signalement déjà envoyé récemment). Réessaie plus tard.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="filter-chip" onClick={onClose}>Annuler</button>
              <button className="share-btn" disabled={reportStatus === 'sending'} onClick={submit}>
                {reportStatus === 'sending' ? 'Envoi…' : 'Envoyer le signalement'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
