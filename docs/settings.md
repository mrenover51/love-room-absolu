# Paramètres

Les groupes `property`, `social`, `seo`, `branding`, `times`, `conditions`, `legal`, `taxes` et `maintenance` sont stockés en JSON dans `settings`. Aucun secret Stripe, Supabase ou Resend n'y est enregistré.

Le mode maintenance est contrôlé par `settings.maintenance.enabled`. `proxy.ts` réécrit alors les pages publiques vers `/maintenance`, sans bloquer l'administration ni les webhooks/API. Les médias nécessitent un bucket Supabase Storage privé/public configuré explicitement avant activation des uploads.

L'export complet produit un JSON sans utilisateurs Auth ni variables d'environnement. L'import API accepte uniquement le sous-ensemble `settings` validé ; les réservations et paiements ne sont jamais écrasés par un import général.
