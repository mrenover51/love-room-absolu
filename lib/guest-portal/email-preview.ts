import type { GuestCommunicationEmailData } from "@/emails/templates/guest-communication";
import type { GuestExperienceSettings } from "./types";

export type GuestEmailPreviewType = "access_48h" | "confirmation";

export function getGuestEmailPreviewData(
  type: GuestEmailPreviewType,
  settings: GuestExperienceSettings,
): GuestCommunicationEmailData {
  return {
    type,
    reference: "ABS-APERÇU",
    firstName: "Camille",
    lastName: "Martin",
    checkIn: "2026-10-12",
    checkOut: "2026-10-14",
    guestCount: 2,
    total: 49000,
    address: "36 rue Pasteur, 51190 Avize",
    phone: settings.phone,
    contactEmail: settings.email,
    portalUrl: "https://example.invalid/mon-sejour-apercu",
    checkInTime: "16:00",
    checkOutTime: settings.checkOutTime,
    options: [{ option_key: "late-checkout", label: "Départ tardif" }],
    accessInstructions: settings.accessInstructions,
    keyboxInstructions: settings.keyboxInstructions,
    keyboxCode: type === "access_48h" ? "1234" : null,
    checkoutInstructions: settings.checkoutInstructions,
    googleReviewUrl: "",
  };
}
