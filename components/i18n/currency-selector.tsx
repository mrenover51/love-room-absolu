"use client";
import { useState } from "react";
const currencies=["EUR","GBP","USD"] as const;
export function CurrencySelector({locale}:{locale:string}){const [currency,setCurrency]=useState<(typeof currencies)[number]>("EUR");return <div className="rounded-2xl border border-white/10 p-4"><label className="text-xs text-white/45">Currency <select value={currency} onChange={e=>setCurrency(e.target.value as typeof currency)} className="ml-3 rounded-lg bg-black p-2 text-white">{currencies.map(item=><option key={item}>{item}</option>)}</select></label><p className="mt-3 text-xs text-white/35">{new Intl.NumberFormat(locale,{style:"currency",currency:"EUR"}).format(250)} · Prices are charged in EUR. GBP and USD conversion is provided by Stripe at payment when available.</p></div>}
