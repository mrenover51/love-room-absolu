import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/site-config";
import type { GuestExperienceSettings } from "./types";

export const DEFAULT_GUEST_EXPERIENCE: GuestExperienceSettings = {
  address: siteConfig.address.replace(", France", ""), phone: siteConfig.phone, email: siteConfig.email,
  checkInTime: "16:00", checkOutTime: "10:00", keyboxRevealTime: "14:00", defaultKeyboxCode: "",
  accessInstructions: "", parkingInstructions: "", keyboxInstructions: "", wifiName: "", wifiPassword: "",
  checkoutInstructions: "", houseRules: "", balneoInstructions: "", saunaInstructions: "", tvInstructions: "",
  kitchenInstructions: "", coffeeInstructions: "", climateInstructions: "", facadeImageUrl: "",
  entranceImageUrl: "", keyboxImageUrl: "", googleReviewUrl: "", guestPortalRetentionDays: 7, smsEnabled: false,
};

const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export function parseGuestExperience(value: unknown): GuestExperienceSettings {
  const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const text = (key: keyof GuestExperienceSettings) => typeof row[key] === "string" ? String(row[key]).slice(0, 5000) : String(DEFAULT_GUEST_EXPERIENCE[key]);
  return {
    address:text("address"), phone:text("phone"), email:text("email"),
    checkInTime:time.test(text("checkInTime"))?text("checkInTime"):"16:00",
    checkOutTime:time.test(text("checkOutTime"))?text("checkOutTime"):"10:00",
    keyboxRevealTime:time.test(text("keyboxRevealTime"))?text("keyboxRevealTime"):"14:00",
    defaultKeyboxCode:text("defaultKeyboxCode"), accessInstructions:text("accessInstructions"), parkingInstructions:text("parkingInstructions"),
    keyboxInstructions:text("keyboxInstructions"), wifiName:text("wifiName"), wifiPassword:text("wifiPassword"), checkoutInstructions:text("checkoutInstructions"),
    houseRules:text("houseRules"), balneoInstructions:text("balneoInstructions"), saunaInstructions:text("saunaInstructions"), tvInstructions:text("tvInstructions"),
    kitchenInstructions:text("kitchenInstructions"), coffeeInstructions:text("coffeeInstructions"), climateInstructions:text("climateInstructions"),
    facadeImageUrl:text("facadeImageUrl"), entranceImageUrl:text("entranceImageUrl"), keyboxImageUrl:text("keyboxImageUrl"), googleReviewUrl:text("googleReviewUrl"),
    guestPortalRetentionDays:typeof row.guestPortalRetentionDays === "number" ? Math.min(30,Math.max(1,Math.trunc(row.guestPortalRetentionDays))) : 7,
    smsEnabled: row.smsEnabled === true,
  };
}

export const getGuestExperienceSettings = cache(async () => {
  try {
    const {data,error}=await createAdminClient().from("settings").select("value").eq("key","guest_experience").maybeSingle();
    if(error) throw error;
    return parseGuestExperience(data?.value);
  } catch { return DEFAULT_GUEST_EXPERIENCE; }
});

