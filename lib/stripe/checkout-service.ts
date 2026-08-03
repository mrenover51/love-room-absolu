import { siteConfig } from "@/lib/site-config";
import "server-only";
import { stripeProvider } from "./stripe-provider";
import { checkoutLineItems } from "./stripe-mapper";
import { ReservationService } from "@/lib/supabase/services/reservation-service";
import { SupabaseReservationRepository } from "@/lib/supabase/repositories/reservation-repository";
import type { CreateReservationDto } from "@/lib/supabase/validators/reservation";
export class CheckoutService {
  constructor(
    private reservations = new ReservationService(),
    private repository = new SupabaseReservationRepository(),
  ) {}
  async create(input: CreateReservationDto) {
    const reservation = await this.reservations.createReservation(input),
      siteUrl = siteConfig.url;
    try {
      const session = await stripeProvider.getClient().checkout.sessions.create(
        {
          mode: "payment",
          customer_email: input.email,
          expires_at: Math.floor(Date.parse(reservation.expiresAt) / 1000),
          line_items: checkoutLineItems(reservation.pricing),
          success_url: `${siteUrl}/reservation/succes?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${siteUrl}/reservation/annulee`,
          metadata: {
            reservation_id: reservation.id,
            reference: reservation.reference,
            ...(reservation.pricing.promoCode
              ? { promo_code: reservation.pricing.promoCode }
              : {}),
          },
          payment_intent_data: {
            metadata: {
              reservation_id: reservation.id,
              reference: reservation.reference,
              ...(reservation.pricing.promoCode
                ? { promo_code: reservation.pricing.promoCode }
                : {}),
            },
          },
        },
        { idempotencyKey: `checkout-${reservation.id}` },
      );
      if (!session.url) throw new Error("CHECKOUT_URL_MISSING");
      await this.repository.attachCheckout(reservation.id, session.id);
      return { url: session.url, reference: reservation.reference };
    } catch (error) {
      await this.repository.cancelPending(reservation.id);
      throw error;
    }
  }
}
