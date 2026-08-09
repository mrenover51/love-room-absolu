import "server-only";
import { randomBytes } from "node:crypto";
import { calculatePriceFromConfig } from "@/lib/booking/pricing";
import { assertMinimumAdvanceDays } from "@/lib/booking/minimum-advance-days";
import type { PriceBreakdown } from "@/lib/booking/types";
import type { CreateReservationDto } from "../validators/reservation";
import { SupabasePricingRepository } from "../repositories/pricing-repository";
import { SupabaseReservationRepository } from "../repositories/reservation-repository";

export class ReservationService {
  constructor(
    private reservations = new SupabaseReservationRepository(),
    private pricing = new SupabasePricingRepository(),
  ) {}
  async calculatePrice(
    checkIn: string,
    checkOut: string,
    extraKeys: string[],
    promoCode?: string,
    guestCount = 1,
  ): Promise<PriceBreakdown> {
    const promo = promoCode
      ? await this.pricing.validatePromoCode(promoCode)
      : null;
    if (promoCode && !promo) throw new Error("PROMO_INVALID");
    const config = await this.pricing.getConfig();
    assertMinimumAdvanceDays(checkIn, config.minimumAdvanceDays);
    return calculatePriceFromConfig(
      checkIn,
      checkOut,
      extraKeys,
      config,
      promo?.discountPercent ?? 0,
      promo?.code,
      guestCount,
    );
  }
  async validateMinimumAdvanceDays(checkIn: string) {
    const config = await this.pricing.getConfig();
    assertMinimumAdvanceDays(checkIn, config.minimumAdvanceDays);
  }
  async createReservation(input: CreateReservationDto) {
    if (!(await this.isAvailable(input.checkIn, input.checkOut)))
      throw new Error("DATES_UNAVAILABLE");
    const pricing = await this.calculatePrice(
        input.checkIn,
        input.checkOut,
        input.extraKeys,
        input.promoCode,
        input.guestCount,
      ),
      reference = `ABS-${new Date().getUTCFullYear()}-${randomBytes(5).toString("base64url").slice(0, 6).toUpperCase()}`,
      expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
    const id = await this.reservations.create({
      reference,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      guestCount: input.guestCount,
      message: input.message,
      expiresAt,
      pricing,
    });
    return { id, reference, expiresAt, pricing };
  }
  confirmReservation() {
    throw new Error("Confirmation réservée au webhook signé.");
  }
  async cancelReservation(id: string) {
    return this.reservations.cancelPending(id);
  }
  refundReservation() {
    throw new Error("Remboursement réservé au service de paiement.");
  }
  async findReservation(id: string) {
    return this.reservations.findReservation(id);
  }
  async isAvailable(checkIn: string, checkOut: string) {
    return this.reservations.isAvailable(checkIn, checkOut);
  }
  blockDates() {
    throw new Error("Blocage réalisé atomiquement par confirm_reservation.");
  }
  syncCalendar() {
    throw new Error("Synchronisation déléguée à ICalendarRepository.");
  }
}
