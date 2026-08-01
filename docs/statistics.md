# Statistiques et exports

Les statistiques annuelles calculent chiffre d'affaires, volume de réservations, durée moyenne et panier moyen. Les exports CSV sont protégés par session et rôle, encodés UTF-8 et neutralisent les formules de tableur. Ils s'ouvrent dans Excel et LibreOffice.

L'impression native du navigateur fournit un export PDF sans bibliothèque lourde. L'export iCal reste disponible séparément sur `/api/calendar/export`. La sauvegarde JSON admin exclut les secrets, Auth Supabase et données Stripe bancaires.
