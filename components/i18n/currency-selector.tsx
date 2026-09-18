"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { intlLocale } from "@/lib/i18n/booking";
const currencies=["EUR","GBP","USD"] as const;
const labels:Record<Locale,{currency:string;note:string}>={
  fr:{currency:"Devise",note:"Les prix sont facturés en EUR. La conversion GBP ou USD est proposée par Stripe au paiement lorsqu’elle est disponible."},
  en:{currency:"Currency",note:"Prices are charged in EUR. GBP or USD conversion is offered by Stripe at payment when available."},
  de:{currency:"Währung",note:"Die Abrechnung erfolgt in EUR. Eine Umrechnung in GBP oder USD bietet Stripe gegebenenfalls bei der Zahlung an."},
  nl:{currency:"Valuta",note:"Prijzen worden in EUR afgerekend. Stripe kan bij betaling een omzetting naar GBP of USD aanbieden."},
  it:{currency:"Valuta",note:"I prezzi sono addebitati in EUR. Stripe può proporre la conversione in GBP o USD al pagamento."},
  es:{currency:"Moneda",note:"Los precios se cobran en EUR. Stripe puede ofrecer la conversión a GBP o USD durante el pago."},
  pt:{currency:"Moeda",note:"Os preços são cobrados em EUR. A Stripe pode propor a conversão para GBP ou USD no pagamento."},
};
export function CurrencySelector({locale}:{locale:Locale}){const [currency,setCurrency]=useState<(typeof currencies)[number]>("EUR"),copy=labels[locale];return <div className="rounded-2xl border border-white/10 p-4"><label className="text-xs text-white/45">{copy.currency} <select value={currency} onChange={e=>setCurrency(e.target.value as typeof currency)} className="ml-3 rounded-lg bg-black p-2 text-white">{currencies.map(item=><option key={item}>{item}</option>)}</select></label><p className="mt-3 text-xs text-white/35">{new Intl.NumberFormat(intlLocale[locale],{style:"currency",currency:"EUR"}).format(250)} · {copy.note}</p></div>}
