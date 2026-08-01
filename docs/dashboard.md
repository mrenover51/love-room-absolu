# Dashboard

Les indicateurs proviennent des réservations payées : CA journalier, mensuel et annuel, occupation, panier moyen, réservations et prochaines arrivées/départs. Les graphiques SVG/CSS n'ajoutent aucune dépendance cliente lourde.

Le calendrier expose les vues mois, semaine et jour, une légende par source et les actions contextuelles. La fonction PostgreSQL `admin_move_reservation` fournit la base transactionnelle du déplacement avec vérification des chevauchements. Les indisponibilités iCal restent soumises au délai des plateformes.
