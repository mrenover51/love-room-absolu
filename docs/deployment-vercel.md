# DÃ©ploiement Vercel

1. CrÃ©er un dÃ©pÃ´t GitHub privÃ© ou public sans aucun fichier `.env`, puis pousser le projet.
2. Dans Vercel, crÃ©er un projet depuis ce dÃ©pÃ´t. Le framework Next.js est dÃ©tectÃ© automatiquement.
3. Copier les variables de `.env.example` dans les environnements Production et Preview appropriÃ©s. GÃ©nÃ©rer `CRON_SECRET` avec une valeur longue et alÃ©atoire.
4. Appliquer la migration Supabase, configurer lâ€™URL du projet et les clÃ©s. La clÃ© service-role reste exclusivement cÃ´tÃ© serveur.
5. Dans Stripe, crÃ©er le webhook `https://love-room-absolu.fr/api/stripe/webhook` pour `checkout.session.completed`, `checkout.session.expired` et `charge.refunded`, puis enregistrer son secret.
6. Tester avec les clÃ©s Stripe de test et les cartes de test officielles. VÃ©rifier rÃ©servation, email et blocage des dates avant dâ€™utiliser les clÃ©s live.
7. VÃ©rifier le domaine dâ€™envoi Resend, configurer `RESEND_FROM`, `RESEND_REPLY_TO`, `RESEND_API_KEY` et `ADMIN_EMAIL`.
8. Ajouter le domaine final dans Vercel, puis appliquer chez le registrar les enregistrements DNS fournis par Vercel. Mettre Ã  jour `SITE_URL` et `NEXT_PUBLIC_SITE_URL`.
9. Le fichier `vercel.json` programme `/api/cron/sync-calendars` chaque jour Ã  03:00 UTC, frÃ©quence compatible avec les contraintes habituelles du plan Hobby. VÃ©rifier les limites du plan au moment du dÃ©ploiement ; elles peuvent Ã©voluer.
10. Ajouter les exports privÃ©s Booking/Airbnb dans `BOOKING_ICAL_URL` et `AIRBNB_ICAL_URL`. Importer `https://love-room-absolu.fr/api/calendar/export` dans les deux extranets.
11. DÃ©clencher le cron manuellement avec `Authorization: Bearer CRON_SECRET`, contrÃ´ler les logs sans donnÃ©es personnelles et vÃ©rifier les blocages admin.
12. AprÃ¨s validation complÃ¨te, remplacer ensemble les clÃ©s Stripe test par les clÃ©s live et le secret du webhook live. Ne jamais mÃ©langer les modes.

Ne pas annoncer la production tant que les mentions lÃ©gales, conditions, adresse, coordonnÃ©es et politiques commerciales ne sont pas validÃ©es par le propriÃ©taire.

