# Absolu — Love Room

Site Next.js 16 pour une suite romantique avec réservation directe, paiement Stripe, disponibilités Supabase, synchronisation iCal et administration sécurisée.

## Démarrage local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Sans clés Stripe/Supabase, le parcours utilise `data/bookings.json` uniquement en développement. En production, une configuration incomplète bloque la création plutôt que d’écrire sur le disque Vercel.

## Commandes

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

## Mise en production

1. Appliquer les migrations dans `supabase/migrations`.
2. Créer l’administrateur Supabase selon `docs/admin-setup.md`.
3. Renseigner toutes les variables Vercel à partir de `.env.example`.
4. Configurer Stripe, Resend, le cron et les calendriers selon `docs/deployment-vercel.md`.
5. Remplacer tous les champs légaux et SEO encore non renseignés.

Documentation détaillée dans [`docs/`](docs/), notamment la checklist finale et le rapport d’audit.

## Production et exploitation

- Installation : [`INSTALL.md`](INSTALL.md)
- Déploiement : [`DEPLOYMENT.md`](DEPLOYMENT.md)
- Checklist : [`docs/checklist.md`](docs/checklist.md)
- Exploitation et sauvegardes : [`docs/production.md`](docs/production.md)
- Rapport vérifié : [`docs/final-audit.md`](docs/final-audit.md)

La PWA ne met jamais en cache l’administration, les API ou la réservation. IA, push/SMS, analytics et langues supplémentaires restent désactivés tant qu’un fournisseur réel et le consentement requis ne sont pas configurés.
