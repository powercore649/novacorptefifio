// Liste des templates Discord vérifiés manuellement (lien discord.new/<code> testé et fonctionnel).
// Pour en ajouter un nouveau : vérifiez d'abord que https://discord.new/<code> fonctionne réellement,
// puis ajoutez une entrée ici. Ne jamais ajouter un code non testé.
export const TEMPLATES = [
  {
    name: "Developer's Community",
    code: 'ESEmMcDaPHfA',
    category: 'Coding',
    description: 'Serveur complet pour une communauté de développeurs : support bot, exemples API, projets GitHub, canaux par langage.',
  },
  {
    name: 'Discord Bot Support',
    code: '9rPhFSTTcQfw',
    category: 'Support',
    description: "Structure prête pour un serveur de support de bot Discord : FAQ, tickets, annonces, retours utilisateurs.",
  },
  {
    name: 'Valorant Community',
    code: '6GFyuBVXAr7M',
    category: 'Gaming',
    description: 'Serveur communautaire Valorant : recherche de coéquipiers, discussions par rang, salons vocaux par équipe.',
  },
  {
    name: 'League of Legends',
    code: 'YGAPHNVMvPEU',
    category: 'Gaming',
    description: 'Serveur communautaire League of Legends : recherche de duo, discussions par rôle, tournois et clips.',
  },
];

export const CATEGORIES = Array.from(new Set(TEMPLATES.map((t) => t.category)));
