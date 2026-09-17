# Réconciliation historique iCal — plan manuel

Ce document accompagne la migration `202609170044_canonical_ical_conflicts.sql`.
La migration ne modifie et ne supprime aucune donnée historique.

## État audité avant migration

- 19 conflits ouverts historiques conservés tels quels ;
- 34 UID protégés par le mécanisme fail-closed : 18 Booking et 16 Airbnb ;
- aucun vrai conflit confirmé pendant l'audit ;
- cinq lignes sont des conflits déjà résolus puis recréés ;
- quatorze lignes proviennent de fenêtres d'indisponibilité glissantes.

## Nettoyage manuel des 19 conflits

1. Exporter les 19 lignes avec leurs deux réservations liées et leurs blocs iCal.
2. Regrouper par paire de réservations, indépendamment de `start_date` et `end_date`.
3. Vérifier les périodes du 1–2 octobre 2026 et du 22–25 octobre 2026 comme miroirs interplateformes déjà documentés.
4. Vérifier le chevauchement passé du 9–10 août 2026 dans les journaux de résolution.
5. Classer les quatorze lignes datées du 11 au 17 septembre 2026 comme fenêtres techniques uniquement après comparaison avec les flux archivés.
6. Marquer manuellement chaque ligne avec une note et un type de résolution. Ne supprimer ni réservation ni bloc dans cette opération.

## Examen manuel des 34 UID protégés

Pour chaque UID, rapprocher `calendar_blocks`, `reservations`,
`calendar_missing_observations` et les snapshots/journaux du fournisseur.

- Conserver le bloc si la plateforme confirme encore l'indisponibilité.
- Conserver le bloc en cas de doute, d'absence d'archive ou de snapshot incomplet.
- Pour une fenêtre technique, documenter sa nature et vérifier ses bornes avant toute action.
- Pour une réservation client réelle, vérifier la plateforme, les dates et la référence avant toute réconciliation.
- Toute libération éventuelle doit faire l'objet d'une action administrative distincte, auditée et explicitement approuvée ; elle ne fait pas partie de cette migration.

## Critère de sortie

Une ligne historique peut être considérée comme traitée lorsque sa paire et sa
nature sont documentées. Un UID protégé ne peut être libéré que sur preuve
positive de son absence ou de son annulation, jamais par simple absence dans un
snapshot suspect.
