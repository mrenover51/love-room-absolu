import { Button, Text } from "@react-email/components";
import type { BookingEmailData } from "@/lib/email";
import type { StaySettings } from "@/lib/stay-config";
import { formatStayTime, getReservationDepartureLabel } from "@/lib/booking/departure-time";
import { siteConfig } from "@/lib/site-config";
import { EmailShell, emailText } from "./email-shell";

export function ReservationConfirmationEmail({
  firstName, lastName, reference, checkIn, checkOut, totalAmount, guestCount,
  options = [], portalUrl, staySettings,
}: BookingEmailData & { staySettings: StaySettings }) {
  const departureLabel = getReservationDepartureLabel(staySettings.checkOut, options);
  return <EmailShell preview={`Réservation ${reference} confirmée`} title="Votre parenthèse est confirmée">
    <Text style={emailText}>Bonjour {firstName}{lastName ? ` ${lastName}` : ""},</Text>
    <Text style={emailText}>Votre réservation chez Absolu est confirmée.</Text>
    <Text style={emailText}>
      <strong>Référence :</strong> {reference}<br />
      <strong>Arrivée :</strong> {checkIn}, à partir de {formatStayTime(staySettings.checkIn)}<br />
      <strong>Départ :</strong> {checkOut}, {departureLabel}<br />
      {guestCount ? <><strong>Voyageurs :</strong> {guestCount}<br /></> : null}
      <strong>Montant payé :</strong> {(totalAmount / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
    </Text>
    {options.length > 0 && <Text style={emailText}><strong>Options réservées :</strong> {options.map((option) => option.label).join(", ")}</Text>}
    <Text style={emailText}><strong>Adresse :</strong><br />36 rue Pasteur, 51190 Avize</Text>
    <Text style={{ ...emailText, color: "#C9A86A", fontSize: "18px" }}><strong>Tout est prévu pour votre séjour</strong></Text>
    <Text style={emailText}>Pour voyager léger, le linge de lit et le linge de bain sont fournis. La suite dispose également d’une machine à café Tassimo, d’un micro-ondes multifonction, d’un réfrigérateur, de vaisselle, d’une bouilloire et d’un grille-pain. Vous profiterez également de votre baignoire balnéo et de votre sauna infrarouge privatifs.</Text>
    {portalUrl && <Button href={portalUrl} style={{display:"block",margin:"26px 0",padding:"14px 22px",borderRadius:"999px",backgroundColor:"#C9A86A",color:"#111",fontWeight:700,textAlign:"center"}}>Accéder à Mon séjour</Button>}
    <Text style={emailText}>Une question ? Contactez-nous au {siteConfig.phone} ou à {siteConfig.email}.</Text>
  </EmailShell>;
}
