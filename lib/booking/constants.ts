import { STAY_TIMES } from "@/lib/stay-config";

// Valeurs de démonstration centralisées pour le Sprint 3. À valider avant production.
export const BOOKING_CONFIG = {
  checkInTime: STAY_TIMES.checkIn,
  checkOutTime: STAY_TIMES.checkOut,
  currency: "EUR",
  minimumNights: 1,
  maximumNights: 7,
  maximumGuests: 2,
  availabilityMonths: 12,
  holdMinutes: 30,
  weekdayAmounts: {
    0: 17000,
    1: 14000,
    2: 14000,
    3: 15000,
    4: 17000,
    5: 22000,
    6: 24000,
  } as Record<number, number>,
  extras: [
    {
      key: "romantic-decoration",
      label: "Décoration romantique",
      description: "Une mise en scène élégante pour votre arrivée.",
      amount: 2500,
      enabled: true,
    },
    {
      key: "champagne",
      label: "Bouteille de champagne",
      description: "Une bouteille fraîche préparée avant votre arrivée.",
      amount: 4500,
      enabled: true,
    },
    {
      key: "petals",
      label: "Pétales",
      description: "Une touche romantique disposée avec soin.",
      amount: 1500,
      enabled: true,
    },
    {
      key: "late-checkout",
      label: "Départ tardif",
      description: "Profitez de la suite plus longtemps le jour du départ.",
      amount: 3000,
      enabled: true,
    },
    {
      key: "early-checkin",
      label: "Arrivée anticipée",
      description:
        "Accédez à la suite plus tôt, sous réserve de disponibilité.",
      amount: 2500,
      enabled: true,
    },
    {
      key: "breakfast",
      label: "Petit-déjeuner",
      description: "Un petit-déjeuner préparé pour deux.",
      amount: 2000,
      enabled: true,
    },
  ],
} as const;

export function reservationHoldMinutes() {
  const configured = Number.parseInt(
    process.env.RESERVATION_HOLD_MINUTES ?? "",
    10,
  );
  return Number.isFinite(configured) && configured > 0
    ? configured
    : BOOKING_CONFIG.holdMinutes;
}
