# Configuration Resend

1. Vérifier un domaine dans Resend et créer une clé API limitée à l’envoi.
2. Renseigner `RESEND_API_KEY` et `ADMIN_EMAIL` dans `.env.local`.
3. Définir `RESEND_FROM_EMAIL` avec une adresse du domaine vérifié.

Sans clé, aucun email n’est envoyé : en développement, un log sans contenu personnel indique seulement le sujet et la destination. Les templates couvrent confirmation, notification admin, échec, annulation et remboursement.
