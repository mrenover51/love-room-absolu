import type Stripe from "stripe";
import { stripeProvider } from "@/lib/stripe/stripe-provider";
import { PaymentService } from "@/lib/stripe/payment-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmation, sendReservationRequestEmail, sendStatusEmail } from "@/lib/email";
import { sendGiftCard } from "@/lib/gifts/email";
export const runtime = "nodejs";
type EmailRow = {
  reference: string;
  guest_first_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  total: number;
};
const emailData = (row: EmailRow) => ({
  reference: row.reference,
  firstName: row.guest_first_name,
  email: row.guest_email,
  checkIn: row.check_in,
  checkOut: row.check_out,
  totalAmount: row.total,
});
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signature absente", { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripeProvider.constructWebhook(await request.text(), signature);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }
  const payments = new PaymentService();
  try {
    const claimed = await payments.claimEvent(event.id, event.type);
    if (!claimed)
      return new Response("OK");
    const db = createAdminClient();
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const giftId = session.metadata?.gift_id;
      if (giftId) {
        if (session.payment_status !== "paid") throw new Error("INVALID_GIFT_SESSION");
        const activatedAt = new Date(), expiresAt = new Date(activatedAt); expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        const { data: gift, error } = await db.from("gift_cards").update({ status: "active", activated_at: activatedAt.toISOString(), expires_at: expiresAt.toISOString(), stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null, updated_at: activatedAt.toISOString() }).eq("id", giftId).eq("status", "pending_payment").select("reference,recipient_name,sender_name,purchaser_email,message,amount,expires_at").maybeSingle();
        if (error) throw error;
        if (gift) await sendGiftCard({ email: gift.purchaser_email, reference: gift.reference, recipient: gift.recipient_name, sender: gift.sender_name, message: gift.message, amount: gift.amount, expiresAt: new Date(gift.expires_at).toLocaleDateString("fr-FR") });
        return new Response("OK");
      }
      const id = session.metadata?.reservation_id;
      if (!id || session.payment_status !== "paid")
        throw new Error("INVALID_SESSION");
      const changed = await payments.confirm(
        id,
        session.id,
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      );
      if (changed) {
        const requestId = session.metadata?.reservation_request_id;
        if(requestId)await db.from("reservation_requests").update({statut:"confirmed",updated_at:new Date().toISOString()}).eq("id",requestId).eq("statut","pending_payment");
        const promoCode = session.metadata?.promo_code;
        if (promoCode) {
          const { data: promo } = await db
            .from("promo_codes")
            .select("uses")
            .eq("code", promoCode)
            .maybeSingle();
          if (promo)
            await db
              .from("promo_codes")
              .update({ uses: promo.uses + 1 })
              .eq("code", promoCode);
        }
        const { data } = await db
          .from("reservations")
          .select(
            "reference,guest_first_name,guest_email,check_in,check_out,total",
          )
          .eq("id", id)
          .single();
        if (data) await sendConfirmation(emailData(data));
      }
    } else if (event.type === "checkout.session.expired") {
      const giftId = event.data.object.metadata?.gift_id;
      if (giftId) { await db.from("gift_cards").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", giftId).eq("status", "pending_payment"); return new Response("OK"); }
      const id = event.data.object.metadata?.reservation_id;
      if (id) {
        const { data } = await db
          .from("reservations")
          .update({
            status: "cancelled",
            payment_status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("status", "pending_payment")
          .select(
            "reference,guest_first_name,guest_email,check_in,check_out,total",
          )
          .maybeSingle();
        const requestId=event.data.object.metadata?.reservation_request_id;
        if(data&&!requestId)await sendStatusEmail("failed",emailData(data));
        if(requestId){const{data:requestRow}=await db.from("reservation_requests").update({statut:"expired",updated_at:new Date().toISOString()}).eq("id",requestId).eq("statut","pending_payment").select("prenom,email,date_arrivee,date_depart,prix_calcule").maybeSingle();if(requestRow)await sendReservationRequestEmail("expired",{firstName:requestRow.prenom,email:requestRow.email,checkIn:requestRow.date_arrivee,checkOut:requestRow.date_depart,totalAmount:requestRow.prix_calcule})}
      }
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object,
        pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
      if (pi) {
        const full = charge.amount_refunded >= charge.amount,
          { data } = await db
            .from("reservations")
            .update({
              status: full ? "refunded" : "confirmed",
              payment_status: full ? "refunded" : "partially_refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent", pi)
            .select(
              "reference,guest_first_name,guest_email,check_in,check_out,total",
            )
            .maybeSingle();
        if (full && data) await sendStatusEmail("refunded", emailData(data));
      }
    }
    return new Response("OK");
  } catch (error) {
    await payments.releaseEvent(event.id);
    console.error("stripe_webhook_failed", {
      eventId: event.id,
      type: event.type,
      code: error instanceof Error ? error.message : "UNKNOWN",
    });
    return new Response("Erreur temporaire", { status: 500 });
  }
}
