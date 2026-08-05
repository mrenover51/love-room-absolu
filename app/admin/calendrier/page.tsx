import { cache } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCalendar } from "@/components/admin/admin-calendar";
import type { CalendarEvent, CalendarPrice, SeasonalPrice, StayRules } from "@/lib/calendar/admin-calendar";

const getCalendarData=cache(async()=>{
  const db=createAdminClient(),start=new Date(),end=new Date();start.setUTCFullYear(start.getUTCFullYear()-1,0,1);end.setUTCFullYear(end.getUTCFullYear()+2,0,1);const from=start.toISOString().slice(0,10),to=end.toISOString().slice(0,10);
  const[{data:reservations},{data:requests},{data:blocks},{data:prices},{data:seasons},{data:settings}]=await Promise.all([
    db.from("reservations").select("id,reference,check_in,check_out,source,status,payment_status,guest_first_name,guest_last_name,total").lt("check_in",to).gt("check_out",from).in("status",["confirmed","pending_payment"]),
    db.from("reservation_requests").select("id,date_arrivee,date_depart,prenom,nom,prix_calcule,statut").lt("date_arrivee",to).gt("date_depart",from).in("statut",["new","accepted","pending_payment"]),
    db.from("blocked_dates").select("id,start_date,end_date,source,reason").lt("start_date",to).gt("end_date",from).order("start_date"),
    db.from("pricing").select("weekday,price").order("weekday"),db.from("seasonal_prices").select("id,name,start_date,end_date,price,active").order("start_date"),db.from("settings").select("key,value").in("key",["minimum_nights","maximum_nights"]),
  ]);
  const events:CalendarEvent[]=[
    ...(reservations??[]).map(row=>({id:row.id,start:row.check_in,end:row.check_out,label:row.reference,source:row.source==="booking"?"booking":row.source==="airbnb"?"airbnb":row.status==="pending_payment"?"payment":"confirmed",kind:"reservation" as const,status:row.status,paymentStatus:row.payment_status,guest:`${row.guest_first_name} ${row.guest_last_name}`,total:row.total})),
    ...(requests??[]).filter(row=>row.statut!=="pending_payment").map(row=>({id:row.id,start:row.date_arrivee,end:row.date_depart,label:"Demande",source:"request",kind:"request" as const,status:row.statut,guest:`${row.prenom} ${row.nom}`,total:row.prix_calcule})),
    ...(blocks??[]).map(row=>({id:row.id,start:row.start_date,end:row.end_date,label:row.reason??"Bloqué",source:row.reason?.toLowerCase().includes("maintenance")?"maintenance":row.source,kind:"block" as const})),
  ];
  const settingValue=(key:string,fallback:number)=>{const value=settings?.find(item=>item.key===key)?.value;return typeof value==="object"&&value!==null&&"value" in value&&typeof value.value==="number"?value.value:fallback};
  return{events,prices:(prices??[]) as CalendarPrice[],seasons:(seasons??[]) as SeasonalPrice[],rules:{minimumNights:settingValue("minimum_nights",1),maximumNights:settingValue("maximum_nights",14)} satisfies StayRules};
});

export default async function CalendarPage(){await requireAdmin();const data=await getCalendarData();return <><AdminPageHeader eyebrow="Planning intelligent" title="Calendrier" description="Pilotez disponibilités, réservations, tarifs et règles de séjour depuis une vue unique."/><div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px]"><span className="text-blue-300">● Demande</span><span className="text-orange-300">● Paiement en attente</span><span className="text-green-300">● Confirmée</span><span className="text-red-300">● Booking</span><span className="text-violet-300">● Airbnb</span><span className="text-white/50">● Bloqué</span></div><AdminCalendar {...data}/></>}
