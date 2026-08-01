import "server-only";import {BOOKING_CONFIG,reservationHoldMinutes} from "./constants";import {SupabasePricingRepository} from "@/lib/supabase/repositories/pricing-repository";import {ReservationService} from "@/lib/supabase/services/reservation-service";
export async function getPublicPricingConfig(){if(!process.env.SUPABASE_SERVICE_ROLE_KEY&&!process.env.SUPABASE_SERVICE_KEY)return{...BOOKING_CONFIG,extras:BOOKING_CONFIG.extras.filter((item)=>item.enabled)};return new SupabasePricingRepository().getConfig()}
export async function calculateServerPrice(checkIn:string,checkOut:string,extraKeys:string[]){return new ReservationService().calculatePrice(checkIn,checkOut,extraKeys)}
export async function pendingExpirationMinutes(){return reservationHoldMinutes()}
