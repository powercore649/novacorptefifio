'use client';
import { useState } from 'react';

// Bloc de code avec bouton "copier" — réutilisé partout dans le centre de
// documentation pour les exemples d'URL/JSON. Reprend le style .share-btn
// déjà utilisé ailleurs sur le site (badge, partage) pour rester cohérent.
export default function CodeBlock({ code, language = 'text' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="doc-code-block">
      <div className="doc-code-block-head">
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{language}</span>
        <button className={`share-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? '✅ Copié !' : '📋 Copier'}
        </button>
      </div>
      <pre className="doc-code-block-pre"><code>{code}</code></pre>
    </div>
  );
}
