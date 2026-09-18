# Bing Webmaster Tools — suivi international

Vérifier le domaine `love-room-absolu.fr` et envoyer le même sitemap XML
`https://love-room-absolu.fr/sitemap.xml`. Les locales sont distinguées par
leurs préfixes d’URL, sans ciblage automatique par IP ou navigateur.

Surveiller les rapports Crawl Control, IndexNow (uniquement lors d’une
publication réelle), erreurs 4xx/5xx, URLs redirigées et balises hreflang.
Conserver les mêmes exclusions que `robots.txt` : administration, espace
privé Mon séjour, checkout, callbacks, API et recherches internes.

Avant toute soumission, lancer :

```text
npm run audit:i18n
npm run seo:audit
npm test
```

Les rapports ne doivent jamais contenir de token de séjour, email, téléphone,
secret ou donnée de réservation.
