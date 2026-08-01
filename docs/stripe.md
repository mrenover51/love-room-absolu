# Stripe

Créer un webhook vers `https://domaine.example/api/stripe/webhook` pour `checkout.session.completed`, `checkout.session.expired` et `charge.refunded`. Placer son secret dans `STRIPE_WEBHOOK_SECRET`.

Le serveur recalcule toujours le montant depuis Supabase, crée la réservation `pending_payment`, puis la Checkout Session. Le webhook vérifie le corps brut et la signature. `webhook_events` garantit l'idempotence. La page succès vérifie elle-même la Session Stripe et ne confirme jamais une réservation.

Tester avec Stripe CLI avant activation réelle. Passer séparément les clés test puis live ; ne jamais mélanger les environnements.
