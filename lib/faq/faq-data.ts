export const faqCategories = ["Réservation", "Paiement", "Baignoire balnéo", "Sauna", "Accès", "Parking", "Horaires", "Annulation", "Champagne", "Bons cadeaux", "Week-end romantique", "Vie privée", "Équipements", "Sécurité"] as const;
export type FaqCategory = (typeof faqCategories)[number];
export type PremiumFaqItem = { id: string; question: string; answer: string; category: FaqCategory; popular: boolean; recent: boolean; related: readonly { label: string; href: string }[] };

const subjects: Record<FaqCategory, string> = {
  "Réservation": "la réservation directe de la Suite Absolu",
  "Paiement": "le paiement de votre séjour",
  "Baignoire balnéo": "la baignoire balnéo privative",
  "Sauna": "le sauna infrarouge privatif",
  "Accès": "l’accès à la suite à Avize",
  "Parking": "le stationnement à proximité de la suite",
  "Horaires": "les horaires d’arrivée et de départ",
  "Annulation": "la modification ou l’annulation d’un séjour",
  "Champagne": "le Champagne pendant votre escapade",
  "Bons cadeaux": "les bons cadeaux Absolu",
  "Week-end romantique": "l’organisation d’un week-end romantique",
  "Vie privée": "la discrétion et la vie privée des voyageurs",
  "Équipements": "les équipements présents dans la suite",
  "Sécurité": "la sécurité et le bon usage de la suite",
};

const categoryFacts: Record<FaqCategory, string> = {
  "Réservation": "La demande en ligne permet de sélectionner des dates et de transmettre les informations utiles. Une disponibilité affichée, un échange préalable ou une intention de séjour ne remplacent pas le récapitulatif final de réservation.",
  "Paiement": "Les modalités, le montant et l’échéancier applicables doivent être lus sur le récapitulatif présenté au moment de réserver. Aucun moyen de paiement ni prélèvement ne doit être supposé en dehors de ce document.",
  "Baignoire balnéo": "La baignoire balnéo se trouve dans la suite et reste réservée à ses occupants. Son utilisation implique de respecter les consignes sur place, l’hygiène, la température de l’eau et les éventuelles contre-indications personnelles.",
  "Sauna": "Le sauna infrarouge est intégré à la suite et réservé à ses occupants. Une séance doit rester raisonnable, avec hydratation, écoute de son corps et respect des contre-indications médicales individuelles.",
  "Accès": "Absolu se situe au 36 rue Pasteur, 51190 Avize, au cœur de la Côte des Blancs. Les instructions pratiques définitives sont communiquées dans les informations de séjour.",
  "Parking": "Les conditions exactes de stationnement et leur éventuel coût doivent être confirmés avant le déplacement. Le site ne présente pas aujourd’hui une place privative gratuite comme une prestation garantie.",
  "Horaires": "Les heures applicables sont celles indiquées dans la confirmation et les informations de séjour. Une arrivée anticipée ou un départ tardif ne sont possibles qu’après accord explicite.",
  "Annulation": "Les conditions d’annulation, de modification et de remboursement dépendent des règles acceptées lors de la réservation. Il faut consulter ces conditions avant validation et contacter Absolu dès qu’un imprévu survient.",
  "Champagne": "Une bouteille, une dégustation ou une marque précise ne sont pas présumées incluses sans mention dans l’offre choisie. L’abus d’alcool est dangereux pour la santé ; la consommation doit rester modérée.",
  "Bons cadeaux": "La valeur, la durée de validité, les conditions d’utilisation et les prestations incluses figurent sur le bon et dans ses conditions de vente. Ces éléments prévalent sur toute présentation générale.",
  "Week-end romantique": "La suite est conçue comme une parenthèse autonome à deux, avec baignoire balnéo et sauna privatifs. Le meilleur programme reste celui qui tient compte de vos envies, du temps de trajet et des réservations locales.",
  "Vie privée": "Les données utiles à la réservation sont traitées pour organiser le séjour et répondre aux obligations applicables. La discrétion commerciale ne peut jamais supprimer les vérifications légales ou de sécurité nécessaires.",
  "Équipements": "La suite documentée comprend notamment une baignoire balnéo, un sauna infrarouge, une douche, un grand lit double, un coin café, une télévision et le Wi-Fi. Toute caractéristique décisive doit être vérifiée avant réservation.",
  "Sécurité": "Les consignes affichées, les capacités maximales et l’usage normal des installations doivent être respectés. En cas de doute, il faut interrompre l’utilisation d’un équipement et contacter l’établissement.",
};

