# Stripe

Utiliser d’abord les clés de test. La réservation crée une ligne `pending_payment`, puis une session Checkout calculée uniquement côté serveur. Le webhook signé confirme la réservation et déclenche les emails. Les événements sont revendiqués dans `webhook_events` afin de garantir l’idempotence.

Endpoints : `/api/stripe/create-checkout-session` pour créer la réservation et la session Checkout, puis `/api/stripe/webhook` pour les événements signés.

Événements : `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`.

Le remboursement intégral est disponible dans `/admin/reservations`. Il exige une session administrateur, la saisie explicite de `REMBOURSER <référence>` et utilise une clé d’idempotence Stripe. Le webhook reste l’unique source de mise à jour du statut remboursé.

En local, utiliser la CLI Stripe officielle pour transférer les événements vers le serveur local. Les données bancaires ne transitent jamais par l’application.
