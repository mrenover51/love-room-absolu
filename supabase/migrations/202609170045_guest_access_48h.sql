-- Communication d'accès H-48. Aucun enregistrement historique n'est modifié.
alter type public.reservation_communication_type
  add value if not exists 'access_48h';
