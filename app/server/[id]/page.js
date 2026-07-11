export const dynamic = 'force-dynamic';
import { fetchServers } from '@/lib/bridge';
import { computeScore, formatNumber, isTrending, isNew, timeAgo, stripMarkdown } from '@/lib/utils';
import ServerDetailClient from '@/components/ServerDetailClient';
import { notFound } from 'next/navigation';

export const revalidate = 30;

const SITE_URL = 'https://zyntra.dpdns.org';

export async function generateMetadata({ params }) {
  const servers = await fetchServers().catch(() => []);
  const server  = servers.find(s => s.guildId === params.id);
  if (!server) return { title: 'Serveur introuvable — Bumpify' };

  const title = `${server.guildName} — Bumpify Directory`;
  // Description en texte brut (sans syntaxe Markdown : "**gras**" n'a aucun
  // sens affiché tel quel dans un aperçu de lien Discord/Twitter).
  const rawDesc = stripMarkdown(server.description) || 'Serveur Discord référencé sur Bumpify Directory.';
  const description = rawDesc.length > 200 ? `${rawDesc.slice(0, 197)}...` : rawDesc;
  const pageUrl = `${SITE_URL}/server/${server.guildId}`;
  // Icône du serveur en haute résolution ; à défaut, l'icône du site sert de repli
  // pour ne jamais avoir un aperçu de lien sans image.
  const image = server.guildIcon
    ? `https://cdn.discordapp.com/icons/${server.guildId}/${server.guildIcon}.png?size=512`
    : `${SITE_URL}/apple-icon.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Bumpify Directory',
      type: 'website',
      images: [{ url: image, width: 512, height: 512, alt: server.guildName }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ServerDetailPage({ params }) {
  const servers = await fetchServers().catch(() => []);
  const server  = servers.find(s => s.guildId === params.id);
  if (!server) notFound();

  const sorted = [...servers].sort((a, b) => computeScore(b) - computeScore(a));
  const rank   = sorted.findIndex(s => s.guildId === params.id) + 1;

  return (
    <ServerDetailClient
      server={{ ...server, score: computeScore(server), rank, trending: isTrending(server), isNew: isNew(server) }}
    />
  );
}
