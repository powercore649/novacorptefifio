export const dynamic = 'force-dynamic';
import { fetchServers } from '@/lib/bridge';
import { computeScore, formatNumber, isTrending, isNew } from '@/lib/utils';
import LeaderboardClient from '@/components/LeaderboardClient';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const revalidate = 60;
export const metadata = { title: 'Classement — Bumpify Directory' };

export default async function LeaderboardPage() {
  const servers = await fetchServers().catch(() => []);
  const ranked  = [...servers]
    .filter(s => s.bumpCount > 0)
    .map(s => ({ ...s, score: computeScore(s), trending: isTrending(s), isNew: isNew(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);

  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/leaderboard" />
      <LeaderboardClient servers={ranked} />
      <PublicFooter />
    </div>
  );
}
