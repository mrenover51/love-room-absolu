import Link from "next/link";
import { Check, Clock3 } from "lucide-react";
import { stripeProvider } from "@/lib/stripe/stripe-provider";
import { StayTimesNotice } from "@/components/shared/stay-times-notice";
import { getStaySettings } from "@/lib/stay-settings";
import { PurchaseEvent } from "@/components/cro/purchase-event";
export const dynamic = "force-dynamic";
export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const staySettings = await getStaySettings();
  let paid = false,
    reference: string | undefined,
    amount = 0;
  try {
    if (session_id) {
      const session = await stripeProvider
        .getClient()
        .checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid";
      reference = session.metadata?.reference;
      amount = session.amount_total ?? 0;
    }
  } catch {
    paid = false;
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#080808] p-6 text-center">
      {paid && reference && (
        <PurchaseEvent reference={reference} amount={amount} />
      )}
      <div className="max-w-xl">
        {paid ? (
          <Check
            className="mx-auto size-14 text-[#C9A86A]"
            aria-hidden="true"
          />
        ) : (
          <Clock3
            className="mx-auto size-14 text-[#C9A86A]"
            aria-hidden="true"
          />
        )}
        <p className="eyebrow mt-8 text-[#C9A86A]">
          {paid ? "Paiement reçu" : "Vérification en cours"}
        </p>
        <h1 className="mt-5 font-heading text-5xl">
          {paid
            ? "Votre parenthèse est confirmée."
            : "Votre paiement est en cours de vérification."}
        </h1>
        <p className="mt-5 leading-7 text-white/60">
          {paid
            ? "Un email récapitulatif vous sera envoyé après traitement du webhook sécurisé."
            : "Ne renouvelez pas le paiement. Contactez-nous si cet état persiste."}
        </p>
        {reference && (
          <p className="mt-5 text-sm text-white/50">Référence : {reference}</p>
        )}
        <StayTimesNotice settings={staySettings} className="mt-7 text-left" />
        <Link
          href="/"
          className="mt-8 inline-block border border-white/30 px-6 py-3"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
