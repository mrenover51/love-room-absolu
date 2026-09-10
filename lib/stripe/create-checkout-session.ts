import type Stripe from "stripe";

export async function createReservationCheckoutSession(input:{
  stripe:Pick<Stripe,"checkout">;
  reservation:{id:string;reference:string;expiresAt:string;promoCode?:string};
  lineItems:Stripe.Checkout.SessionCreateParams.LineItem[];
  email:string;
  siteUrl:string;
  requestId?:string;
}) {
  const {stripe,reservation,email,siteUrl,requestId,lineItems}=input;
  const metadata={reservation_id:reservation.id,reference:reservation.reference,...(requestId?{reservation_request_id:requestId}:{}),...(reservation.promoCode?{promo_code:reservation.promoCode}:{})};
  return stripe.checkout.sessions.create({mode:"payment",customer_email:email,expires_at:Math.floor(Date.parse(reservation.expiresAt)/1000),line_items:lineItems,success_url:`${siteUrl}/reservation/succes?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${siteUrl}/reservation/annulee`,metadata,payment_intent_data:{metadata}},{idempotencyKey:`checkout-${reservation.id}`});
}
