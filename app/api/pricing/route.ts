import { NextResponse } from "next/server";
import { getPublicPricingConfig } from "@/lib/booking/server-pricing";
export async function GET(){try{return NextResponse.json(await getPublicPricingConfig(),{headers:{"Cache-Control":"public, max-age=60, s-maxage=300"}})}catch{console.error("public_pricing_failed");return NextResponse.json({error:"Tarifs temporairement indisponibles."},{status:503})}}
