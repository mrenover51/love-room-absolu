"use client";

import { useEffect } from "react";
import { trackConversion } from "@/lib/analytics/conversion";

export function PurchaseEvent({
  reference,
  amount,
}: {
  reference: string;
  amount: number;
}) {
  useEffect(() => {
    const key = `absolu-purchase-${reference}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "tracked");
    trackConversion("purchase", {
      transaction_id: reference,
      value: amount / 100,
      currency: "EUR",
    });
  }, [amount, reference]);
  return null;
}
