export const RESERVATION_CONFIRMATION_BCC = "love.room.absolu@gmail.com";

const reservationConfirmationTemplates = new Set([
  "reservation-confirmation",
  "guest-confirmation",
]);

export function confirmationBccForTemplate(template: string) {
  return reservationConfirmationTemplates.has(template)
    ? RESERVATION_CONFIRMATION_BCC
    : undefined;
}
