export function touristTaxRateToAmount(rate: number) {
  if (!Number.isFinite(rate) || rate < 0)
    throw new Error("INVALID_TOURIST_TAX_RATE");
  return Math.round(rate * 100);
}

export function calculateTouristTax(
  rateAmount: number,
  nights: number,
  guestCount: number,
) {
  if (
    !Number.isInteger(rateAmount) ||
    rateAmount < 0 ||
    !Number.isInteger(nights) ||
    nights < 1 ||
    !Number.isInteger(guestCount) ||
    guestCount < 1
  )
    throw new Error("INVALID_TOURIST_TAX_INPUT");
  return rateAmount * nights * guestCount;
}

export function calculateBookingTotal(
  baseAmount: number,
  extrasAmount: number,
  touristTaxAmount: number,
) {
  if (
    [baseAmount, extrasAmount, touristTaxAmount].some(
      (amount) => !Number.isInteger(amount) || amount < 0,
    )
  )
    throw new Error("INVALID_BOOKING_TOTAL_INPUT");
  return baseAmount + extrasAmount + touristTaxAmount;
}
