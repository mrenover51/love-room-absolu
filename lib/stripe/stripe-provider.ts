import "server-only";
import Stripe from "stripe";
export class StripeProvider {private client?:Stripe;getClient(){const key=process.env.STRIPE_SECRET_KEY??process.env.STRIPE_SECRET;if(!key)throw new Error("STRIPE_NOT_CONFIGURED");return this.client??=new Stripe(key)}constructWebhook(payload:string,signature:string){const secret=process.env.STRIPE_WEBHOOK_SECRET??process.env.STRIPE_WEBHOOK;if(!secret)throw new Error("STRIPE_WEBHOOK_NOT_CONFIGURED");return this.getClient().webhooks.constructEvent(payload,signature,secret)}}
export const stripeProvider=new StripeProvider();
