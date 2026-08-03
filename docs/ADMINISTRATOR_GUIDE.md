# Guide administrateur — Absolu v1

Le tableau de bord `/admin` centralise réservations, calendrier, tarifs, options, paiements, marketing et exploitation. L’écran `/admin/release` expose l’état des audits sans révéler les secrets.

## Routine quotidienne

Vérifier les nouvelles réservations, paiements, emails échoués, conflits calendrier et alertes. Ne jamais confirmer manuellement un paiement sans le retrouver dans Stripe et dans le journal du webhook.

## Routine mensuelle

Exporter une sauvegarde, contrôler les synchronisations Booking/Airbnb, consulter les conversions, traiter les erreurs ouvertes et vérifier que les coordonnées, tarifs et horaires publiés restent exacts.

## Incident

Suspendre les ventes si disponibilité ou prix sont incohérents. Conserver l’identifiant de réservation et l’heure, sans copier de données bancaires. Vérifier Vercel, Supabase, Stripe et Resend, puis documenter la résolution dans le journal d’exploitation.

## Accès

Utiliser un compte nominatif avec authentification forte. Retirer immédiatement les comptes inutilisés. Réserver le rôle owner aux opérations sensibles et ne jamais partager les clés API par email ou messagerie.
