import { z } from "zod";

export const checkoutSchema = z.object({
  checkIn: z.iso.date(), checkOut: z.iso.date(),
  firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100),
  email: z.email().max(254), phone: z.string().trim().min(6).max(30), guestCount: z.number().int().min(1).max(2),
  message: z.string().trim().max(2000).optional(), extras: z.array(z.object({ key: z.string().min(1).max(80), quantity: z.number().int().min(1).max(10) })).max(10).default([]),
}).refine((v) => v.checkOut > v.checkIn, { message: "La date de départ doit suivre la date d’arrivée", path: ["checkOut"] });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
