import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReservationService } from "@/lib/supabase/services/reservation-service";
import { SupabaseReservationRepository } from "@/lib/supabase/repositories/reservation-repository";
import { CheckoutService } from "@/lib/stripe/checkout-service";
import { getReservationWorkflowSettings } from "./workflow-settings";
import {
  sendReservationRequestAdminEmail,
  sendReservationRequestEmail,
} from "@/lib/email";
import { stripeProvider } from "@/lib/stripe/stripe-provider";
import type { PriceBreakdown } from "./types";
import type { ReservationRequestInput } from "./validation";

type RequestRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_arrivee: string;
  date_depart: string;
  adultes: number;
  options: unknown;
  prix_calcule: number;
  message: string | null;
  statut: string;
  reservation_id: string | null;
  stripe_checkout_url: string | null;
};
const reference = () =>
  `ABS-${new Date().getUTCFullYear()}-${randomBytes(5).toString("base64url").slice(0, 6).toUpperCase()}`;
const emailData = (row: RequestRow) => ({
  firstName: row.prenom,
  email: row.email,
  checkIn: row.date_arrivee,
  checkOut: row.date_depart,
  totalAmount: row.prix_calcule,
});
async function safelyEmail(
  kind: Parameters<typeof sendReservationRequestEmail>[0],
  row: RequestRow,
  checkoutUrl?: string,
) {
  try {
    await sendReservationRequestEmail(kind, { ...emailData(row), checkoutUrl });
  } catch (error) {
    console.error("reservation_request_email_failed", {
      kind,
      requestId: row.id,
      code: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
}
async function safelyAdminEmail(row: RequestRow) {
  try {
    await sendReservationRequestAdminEmail({
      requestId: row.id,
      firstName: row.prenom,
      lastName: row.nom,
      email: row.email,
      phone: row.telephone,
      checkIn: row.date_arrivee,
      checkOut: row.date_depart,
      totalAmount: row.prix_calcule,
      message: row.message,
    });
  } catch (error) {
    console.error("reservation_request_admin_email_failed", {
      requestId: row.id,
      code: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
}

export async function createManualReservationRequest(
  input: ReservationRequestInput,
) {
  if ((await getReservationWorkflowSettings()).mode !== "manual")
    throw new Error("MANUAL_BOOKING_DISABLED");
  const reservations = new ReservationService();
  if (!(await reservations.isAvailable(input.checkIn, input.checkOut)))
    throw new Error("DATES_UNAVAILABLE");
  const pricing = await reservations.calculatePrice(
    input.checkIn,
    input.checkOut,
    input.extraKeys,
    input.promoCode,
    input.guestCount,
  );
  const db = createAdminClient(),
    recent = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: duplicate } = await db
    .from("reservation_requests")
    .select("id")
    .eq("email", input.email)
    .eq("date_arrivee", input.checkIn)
    .eq("date_depart", input.checkOut)
    .in("statut", ["new", "accepted", "pending_payment"])
    .gte("created_at", recent)
    .maybeSingle();
  if (duplicate) throw new Error("DUPLICATE_REQUEST");
  const { data, error } = await db
    .from("reservation_requests")
    .insert({
      nom: input.lastName,
      prenom: input.firstName,
      email: input.email,
      telephone: input.phone,
      date_arrivee: input.checkIn,
      date_depart: input.checkOut,
      adultes: input.guestCount,
      options: {
        extraKeys: input.extraKeys,
        promoCode: pricing.promoCode,
        pricing,
      },
      prix_calcule: pricing.totalAmount,
      message: input.message || null,
      statut: "new",
      provider: "site",
      source: "direct",
    })
    .select(
      "id,nom,prenom,email,telephone,date_arrivee,date_depart,adultes,options,prix_calcule,message,statut,reservation_id,stripe_checkout_url",
    )
    .single();
  if (error || !data) throw new Error("RESERVATION_REQUEST_CREATE_FAILED");
  await db
    .from("notifications")
    .insert({
      kind: "reservation_request",
      title: "Nouvelle demande",
      message: `${data.prenom} ${data.nom} · ${data.date_arrivee} au ${data.date_depart}.`,
    });
  await Promise.all([
    safelyEmail("received", data as RequestRow),
    safelyAdminEmail(data as RequestRow),
  ]);
  return { id: data.id, status: "new", totalAmount: pricing.totalAmount };
}

export async function acceptManualReservationRequest(id: string) {
  const db = createAdminClient(),
    { data: existing, error: readError } = await db
      .from("reservation_requests")
      .select(
        "id,nom,prenom,email,telephone,date_arrivee,date_depart,adultes,options,prix_calcule,message,statut,reservation_id,stripe_checkout_url",
      )
      .eq("id", id)
      .single();
  if (readError || !existing) throw new Error("RESERVATION_REQUEST_NOT_FOUND");
  const row = existing as RequestRow;
  if (row.statut === "pending_payment" && row.stripe_checkout_url)
    return { url: row.stripe_checkout_url };
  if (row.statut !== "new")
    throw new Error("RESERVATION_REQUEST_INVALID_STATUS");
  const stored = row.options as { pricing?: PriceBreakdown };
  if (!stored.pricing || stored.pricing.totalAmount !== row.prix_calcule)
    throw new Error("RESERVATION_REQUEST_PRICE_INVALID");
  await new ReservationService().validateMinimumAdvanceDays(row.date_arrivee);
  const { data: claimed } = await db
    .from("reservation_requests")
    .update({ statut: "accepted", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("statut", "new")
    .select("id")
    .maybeSingle();
  if (!claimed) throw new Error("RESERVATION_REQUEST_ALREADY_PROCESSED");
  const settings = await getReservationWorkflowSettings(),
    expiresAt = new Date(
      Date.now() + settings.paymentExpirationHours * 3_600_000,
    ).toISOString(),
    repository = new SupabaseReservationRepository();
  let reservationId: string | undefined;
  try {
    reservationId = await repository.create({
      reference: reference(),
      checkIn: row.date_arrivee,
      checkOut: row.date_depart,
      firstName: row.prenom,
      lastName: row.nom,
      email: row.email,
      phone: row.telephone,
      guestCount: row.adultes,
      message: row.message ?? undefined,
      expiresAt,
      pricing: stored.pricing,
    });
    const reservation = {
      id: reservationId,
      reference: await reservationReference(reservationId),
      expiresAt,
      pricing: stored.pricing,
    };
    const checkout = await new CheckoutService().createForApprovedRequest(
      reservation,
      row.email,
      row.id,
    );
    const { error } = await db
      .from("reservation_requests")
      .update({
        statut: "pending_payment",
        expires_at: expiresAt,
        stripe_checkout_url: checkout.url,
        reservation_id: reservationId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("statut", "accepted");
    if (error) throw new Error("RESERVATION_REQUEST_UPDATE_FAILED");
    await safelyEmail("accepted", row, checkout.url);
    return checkout;
  } catch (error) {
    if (reservationId) {
      const { data: pending } = await db
        .from("reservations")
        .select("stripe_checkout_session")
        .eq("id", reservationId)
        .maybeSingle();
      if (pending?.stripe_checkout_session)
        try {
          await stripeProvider
            .getClient()
            .checkout.sessions.expire(pending.stripe_checkout_session);
        } catch {
          console.error("reservation_request_checkout_cleanup_failed", {
            requestId: id,
          });
        }
      await repository.cancelPending(reservationId);
    }
    await db
      .from("reservation_requests")
      .update({
        statut: "new",
        reservation_id: null,
        expires_at: null,
        stripe_checkout_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("statut", "accepted");
    throw error;
  }
}

async function reservationReference(id: string) {
  const { data, error } = await createAdminClient()
    .from("reservations")
    .select("reference")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error("RESERVATION_READ_FAILED");
  return data.reference;
}

export async function rejectManualReservationRequest(
  id: string,
  adminNotes?: string,
) {
  const db = createAdminClient(),
    { data, error } = await db
      .from("reservation_requests")
      .update({
        statut: "rejected",
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("statut", ["new", "accepted"])
      .select(
        "id,nom,prenom,email,telephone,date_arrivee,date_depart,adultes,options,prix_calcule,message,statut,reservation_id,stripe_checkout_url",
      )
      .maybeSingle();
  if (error || !data) throw new Error("RESERVATION_REQUEST_REJECT_FAILED");
  await safelyEmail("rejected", data as RequestRow);
}

export async function expireManualReservationRequests() {
  const db = createAdminClient(),
    now = new Date().toISOString(),
    { data, error } = await db
      .from("reservation_requests")
      .select(
        "id,nom,prenom,email,telephone,date_arrivee,date_depart,adultes,options,prix_calcule,message,statut,reservation_id,stripe_checkout_url",
      )
      .eq("statut", "pending_payment")
      .lt("expires_at", now);
  if (error) throw new Error("RESERVATION_REQUEST_EXPIRATION_READ_FAILED");
  let count = 0;
  for (const item of data ?? []) {
    const row = item as RequestRow;
    if (row.reservation_id) {
      const { data: reservation, error: reservationError } = await db
        .from("reservations")
        .select("stripe_checkout_session")
        .eq("id", row.reservation_id)
        .single();
      if (reservationError || !reservation?.stripe_checkout_session) continue;
      try {
        const session = await stripeProvider
          .getClient()
          .checkout.sessions.retrieve(reservation.stripe_checkout_session);
        if (session.payment_status === "paid") continue;
        if (session.status === "open")
          await stripeProvider.getClient().checkout.sessions.expire(session.id);
      } catch (error) {
        console.error("reservation_request_expiration_stripe_failed", {
          requestId: row.id,
          code: error instanceof Error ? error.message : "UNKNOWN",
        });
        continue;
      }
    }
    const { data: expired } = await db
      .from("reservation_requests")
      .update({ statut: "expired", updated_at: now })
      .eq("id", row.id)
      .eq("statut", "pending_payment")
      .select("id")
      .maybeSingle();
    if (!expired) continue;
    if (row.reservation_id)
      await db
        .from("reservations")
        .update({
          status: "cancelled",
          payment_status: "failed",
          updated_at: now,
        })
        .eq("id", row.reservation_id)
        .eq("status", "pending_payment");
    count += 1;
    await safelyEmail("expired", row);
  }
  return { expired: count };
}
