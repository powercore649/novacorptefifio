import { fetchServers } from '@/lib/bridge';
import { CATEGORIES } from '@/lib/categories';

// Régénéré au maximum toutes les heures — pas besoin de le refaire à chaque
// requête, la liste des serveurs ne change pas assez vite pour ça.
export const revalidate = 3600;

const SITE_URL = 'https://zyntra.dpdns.org';

export default async function sitemap() {
  const staticRoutes = ['', '/annuaire', '/recherche-avancee', '/activite', '/leaderboard', '/trending', '/new', '/decouverte', '/stats', '/status', '/documentation', '/templates', '/faq', '/cgu', '/reglement', '/a-propos', '/changelog', '/partenaires', '/tags'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
  }));

  const tagRoutes = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/tag/${encodeURIComponent(c)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
  }));

  let serverRoutes = [];
  try {
    const servers = await fetchServers();
    serverRoutes = servers.map((s) => ({
      url: `${SITE_URL}/server/${s.guildId}`,
      lastModified: s.lastBump ? new Date(s.lastBump) : new Date(),
      changeFrequency: 'daily',
    }));
  } catch {
    // Bridge injoignable au moment de la génération : le sitemap garde au
    // moins les pages statiques plutôt que de planter entièrement.
  }

  return [...staticRoutes, ...tagRoutes, ...serverRoutes];
}
