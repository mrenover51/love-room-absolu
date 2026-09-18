import { siteConfig } from "@/lib/site-config";
import "server-only";
import { stripeProvider } from "./stripe-provider";
import { createReservationCheckoutSession } from "./create-checkout-session";
import { checkoutLineItems } from "./stripe-mapper";
import { ReservationService } from "@/lib/supabase/services/reservation-service";
import { SupabaseReservationRepository } from "@/lib/supabase/repositories/reservation-repository";
import type { CreateReservationDto } from "@/lib/supabase/validators/reservation";
import type { PriceBreakdown } from "@/lib/booking/types";
import type { Locale } from "@/lib/i18n/config";
export class CheckoutService {
  constructor(
    private reservations = new ReservationService(),
    private repository = new SupabaseReservationRepository(),
  ) {}
  private async createSession(reservation:{id:string;reference:string;expiresAt:string;pricing:PriceBreakdown},email:string,requestId?:string,locale:Locale="fr") {
    const siteUrl = siteConfig.url;
    const session = await createReservationCheckoutSession({stripe:stripeProvider.getClient(),reservation:{...reservation,promoCode:reservation.pricing.promoCode},lineItems:checkoutLineItems(reservation.pricing),email,siteUrl,requestId,locale});
    if (!session.url) throw new Error("CHECKOUT_URL_MISSING");
    await this.repository.attachCheckout(reservation.id, session.id);
    return { url: session.url, reference: reservation.reference };
  }
  async create(input: CreateReservationDto, locale: Locale = "fr") {
    const reservation = await this.reservations.createReservation(input);
    try {
      return await this.createSession(reservation,input.email,undefined,locale);
    } catch (error) {
      await this.repository.cancelPending(reservation.id);
      throw error;
    }
  }
  async createForApprovedRequest(reservation:{id:string;reference:string;expiresAt:string;pricing:PriceBreakdown},email:string,requestId:string){return this.createSession(reservation,email,requestId)}
}
