// Compatibilité avec les imports existants. Le remplacement Supabase se fera au Sprint 4.
export type { ReservationRepository as BookingRepository } from "./reservation-repository";
export { localReservationRepository as bookingRepository } from "./local-reservation-repository";
