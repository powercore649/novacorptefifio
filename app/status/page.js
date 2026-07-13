import StatusClient from '@/components/StatusClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Statut des services — Bumpify Directory' };

export default function StatusPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/status" />
      <StatusClient />
      <PublicFooter />
    </div>
  );
}