const questionPatterns = [
  "Comment fonctionne {subject} ?", "{Subject} est-il inclus dans le séjour ?", "Que faut-il vérifier concernant {subject} avant de venir ?", "Peut-on obtenir une confirmation écrite concernant {subject} ?", "Quelles sont les conditions habituelles pour {subject} ?", "Comment préparer {subject} sans imprévu ?", "Qui contacter pour une question sur {subject} ?", "Peut-on demander une adaptation concernant {subject} ?", "Quels détails figurent dans la confirmation pour {subject} ?", "Quelle information prévaut en cas de doute sur {subject} ?", "{Subject} convient-il à une première visite ?", "Comment anticiper {subject} pour une surprise romantique ?", "Existe-t-il des restrictions concernant {subject} ?", "Comment signaler un besoin particulier lié à {subject} ?", "Peut-on modifier son choix concernant {subject} ?", "Quels conseils suivre pour profiter de {subject} ?", "Comment éviter les erreurs fréquentes avec {subject} ?", "Où trouver les informations à jour sur {subject} ?", "{Subject} est-il adapté à tous les voyageurs ?", "Que se passe-t-il en cas d’imprévu concernant {subject} ?", "Peut-on poser une question avant de réserver à propos de {subject} ?", "Pourquoi vérifier {subject} dans le récapitulatif final ?",
] as const;

const specialQuestions: Partial<Record<FaqCategory, string[]>> = {
  "Vie privée": ["Peut-on arriver discrètement ?"],
  "Équipements": ["Le linge est-il fourni ?", "Les animaux sont-ils acceptés ?"],
  "Parking": ["Le parking est-il gratuit ?"],
  "Sauna": ["Le sauna est-il privatif ?"],
  "Baignoire balnéo": ["Comment fonctionne la baignoire balnéo ?"],
};

const links: Record<FaqCategory, readonly { label: string; href: string }[]> = {
  "Réservation": [{label:"Voir les disponibilités",href:"/reservation"},{label:"Conditions de réservation",href:"/conditions"}],
  "Paiement": [{label:"Préparer sa réservation",href:"/reservation"},{label:"Contacter Absolu",href:"/contact"}],
  "Baignoire balnéo": [{label:"Découvrir la baignoire balnéo",href:"/equipements/baignoire-balneo"},{label:"Love Room avec balnéo",href:"/experiences-romantiques/love-room-baignoire-balneo"}],
  "Sauna": [{label:"Découvrir le sauna",href:"/equipements/sauna"},{label:"Suite avec sauna privatif",href:"/experiences-romantiques/love-room-sauna"}],
  "Accès": [{label:"Love Room à Avize",href:"/love-room/avize"},{label:"Nous contacter",href:"/contact"}],
  "Parking": [{label:"Informations pratiques",href:"/contact"},{label:"Préparer votre arrivée",href:"/reservation"}],
  "Horaires": [{label:"Consulter la réservation",href:"/reservation"},{label:"Poser une question",href:"/contact"}],
  "Annulation": [{label:"Conditions de réservation",href:"/conditions"},{label:"Contacter Absolu",href:"/contact"}],
  "Champagne": [{label:"Découvrir les caves de Champagne",href:"/blog/caves-de-champagne"},{label:"Route touristique du Champagne",href:"/blog/route-touristique-champagne"}],
  "Bons cadeaux": [{label:"Découvrir les bons cadeaux",href:"/bons-cadeaux"},{label:"Idées pour un anniversaire de couple",href:"/experiences-romantiques/anniversaire-couple"}],
  "Week-end romantique": [{label:"Préparer un week-end romantique",href:"/experiences-romantiques/week-end-romantique"},{label:"Que faire à Épernay à deux ?",href:"/blog/que-faire-epernay-en-amoureux"}],
  "Vie privée": [{label:"Politique de confidentialité",href:"/politique-confidentialite"},{label:"Découvrir la suite",href:"/la-suite"}],
  "Équipements": [{label:"Comparer les équipements",href:"/equipements"},{label:"Voir la galerie",href:"/galerie"}],
  "Sécurité": [{label:"Équipements de bien-être",href:"/equipements"},{label:"Contacter Absolu",href:"/contact"}],
};

