import type { DateRange } from "@/lib/booking/types";
export interface BookingRepository { fetchOccupiedDates():Promise<DateRange[]> }
export interface AirbnbRepository { fetchOccupiedDates():Promise<DateRange[]> }
export interface ICalendarRepository { import(source:"booking"|"airbnb"):Promise<DateRange[]>; export():Promise<string> }
// Interfaces uniquement : aucune API propriétaire n'est simulée.
