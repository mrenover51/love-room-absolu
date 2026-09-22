export const LATE_CHECKOUT_OPTION_KEY = "late-checkout";
export const LATE_CHECKOUT_TIME = "12:00";

export type ReservationOptionIdentity = { option_key: string };

export function hasLateCheckout(
  options: readonly ReservationOptionIdentity[] | null | undefined,
) {
  return options?.some(
    (option) => option.option_key === LATE_CHECKOUT_OPTION_KEY,
  ) ?? false;
}

export function getReservationDepartureTime(
  standardDepartureTime: string,
  options: readonly ReservationOptionIdentity[] | null | undefined,
) {
  return hasLateCheckout(options) ? LATE_CHECKOUT_TIME : standardDepartureTime;
}

export function formatStayTime(value: string) {
  return value.replace(":", "h");
}

export function getReservationDepartureLabel(
  standardDepartureTime: string,
  options: readonly ReservationOptionIdentity[] | null | undefined,
) {
  const departureTime = getReservationDepartureTime(
    standardDepartureTime,
    options,
  );
  return hasLateCheckout(options)
    ? `jusqu’à ${formatStayTime(departureTime)} (option départ tardif)`
    : `avant ${formatStayTime(departureTime)}`;
}
