import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dateRangesOverlap } from "./date-utils";
import type { BookingRequest } from "./types";
import type { ReservationRepository } from "./reservation-repository";

const filePath = path.join(process.cwd(), "data", "reservations.json");
let writeQueue = Promise.resolve();

function blocksDates(item: BookingRequest, now = new Date()) {
  if (item.status === "confirmed" || item.status === "blocked") return true;
  return item.status === "pending" && Date.parse(item.expiresAt) > now.getTime();
}

export class LocalReservationRepository implements ReservationRepository {
  async list() {
    try { return JSON.parse(await fs.readFile(filePath, "utf8")) as BookingRequest[]; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  }
  async findByReference(reference: string) { return (await this.list()).find((item) => item.reference === reference) ?? null; }
  async findBetween(from: string, to: string) { return (await this.list()).filter((item) => dateRangesOverlap(from, to, item.checkIn, item.checkOut)); }
  async occupiedRanges(now = new Date()) { return (await this.list()).filter((item) => blocksDates(item, now)).map((item) => ({ start: item.checkIn, end: item.checkOut })); }
  async isAvailable(checkIn: string, checkOut: string) { return !(await this.occupiedRanges()).some((range) => dateRangesOverlap(checkIn, checkOut, range.start, range.end)); }
  async create(reservation: BookingRequest) {
    let failure: Error | undefined;
    writeQueue = writeQueue.then(async () => {
      const current = await this.list();
      const duplicate = current.some((item) => item.fingerprint === reservation.fingerprint && Date.now() - Date.parse(item.createdAt) < 10 * 60_000);
      if (duplicate) { failure = new Error("DUPLICATE_REQUEST"); return; }
      const overlap = current.some((item) => blocksDates(item) && dateRangesOverlap(reservation.checkIn, reservation.checkOut, item.checkIn, item.checkOut));
      if (overlap) { failure = new Error("DATES_UNAVAILABLE"); return; }
      const temporary = `${filePath}.${process.pid}.tmp`;
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(temporary, JSON.stringify([...current, reservation], null, 2), "utf8");
      await fs.rename(temporary, filePath);
    });
    await writeQueue;
    if (failure) throw failure;
  }
}

// Dépôt temporaire de développement : un filesystem Vercel n'est ni persistant ni partagé.
export const localReservationRepository = new LocalReservationRepository();
