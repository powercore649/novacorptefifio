'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Rendu Markdown sécurisé des descriptions de serveur (fournies par les
// propriétaires de serveur via le bot). Pas de HTML brut autorisé (react-markdown
// ne le rend jamais par défaut, sans plugin rehype-raw) — donc pas de risque
// d'injection de script. Les images sont volontairement désactivées (remplacées
// par un simple texte) pour éviter tout abus (pixels de tracking, contenu
// inapproprié planqué dans une image). Les liens s'ouvrent dans un nouvel onglet.
export default function ServerDescription({ text, compact = false }) {
  if (!text) return null;

  return (
    <div className={`markdown-body ${compact ? 'markdown-compact' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer nofollow" />,
          img: ({ node, alt }) => (alt ? <em>[image : {alt}]</em> : <em>[image]</em>),
          h1: ({ node, ...props }) => <p className="md-heading" {...props} />,
          h2: ({ node, ...props }) => <p className="md-heading" {...props} />,
          h3: ({ node, ...props }) => <p className="md-heading" {...props} />,
          h4: ({ node, ...props }) => <p className="md-heading" {...props} />,
          h5: ({ node, ...props }) => <p className="md-heading" {...props} />,
          h6: ({ node, ...props }) => <p className="md-heading" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
