export type CalendarView = "day" | "week" | "month" | "year";
export type CalendarEventKind = "reservation" | "block";
export interface CalendarEvent { id:string; start:string; end:string; label:string; source:string; kind:CalendarEventKind; status?:string; guest?:string; total?:number }
export interface CalendarPrice { weekday:number; price:number }
export interface SeasonalPrice { id:string; name:string; start_date:string; end_date:string; price:number; active:boolean }
export interface StayRules { minimumNights:number; maximumNights:number }
export interface CalendarActionState { status:"idle"|"success"|"error"; message:string }
export const initialCalendarActionState:CalendarActionState={status:"idle",message:""};
export const toIsoDate=(date:Date)=>date.toISOString().slice(0,10);
export function addUtcDays(value:Date,days:number){const date=new Date(value);date.setUTCDate(date.getUTCDate()+days);return date}
export function priceForDate(date:string,prices:CalendarPrice[],seasons:SeasonalPrice[]){const season=seasons.filter(item=>item.active&&item.start_date<=date&&item.end_date>date).at(-1);if(season)return season.price;return prices.find(item=>item.weekday===new Date(`${date}T12:00:00Z`).getUTCDay())?.price??0}
