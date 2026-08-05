import {
  Bath,
  BedDouble,
  DoorOpen,
  Radio,
  ShowerHead,
  Sparkles,
  Tv,
  Wifi,
  House,
  Maximize,
  Utensils,
  Coffee,
  Wind,
  Ban,
  Armchair,
  Thermometer,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { BOOKING_CONFIG } from "@/lib/booking/constants";
import {
  DEFAULT_STAY_SETTINGS,
  getStayCopy,
  type StaySettings,
} from "@/lib/stay-config";

export const navigation = [
  { label: "Accueil", href: "/" },
  { label: "La suite", href: "/la-suite" },
  { label: "Galerie", href: "/galerie" },
  { label: "Vidéos", href: "/videos" },
  { label: "Équipements", href: "/equipements" },
  { label: "Réservation", href: "/reservation" },
  { label: "Contact", href: "/contact" },
  { label: "Autour de nous", href: "/love-room" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Guide touristique", href: "/guide-touristique" },
  { label: "Carte", href: "/carte-touristique" },
  { label: "Ressources", href: "/ressources" },
  { label: "Avis clients", href: "/avis" },
  { label: "Inspirations", href: "/experiences-romantiques" },
] as const;

export const experiences = [
  {
    title: "Baignoire balnéo privative",
    description:
      "Glissez-vous dans une eau chaude après une journée au cœur des vignobles, puis laissez les bulles et le silence suspendre le temps.",
    detail: "Bien-être à deux",
    natural: "/images/optimized/salledebain.webp",
    ambient: "/images/optimized/salledebainviolet.webp",
    position: "object-center",
  },
  {
    title: "Sauna infrarouge",
    description:
      "Entrez dans la chaleur douce du bois et prolongez cette parenthèse à deux dans une atmosphère calme et enveloppante.",
    detail: "Chaleur enveloppante",
    natural: "/images/optimized/sauna.webp",
    ambient: "/images/optimized/saunaviolet.webp",
    position: "object-center",
  },
  {
    title: "Douche à l’italienne",
    description:
      "Retrouvez la fraîcheur de l’eau dans un espace aux lignes pures, doucement redessiné par la lumière du soir.",
    detail: "Rituel sensoriel",
    natural: "/images/optimized/douche.webp",
    ambient: "/images/optimized/doucheviolet.webp",
    position: "object-center",
  },
] as const;

export const amenities = [
  { label: "Suite privative", icon: House },
  { label: "35 m²", icon: Maximize },
  { label: "Grand lit double", icon: BedDouble },
  { label: "Baignoire balnéo", icon: Bath },
  { label: "Sauna privatif", icon: Radio },
  { label: "Douche à l’italienne", icon: ShowerHead },
  { label: "Coin café", icon: Coffee },
  { label: "Réfrigérateur", icon: Utensils },
  { label: "Micro-ondes", icon: Utensils },
  { label: "Machine à café", icon: Coffee },
  { label: "Bouilloire", icon: Coffee },
  { label: "Grille-pain", icon: Utensils },
  { label: "Coin repas", icon: Utensils },
  { label: "Télévision écran plat", icon: Tv },
  { label: "Wi-Fi gratuit", icon: Wifi },
  { label: "Entrée indépendante", icon: DoorOpen },
  { label: "Rez-de-chaussée", icon: House },
  { label: "Coin salon", icon: Armchair },
  { label: "Peignoirs", icon: Sparkles },
  { label: "Serviettes", icon: Sparkles },
  { label: "Sèche-cheveux", icon: Wind },
  { label: "Chauffage", icon: Thermometer },
  { label: "Penderie", icon: House },
  { label: "Logement indépendant", icon: House },
  { label: "Non-fumeur", icon: Ban },
] as const;

export const galleryImages = [
  {
    src: "/images/optimized/lit.webp",
    alt: "Lit de la suite Absolu dans une ambiance tamisée",
  },
  {
    src: "/images/optimized/entree2.webp",
    alt: "Entrée contemporaine de la suite Absolu",
  },
  {
    src: "/images/optimized/salledebainviolet.webp",
    alt: "Baignoire balnéo éclairée d’une lumière violette",
  },
  {
    src: "/images/optimized/sauna.webp",
    alt: "Sauna infrarouge privatif de la suite",
  },
  {
    src: "/images/optimized/doucheviolet.webp",
    alt: "Douche à l’italienne en ambiance lumineuse",
  },
  {
    src: "/images/optimized/entree1.webp",
    alt: "Vue d’ensemble élégante de l’entrée",
  },
  {
    src: "/images/optimized/salledebain.webp",
    alt: "Espace baignoire balnéo de la suite en lumière naturelle",
  },
  {
    src: "/images/optimized/saunaviolet.webp",
    alt: "Sauna infrarouge dans l’ambiance violette",
  },
  {
    src: "/images/optimized/douche.webp",
    alt: "Douche à l’italienne en lumière naturelle",
  },
] as const;

export const contactDetails = {
  phone: siteConfig.phone as string,
  email: siteConfig.email as string,
  address: siteConfig.address,
  access: "36 rue Pasteur, 51190 Avize, France",
} as const;

export function createFaqItems(settings: StaySettings = DEFAULT_STAY_SETTINGS) {
  const copy = getStayCopy(settings);
  return [
    {
      question: "Quels sont les horaires ?",
      answer: `${copy.arrivalText} ${copy.departureText} ${copy.flexibilityText}`,
    },
    {
      question: "Le parking est-il disponible ?",
      answer: "Les modalités de stationnement restent à confirmer.",
    },
    {
      question: "Le petit-déjeuner est-il proposé ?",
      answer: "Cette prestation reste à confirmer.",
    },
    {
      question: "La baignoire balnéo est-elle privative ?",
      answer:
        "Oui. La baignoire balnéo est exclusivement réservée aux occupants de la suite.",
    },
    {
      question: "Le sauna est-il privatif ?",
      answer: "Oui. Le sauna infrarouge est intégré à la suite privative.",
    },
    {
      question: "L’expérience Tantra est-elle une prestation ?",
      answer:
        "Non. Absolu ne propose pas de prestation de Tantra. L’ambiance de la suite est simplement inspirée des valeurs de reconnexion, de relaxation, de bien-être et de complicité qui caractérisent cet univers.",
    },
    {
      question: "Le paiement est-il sécurisé ?",
      answer:
        "Aucun paiement n’est prélevé lors de la demande en ligne. Les modalités définitives seront communiquées après vérification des disponibilités.",
    },
    {
      question: "Les animaux sont-ils acceptés ?",
      answer: "La politique d’accueil des animaux reste à confirmer.",
    },
    {
      question: "Peut-on réserver directement ?",
      answer:
        "Oui. La réservation directe est proposée sur le site, sous réserve de disponibilité.",
    },
  ];
}
export const faqItems = createFaqItems();

// Tarifs de démonstration uniquement. À valider avant mise en production.
export const bookingConfig = {
  currency: "EUR",
  baseNightAmount: BOOKING_CONFIG.weekdayAmounts[1],
  fridaySupplement:
    BOOKING_CONFIG.weekdayAmounts[5] - BOOKING_CONFIG.weekdayAmounts[1],
  saturdaySupplement:
    BOOKING_CONFIG.weekdayAmounts[6] - BOOKING_CONFIG.weekdayAmounts[1],
  serviceFeeAmount: 0,
  minimumNights: BOOKING_CONFIG.minimumNights,
  maximumNights: BOOKING_CONFIG.maximumNights,
  maximumGuests: BOOKING_CONFIG.maximumGuests,
  availabilityMonths: BOOKING_CONFIG.availabilityMonths,
  extras: BOOKING_CONFIG.extras.filter((extra) => extra.enabled),
} as const;
