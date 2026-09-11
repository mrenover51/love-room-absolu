import { processGuestCommunications } from "@/lib/guest-portal/communications";
import { isCronAuthorized } from "@/lib/cron-auth";
export const runtime="nodejs";
export async function GET(request:Request){if(!isCronAuthorized(request))return Response.json({error:"Non autorisé"},{status:401});const results=await processGuestCommunications();return Response.json({ok:results.every(r=>r.status==='sent'),processed:results.length,results},{status:results.some(r=>r.status==='failed')?207:200})}
