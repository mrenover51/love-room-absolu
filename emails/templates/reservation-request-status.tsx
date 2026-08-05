import { Button, Text } from "@react-email/components";
import { EmailShell, emailText } from "./email-shell";

export type ReservationRequestEmailKind = "received" | "accepted" | "payment_pending" | "rejected" | "expired";
type Props = { kind: ReservationRequestEmailKind; firstName: string; checkIn: string; checkOut: string; totalAmount: number; checkoutUrl?: string };
const content = {
  received: { preview: "Votre demande de réservation a bien été reçue", title: "Votre demande est entre de bonnes mains", text: "Nous vérifions personnellement la disponibilité de la suite. Vous recevrez rapidement notre réponse par email." },
  accepted: { preview: "Votre demande a été acceptée", title: "Votre parenthèse est disponible", text: "Votre demande a été acceptée. Votre séjour est disponible. Vous pouvez maintenant confirmer votre réservation." },
  payment_pending: { preview: "Votre paiement est en attente", title: "Il ne reste plus qu’à confirmer", text: "Votre séjour est réservé temporairement. Finalisez le paiement sécurisé avant l’expiration du lien pour confirmer votre venue." },
  rejected: { preview: "Réponse à votre demande de réservation", title: "Ces dates ne sont plus disponibles", text: "Nous sommes désolés. Les dates demandées ne sont malheureusement plus disponibles." },
  expired: { preview: "Votre demande de réservation a expiré", title: "Le délai de confirmation est terminé", text: "Le paiement n’ayant pas été finalisé dans le délai prévu, les dates ont été libérées. Vous pouvez effectuer une nouvelle demande depuis le site." },
} satisfies Record<ReservationRequestEmailKind, { preview: string; title: string; text: string }>;

export function ReservationRequestStatusEmail({ kind, firstName, checkIn, checkOut, totalAmount, checkoutUrl }: Props) {
  const copy = content[kind];
  return <EmailShell preview={copy.preview} title={copy.title}><Text style={emailText}>Bonjour {firstName},</Text><Text style={emailText}>{copy.text}</Text><Text style={emailText}>Séjour du <strong>{checkIn}</strong> au <strong>{checkOut}</strong> · {(totalAmount / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</Text>{checkoutUrl && <Button href={checkoutUrl} style={{ backgroundColor: "#C9A86A", color: "#090909", padding: "14px 24px", borderRadius: "999px", fontWeight: 700 }}>Confirmer ma réservation</Button>}</EmailShell>;
}
