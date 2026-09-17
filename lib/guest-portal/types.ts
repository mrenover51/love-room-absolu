export type GuestExperienceSettings = {
  address: string; phone: string; email: string;
  checkInTime: string; checkOutTime: string; accessLeadHours: number;
  defaultKeyboxCode: string; accessInstructions: string; parkingInstructions: string;
  keyboxInstructions: string; wifiName: string; wifiPassword: string;
  checkoutInstructions: string; houseRules: string; balneoInstructions: string;
  saunaInstructions: string; tvInstructions: string; kitchenInstructions: string;
  coffeeInstructions: string; climateInstructions: string; facadeImageUrl: string;
  entranceImageUrl: string; keyboxImageUrl: string; googleReviewUrl: string;
  guestPortalRetentionDays: number; smsEnabled: boolean;
};

export type CommunicationType = "confirmation" | "pre_arrival" | "access_48h" | "access_ready" | "checkout_reminder" | "post_stay_review";
