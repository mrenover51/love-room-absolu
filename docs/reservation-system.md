# Moteur de réservation — Sprint 3

## Architecture

Le parcours public comporte quatre étapes : dates, options, informations client et récapitulatif. Le navigateur ne persiste aucune réservation et son total n'est jamais considéré comme fiable. `POST /api/reservation-request` valide les données avec Zod, recalcule le devis, revérifie les disponibilités, puis appelle le service et le dépôt serveur.

`ReservationRepository` définit le contrat de stockage (`create`, `findByReference`, `findBetween`, `isAvailable`). `LocalReservationRepository` est l'implémentation provisoire de développement, stockée dans `data/reservations.json`. Les composants React ne lisent et n'écrivent jamais ce fichier directement.

> Ce fichier JSON n'est pas une base de production : le filesystem de Vercel n'est ni persistant ni partagé entre instances. Il devra être remplacé par Supabase au Sprint 4.

## Prix et options

Toutes les valeurs de démonstration sont regroupées dans `lib/booking/constants.ts` et exprimées en centimes d'euro. Chaque nuit est parcourue séparément par `calculateStayPrice()` afin d'appliquer son tarif du lundi au dimanche. Les options sont activables individuellement, dédupliquées et limitées à une unité dans ce sprint. L'API effectue toujours son propre calcul.

## Disponibilités et demandes pending

Les plages suivent la convention `[arrivée, départ[` : une arrivée le jour du départ précédent est autorisée. Une demande `pending` bloque les nuits pendant 30 minutes par défaut. La durée se configure avec `RESERVATION_HOLD_MINUTES`. Après `expiresAt`, elle ne participe plus aux disponibilités ni à l'export iCal.

La création locale est sérialisée dans le processus Node pour réduire le risque de double demande. Cette garantie ne couvre pas plusieurs instances serveur ; la transaction atomique Supabase sera nécessaire au Sprint 4.

Le limiteur en mémoire et le honeypot offrent une protection de développement basique. En production, utiliser un stockage partagé pour le rate limiting.

## Évolution Sprint 4

- remplacer `LocalReservationRepository` par une implémentation Supabase sans modifier l'interface ;
- effectuer la vérification de chevauchement dans une transaction/verrou en base ;
- remplacer le statut `pending` par le cycle paiement Stripe ;
- confirmer et bloquer définitivement depuis un webhook Stripe signé ;
- envoyer les emails transactionnels après confirmation.
