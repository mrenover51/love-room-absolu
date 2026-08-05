import { Link, Text } from "@react-email/components";
import { EmailShell, emailText } from "./email-shell";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  message?: string | null;
  adminUrl: string;
};

export function ReservationRequestAdminEmail({
  firstName,
  lastName,
  email,
  phone,
  checkIn,
  checkOut,
  totalAmount,
  message,
  adminUrl,
}: Props) {
  return (
    <EmailShell preview="Nouvelle demande de réservation" title="Nouvelle demande de réservation">
      <Text style={emailText}>
        {firstName} {lastName} vient d’envoyer une demande de réservation.
      </Text>
      <Text style={emailText}>
        Séjour du <strong>{checkIn}</strong> au <strong>{checkOut}</strong> ·{" "}
        {(totalAmount / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
      </Text>
      <Text style={emailText}>
        Contact : {email} · {phone}
      </Text>
      {message && <Text style={emailText}>Message : {message}</Text>}
      <Link href={adminUrl} style={{ color: "#C9A86A" }}>
        Ouvrir la demande dans l’administration
      </Link>
    </EmailShell>
  );
}
