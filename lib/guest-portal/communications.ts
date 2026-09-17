import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendGuestCommunication } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import {
  communicationWindowOpen,
  DEFAULT_ACCESS_LEAD_HOURS,
  reservationAllowsAccess,
  selectKeyboxCode,
} from "./eligibility";
import { getGuestExperienceSettings } from "./settings";
import { ensureGuestPortalToken } from "./repository";
import type { CommunicationType } from "./types";

const validGuestEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
  !email.toLowerCase().endsWith("@invalid.local");

type ReservationRow = {
  id: string;
  reference: string;
  guest_first_name: string;
  guest_email: string;
  guest_count: number;
  check_in: string;
  check_out: string;
  total: number;
  status: string;
  payment_status: string;
  source: string;
  guest_portal_token: string | null;
  reservation_options: Array<{ label: string }>;
};

export function communicationIsDue(
  type: Exclude<CommunicationType, "confirmation">,
  reservation: ReservationRow,
  now: Date,
  checkInTime = "16:00",
  accessLeadHours = DEFAULT_ACCESS_LEAD_HOURS,
) {
  return communicationWindowOpen({
    type,
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    now,
    checkInTime,
    accessLeadHours,
  });
}

export async function queueConfirmation(reservationId: string) {
  const token = await ensureGuestPortalToken(reservationId);
  const { error } = await createAdminClient()
    .from("reservation_communications")
    .upsert(
      {
        reservation_id: reservationId,
        type: "confirmation",
        channel: "email",
        status: "pending",
        scheduled_for: new Date().toISOString(),
      },
      { onConflict: "reservation_id,type", ignoreDuplicates: true },
    );
  if (error) throw error;
  return token;
}

export async function processGuestCommunications(
  now = new Date(),
  only?: { reservationId: string; type: CommunicationType; force?: boolean },
) {
  const db = createAdminClient();
  const settings = await getGuestExperienceSettings();
  let query = db
    .from("reservations")
    .select(
      "id,reference,guest_first_name,guest_email,guest_count,check_in,check_out,total,status,payment_status,source,guest_portal_token,reservation_options(label)",
    );
  if (only) query = query.eq("id", only.reservationId);
  const { data, error } = await query;
  if (error) throw error;
  const results = [];

  for (const reservation of (data ?? []) as ReservationRow[]) {
    if (
      !reservationAllowsAccess({
        status: reservation.status,
        paymentStatus: reservation.payment_status,
        source: reservation.source,
      }) ||
      !validGuestEmail(reservation.guest_email)
    )
      continue;

    const types: CommunicationType[] = only
      ? [only.type]
      : [
          "confirmation",
          "pre_arrival",
          "access_48h",
          "checkout_reminder",
          "post_stay_review",
        ];

    for (const type of types) {
      const due =
        type === "confirmation" ||
        communicationIsDue(
          type,
          reservation,
          now,
          settings.checkInTime,
          settings.accessLeadHours,
        );
      // Le code ne peut jamais être forcé avant H-48, même depuis l'admin.
      if ((!only && !due) || (type === "access_48h" && !due)) continue;

      const token =
        reservation.guest_portal_token ??
        (await ensureGuestPortalToken(reservation.id));
      if (type !== "confirmation" || only) {
        await db.from("reservation_communications").upsert(
          {
            reservation_id: reservation.id,
            type,
            channel: "email",
            status: "pending",
            scheduled_for: now.toISOString(),
          },
          { onConflict: "reservation_id,type", ignoreDuplicates: true },
        );
      }

      let claim = db
        .from("reservation_communications")
        .update({ status: "processing", updated_at: now.toISOString() })
        .eq("reservation_id", reservation.id)
        .eq("type", type);
      if (!only?.force)
        claim = claim.is("sent_at", null).in("status", ["pending", "failed"]);
      const { data: claimed } = await claim
        .select("id,attempt_count")
        .maybeSingle();
      if (!claimed) continue;

      let keyboxCode: string | null = null;
      let communicationWarning: string | null = null;
      if (type === "access_48h") {
        const { data: sensitive, error: codeError } = await db
          .from("reservations")
          .select("keybox_code")
          .eq("id", reservation.id)
          .maybeSingle();
        if (codeError) throw codeError;
        const selectedCode = selectKeyboxCode(
          sensitive?.keybox_code,
          settings.defaultKeyboxCode,
        );
        keyboxCode = selectedCode.code;
        communicationWarning = selectedCode.warning;
        if (communicationWarning) {
          console.warn("guest_communication_warning", {
            code: communicationWarning,
            reservationId: reservation.id,
            type,
          });
        }
      }

      try {
        const providerId = await sendGuestCommunication(
          {
            type,
            firstName: reservation.guest_first_name,
            checkIn: reservation.check_in,
            checkOut: reservation.check_out,
            guestCount: reservation.guest_count,
            total: reservation.total,
            address: settings.address,
            portalUrl: `${siteConfig.url}/mon-sejour/${token}`,
            checkInTime: settings.checkInTime,
            checkOutTime: settings.checkOutTime,
            options: (reservation.reservation_options ?? []).map(
              (option) => option.label,
            ),
            accessInstructions: settings.accessInstructions,
            keyboxInstructions: settings.keyboxInstructions,
            keyboxCode,
            checkoutInstructions: settings.checkoutInstructions,
            googleReviewUrl: settings.googleReviewUrl,
          },
          reservation.guest_email,
        );
        await db
          .from("reservation_communications")
          .update({
            status: "sent",
            sent_at: now.toISOString(),
            provider_message_id: providerId,
            error: communicationWarning,
            attempt_count: claimed.attempt_count + 1,
            updated_at: now.toISOString(),
          })
          .eq("id", claimed.id);
        results.push({ reservationId: reservation.id, type, status: "sent" });
      } catch (sendError) {
        await db
          .from("reservation_communications")
          .update({
            status: "failed",
            error:
              sendError instanceof Error
                ? sendError.message.slice(0, 500)
                : "UNKNOWN",
            attempt_count: claimed.attempt_count + 1,
            updated_at: now.toISOString(),
          })
          .eq("id", claimed.id);
        results.push({ reservationId: reservation.id, type, status: "failed" });
      }
    }
  }
  return results;
}
