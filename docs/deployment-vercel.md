# Déploiement Vercel

1. Créer un dépôt GitHub privé ou public sans aucun fichier `.env`, puis pousser le projet.
2. Dans Vercel, créer un projet depuis ce dépôt. Le framework Next.js est détecté automatiquement.
3. Copier les variables de `.env.example` dans les environnements Production et Preview appropriés. Générer `CRON_SECRET` avec une valeur longue et aléatoire.
4. Appliquer la migration Supabase, configurer l’URL du projet et les clés. La clé service-role reste exclusivement côté serveur.
5. Dans Stripe, créer le webhook `https://DOMAINE/api/stripe/webhook` pour `checkout.session.completed`, `checkout.session.expired` et `charge.refunded`, puis enregistrer son secret.
6. Tester avec les clés Stripe de test et les cartes de test officielles. Vérifier réservation, email et blocage des dates avant d’utiliser les clés live.
7. Vérifier le domaine d’envoi Resend, configurer `RESEND_FROM_EMAIL`, `RESEND_API_KEY` et `ADMIN_EMAIL`.
8. Ajouter le domaine final dans Vercel, puis appliquer chez le registrar les enregistrements DNS fournis par Vercel. Mettre à jour `SITE_URL` et `NEXT_PUBLIC_SITE_URL`.
9. Le fichier `vercel.json` programme `/api/cron/sync-calendars` chaque jour à 03:00 UTC, fréquence compatible avec les contraintes habituelles du plan Hobby. Vérifier les limites du plan au moment du déploiement ; elles peuvent évoluer.
10. Ajouter les exports privés Booking/Airbnb dans `BOOKING_ICAL_URL` et `AIRBNB_ICAL_URL`. Importer `https://DOMAINE/api/calendar/export` dans les deux extranets.
11. Déclencher le cron manuellement avec `Authorization: Bearer CRON_SECRET`, contrôler les logs sans données personnelles et vérifier les blocages admin.
12. Après validation complète, remplacer ensemble les clés Stripe test par les clés live et le secret du webhook live. Ne jamais mélanger les modes.

Ne pas annoncer la production tant que les mentions légales, conditions, adresse, coordonnées et politiques commerciales ne sont pas validées par le propriétaire.
