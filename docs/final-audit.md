# Audit final et mise en production

## Compléments de finalisation

- PWA installable : manifeste, icônes, service worker et page hors ligne ; aucune zone sensible mise en cache.
- Images : PNG et WebP conservés, neuf variantes AVIF ajoutées ; Next Image négocie le format.
- SEO : Open Graph, icônes et schémas structurés limités aux contenus réellement visibles.
- Confidentialité : consentement granulaire avant tout connecteur facultatif d’analytics ou marketing.
- Architectures désactivées, sans fausse API, pour IA, push/SMS, quatre locales et thèmes.
- Sécurité : CSP compatible avec les services, HSTS, anti-sniffing, permissions, contrôle same-origin, validation et limitation basique.
- Sauvegarde : script `pg_dump`, exclusion Git et restauration isolée documentée.

Le 31 juillet 2026, ESLint, TypeScript et le build Next.js (52 routes) réussissent. Le smoke test HTTP confirme le manifeste, la page hors ligne, robots, sitemap, service worker, redirection admin, export iCal et CSP.

`npm audit --omit=dev` signale trois avis élevés transitifs dans Next.js/PostCSS et Sharp. PostCSS n’a pas de correctif proposé dans l’arbre compatible. Aucun correctif forcé potentiellement cassant n’a été appliqué ; surveiller les versions officielles.

Audit réalisé le 31 juillet 2026 sur l’implémentation locale. Le code est prêt à être configuré pour la production, mais aucun service externe ne peut être déclaré opérationnel sans les identifiants du propriétaire et les tests de bout en bout correspondants.

## Fonctionnalités terminées

- Site public responsive, galerie accessible, pages légales modèles, réservation en quatre étapes et calcul tarifaire côté serveur.
- Création atomique d’une réservation `pending_payment` dans Supabase, expiration après 30 minutes et prévention des chevauchements par la migration SQL.
- Stripe Checkout calculé côté serveur, webhook signé et idempotent, confirmation, expiration et remboursement pris en compte.
- Emails Resend de confirmation, notification administrateur, annulation, échec et remboursement ; aucun envoi simulé sans clé.
- Administration protégée par Supabase Auth et `admin_profiles`, avec réservations, calendrier, blocages, tarifs, options et paramètres.
- Import Booking/Airbnb par UID iCal, mise à jour et suppression des événements disparus, export sans donnée personnelle et cron Vercel protégé par `CRON_SECRET`.
- Abstraction de channel manager désactivée, sans intégration ni API fictive.
- Métadonnées, canonical, sitemap, robots, JSON-LD conditionnel, FAQ et fil d’Ariane. Les données locales absentes ne sont pas publiées.
- CSP et en-têtes de sécurité, validation Zod, honeypot et limitation simple des requêtes sensibles.
- Images originales conservées et variantes WebP utilisées. Les variantes pèsent environ 39 à 152 Ko contre 1,7 à 2,3 Mo pour les PNG sources.

## Éléments obligatoires à compléter par le propriétaire

1. Remplir toutes les variables de `.env.example`, notamment les clés Supabase, Stripe, Resend, `CRON_SECRET` et l’URL finale.
2. Compléter `lib/site-config.ts` via les variables publiques : ville, département, région, adresse, téléphone, email, GPS, horaires et prix à partir de.
3. Remplacer les champs entre crochets des pages légales : exploitant, raison sociale, SIRET, hébergeur, médiateur, politique d’annulation, dépôt, horaires et règlement.
4. Valider les tarifs et options de démonstration centralisés dans `lib/constants.ts` avant d’accepter un paiement réel.
5. Vérifier le domaine d’envoi Resend et créer le premier administrateur selon `docs/admin-setup.md`.
6. Fournir les vrais flux iCal et importer `/api/calendar/export` dans Booking et Airbnb.

## Variables d’environnement

La liste de référence est `.env.example`. Les secrets sans préfixe `NEXT_PUBLIC_` restent exclusivement côté serveur. La clé Supabase `service_role`, le secret Stripe, le secret webhook, la clé Resend et `CRON_SECRET` ne doivent jamais être copiés dans du code client ni committés.

## Contrôles et tests

- `npm install` : terminé.
- ESLint : réussi.
- TypeScript `tsc --noEmit` : réussi après corrections finales.
- Build Next.js de production : réussi après corrections finales.
- Routes publiques, export iCal, refus du cron non authentifié, refus d’un webhook non signé et présence des en-têtes de sécurité : vérifiés localement.
- Parcours local provisoire, détection d’un doublon, date occupée et export iCal sans donnée personnelle : vérifiés avec le dépôt local de développement.
- Affichage de l’image principale WebP : contrôlé visuellement.

Les opérations Supabase réelles, le paiement Stripe test, l’envoi Resend, les imports iCal privés et la session administrateur doivent encore être testés sur l’environnement de préproduction avec les clés du propriétaire. Le responsive et le clavier ont été audités dans le code ; une recette sur appareils réels reste recommandée.

## Sécurité et risques résiduels

- La limitation de débit en mémoire convient à une protection légère, mais n’est pas globale entre plusieurs instances Vercel. Pour un trafic important, utiliser un stockage distribué compatible avec la politique de confidentialité.
- La CSP autorise les domaines nécessaires à Stripe et Supabase ; la vérifier après ajout de tout outil tiers.
- `npm audit` signale des avis transitifs concernant notamment PostCSS/Sharp dans la chaîne Next.js. La correction automatique proposée impose des changements incompatibles ou une régression de version : ne pas utiliser `--force`; surveiller les mises à jour officielles de Next.js.
- Aucun numéro de carte n’est traité ou conservé par l’application.

## Limites iCal et channel manager

iCal fonctionne par synchronisation périodique et peut comporter un délai. Le cron est quotidien afin de rester compatible avec les limites courantes du plan Vercel Hobby ; ajuster la fréquence uniquement après vérification du plan effectivement souscrit. Tester les quatre sens : Booking vers site, Airbnb vers site, site vers Booking et site vers Airbnb. Pour une synchronisation plus rapide et une gestion centralisée des tarifs, adopter ensuite un channel manager réel (Smoobu, Beds24, Lodgify ou autre) en implémentant l’interface documentée, uniquement à partir de sa documentation officielle.

## Procédure de production

Suivre `docs/deployment-vercel.md`, puis `docs/production-checklist.md`. Déployer d’abord avec Stripe en mode test, appliquer la migration Supabase, créer l’administrateur, configurer le webhook et le cron, tester une réservation complète et son remboursement, puis seulement remplacer les clés Stripe de test par les clés live. Après raccordement du domaine, mettre à jour `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, les canonical et les URLs de retour Stripe via les variables Vercel.
