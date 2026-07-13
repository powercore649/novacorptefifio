import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SiteCustomizer from '@/components/SiteCustomizer';
import AuthProvider from '@/components/AuthProvider';
import OnboardingTour from '@/components/OnboardingTour';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

const SITE_URL = 'https://zyntra.dpdns.org';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bumpify Directory — Trouvez votre prochain serveur Discord',
    template: '%s',
  },
  description: "L'annuaire des serveurs Discord propulsés par Bumpify : découvrez, comparez et rejoignez des communautés actives grâce à de vraies données en direct — membres, tags et nombre de bumps.",
  keywords: ['discord', 'serveur discord', 'annuaire discord', 'bump discord', 'bumpify'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Bumpify Directory',
    title: 'Bumpify Directory — Trouvez votre prochain serveur Discord',
    description: "Bumpify Directory est l'annuaire des serveurs Discord propulsés par Bumpify. Découvrez, comparez et rejoignez des communautés actives grâce à de vraies données en direct : membres, tags, bumps, classement et activité du réseau en temps réel.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bumpify Directory — Trouvez votre prochain serveur Discord',
    description: "Bumpify Directory est l'annuaire des serveurs Discord propulsés par Bumpify. Découvrez, comparez et rejoignez des communautés actives grâce à de vraies données en direct : membres, tags, bumps, classement et activité du réseau en temps réel.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <AuthProvider>
          {children}
          <SiteCustomizer />
          <OnboardingTour />
        </AuthProvider>
      </body>
    </html>
  );
}
