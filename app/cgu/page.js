import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata = { title: 'Conditions Générales d\'Utilisation — Bumpify Directory' };

const SUPPORT_DISCORD = 'https://discord.gg/ts5mh326ew';

export default function CguPage() {
  return (
    <div>
      <div className="hex-field" />
      <PublicNav current="/cgu" />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '4vh 6vw 8vh', position: 'relative', zIndex: 1, lineHeight: 1.7, fontSize: 14.5, color: 'var(--text-dim)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
          Conditions Générales d'Utilisation (CGU)
        </h1>
        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 32 }}>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
        </p>

        <h2 style={legalH2}>1. Objet</h2>
        <p style={legalP}>
          Les présentes CGU encadrent l'utilisation de Bumpify Directory (ci-après « le Site »), un annuaire
          public de serveurs Discord alimenté par les données du bot Bumpify. En utilisant le Site, tu acceptes
          sans réserve les présentes conditions.
        </p>

        <h2 style={legalH2}>2. Description du service</h2>
        <p style={legalP}>
          Le Site affiche des informations publiques sur des serveurs Discord utilisant le bot Bumpify
          (nom, description, nombre de membres, tags, statistiques de bump) ainsi qu'un classement, des
          templates de serveur et un espace compte permettant de consulter tes propres statistiques
          (bumps, coins, XP, réputation, badges) via une connexion Discord.
        </p>

        <h2 style={legalH2}>3. Compte et connexion Discord</h2>
        <p style={legalP}>
          La connexion au Site se fait exclusivement via l'authentification Discord (OAuth2). Nous ne stockons
          jamais ton mot de passe Discord. Les informations récupérées (pseudo, avatar, email, identifiant,
          liste de tes serveurs) servent uniquement à afficher ton espace compte et ne sont ni vendues ni
          partagées avec des tiers.
        </p>

        <h2 style={legalH2}>4. Contenu des serveurs listés</h2>
        <p style={legalP}>
          Les descriptions, noms et tags des serveurs affichés sont fournis par les propriétaires de ces
          serveurs via le bot Bumpify. Le Site n'édite pas ce contenu et ne garantit pas son exactitude.
          Tout contenu illégal, trompeur, ou enfreignant les conditions d'utilisation de Discord peut être
          retiré de l'annuaire sans préavis.
        </p>

        <h2 style={legalH2}>5. Utilisation acceptable</h2>
        <p style={legalP}>Il est interdit d'utiliser le Site pour :</p>
        <ul style={legalUl}>
          <li>manipuler artificiellement les votes, bumps ou classements (scripts, faux comptes, achat de votes) ;</li>
          <li>diffuser du contenu illégal, haineux, ou portant atteinte aux droits d'autrui ;</li>
          <li>tenter d'accéder sans autorisation aux systèmes du Site ou du bot (bridge, base de données, API) ;</li>
          <li>usurper l'identité d'un tiers.</li>
        </ul>

        <h2 style={legalH2}>6. Disponibilité et responsabilité</h2>
        <p style={legalP}>
          Le Site est fourni « en l'état », sans garantie de disponibilité continue. Les statistiques affichées
          dépendent de l'activité réelle du bot Bumpify et peuvent connaître des délais de synchronisation.
          Le Site ne peut être tenu responsable des décisions prises sur la base des informations qui y sont
          affichées.
        </p>

        <h2 style={legalH2}>7. Modification des CGU</h2>
        <p style={legalP}>
          Ces CGU peuvent être mises à jour à tout moment. La date de dernière mise à jour en haut de cette
          page fait foi. L'utilisation continue du Site après modification vaut acceptation des nouvelles
          conditions.
        </p>

        <h2 style={legalH2}>8. Contact</h2>
        <p style={legalP}>
          Pour toute question concernant ces CGU, ou pour signaler un contenu problématique, rejoins notre{' '}
          <a href={SUPPORT_DISCORD} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            serveur de support Discord
          </a>.
        </p>
      </div>

      <PublicFooter />
    </div>
  );
}

const legalH2 = { fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 28, marginBottom: 8 };
const legalP = { marginBottom: 4 };
const legalUl = { paddingLeft: 20, marginBottom: 4 };
