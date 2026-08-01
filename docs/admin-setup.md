# Configuration de l’administration

L’accès se fait sur `/admin/connexion` avec un utilisateur Supabase Auth présent dans `admin_profiles`. Toutes les lectures et mutations revérifient l’utilisateur et son rôle côté serveur ; masquer un écran ne constitue jamais une autorisation.

- `/admin` : indicateurs et arrivées à venir.
- `/admin/reservations` : recherche, statuts, notes et remboursement avec saisie explicite `REMBOURSER`.
- `/admin/calendrier` : réservations et blocages manuels.
- `/admin/tarifs`, `/admin/options` : paramètres JSON stockés en base.
- `/admin/parametres` : état du compte et rappel de configuration.

Attribuer le rôle `owner` seulement aux propriétaires. Ne jamais partager le mot de passe ni la clé service-role.
