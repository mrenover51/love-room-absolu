import type { BookingRequest, DateRange } from "./types";

export interface ReservationRepository {
  create(reservation: BookingRequest): Promise<void>;
  findByReference(reference: string): Promise<BookingRequest | null>;
  findBetween(from: string, to: string): Promise<BookingRequest[]>;
  isAvailable(checkIn: string, checkOut: string): Promise<boolean>;
  occupiedRanges(now?: Date): Promise<DateRange[]>;
  list(): Promise<BookingRequest[]>;
}
