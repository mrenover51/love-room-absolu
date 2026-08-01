# Futur channel manager

`lib/channel-manager/provider.ts` définit uniquement le contrat nécessaire à un futur fournisseur. L’implémentation actuelle est désactivée et n’effectue aucun appel externe.

Un adaptateur réel pourra être créé pour Smoobu, Beds24, Lodgify ou un autre service seulement après sélection du fournisseur, accès à sa documentation officielle et définition des règles de synchronisation. Aucune URL ni méthode API n’est supposée dans le code actuel.

iCal reste périodique et peut présenter un délai. Un channel manager devient recommandé si la centralisation des disponibilités, tarifs et réservations doit être plus rapide.
