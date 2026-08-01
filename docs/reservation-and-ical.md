# Demandes de réservation et calendriers iCal

## Configuration des imports

Copier `.env.local.example` vers `.env.local`, puis renseigner `BOOKING_ICAL_URL` et `AIRBNB_ICAL_URL`. Ces URLs restent lues uniquement sur le serveur et ne sont jamais retournées par l’API publique.

### Airbnb

Dans l’extranet Airbnb, ouvrir le calendrier de l’annonce, puis la section de disponibilité et de synchronisation des calendriers. Choisir l’export du calendrier et copier le lien iCal fourni dans `AIRBNB_ICAL_URL`. Les intitulés exacts peuvent évoluer dans l’interface Airbnb.

### Booking.com

Dans l’extranet Booking.com, ouvrir les paramètres de calendrier de l’hébergement, puis la fonction de synchronisation ou d’export du calendrier. Copier le lien iCal fourni dans `BOOKING_ICAL_URL`. Cette fonction dépend du type de compte et de calendrier activé par Booking.com.

Ne pas publier ces deux liens et ne pas les préfixer avec `NEXT_PUBLIC_`.

## Export du calendrier Absolu

Le calendrier est disponible sur `/api/calendar/export`. Il contient uniquement les demandes marquées `blocked` ou `confirmed`, avec le titre générique « Indisponible ». Aucun nom, email ou téléphone n’est exporté. Cette URL pourra être importée dans les extranets compatibles iCal.

## Fonctionnement et limites

- Les flux externes sont téléchargés côté serveur et conservés en cache pendant 15 minutes.
- En cas d’erreur réseau, la dernière version en cache est utilisée lorsqu’elle existe.
- iCal fonctionne par synchronisation périodique : il ne garantit pas une mise à jour instantanée entre plateformes.
- La disponibilité est donc vérifiée une seconde fois côté serveur lors de chaque demande.

## Stockage

La production utilise Supabase. `data/bookings.json` reste uniquement un secours de développement lorsque les services externes ne sont pas configurés ; il n’est jamais utilisé en production.

## Évolution future

La création Supabase utilise un verrou transactionnel et revérifie tous les chevauchements avant insertion. À plus long terme, un channel manager réel pourra remplacer la synchronisation iCal si une synchronisation plus rapide et centralisée devient nécessaire.
