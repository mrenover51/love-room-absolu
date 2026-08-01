# Checklist de production

- [ ] Données légales, coordonnées, horaires et tarifs validés.
- [ ] Migrations Supabase, RLS et compte administrateur vérifiés.
- [ ] Paiement Stripe testé puis webhook live configuré.
- [ ] Domaine Resend vérifié et emails client/admin reçus.
- [ ] Imports Booking/Airbnb et export `/api/calendar/export` contrôlés.
- [ ] `CRON_SECRET` configuré et synchronisation vérifiée.
- [ ] Réservation concurrente, remboursement et expiration testés.
- [ ] Admin testé sur ordinateur, tablette et mobile.
- [ ] Consentement et connecteurs analytics validés juridiquement.
- [ ] Installation PWA et page hors ligne testées.
- [ ] Lighthouse exécuté sur l’URL réelle de production.
- [ ] Lint, TypeScript et build réussis.
- [ ] Sauvegarde Supabase et restauration isolée testées.
