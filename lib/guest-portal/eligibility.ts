export const PARIS_TIME_ZONE = "Europe/Paris";
export function parisParts(now: Date) {
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:PARIS_TIME_ZONE,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
  const get=(type:string)=>parts.find(p=>p.type===type)?.value??"";
  return {date:`${get("year")}-${get("month")}-${get("day")}`,time:`${get("hour")}:${get("minute")}`};
}
export function addCalendarDays(date:string,days:number){const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
export function canRevealKeybox(input:{now:Date;checkIn:string;checkOut:string;status:string;paymentStatus:string;source:string;revealTime:string}){
  const local=parisParts(input.now);
  return input.status==="confirmed" &&
    (input.source!=="direct" || input.paymentStatus==="paid" || input.paymentStatus==="partially_refunded") &&
    local.date>=input.checkIn && local.date<input.checkOut && (local.date>input.checkIn || local.time>=input.revealTime);
}
export function portalExpired(checkOut:string,retentionDays:number,now:Date){return parisParts(now).date>addCalendarDays(checkOut,retentionDays)}
export type ScheduledCommunication = "pre_arrival" | "access_ready" | "checkout_reminder" | "post_stay_review";
export function communicationWindowOpen(input:{type:ScheduledCommunication;checkIn:string;checkOut:string;now:Date;revealTime?:string}){
  const rules={
    pre_arrival:{date:addCalendarDays(input.checkIn,-2),time:"10:00"},
    access_ready:{date:input.checkIn,time:input.revealTime??"14:00"},
    checkout_reminder:{date:input.checkOut,time:"08:30"},
    post_stay_review:{date:addCalendarDays(input.checkOut,1),time:"10:00"},
  } as const;
  const local=parisParts(input.now),due=rules[input.type];
  // Fenêtre de rattrapage : de l'heure prévue jusqu'à la fin de la journée locale.
  return local.date===due.date&&local.time>=due.time;
}
