import { timingSafeEqual } from "node:crypto";
import { expireManualReservationRequests } from "@/lib/booking/manual-request-service";

function authorized(request:Request){const expected=process.env.CRON_SECRET,provided=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!expected||!provided)return false;const a=Buffer.from(expected),b=Buffer.from(provided);return a.length===b.length&&timingSafeEqual(a,b)}
export async function GET(request:Request){if(!authorized(request))return Response.json({error:"Non autorisé"},{status:401});return Response.json({ok:true,...await expireManualReservationRequests()})}
