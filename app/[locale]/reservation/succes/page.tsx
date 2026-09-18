import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { stripeProvider } from "@/lib/stripe/stripe-provider";
import { PurchaseEvent } from "@/components/cro/purchase-event";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/routing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title:"Booking confirmation | Absolu", robots:{index:false,follow:false} };

const copy:Record<Locale,{paid:string;checking:string;paidTitle:string;checkingTitle:string;paidBody:string;checkingBody:string;reference:string;home:string}>={
  fr:{paid:"Paiement reçu",checking:"Vérification en cours",paidTitle:"Votre parenthèse est confirmée.",checkingTitle:"Votre paiement est en cours de vérification.",paidBody:"Un email récapitulatif vous sera envoyé après traitement du webhook sécurisé.",checkingBody:"Ne renouvelez pas le paiement. Contactez-nous si cet état persiste.",reference:"Référence",home:"Retour à l’accueil"},
  en:{paid:"Payment received",checking:"Verification in progress",paidTitle:"Your stay is confirmed.",checkingTitle:"Your payment is being verified.",paidBody:"A summary email will be sent after the secure webhook is processed.",checkingBody:"Do not pay again. Contact us if this status persists.",reference:"Reference",home:"Back to home"},
  de:{paid:"Zahlung erhalten",checking:"Prüfung läuft",paidTitle:"Ihr Aufenthalt ist bestätigt.",checkingTitle:"Ihre Zahlung wird geprüft.",paidBody:"Nach Verarbeitung des sicheren Webhooks erhalten Sie eine Bestätigung per E-Mail.",checkingBody:"Zahlen Sie nicht erneut. Kontaktieren Sie uns, wenn dieser Status bestehen bleibt.",reference:"Referenz",home:"Zur Startseite"},
  nl:{paid:"Betaling ontvangen",checking:"Controle loopt",paidTitle:"Uw verblijf is bevestigd.",checkingTitle:"Uw betaling wordt gecontroleerd.",paidBody:"Na verwerking van de beveiligde webhook ontvangt u een bevestiging per e-mail.",checkingBody:"Betaal niet opnieuw. Neem contact op als deze status aanhoudt.",reference:"Referentie",home:"Terug naar home"},
  it:{paid:"Pagamento ricevuto",checking:"Verifica in corso",paidTitle:"Il soggiorno è confermato.",checkingTitle:"Il pagamento è in verifica.",paidBody:"Riceverete un riepilogo via email dopo l’elaborazione sicura del webhook.",checkingBody:"Non ripetete il pagamento. Contattateci se lo stato persiste.",reference:"Riferimento",home:"Torna alla home"},
  es:{paid:"Pago recibido",checking:"Verificación en curso",paidTitle:"Su estancia está confirmada.",checkingTitle:"Su pago se está verificando.",paidBody:"Recibirá un resumen por correo tras procesarse el webhook seguro.",checkingBody:"No vuelva a pagar. Contáctenos si este estado persiste.",reference:"Referencia",home:"Volver al inicio"},
  pt:{paid:"Pagamento recebido",checking:"Verificação em curso",paidTitle:"A sua estadia está confirmada.",checkingTitle:"O seu pagamento está a ser verificado.",paidBody:"Receberá um resumo por email após o processamento seguro do webhook.",checkingBody:"Não efetue novo pagamento. Contacte-nos se o estado persistir.",reference:"Referência",home:"Voltar ao início"},
};

export default async function LocalizedSuccess({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{session_id?:string}>}){
  const {locale}=await params;if(!isLocale(locale))notFound();
  const {session_id}=await searchParams;let paid=false,reference:string|undefined,amount=0;
  try{if(session_id){const session=await stripeProvider.getClient().checkout.sessions.retrieve(session_id);paid=session.payment_status==="paid";reference=session.metadata?.reference;amount=session.amount_total??0}}catch{paid=false}
  const labels=copy[locale];
  return <main className="grid min-h-screen place-items-center bg-[#080808] p-6 text-center">{paid&&reference&&<PurchaseEvent reference={reference} amount={amount}/>}<div className="max-w-xl">{paid?<Check className="mx-auto size-14 text-[#C9A86A]" aria-hidden="true"/>:<Clock3 className="mx-auto size-14 text-[#C9A86A]" aria-hidden="true"/>}<p className="eyebrow mt-8 text-[#C9A86A]">{paid?labels.paid:labels.checking}</p><h1 className="mt-5 font-heading text-5xl">{paid?labels.paidTitle:labels.checkingTitle}</h1><p className="mt-5 leading-7 text-white/60">{paid?labels.paidBody:labels.checkingBody}</p>{reference&&<p className="mt-5 text-sm text-white/50">{labels.reference}: {reference}</p>}<Link href={localizedPath(locale,"home")} className="mt-8 inline-block border border-white/30 px-6 py-3">{labels.home}</Link></div></main>;
}
