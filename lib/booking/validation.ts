import { z } from "zod";
import { BOOKING_CONFIG } from "./constants";
import { nightsBetween } from "./date-utils";

export const reservationRequestSchema = z
  .object({
    checkIn: z.iso.date("Veuillez sélectionner une date d’arrivée."),
    checkOut: z.iso.date("Veuillez sélectionner une date de départ."),
    extraKeys: z
      .array(z.string().trim().min(1).max(80))
      .max(BOOKING_CONFIG.extras.length),
    promoCode: z.string().trim().toUpperCase().max(40).optional(),
    firstName: z
      .string()
      .trim()
      .min(1, "Veuillez renseigner votre prénom.")
      .max(80),
    lastName: z
      .string()
      .trim()
      .min(1, "Veuillez renseigner votre nom.")
      .max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Veuillez saisir une adresse email valide.")),
    phone: z
      .string()
      .trim()
      .min(6, "Veuillez saisir un numéro de téléphone valide.")
      .max(30),
    guestCount: z
      .number()
      .int()
      .min(1, "Sélectionnez au moins une personne.")
      .max(
        BOOKING_CONFIG.maximumGuests,
        "La suite accueille deux personnes maximum.",
      ),
    message: z
      .string()
      .trim()
      .max(1500, "Votre message est trop long.")
      .optional(),
    acceptTerms: z
      .boolean()
      .refine(Boolean, "Veuillez accepter les conditions de réservation."),
    acceptPrivacy: z
      .boolean()
      .refine(Boolean, "Veuillez accepter la politique de confidentialité."),
    website: z.string().max(0).optional(),
  })
  .superRefine((value, ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const nights = nightsBetween(value.checkIn, value.checkOut);
    if (value.checkIn < today)
      ctx.addIssue({
        code: "custom",
        path: ["checkIn"],
        message: "Une date passée ne peut pas être réservée.",
      });
    if (nights < BOOKING_CONFIG.minimumNights)
      ctx.addIssue({
        code: "custom",
        path: ["checkOut"],
        message: "Le départ doit suivre l’arrivée d’au moins une nuit.",
      });
    if (nights > BOOKING_CONFIG.maximumNights)
      ctx.addIssue({
        code: "custom",
        path: ["checkOut"],
        message: `Le séjour est limité à ${BOOKING_CONFIG.maximumNights} nuits.`,
      });
  });
export type ReservationRequestInput = z.infer<typeof reservationRequestSchema>;
