import { z } from "zod";
import { isAdminRequest } from "@/lib/admin/api-auth";
import { testCalendar } from "@/lib/calendar/sync";
import type { CalendarSource } from "@/lib/booking/ical";

const input=z.object({provider:z.enum(["booking","airbnb"]),url:z.url().max(2048)});
export async function POST(request:Request){if(!await isAdminRequest())return Response.json({error:"Non autorisé"},{status:401});try{const body=input.parse(await request.json()),result=await testCalendar(body.provider as CalendarSource,body.url);return Response.json(result)}catch(error){return Response.json({valid:false,error:error instanceof Error?error.message:"ICAL_TEST_FAILED"},{status:400})}}
