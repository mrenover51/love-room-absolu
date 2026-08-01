import "server-only";
import { randomBytes } from "node:crypto";
import { addDays, nightsBetween, parseIsoDate } from "@/lib/booking/date-utils";
import type { PriceBreakdown } from "@/lib/booking/types";
import type { CreateReservationDto } from "../validators/reservation";
import { SupabasePricingRepository } from "../repositories/pricing-repository";
import { SupabaseReservationRepository } from "../repositories/reservation-repository";

export class ReservationService {
  constructor(private reservations=new SupabaseReservationRepository(),private pricing=new SupabasePricingRepository()){}
  async calculatePrice(checkIn:string,checkOut:string,extraKeys:string[]):Promise<PriceBreakdown>{const config=await this.pricing.getConfig(),nights=nightsBetween(checkIn,checkOut);if(nights<config.minimumNights||nights>config.maximumNights)throw new Error("INVALID_STAY_LENGTH");const nightPrices=Array.from({length:nights},(_,index)=>{const date=addDays(checkIn,index),weekday=parseIsoDate(date).getUTCDay(),amount=config.weekdayAmounts[weekday];if(!Number.isInteger(amount))throw new Error("PRICING_INCOMPLETE");return{date,weekday,amount}});const extras=[...new Set(extraKeys)].map((key)=>{const item=config.extras.find((extra)=>extra.key===key&&extra.enabled);if(!item)throw new Error("INVALID_OPTION");return{key:item.key,label:item.label,amount:item.amount,quantity:1}});const baseAmount=nightPrices.reduce((sum,item)=>sum+item.amount,0),extrasAmount=extras.reduce((sum,item)=>sum+item.amount,0);return{nights,nightPrices,baseAmount,weekendSupplements:0,extrasAmount,feesAmount:0,totalAmount:baseAmount+extrasAmount,currency:"EUR",extras}}
  async createReservation(input:CreateReservationDto){if(!await this.isAvailable(input.checkIn,input.checkOut))throw new Error("DATES_UNAVAILABLE");const pricing=await this.calculatePrice(input.checkIn,input.checkOut,input.extraKeys),reference=`ABS-${new Date().getUTCFullYear()}-${randomBytes(5).toString("base64url").slice(0,6).toUpperCase()}`,expiresAt=new Date(Date.now()+30*60_000).toISOString();const id=await this.reservations.create({reference,checkIn:input.checkIn,checkOut:input.checkOut,firstName:input.firstName,lastName:input.lastName,email:input.email,phone:input.phone,guestCount:input.guestCount,message:input.message,expiresAt,pricing});return{id,reference,expiresAt,pricing}}
  confirmReservation(){throw new Error("Confirmation réservée au webhook signé.")}
  async cancelReservation(id:string){return this.reservations.cancelPending(id)}
  refundReservation(){throw new Error("Remboursement réservé au service de paiement.")}
  async findReservation(id:string){return this.reservations.findReservation(id)}
  async isAvailable(checkIn:string,checkOut:string){return this.reservations.isAvailable(checkIn,checkOut)}
  blockDates(){throw new Error("Blocage réalisé atomiquement par confirm_reservation.")}
  syncCalendar(){throw new Error("Synchronisation déléguée à ICalendarRepository.")}
}
