import "server-only";
import { render } from "@react-email/components";
import { Resend } from "resend";
import QRCode from "qrcode";
import { createHash } from "node:crypto";
import { GiftCardEmail } from "@/emails/templates/gift-card";
import { createAdminClient } from "@/lib/supabase/admin";
export async function sendGiftCard(data:{email:string;reference:string;recipient:string;sender:string;message:string;amount:number;expiresAt:string}){const key=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM,replyTo=process.env.RESEND_REPLY_TO;if(!key||!from){if(process.env.NODE_ENV!=="production")console.info("gift_email_skipped_dev");return;}const qrCode=await QRCode.toDataURL(`https://love-room-absolu.fr/bons-cadeaux/verification?reference=${encodeURIComponent(data.reference)}`,{width:264,margin:1,color:{dark:"#090909",light:"#ffffff"}}),html=await render(<GiftCardEmail {...data} qrCode={qrCode}/>),result=await new Resend(key).emails.send({from,to:data.email,subject:"Votre bon cadeau Absolu est prêt",html,...(replyTo?{replyTo}:{})}),recipientHash=createHash("sha256").update(data.email.trim().toLowerCase()).digest("hex");await createAdminClient().from("email_logs").insert({template:"gift-card",recipient_hash:recipientHash,status:result.error?"failed":"sent",provider_id:result.data?.id??null,error_code:result.error?.name??null});if(result.error)throw new Error("GIFT_EMAIL_FAILED");}
