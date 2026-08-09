import type Stripe from "stripe";
import type { PriceBreakdown } from "@/lib/booking/types";
export function checkoutLineItems(
  pricing: PriceBreakdown,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return [
    {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: pricing.baseAmount,
        product_data: {
          name: `Séjour Absolu — ${pricing.nights} nuit${pricing.nights > 1 ? "s" : ""}`,
        },
      },
    },
    ...pricing.extras.map((extra) => {
      const quantity = extra.quantity ?? 1;
      return {
        quantity,
        price_data: {
          currency: "eur" as const,
          unit_amount: Math.round(extra.amount / quantity),
          product_data: { name: extra.label },
        },
      };
    }),
    ...(pricing.feesAmount > 0
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "eur" as const,
              unit_amount: pricing.feesAmount,
              product_data: { name: "Taxe de séjour" },
            },
          },
        ]
      : []),
  ];
}
