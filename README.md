# Bumpify Directory — Bêta 2.1

Annuaire public (façon Disboard) des serveurs Discord qui utilisent Bumpify, avec de vraies
données en direct, plus une page de templates de serveur Discord vérifiés.

## Pages

- **`/`** — Annuaire des serveurs : recherche, filtres par tags, tri par bumps/membres, filtre
  NSFW, popup de détails complets au clic sur une carte (bumps, streak, votes, dernier bump...).
- **`/templates`** — Templates de serveur Discord réels (`discord.new/<code>`), vérifiés
  manuellement, filtrables par catégorie.

## Personnalisation de l'interface

Un bouton ⚙ flottant (en bas à droite, sur toutes les pages) ouvre un panneau permettant à
chaque visiteur de personnaliser localement l'interface : couleur d'accent (5 thèmes) et
densité d'affichage (confortable/compacte). Ces préférences sont sauvegardées dans le
navigateur du visiteur (localStorage) — chaque personne peut avoir ses propres réglages, sans
rien envoyer au serveur.

## Comment ça marche

- Le bridge (déjà installé pour le dashboard) expose une route publique `GET /public/servers`
  qui renvoie uniquement les serveurs ayant rempli une description ou un lien d'invitation.
- Ce site interroge cette route côté serveur (`app/api/servers/route.js`), donc `BRIDGE_URL`
  reste privé (jamais exposé au navigateur).
- La page se rafraîchit toutes les 15 secondes pour garder les compteurs de bump à jour.
- Les templates vivent dans `lib/templates.js` — chaque code a été vérifié manuellement avant
  d'être ajouté.

## Déploiement sur Vercel

1. Mettez à jour votre **bridge** (dashboard-bridge) avec la version la plus récente fournie.
2. `vercel` (ou importer ce dossier comme nouveau projet sur vercel.com).
3. Seule variable d'environnement nécessaire :
   - `BRIDGE_URL` = l'adresse de votre bridge (ex: `http://de-01.rrhosting.eu:7536`)
4. Redéployez.

## Faire apparaître un serveur dans l'annuaire

Un serveur apparaît dans l'annuaire s'il a une **description** ou un **lien d'invitation**
rempli dans le dashboard (section "Bump & Réseau"). Ça se fait exclusivement depuis le
dashboard — ce site n'a pas de connexion Discord ni de formulaire de soumission.

## Ajouter un template

Vérifiez d'abord manuellement que `https://discord.new/<code>` fonctionne réellement, puis
ajoutez une entrée dans `lib/templates.js`.
