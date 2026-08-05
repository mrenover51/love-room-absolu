import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { giftAmounts, giftBySlug } from "@/lib/gifts/catalog";
import { rejectCrossSite } from "@/lib/security/request";
import { siteConfig } from "@/lib/site-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripeClient } from "@/lib/stripe";

const schema=z.object({theme:z.string().max(40),amount:z.number().refine(v=>(giftAmounts as readonly number[]).includes(v)),recipient:z.string().trim().min(1).max(80),sender:z.string().trim().min(1).max(80),purchaserEmail:z.email(),message:z.string().trim().min(10).max(500),color:z.string().regex(/^#[0-9a-f]{6}$/i),eventDate:z.iso.date().optional()});
const attempts=new Map<string,number[]>();
export async function POST(request:Request){
  if(rejectCrossSite(request))return NextResponse.json({error:"Origine refusée."},{status:403});
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"local",now=Date.now(),recent=(attempts.get(ip)??[]).filter(t=>now-t<900000); if(recent.length>=5)return NextResponse.json({error:"Trop de tentatives. Réessayez plus tard."},{status:429}); attempts.set(ip,[...recent,now]);
  const parsed=schema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return NextResponse.json({error:"Vérifiez les informations saisies."},{status:400});
  const gift=giftBySlug(parsed.data.theme); if(!gift)return NextResponse.json({error:"Bon cadeau inconnu."},{status:400});
  try{const db=createAdminClient(),reference=`ABS-GIFT-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`; const {data:row,error}=await db.from("gift_cards").insert({reference,theme:gift.slug,amount:parsed.data.amount,recipient_name:parsed.data.recipient,sender_name:parsed.data.sender,purchaser_email:parsed.data.purchaserEmail,message:parsed.data.message,color:parsed.data.color,status:"pending_payment"}).select("id").single(); if(error)throw error;
    const session=await stripeClient().checkout.sessions.create({mode:"payment",customer_email:parsed.data.purchaserEmail,line_items:[{quantity:1,price_data:{currency:"eur",unit_amount:parsed.data.amount*100,product_data:{name:gift.name,description:`Bon personnalisé pour ${parsed.data.recipient}`}}}],metadata:{gift_id:row.id,gift_reference:reference},success_url:`${siteConfig.url}/bons-cadeaux/confirmation?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${siteConfig.url}/bons-cadeaux/${gift.slug}#personnaliser`,expires_at:Math.floor(Date.now()/1000)+1800}); await db.from("gift_cards").update({stripe_checkout_session:session.id}).eq("id",row.id); return NextResponse.json({url:session.url},{status:201});
  }catch(error){console.error("gift_checkout_failed",{code:error instanceof Error?error.message.slice(0,80):"UNKNOWN"});return NextResponse.json({error:"Le paiement est temporairement indisponible."},{status:503});}
}
