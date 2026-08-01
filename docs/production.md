# Exploitation en production

Supabase gère les données et l’authentification, Stripe les paiements, Resend les emails et iCal les canaux externes. Aucun service n’est considéré actif avant configuration de ses secrets et tests réels.

## Sauvegardes

Utiliser les sauvegardes managées Supabase du plan souscrit. Une exportation manuelle peut être créée avec `scripts/backup-supabase.ps1 -DatabaseUrl "..."`. Le fichier contient des données personnelles : le chiffrer, restreindre son accès, définir une rétention et ne jamais le committer. Tester la restauration dans un environnement isolé.

Paramètres, tarifs, options et calendriers sont inclus dans PostgreSQL. L’export iCal public ne remplace pas une sauvegarde.

## PWA et hors ligne

Le service worker met en cache uniquement des ressources publiques et la page hors ligne. `/admin`, `/api` et `/reservation` sont exclus afin de ne pas conserver de données sensibles. L’admin est installable et responsive, mais exige le réseau.

## Limites

iCal n’est pas instantané et ne transporte ni tarifs ni messages. IA, push/SMS et langues supplémentaires restent des interfaces désactivées jusqu’à la configuration d’un fournisseur réel.
