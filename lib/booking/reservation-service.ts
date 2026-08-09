import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { bookingRepository } from "./repository";
import { isAvailable } from "./availability";
import { calculateStayPrice } from "./pricing";
import { reservationHoldMinutes } from "./constants";
import { generateReservationReference } from "./reference";
import { assertMinimumAdvanceDays } from "./minimum-advance-days";
import { getReservationWorkflowSettings } from "./workflow-settings";
import type { BookingRequest, PublicBookingSummary } from "./types";
import type { ReservationRequestInput } from "./validation";

export async function createReservationRequest(
  input: ReservationRequestInput,
): Promise<PublicBookingSummary> {
  const { minimumAdvanceDays } = await getReservationWorkflowSettings();
  assertMinimumAdvanceDays(input.checkIn, minimumAdvanceDays);
  if (!(await isAvailable(input.checkIn, input.checkOut)))
    throw new Error("DATES_UNAVAILABLE");
  const pricing = calculateStayPrice(
    input.checkIn,
    input.checkOut,
    input.extraKeys,
  );
  const createdAt = new Date();
  const reservation: BookingRequest = {
    id: randomUUID(),
    reference: generateReservationReference(createdAt),
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(
      createdAt.getTime() + reservationHoldMinutes() * 60_000,
    ).toISOString(),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    status: "pending",
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    guestCount: input.guestCount,
    message: input.message?.trim() || undefined,
    extraKeys: [...new Set(input.extraKeys)],
    pricing,
    fingerprint: createHash("sha256")
      .update(
        `${input.email.trim().toLowerCase()}|${input.checkIn}|${input.checkOut}`,
      )
      .digest("hex"),
  };
  await bookingRepository.create(reservation);
  return {
    reference: reservation.reference,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guestCount: reservation.guestCount,
    pricing,
  };
}
