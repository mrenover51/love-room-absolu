# Inventaire des anciennes URL françaises

La version française éditoriale reste la référence. Une URL historique n’est
redirigée que lorsqu’une page `/fr/` de qualité équivalente la remplace.

## Redirections permanentes vers `/fr/`

- `/` → `/fr`
- `/la-suite` → `/fr/la-suite`
- `/reservation` → `/fr/reservation`
- `/equipements` → `/fr/equipements`
- `/faq` → `/fr/faq`
- `/contact` → `/fr/contact`
- `/conditions` et `/conditions-reservation` → `/fr/conditions`
- `/politique-confidentialite` et `/confidentialite` → `/fr/politique-confidentialite`

Les destinations sont directes : aucune chaîne intermédiaire n’est attendue.

## URL historiques conservées

- `/galerie`
- `/bons-cadeaux` et ses pages transactionnelles
- `/guide-touristique` et ses fiches
- `/blog` et ses articles, catégories, tags et auteurs
- `/restaurants` et ses fiches
- Tous les clusters français sans équivalent international éditorial complet

Ces URL conservent leur valeur SEO et leur canonical historique. Les ébauches
internationales correspondantes sous `/fr/`, `/en/`, `/de/`, `/nl/`, `/it/`,
`/es/` et `/pt/` sont accessibles à la navigation mais restent `noindex` et
absentes du sitemap tant que leur contenu n’est pas équivalent.

## URL exclues de l’index

Administration, API, recherche interne, maintenance, espace Mon séjour et ses
tokens, confirmations, retours de paiement, pages de vérification et autres
états transactionnels ne figurent jamais dans le sitemap.
