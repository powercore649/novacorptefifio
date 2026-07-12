import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import HomeHero from '@/components/HomeHero';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Bumpify Directory',
  url: 'https://zyntra.dpdns.org',
  description: "L'annuaire des serveurs Discord propulsés par Bumpify, avec de vraies données en direct.",
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
