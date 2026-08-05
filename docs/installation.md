# Installation Sprint 4A

1. Installer les dépendances avec `npm install`.
2. Copier `.env.example` vers `.env.local` et renseigner uniquement des clés de test.
3. Créer un projet Supabase puis exécuter les migrations de `supabase/migrations` dans l'ordre.
4. Configurer Stripe Checkout et le webhook `/api/stripe/webhook`.
5. Vérifier le domaine d'envoi Resend et définir `RESEND_FROM` et `RESEND_REPLY_TO`.
6. Lancer `npm run dev`, puis tester une réservation Stripe en mode test.

Ne jamais committer `.env.local`. Le dashboard admin existant n'est pas développé davantage dans ce sprint.
