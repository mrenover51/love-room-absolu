import { timingSafeEqual } from "node:crypto";
import { isAdminRequest } from "@/lib/admin/api-auth";
import { syncAllCalendars } from "@/lib/calendar/sync";

function hasCronSecret(request:Request){const expected=process.env.CRON_SECRET,provided=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!expected||!provided)return false;const a=Buffer.from(expected),b=Buffer.from(provided);return a.length===b.length&&timingSafeEqual(a,b)}
async function authorized(request:Request){return hasCronSecret(request)||await isAdminRequest()}
async function sync(request:Request){if(!await authorized(request))return Response.json({error:"Non autorisé"},{status:401});const results=await syncAllCalendars("api");return Response.json({ok:results.every(item=>item.status!=="failed"),generatedAt:new Date().toISOString(),results},{status:results.some(item=>item.status==="failed")?207:200})}
export const GET=sync;export const POST=sync;
