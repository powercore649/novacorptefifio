export const dynamic = 'force-dynamic';
import { fetchServers } from '@/lib/bridge';
import CollectionsClient from '@/components/CollectionsClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const revalidate = 60;
export const metadata = { title: 'Mes collections — Bumpify Directory' };

export default async function CollectionsPage() {
  const servers = await fetchServers().catch(() => []);

  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/collections" />
      <CollectionsClient servers={servers} />
      <PublicFooter />
    </div>
  );
}
