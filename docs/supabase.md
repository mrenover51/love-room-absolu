# Supabase

Les migrations créent les enums, contraintes, indexes, RLS, tables métier et fonctions atomiques. Appliquer `202607310001`, `002`, puis `003`. La fonction `create_checkout_reservation` prend un verrou transactionnel, revérifie les chevauchements et insère réservation/options/client dans la même transaction. `confirm_reservation` est réservée au rôle serveur et bloque les dates de façon idempotente.

Le navigateur utilise uniquement l'anon key. `SUPABASE_SERVICE_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` ne doit être accessible que dans les Route Handlers et modules marqués `server-only`. Créer l'utilisateur administrateur dans Supabase Auth puis son profil séparément ; aucun rôle n'est attribué automatiquement.
