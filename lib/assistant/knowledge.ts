export const assistantScenarios = [
  {
    id: "anniversaire",
    label: "Anniversaire",
    answer:
      "Pour un anniversaire, choisissez d’abord une date certaine. La décoration romantique et le champagne figurent parmi les options tarifaires lorsqu’ils sont actifs ; leur disponibilité exacte est confirmée dans le récapitulatif.",
  },
  {
    id: "demande",
    label: "Demande en mariage",
    answer:
      "Pour une demande en mariage, contactez Absolu avant d’engager des frais annexes. Précisez la date, le moment souhaité et les éléments indispensables afin d’obtenir une confirmation écrite.",
  },
  {
    id: "saint-valentin",
    label: "Saint-Valentin",
    answer:
      "La Saint-Valentin est une période très demandée. Vérifiez le calendrier au plus tôt et envisagez une date voisine si la nuit du 14 février n’est plus disponible.",
  },
  {
    id: "week-end",
    label: "Week-end romantique",
    answer:
      "Pour un week-end romantique, gardez un programme léger : une activité en Champagne, un dîner réservé et du temps dans la suite avec baignoire balnéo et sauna privatifs.",
  },
] as const;

export const assistantKnowledge = [
  {
    keywords: ["balneo", "baignoire", "spa", "jacuzzi"],
    answer:
      "La baignoire balnéo est privative et réservée aux occupants de la suite. Elle se trouve directement dans l’espace bien-être.",
  },
  {
    keywords: ["sauna", "infrarouge"],
    answer:
      "Le sauna infrarouge est privatif et intégré à la suite. Respectez les consignes sur place, hydratez-vous et tenez compte de toute contre-indication personnelle.",
  },
  {
    keywords: ["parking", "stationnement", "voiture"],
    answer:
      "Les modalités exactes de stationnement ne sont pas encore présentées comme une prestation garantie. Demandez une confirmation avant votre déplacement.",
  },
  {
    keywords: ["horaire", "arrivee", "depart", "check-in", "check-out"],
    answer:
      "Les horaires applicables figurent dans votre confirmation. Une arrivée anticipée ou un départ tardif nécessitent un accord explicite.",
  },
  {
    keywords: ["annulation", "remboursement", "modifier"],
    answer:
      "Les règles d’annulation et de modification dépendent des conditions acceptées lors de la réservation. Consultez le récapitulatif puis contactez Absolu rapidement en cas d’imprévu.",
  },
  {
    keywords: ["champagne", "bouteille"],
    answer:
      "Une bouteille de champagne peut être proposée comme option lorsqu’elle est active ; elle n’est pas présumée incluse. L’abus d’alcool est dangereux pour la santé, à consommer avec modération.",
  },
  {
    keywords: ["decoration", "petale", "surprise"],
    answer:
      "La décoration romantique et les pétales peuvent être proposés comme options. Vérifiez leur présence, leur tarif et les détails dans le récapitulatif correspondant à vos dates.",
  },
  {
    keywords: ["cadeau", "bon"],
    answer:
      "Consultez la page Bons cadeaux pour connaître les formules réellement disponibles, leur validité et leurs conditions d’utilisation.",
  },
  {
    keywords: ["equipement", "wifi", "linge", "serviette", "peignoir"],
    answer:
      "La suite confirme notamment baignoire balnéo, sauna infrarouge, douche à l’italienne, grand lit double, coin café, télévision, Wi-Fi, peignoirs et serviettes.",
  },
  {
    keywords: ["adresse", "acces", "avize", "epernay"],
    answer:
      "Absolu se situe au 36 rue Pasteur, 51190 Avize, sur la Côte des Blancs et à proximité d’Épernay.",
  },
] as const;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function findAssistantAnswer(query: string) {
  const normalized = normalize(query);
  const result = assistantKnowledge
    .map((entry) => ({
      entry,
      score: entry.keywords.filter((word) => normalized.includes(word)).length,
    }))
    .sort((a, b) => b.score - a.score)[0];
  return result?.score
    ? result.entry.answer
    : "Je n’ai pas trouvé de réponse suffisamment fiable. Consultez le centre d’aide ou contactez Absolu en précisant vos dates et votre question.";
}
