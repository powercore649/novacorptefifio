import StatsClient from '@/components/StatsClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
export const revalidate = 60;
export const metadata = { title: 'Statistiques — Bumpify Directory' };
export default function StatsPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/stats" />
      <StatsClient />
      <PublicFooter />
    </div>
  );
}
