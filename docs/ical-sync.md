# Synchronisation iCal provisoire

## Configuration

Copier `.env.example` vers `.env.local`, sans committer ce dernier, puis renseigner :

```env
BOOKING_ICAL_URL=
AIRBNB_ICAL_URL=
SITE_URL=http://localhost:3000
RESERVATION_HOLD_MINUTES=30
```

Les URLs d'import restent côté serveur et ne sont jamais retournées par l'API publique. Si une URL est absente ou inaccessible, le calendrier continue avec les demandes directes locales ; une alerte sans donnée personnelle est uniquement journalisée côté serveur.

## Airbnb

Dans les paramètres de disponibilité/calendrier de l'annonce, utiliser la fonction d'export de calendrier et placer le lien obtenu dans `AIRBNB_ICAL_URL`. Pour transmettre les indisponibilités Absolu à Airbnb, utiliser sa fonction d'import de calendrier avec l'URL publique `https://votre-domaine.example/api/calendar/export`.

## Booking.com

Dans les paramètres de synchronisation du calendrier de l'hébergement, utiliser la fonction d'export iCal et placer le lien dans `BOOKING_ICAL_URL`. Dans la fonction d'import de calendrier, ajouter l'URL publique `https://votre-domaine.example/api/calendar/export`.

Les intitulés et emplacements exacts de ces réglages peuvent évoluer : se référer à l'aide officielle de la plateforme au moment de la configuration.

## Export du site

`GET /api/calendar/export` télécharge `absolu-disponibilites.ics`. Les événements contiennent uniquement UID, dates, horodatage, `Indisponible` et `Réservation directe Absolu`. Aucun nom, email, téléphone, montant, option ou message n'est exporté. `DTEND` représente le jour de départ et reste exclusif.

## Limites

iCal peut être synchronisé avec retard selon la fréquence choisie par chaque plateforme. Il ne synchronise ni les prix, ni les messages, ni les paiements et ne garantit pas une mise à jour instantanée. Un channel manager pourra remplacer cette couche ultérieurement si une synchronisation plus rapide devient nécessaire.