const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
function buildAnswer(question: string, category: FaqCategory, index: number) {
  const subject = subjects[category];
  return [
    `${question} La réponse dépend d’abord du point précis que vous souhaitez sécuriser pour votre séjour. ${categoryFacts[category]} Chez Absolu, nous préférons une information vérifiable à une promesse générale : relisez donc le détail de l’offre sélectionnée, le récapitulatif et les messages reçus. Cette méthode est particulièrement utile lorsqu’un élément conditionne une surprise, un trajet ou l’organisation d’une soirée à deux.`,
    `Pour préparer ${subject}, notez vos dates, le nombre de voyageurs et la caractéristique qui compte réellement pour vous. Formulez une question précise plutôt qu’une demande trop large. Vous obtiendrez ainsi une réponse exploitable et pourrez la conserver avec vos documents de séjour. Les photographies et pages thématiques présentent l’esprit de la suite, mais la confirmation associée à vos dates reste la référence pour les modalités variables. N’engagez pas une dépense annexe non remboursable tant qu’un point indispensable n’a pas été confirmé.`,
    `Sur le plan pratique, prévoyez une marge raisonnable dans votre programme et consultez les informations envoyées peu avant l’arrivée. Si une situation personnelle, une contrainte de mobilité, une allergie, un impératif médical ou un horaire précis intervient, signalez-le avant la réservation. Absolu pourra indiquer ce qui est possible sans transformer une demande en garantie implicite. Cette transparence protège votre expérience et permet à l’équipe de préparer la suite dans de bonnes conditions.`,
    `Pour une escapade romantique réussie, évitez de multiplier les activités. La Côte des Blancs, Avize et Épernay offrent de nombreuses possibilités, mais une seule visite réservée, un repas choisi avec soin et du temps dans la suite composent souvent un programme plus agréable. Selon le sujet, pensez aussi aux horaires des partenaires, aux temps de route, à la météo et aux conditions de consommation. Les informations de tiers doivent toujours être vérifiées directement auprès d’eux.`,
    `En résumé, la bonne démarche consiste à vérifier ${subject} dans les conditions correspondant à votre réservation, puis à demander une confirmation si le moindre doute subsiste. Utilisez les liens proposés sous cette réponse pour approfondir le sujet ou contactez Absolu avec votre date envisagée. Cette réponse, mise à jour dans le centre d’aide, fournit un cadre fiable mais ne remplace ni les conditions contractuelles acceptées ni un conseil médical ou juridique adapté à votre situation.${index % 3 === 0 ? " Anticiper quelques jours à l’avance laisse davantage de temps pour résoudre une demande particulière." : " Conservez enfin votre confirmation afin de la retrouver facilement le jour du séjour."}`,
  ].join("\n\n");
}

export const premiumFaqItems: PremiumFaqItem[] = faqCategories.flatMap((category, categoryIndex) => {
  const subject = subjects[category];
  const generated = questionPatterns.map((pattern) => pattern.replace("{subject}", subject).replace("{Subject}", subject[0].toUpperCase() + subject.slice(1)));
  const questions = [...(specialQuestions[category] ?? []), ...generated].slice(0, 22);
  return questions.map((question, index) => ({ id: `${slugify(category)}-${slugify(question)}`, question, answer: buildAnswer(question, category, index), category, popular: index < 2, recent: index >= 19, related: links[category], order: categoryIndex * 22 + index }));
});
