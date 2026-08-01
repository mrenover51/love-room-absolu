import "server-only";import {stripeProvider} from "@/lib/stripe/stripe-provider";export function stripeClient(){return stripeProvider.getClient()}
