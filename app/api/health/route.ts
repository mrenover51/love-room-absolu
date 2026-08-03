export const dynamic="force-dynamic";
export function GET(){return Response.json({status:"ok",service:"love-room-absolu",version:"1.0.0",timestamp:new Date().toISOString()},{headers:{"cache-control":"no-store","x-robots-tag":"noindex, nofollow"}});}
