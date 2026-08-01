import { randomBytes } from "node:crypto";
export function generateReservationReference(date = new Date()) {
  return `ABS-${date.getUTCFullYear()}-${randomBytes(5).toString("base64url").slice(0, 6).toUpperCase()}`;
}
