"use client";

import { FormEvent, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Gift, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import type { GiftTheme } from "@/lib/gifts/catalog";
import { giftAmounts } from "@/lib/gifts/catalog";

export function GiftConfigurator({ theme }: { theme: GiftTheme }) {
  const reduced = useReducedMotion();
  const [amount, setAmount] = useState<number>(250);
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Une parenthèse rien que pour vous, à savourer quand vous le souhaitez.");
  const [color, setColor] = useState(theme.accent);
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function checkout(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/gifts/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ theme: theme.slug, amount, recipient, sender, purchaserEmail: email, message, color }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Paiement indisponible.");
      window.location.assign(data.url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Une erreur est survenue."); setBusy(false); }
  }

  return <section id="personnaliser" className="page-shell grid gap-8 py-24 lg:grid-cols-[.9fr_1.1fr]">
    <form onSubmit={checkout} className="rounded-[2rem] border border-white/10 bg-[#121212] p-6 sm:p-8">
      <p className="eyebrow text-[#C9A86A]">Créer votre bon</p><h2 className="mt-3 font-heading text-4xl">Personnalisation</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="text-xs text-white/55">Pour<input required maxLength={80} value={recipient} onChange={e=>setRecipient(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-white" placeholder="Prénom du bénéficiaire" /></label>
        <label className="text-xs text-white/55">De la part de<input required maxLength={80} value={sender} onChange={e=>setSender(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-white" placeholder="Votre prénom" /></label>
        <label className="text-xs text-white/55 sm:col-span-2">Votre email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-white" placeholder="Pour recevoir le bon après paiement" /></label>
        <label className="text-xs text-white/55 sm:col-span-2">Message<textarea required minLength={10} maxLength={500} value={message} onChange={e=>setMessage(e.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-black p-4 text-white" /></label>
      </div>
      <fieldset className="mt-6"><legend className="text-xs text-white/55">Montant</legend><div className="mt-2 grid grid-cols-3 gap-2">{giftAmounts.map(value=><button type="button" key={value} onClick={()=>setAmount(value)} className={`min-h-12 rounded-xl border text-sm ${amount===value?"border-[#C9A86A] bg-[#C9A86A] text-black":"border-white/10"}`}>{value} €</button>)}</div></fieldset>
      <div className="mt-6 flex items-end gap-5"><label className="text-xs text-white/55">Couleur<input aria-label="Couleur du bon" type="color" value={color} onChange={e=>setColor(e.target.value)} className="mt-2 block size-12 rounded-lg bg-transparent" /></label><label className="flex-1 text-xs text-white/55">Photo personnelle<input accept="image/jpeg,image/png,image/webp" type="file" onChange={e=>{const file=e.target.files?.[0]; if(file && file.size<=3_000_000)setPhoto(URL.createObjectURL(file));}} className="mt-2 block w-full text-xs" /></label></div>
      {error&&<p role="alert" className="mt-5 text-sm text-rose-300">{error}</p>}
      <button disabled={busy} className="mt-8 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#C9A86A] font-semibold text-black disabled:opacity-60">{busy?<LoaderCircle className="size-5 animate-spin"/>:<ShieldCheck className="size-5"/>}Payer {amount} € avec Stripe</button>
      <p className="mt-4 text-center text-[11px] text-white/35">Paiement sécurisé · activation après confirmation · valable 12 mois</p>
    </form>
    <div className="lg:sticky lg:top-28 lg:self-start"><p className="mb-3 text-xs uppercase tracking-[.2em] text-white/35">Aperçu avant achat</p>
      <motion.article initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} className="relative aspect-[1.414/1] overflow-hidden rounded-[2rem] border border-white/15 p-7 shadow-2xl sm:p-10" style={{background:`linear-gradient(135deg, ${color}33, #090909 55%)`}}>
        {photo&&<div role="img" aria-label="Photo personnelle du bon cadeau" className="absolute inset-0 bg-cover bg-center opacity-25" style={{backgroundImage:`url(${photo})`}}/>}<div className="relative flex h-full flex-col"><Gift className="size-7" style={{color}}/><p className="mt-5 text-[10px] uppercase tracking-[.3em]" style={{color}}>Love Room Absolu · Avize</p><h3 className="mt-2 font-heading text-4xl sm:text-6xl">{theme.shortName}</h3><p className="mt-4 line-clamp-3 max-w-lg text-sm italic text-white/70">« {message} »</p><div className="mt-auto flex items-end justify-between"><div><p className="text-sm">Pour {recipient||"votre moitié"}</p><p className="mt-1 text-xs text-white/45">De la part de {sender||"vous"} · valable 12 mois après activation</p></div><strong className="font-heading text-4xl">{amount} €</strong></div></div>
      </motion.article>
      <button type="button" onClick={()=>window.print()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-sm"><Download className="size-4"/>Prévisualiser / enregistrer en PDF</button>
      <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/45"><span className="flex gap-2"><Mail className="size-4 text-[#C9A86A]"/>Envoi automatique</span><span className="flex gap-2"><ShieldCheck className="size-4 text-[#C9A86A]"/>Numéro unique</span></div>
    </div>
  </section>;
}
