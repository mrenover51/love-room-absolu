import { bookingRepository } from "@/lib/booking/repository";
import { generateIcal } from "@/lib/booking/ical";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const now = new Date();
  const configured=Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL??process.env.SUPABASE_URL)&&(process.env.SUPABASE_SERVICE_ROLE_KEY??process.env.SUPABASE_SERVICE_KEY));
  let ranges:Array<{id:string;start:string;end:string}>;
  if(configured){const{data,error}=await createAdminClient().from("reservations").select("id,check_in,check_out").or(`status.eq.confirmed,and(status.eq.pending_payment,payment_expires_at.gt.${now.toISOString()})`);if(error)return new Response("Export temporairement indisponible",{status:503});ranges=(data??[]).map((item)=>({id:item.id,start:item.check_in,end:item.check_out}))}else{const bookings=(await bookingRepository.list()).filter((item) => item.status === "confirmed" || item.status === "blocked" || (item.status === "pending" && Date.parse(item.expiresAt) > now.getTime()));ranges=bookings.map((item)=>({id:item.id,start:item.checkIn,end:item.checkOut}))}
  const calendar = generateIcal(ranges);
  return new Response(calendar, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": "attachment; filename=absolu-disponibilites.ics", "Cache-Control": "no-store, max-age=0" } });
}
