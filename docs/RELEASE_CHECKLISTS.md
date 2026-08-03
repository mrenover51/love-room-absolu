# Checklists d’exploitation v1

## Mise en production

- [ ] `npm ci`, `npm run verify` et `npm run build` réussissent.
- [ ] Migrations appliquées et RLS testée sur Supabase de préproduction.
- [ ] Domaine, HTTPS, canonical, robots et sitemaps vérifiés.
- [ ] Stripe test : succès, refus, expiration, remboursement et webhook rejoué.
- [ ] Resend : domaine vérifié et emails reçus sur mobile et desktop.
- [ ] iCal testé dans les deux sens sans fuite de données personnelles.
- [ ] Lighthouse CI 100/100 sur les quatre catégories et routes critiques.
- [ ] Responsive, clavier, lecteur d’écran et appareils réels contrôlés.
- [ ] Analytics bloqués avant consentement puis événements validés après accord.
- [ ] Première sauvegarde restaurée sur une base isolée.

## Sauvegarde

- [ ] Exécuter `scripts/backup-supabase.ps1` vers le dossier local ignoré `backups`.
- [ ] Chiffrer la copie hors site et limiter les accès.
- [ ] Contrôler taille, date et code retour de `pg_dump`.
- [ ] Tester trimestriellement `restore-supabase.ps1` sur une base vide isolée.
- [ ] Documenter RPO, RTO et responsable de restauration.

## Maintenance

- [ ] Quotidien : réservations, paiements, emails, crons et erreurs.
- [ ] Hebdomadaire : liens cassés, Search Console, Core Web Vitals et dépendances.
- [ ] Mensuel : restauration test, comptes admin, contenu légal, tarifs et iCal.
- [ ] Après chaque release : migrations, webhooks, cache, sitemap et parcours complet.

## Sécurité

- [ ] Rotation des secrets et révocation des anciens accès.
- [ ] MFA sur Vercel, Supabase, Stripe, Resend, Google et registrar.
- [ ] Aucun secret dans Git, logs, bundle client ou captures d’écran.
- [ ] CSP et permissions réévaluées à chaque nouveau fournisseur.
- [ ] RLS, rôles admin, rate limits et signatures webhook testés.
- [ ] Procédure d’incident et contacts d’urgence à jour.
