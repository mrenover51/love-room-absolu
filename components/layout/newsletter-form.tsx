"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";

const copy: Record<Locale,{label:string;placeholder:string;submit:string;sent:string;error:string;note:string}> = {
  fr:{label:"Votre adresse email",placeholder:"Votre adresse email",submit:"S’inscrire",sent:"Demande d’inscription envoyée.",error:"Vérifiez votre email ou réessayez plus tard.",note:"Recevez ponctuellement les nouvelles d’Absolu."},
  en:{label:"Your email address",placeholder:"Your email address",submit:"Subscribe",sent:"Subscription request sent.",error:"Check your email or try again later.",note:"Receive occasional news from Absolu."},
  de:{label:"Ihre E-Mail-Adresse",placeholder:"Ihre E-Mail-Adresse",submit:"Anmelden",sent:"Anmeldung gesendet.",error:"Prüfen Sie Ihre E-Mail-Adresse oder versuchen Sie es später erneut.",note:"Erhalten Sie gelegentlich Neuigkeiten von Absolu."},
  nl:{label:"Uw e-mailadres",placeholder:"Uw e-mailadres",submit:"Inschrijven",sent:"Aanvraag verzonden.",error:"Controleer uw e-mailadres of probeer het later opnieuw.",note:"Ontvang af en toe nieuws van Absolu."},
  it:{label:"Il vostro indirizzo email",placeholder:"Il vostro indirizzo email",submit:"Iscriviti",sent:"Richiesta inviata.",error:"Controllate l’email o riprovate più tardi.",note:"Ricevete occasionalmente notizie da Absolu."},
  es:{label:"Su dirección de correo",placeholder:"Su dirección de correo",submit:"Suscribirse",sent:"Solicitud enviada.",error:"Compruebe el correo o inténtelo más tarde.",note:"Reciba ocasionalmente noticias de Absolu."},
  pt:{label:"O seu endereço de email",placeholder:"O seu endereço de email",submit:"Subscrever",sent:"Pedido enviado.",error:"Verifique o email ou tente mais tarde.",note:"Receba ocasionalmente novidades da Absolu."},
};

export function NewsletterForm({locale="fr"}:{locale?:Locale}){
  const labels=copy[locale];
  const[state,setState]=useState<"idle"|"pending"|"sent"|"error">("idle");
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=event.currentTarget,email=String(new FormData(form).get("email")??"");if(!/^\S+@\S+\.\S+$/.test(email)){setState("error");return}setState("pending");try{const response=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"Inscription newsletter",email,message:"Demande d’inscription à la newsletter Absolu.",website:""})});if(!response.ok)throw new Error();setState("sent");form.reset()}catch{setState("error")}}
  return <form onSubmit={submit} className="mt-5" noValidate><label htmlFor={`newsletter-email-${locale}`} className="sr-only">{labels.label}</label><div className="flex border-b border-white/20"><input id={`newsletter-email-${locale}`} name="email" type="email" autoComplete="email" placeholder={labels.placeholder} className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/35"/><button disabled={state==="pending"} className="px-3 text-xs uppercase tracking-[.14em] text-[#C9A86A] disabled:opacity-50">{labels.submit}</button></div><p role="status" className="mt-3 min-h-5 text-xs text-white/45">{state==="sent"?labels.sent:state==="error"?labels.error:labels.note}</p></form>;
}
