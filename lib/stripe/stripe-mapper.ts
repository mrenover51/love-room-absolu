import type Stripe from "stripe";
import type { PriceBreakdown } from "@/lib/booking/types";
export function checkoutLineItems(pricing:PriceBreakdown):Stripe.Checkout.SessionCreateParams.LineItem[]{return[{quantity:1,price_data:{currency:"eur",unit_amount:pricing.baseAmount,product_data:{name:`Séjour Absolu — ${pricing.nights} nuit${pricing.nights>1?"s":""}`}}},...pricing.extras.map((extra)=>({quantity:1,price_data:{currency:"eur" as const,unit_amount:extra.amount,product_data:{name:extra.label}}}))]}
