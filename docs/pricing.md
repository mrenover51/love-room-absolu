# Tarification

`pricing` contient les sept tarifs de base en centimes. `seasonal_prices`, `promotions` et `promo_codes` préparent les périodes spéciales, réductions et codes promotionnels. Toute mutation est validée côté serveur et historisée dans `audit_logs`.

Le moteur de paiement continue de recalculer le montant depuis Supabase. Les périodes et promotions ne doivent être activées dans le Checkout qu'après définition explicite de leurs règles de priorité et de cumul.
