export type ResourcePillar = {
  slug: string;
  title: string;
  description: string;
  shortAnswer: string;
  longAnswer: readonly string[];
  steps: readonly { name: string; text: string }[];
  comparison: readonly {
    criterion: string;
    absolu: string;
    alternative: string;
  }[];
  faq: readonly { question: string; answer: string }[];
  satellites: readonly { href: string; label: string }[];
};
export const resourcePillars: ResourcePillar[] = [
  {
    slug: "love-room-champagne",
    title: "Love Room en Champagne : le guide complet",
    description:
      "Comprendre, comparer et réserver une Love Room romantique en Champagne, près d’Épernay et de la Côte des Blancs.",
    shortAnswer:
      "Absolu est une suite romantique indépendante de 35 m² située à Avize, au cœur de la Côte des Blancs. Elle réunit une baignoire balnéo et un sauna infrarouge privatifs pour un séjour à deux près d’Épernay.",
    longAnswer: [
      "Une Love Room en Champagne associe l’intimité d’un hébergement réservé au couple à un environnement propice à l’escapade : vignoble, maisons de Champagne, restaurants et villages de la Côte des Blancs. La qualité ne dépend pas du seul décor. Elle repose aussi sur la clarté des équipements, la localisation, les horaires et les conditions de réservation.",
      "Chez Absolu, les éléments confirmés sont présentés séparément des options qui restent à valider. La suite se situe au 36 rue Pasteur à Avize. Sa baignoire balnéo et son sauna infrarouge sont intégrés à l’espace privatif ; les voyageurs ne réservent donc pas un créneau dans un spa partagé.",
      "Pour choisir, vérifiez la distance réelle, les équipements indispensables, les conditions d’annulation et le programme souhaité. Une visite de cave ou un restaurant peuvent compléter le séjour, mais conserver du temps dans la suite reste souvent le meilleur moyen de profiter de l’expérience.",
    ],
    steps: [
      {
        name: "Définir l’intention du séjour",
        text: "Choisissez entre détente, anniversaire, demande en mariage ou simple parenthèse.",
      },
      {
        name: "Vérifier les équipements",
        text: "Contrôlez les éléments confirmés et demandez une réponse écrite pour toute option décisive.",
      },
      {
        name: "Choisir les dates",
        text: "Consultez les disponibilités et lisez le récapitulatif avant validation.",
      },
      {
        name: "Composer un programme léger",
        text: "Ajoutez au maximum une visite et un restaurant afin de préserver du temps à deux.",
      },
    ],
    comparison: [
      {
        criterion: "Localisation",
        absolu: "Avize, Côte des Blancs",
        alternative: "Variable selon l’hébergement",
      },
      {
        criterion: "Bien-être",
        absolu: "Balnéo et sauna privatifs",
        alternative: "Parfois spa partagé ou sur créneau",
      },
      {
        criterion: "Réservation",
        absolu: "Directe sur le site",
        alternative: "Intermédiaire possible",
      },
      {
        criterion: "Programme",
        absolu: "Caves, vignoble et Épernay à proximité",
        alternative: "Dépend de la destination",
      },
    ],
    faq: [
      {
        question: "Où se trouve Absolu ?",
        answer:
          "La suite est située au 36 rue Pasteur, 51190 Avize, dans la Côte des Blancs.",
      },
      {
        question: "Les équipements de bien-être sont-ils privatifs ?",
        answer:
          "Oui, la baignoire balnéo et le sauna infrarouge se trouvent dans la suite et sont réservés à ses occupants.",
      },
    ],
    satellites: [
      { href: "/love-room/epernay", label: "Love Room près d’Épernay" },
      {
        href: "/equipements/baignoire-balneo",
        label: "Baignoire balnéo privative",
      },
      { href: "/equipements/sauna", label: "Sauna infrarouge" },
      {
        href: "/experiences-romantiques/week-end-romantique",
        label: "Week-end romantique",
      },
    ],
  },
  {
    slug: "reserver-en-direct",
    title: "Pourquoi réserver une Love Room en direct ?",
    description:
      "Avantages, vérifications et étapes pour réserver directement votre séjour romantique chez Absolu.",
    shortAnswer:
      "Réserver en direct permet d’échanger avec Absolu, de consulter les informations propres à la suite et de limiter les intermédiaires. Le prix et les conditions applicables restent toujours ceux du récapitulatif final.",
    longAnswer: [
      "La réservation directe crée un lien simple entre le voyageur et l’hébergement. Elle facilite les questions sur une surprise, un horaire ou un équipement précis, sans faire transiter la demande par une plateforme tierce.",
      "Elle ne signifie pas qu’une demande particulière est automatiquement garantie. Les dates, prix, options, modalités de paiement et conditions d’annulation doivent être lus avant validation. Une confirmation écrite reste la meilleure référence.",
      "Pour une occasion importante, contactez Absolu avant d’engager des dépenses annexes. Présentez votre date, votre contrainte et le résultat attendu : la réponse sera plus précise et plus facile à intégrer à votre programme.",
    ],
    steps: [
      {
        name: "Sélectionner les dates",
        text: "Vérifiez les disponibilités correspondant à votre séjour.",
      },
      {
        name: "Lire le récapitulatif",
        text: "Contrôlez prix, horaires, équipements et conditions.",
      },
      {
        name: "Poser les questions indispensables",
        text: "Demandez confirmation avant d’organiser une surprise.",
      },
      {
        name: "Conserver la confirmation",
        text: "Gardez les informations utiles pour l’arrivée.",
      },
    ],
    comparison: [
      {
        criterion: "Interlocuteur",
        absolu: "Échange direct avec Absolu",
        alternative: "Support d’une plateforme",
      },
      {
        criterion: "Information",
        absolu: "Contenu spécifique à la suite",
        alternative: "Fiche standardisée",
      },
      {
        criterion: "Demande particulière",
        absolu: "Question transmise directement",
        alternative: "Relais parfois nécessaire",
      },
      {
        criterion: "Conditions",
        absolu: "Récapitulatif du site",
        alternative: "Conditions de la plateforme",
      },
    ],
    faq: [
      {
        question: "La réservation directe garantit-elle une option ?",
        answer:
          "Non. Seules les prestations mentionnées dans la confirmation sont garanties.",
      },
      {
        question: "Où vérifier le prix final ?",
        answer:
          "Le montant applicable figure dans le récapitulatif présenté avant validation.",
      },
    ],
    satellites: [
      { href: "/reservation", label: "Voir les disponibilités" },
      { href: "/conditions", label: "Conditions de réservation" },
      { href: "/faq", label: "Centre d’aide" },
      { href: "/contact", label: "Contacter Absolu" },
    ],
  },
  {
    slug: "pourquoi-avize",
    title: "Pourquoi choisir Avize pour un séjour romantique ?",
    description:
      "Avize, Épernay et la Côte des Blancs : les avantages d’un point de départ au cœur du vignoble champenois.",
    shortAnswer:
      "Avize est un village viticole de la Côte des Blancs, proche d’Épernay. Il offre un point de départ calme pour découvrir les caves, les routes du Champagne et les restaurants tout en revenant dans une suite privative.",
    longAnswer: [
      "Choisir Avize permet de séjourner dans un village directement lié au vignoble plutôt que dans un centre urbain. La destination convient aux couples qui recherchent du calme sans renoncer aux visites et aux restaurants de Champagne.",
      "Épernay, Cramant, Oger et plusieurs étapes de la Côte des Blancs restent accessibles en voiture. Les temps de trajet du site sont des estimations : circulation, travaux et stationnement doivent être intégrés au programme.",
      "Avize fonctionne particulièrement bien pour une escapade lente. Une visite de cave, une promenade dans les vignes et un dîner suffisent à structurer la journée avant de profiter de la baignoire balnéo et du sauna privatifs.",
    ],
    steps: [
      {
        name: "Choisir une étape locale",
        text: "Sélectionnez une cave, un village ou une balade.",
      },
      {
        name: "Réserver une table",
        text: "Vérifiez horaires et trajet auprès du restaurant.",
      },
      {
        name: "Préserver du temps dans la suite",
        text: "Évitez de transformer l’escapade en programme chronométré.",
      },
      {
        name: "Préparer le retour",
        text: "Ajoutez une étape à Épernay après le départ si votre route le permet.",
      },
    ],
    comparison: [
      {
        criterion: "Ambiance",
        absolu: "Village viticole calme",
        alternative: "Centre urbain plus animé",
      },
      {
        criterion: "Vignoble",
        absolu: "Au cœur de la Côte des Blancs",
        alternative: "Trajet nécessaire",
      },
      {
        criterion: "Épernay",
        absolu: "Environ 20 minutes",
        alternative: "Variable",
      },
      {
        criterion: "Expérience",
        absolu: "Suite privative et tourisme lent",
        alternative: "Programme plus urbain",
      },
    ],
    faq: [
      {
        question: "Avize est-elle proche d’Épernay ?",
        answer:
          "Oui. Le trajet indicatif est d’environ vingt minutes, selon la circulation.",
      },
      {
        question: "Que faire autour d’Avize ?",
        answer:
          "Les visiteurs peuvent explorer la Côte des Blancs, réserver une cave, marcher dans le vignoble ou rejoindre Épernay.",
      },
    ],
    satellites: [
      { href: "/love-room/avize", label: "Love Room à Avize" },
      {
        href: "/guide-touristique/cote-des-blancs",
        label: "Route de la Côte des Blancs",
      },
      { href: "/restaurants", label: "Restaurants autour d’Absolu" },
      { href: "/blog/visiter-avize", label: "Guide pour visiter Avize" },
    ],
  },
];
export const getResourcePillar = (slug: string) =>
  resourcePillars.find((item) => item.slug === slug);
