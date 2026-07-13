import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import HomeHero from '@/components/HomeHero';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Bumpify Directory',
  url: 'https://zyntra.dpdns.org',
  description: "Bumpify Directory est l'annuaire des serveurs Discord propulsés par Bumpify. Découvrez, comparez et rejoignez des communautés actives grâce à de vraies données en direct : membres, tags, bumps, classement et activité du réseau en temps réel.",
};

export default function DirectoryHome() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="hex-field" />
      <PublicNav current="/" />

      <HomeHero />

      <PublicFooter />
    </div>
  );
}
