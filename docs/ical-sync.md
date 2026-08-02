# Synchronisation iCal provisoire

## Configuration

Copier `.env.example` vers `.env.local`, sans committer ce dernier, puis renseigner :

```env
BOOKING_ICAL_URL=
AIRBNB_ICAL_URL=
SITE_URL=https://love-room-absolu.fr
RESERVATION_HOLD_MINUTES=30
```

Les URLs d'import restent cÃ´tÃ© serveur et ne sont jamais retournÃ©es par l'API publique. Si une URL est absente ou inaccessible, le calendrier continue avec les demandes directes locales ; une alerte sans donnÃ©e personnelle est uniquement journalisÃ©e cÃ´tÃ© serveur.

## Airbnb

Dans les paramÃ¨tres de disponibilitÃ©/calendrier de l'annonce, utiliser la fonction d'export de calendrier et placer le lien obtenu dans `AIRBNB_ICAL_URL`. Pour transmettre les indisponibilitÃ©s Absolu Ã  Airbnb, utiliser sa fonction d'import de calendrier avec l'URL publique `https://love-room-absolu.fr/api/calendar/export`.

## Booking.com

Dans les paramÃ¨tres de synchronisation du calendrier de l'hÃ©bergement, utiliser la fonction d'export iCal et placer le lien dans `BOOKING_ICAL_URL`. Dans la fonction d'import de calendrier, ajouter l'URL publique `https://love-room-absolu.fr/api/calendar/export`.

Les intitulÃ©s et emplacements exacts de ces rÃ©glages peuvent Ã©voluer : se rÃ©fÃ©rer Ã  l'aide officielle de la plateforme au moment de la configuration.

## Export du site

`GET /api/calendar/export` tÃ©lÃ©charge `absolu-disponibilites.ics`. Les Ã©vÃ©nements contiennent uniquement UID, dates, horodatage, `Indisponible` et `RÃ©servation directe Absolu`. Aucun nom, email, tÃ©lÃ©phone, montant, option ou message n'est exportÃ©. `DTEND` reprÃ©sente le jour de dÃ©part et reste exclusif.

## Limites

iCal peut Ãªtre synchronisÃ© avec retard selon la frÃ©quence choisie par chaque plateforme. Il ne synchronise ni les prix, ni les messages, ni les paiements et ne garantit pas une mise Ã  jour instantanÃ©e. Un channel manager pourra remplacer cette couche ultÃ©rieurement si une synchronisation plus rapide devient nÃ©cessaire.

