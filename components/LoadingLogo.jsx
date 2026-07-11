'use client';

export default function LoadingLogo({ label = 'Chargement…' }) {
  return (
    <div className="loading-wrap">
      <svg viewBox="0 0 100 100" className="loading-logo" width="72" height="72">
        <circle cx="50" cy="50" r="40" className="loading-ring loading-ring-track" />
        <circle cx="50" cy="50" r="40" className="loading-ring loading-ring-arc" />
        <text x="50" y="58" textAnchor="middle" className="loading-letter">B</text>
      </svg>
      <div className="loading-label">{label}</div>
    </div>
  );
}
