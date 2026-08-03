# Guide développeur — Absolu v1

## Prérequis et architecture

Node.js 22, npm, PostgreSQL/Supabase CLI et `pg_dump`/`pg_restore` pour les sauvegardes. L’application utilise Next.js 16 App Router, des Server Components par défaut, Supabase pour les données et l’authentification, Stripe Checkout, Resend et iCal.

Copier `.env.example` vers `.env.local` puis renseigner uniquement les variables nécessaires. Les secrets serveur ne doivent jamais porter le préfixe `NEXT_PUBLIC_`.

## Commandes de référence

- `npm run dev` : développement.
- `npm run verify` : lint, TypeScript, tests et audit de release.
- `npm run build` : validations SEO/schema/performance puis build de production.
- `npm run audit:release` : rapports release, sécurité et campagne Lighthouse.
- `npm run validate:schema` et `npm run validate:mesh` : données structurées et maillage.

## Données et migrations

Appliquer les migrations `supabase/migrations` dans l’ordre. Toute table privée doit activer RLS ; les opérations privilégiées passent par le service role uniquement côté serveur. Tester les droits avec un utilisateur anonyme, un client, un admin et un owner.

## Observabilité et erreurs

`instrumentation.ts` journalise les erreurs serveur et peut les transmettre à `MONITORING_WEBHOOK_URL`. `/api/health` est un contrôle de disponibilité minimal. Ne jamais envoyer de secret, carte bancaire, email complet ou contenu privé dans les logs.

## Définition de terminé

Le build et `npm run verify` réussissent, Lighthouse CI produit ses artefacts, aucune migration n’est en attente, et le parcours réservation → Stripe → webhook → email est validé en préproduction.
