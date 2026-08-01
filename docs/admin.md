# Administration Absolu

Toutes les pages `/admin` nécessitent une session Supabase Auth et un profil `admin_profiles` de rôle `admin` ou `owner`. Next.js 16 utilise `proxy.ts` pour rafraîchir la session ; chaque page, Server Action et Route Handler sensible revérifie aussi l'utilisateur et son rôle.

Le menu couvre dashboard, calendrier, réservations, clients, tarifs, options, paiements, synchronisation, statistiques, notifications, paramètres et compte. Les mutations passent par des actions serveur validées avec Zod. Les remboursements passent exclusivement par Stripe et requièrent une confirmation textuelle.

La migration `202607310004_admin_management.sql` doit être appliquée avant utilisation.
