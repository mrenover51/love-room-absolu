# Stripe

CrÃ©er un webhook vers `https://love-room-absolu.fr/api/stripe/webhook` pour `checkout.session.completed`, `checkout.session.expired` et `charge.refunded`. Placer son secret dans `STRIPE_WEBHOOK_SECRET`.

Le serveur recalcule toujours le montant depuis Supabase, crÃ©e la rÃ©servation `pending_payment`, puis la Checkout Session. Le webhook vÃ©rifie le corps brut et la signature. `webhook_events` garantit l'idempotence. La page succÃ¨s vÃ©rifie elle-mÃªme la Session Stripe et ne confirme jamais une rÃ©servation.

Tester avec Stripe CLI avant activation rÃ©elle. Passer sÃ©parÃ©ment les clÃ©s test puis live ; ne jamais mÃ©langer les environnements.

