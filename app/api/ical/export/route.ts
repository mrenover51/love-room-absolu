import { createOutboundCalendarResponse } from "@/lib/calendar/outbound-export";

export const dynamic = "force-dynamic";

export async function GET() {
  return createOutboundCalendarResponse();
}
