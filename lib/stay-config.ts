export type StaySettings = {
  checkIn: string;
  checkOut: string;
  earlyCheckInEnabled: boolean;
  lateCheckOutEnabled: boolean;
  earlyCheckInFee: number;
  lateCheckOutFee: number;
};

export const DEFAULT_STAY_SETTINGS: StaySettings = {
  checkIn: "16:00",
  checkOut: "10:00",
  earlyCheckInEnabled: false,
  lateCheckOutEnabled: false,
  earlyCheckInFee: 0,
  lateCheckOutFee: 0,
};

export function formatStayTime(value: string) {
  return value.replace(":", "h");
}

export function getStayCopy(settings: StaySettings) {
  const checkInDisplay = formatStayTime(settings.checkIn);
  const checkOutDisplay = formatStayTime(settings.checkOut);
  return {
    checkInDisplay,
    checkOutDisplay,
    arrivalText: `Votre arrivée est prévue à partir de ${checkInDisplay}.`,
    departureText: `Votre départ devra être effectué avant ${checkOutDisplay}.`,
    flexibilityText: "Pour toute demande d’arrivée anticipée ou de départ tardif, contactez-nous. Cette prestation peut être proposée selon les disponibilités et peut faire l’objet d’un supplément.",
  };
}

const defaultCopy = getStayCopy(DEFAULT_STAY_SETTINGS);
export const STAY_TIMES = { ...DEFAULT_STAY_SETTINGS, ...defaultCopy } as const;
