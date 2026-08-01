import "server-only";import type { DateRange } from "@/lib/booking/types";
export interface ChannelManagerProvider { readonly name:string; readonly enabled:boolean; pullAvailability():Promise<DateRange[]>; pushBooking(input:{externalId:string;checkIn:string;checkOut:string}):Promise<void> }
export class DisabledChannelManagerProvider implements ChannelManagerProvider { readonly enabled=false;constructor(readonly name="disabled"){}async pullAvailability(){return []}async pushBooking(){throw new Error("CHANNEL_MANAGER_NOT_CONFIGURED")} }
export const channelManagerProvider:ChannelManagerProvider=new DisabledChannelManagerProvider();
// Adapter prévu pour Smoobu, Beds24, Lodgify ou autre. Aucune API fictive n’est appelée.
