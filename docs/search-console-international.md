# Search Console — suivi international

## Propriété et sitemaps

Déclarer une propriété de domaine pour `love-room-absolu.fr`, puis soumettre
`https://love-room-absolu.fr/sitemap.xml`. Le sitemap contient uniquement les
77 URLs canoniques indexables des sept locales. Ne pas soumettre les URLs
`/admin`, `/mon-sejour`, checkout, callbacks ou API.

Créer une vue de suivi par préfixe d’URL (`/fr/`, `/en/`, `/de/`, `/nl/`,
`/it/`, `/es/`, `/pt/`) et comparer clics, impressions, CTR, position et
réservations issues des événements first-party consentis.

## Contrôles réguliers

- Inspection d’URL sur une page de chaque locale.
- Rapport Pages indexées : 404, redirections, exclues par canonical et noindex.
- Rapport International Targeting : erreurs hreflang réciproques.
- Export mensuel sans données personnelles dans `reports/`.

La validation locale reproductible est `npm run audit:i18n`. Elle vérifie les
réponses 200, lang, canonical, huit alternates, métadonnées et redirections
françaises historiques.
