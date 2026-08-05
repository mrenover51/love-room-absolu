# Emails transactionnels

Les templates React Email se trouvent dans `emails/templates` : confirmation client, notification administrateur, paiement échoué, annulation et remboursement. Ils sont rendus côté serveur puis envoyés avec Resend.

Configurer `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO` et `ADMIN_EMAIL`. Le domaine de l'expéditeur doit être vérifié chez Resend. Sans clé en développement, aucun faux email n'est envoyé : seul un log contenant le nom du template est produit, sans donnée personnelle.
