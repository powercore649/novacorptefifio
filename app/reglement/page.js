import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Règlement du réseau — Bumpify Directory' };

const SUPPORT_DISCORD = 'https://discord.gg/ts5mh326ew';

export default function ReglementPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/reglement" />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '4vh 6vw 8vh', position: 'relative', zIndex: 1, lineHeight: 1.7, fontSize: 14.5, color: 'var(--text-dim)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
          Règlement du réseau Bumpify
        </h1>
        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 32 }}>
          Ce règlement s'applique à tous les serveurs listés dans l'annuaire et à tous les membres du réseau de bump.
        </p>

        <h2 style={legalH2}>1. Conditions pour être listé</h2>
        <ul style={legalUl}>
          <li>Le serveur doit avoir le bot Bumpify actif et une description ou un lien d'invitation renseigné.</li>
          <li>La description doit refléter honnêtement le contenu réel du serveur.</li>
          <li>Le lien d'invitation doit rester valide ; un lien expiré peut entraîner le retrait temporaire de l'annuaire.</li>
        </ul>

        <h2 style={legalH2}>2. Contenu NSFW</h2>
        <p style={legalP}>
          Les serveurs à contenu NSFW doivent obligatoirement être déclarés comme tels via la configuration
          du bot. Un serveur NSFW non déclaré peut être blacklisté sans préavis. Les contenus impliquant des
          mineurs, même de manière suggérée, entraînent un bannissement immédiat et définitif du réseau.
        </p>

        <h2 style={legalH2}>3. Contenus et serveurs interdits</h2>
        <p style={legalP}>Sont strictement interdits sur les serveurs listés :</p>
        <ul style={legalUl}>
          <li>l'incitation à la haine, au harcèlement ou à la violence ;</li>
          <li>la promotion d'activités illégales (piratage, vente de substances illicites, fraude, etc.) ;</li>
          <li>les serveurs dont le but principal est de contourner les règles de Discord lui-même ;</li>
          <li>la désinformation présentée comme factuelle de manière délibérée.</li>
        </ul>

        <h2 style={legalH2}>4. Équité du système de bump et de vote</h2>
        <p style={legalP}>
          Le classement repose sur des bumps et votes réels. Sont interdits :
        </p>
        <ul style={legalUl}>
          <li>l'utilisation de bots ou scripts pour bumper/voter automatiquement ;</li>
          <li>la création de comptes multiples dans le but de gonfler artificiellement un score ;</li>
          <li>l'achat ou l'échange organisé de votes en dehors du fonctionnement normal du bot.</li>
        </ul>
        <p style={legalP}>
          Toute anomalie détectée peut entraîner une remise à zéro des statistiques concernées et/ou un
          retrait du réseau.
        </p>

        <h2 style={legalH2}>5. Sanctions</h2>
        <p style={legalP}>
          Selon la gravité, les sanctions vont de l'avertissement au retrait définitif du serveur de
          l'annuaire, en passant par la mise en blacklist temporaire. Les décisions sont prises au cas par
          cas par l'équipe du réseau.
        </p>

        <h2 style={legalH2}>6. Contester une décision</h2>
        <p style={legalP}>
          Si ton serveur a été retiré ou blacklisté et que tu penses qu'il s'agit d'une erreur, tu peux faire
          appel directement sur notre{' '}
          <a href={SUPPORT_DISCORD} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            serveur de support Discord
          </a>{' '}
          — explique la situation dans le salon prévu à cet effet, une décision te sera communiquée après
          vérification.
        </p>
      </div>

      <PublicFooter />
    </div>
  );
}

const legalH2 = { fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 8 };
const legalP = { marginBottom: 4 };
const legalUl = { paddingLeft: 20, marginBottom: 4 };
