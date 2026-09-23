import { Button, Text } from "@react-email/components";
import { EmailShell, emailText } from "./email-shell";
import type { CommunicationType } from "@/lib/guest-portal/types";
import { formatStayTime, getReservationDepartureLabel } from "@/lib/booking/departure-time";

export type GuestCommunicationEmailData = {
  type: CommunicationType; reference: string; firstName: string; lastName: string;
  checkIn: string; checkOut: string; guestCount: number; total: number;
  address: string; phone: string; contactEmail: string; portalUrl: string;
  checkInTime: string; checkOutTime: string;
  options: Array<{ option_key: string; label: string }>;
  accessInstructions: string; keyboxInstructions: string; keyboxCode: string | null;
  checkoutInstructions: string; googleReviewUrl: string;
};

export const guestCommunicationSubjects: Record<CommunicationType, string> = {
  confirmation: "Votre séjour chez Absolu est confirmé",
  pre_arrival: "Votre séjour chez Absolu approche",
  access_48h: "Votre arrivée chez Absolu approche",
  access_ready: "Rappel de votre arrivée chez Absolu",
  checkout_reminder: "Votre départ chez Absolu",
  post_stay_review: "Merci pour votre séjour chez Absolu",
};

const formatDate = (value: string) => new Intl.DateTimeFormat("fr-FR", {
  day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris",
}).format(new Date(`${value}T12:00:00Z`));

export function GuestCommunicationEmail(props: GuestCommunicationEmailData) {
  const departureLabel = getReservationDepartureLabel(props.checkOutTime, props.options);
  const details = <Text style={emailText}>
    <strong>Référence :</strong> {props.reference}<br />
    <strong>Arrivée :</strong> {formatDate(props.checkIn)}, à partir de {formatStayTime(props.checkInTime)}<br />
    <strong>Départ :</strong> {formatDate(props.checkOut)}, {departureLabel}<br />
    <strong>Voyageurs :</strong> {props.guestCount}
    {props.type === "confirmation" ? <><br /><strong>Montant payé :</strong>{" "}{(props.total / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</> : null}
  </Text>;

  return <EmailShell preview={guestCommunicationSubjects[props.type]} title={guestCommunicationSubjects[props.type]}>
    <Text style={emailText}>Bonjour {props.firstName}{props.lastName ? ` ${props.lastName}` : ""},</Text>
    {props.type === "confirmation" && <>
      <Text style={emailText}>Votre séjour chez Absolu est confirmé.</Text>
      {details}
      {props.options.length > 0 && <Text style={emailText}><strong>Options réservées :</strong>{" "}{props.options.map((option) => option.label).join(", ")}</Text>}
      <Text style={emailText}><strong>Adresse :</strong><br />{props.address}</Text>
      <Text style={{ ...emailText, color: "#C9A86A", fontSize: "18px" }}><strong>Tout est prévu pour votre séjour</strong></Text>
      <Text style={emailText}>Pour voyager léger, le linge de lit et le linge de bain sont fournis. La suite dispose également d’une machine à café Tassimo, d’un micro-ondes multifonction, d’un réfrigérateur, de vaisselle, d’une bouilloire et d’un grille-pain. Vous profiterez également de votre baignoire balnéo et de votre sauna infrarouge privatifs.</Text>
      <Text style={emailText}>Une question ? Contactez-nous au {props.phone} ou à {props.contactEmail}.</Text>
    </>}
    {props.type === "pre_arrival" && <>
      <Text style={emailText}>Votre arrivée approche. La suite vous accueille à partir de {formatStayTime(props.checkInTime)}.</Text>
      {details}
      <Text style={emailText}>{props.address}<br />Vous pouvez dès maintenant compléter votre pré-check-in.</Text>
    </>}
    {props.type === "access_48h" && <>
      <Text style={emailText}>Votre séjour chez Absolu approche.</Text>
      <Text style={emailText}>Votre arrivée est prévue le {formatDate(props.checkIn)} à partir de {formatStayTime(props.checkInTime)}.<br />Votre départ est prévu le {formatDate(props.checkOut)} {departureLabel}.</Text>
      <Text style={emailText}><strong>Adresse :</strong><br />{props.address}</Text>
      {props.accessInstructions && <Text style={emailText}><strong>Accès :</strong><br />{props.accessInstructions}</Text>}
      {props.keyboxInstructions && <Text style={emailText}><strong>Boîte à clés :</strong><br />{props.keyboxInstructions}</Text>}
      {props.keyboxCode && <Text style={{ ...emailText, fontSize: "20px" }}><strong>Votre code : {props.keyboxCode}</strong></Text>}
      <Text style={emailText}><strong>Mon séjour :</strong><br />Vous y retrouverez toutes les informations utiles pour votre séjour.</Text>
    </>}
    {props.type === "access_ready" && <Text style={emailText}>Nous vous souhaitons une belle arrivée chez Absolu. Vos informations d’accès restent disponibles dans votre espace personnel.</Text>}
    {props.type === "checkout_reminder" && <>
      <Text style={emailText}>Nous espérons que votre nuit a été douce. Le départ est prévu {departureLabel}.</Text>
      {props.checkoutInstructions && <Text style={emailText}>{props.checkoutInstructions}</Text>}
    </>}
    {props.type === "post_stay_review" && <Text style={emailText}>Merci d’avoir choisi Absolu. Nous espérons que cette parenthèse vous laissera un beau souvenir.</Text>}
    <Button href={props.type === "post_stay_review" && props.googleReviewUrl ? props.googleReviewUrl : props.portalUrl} style={{display:"block",margin:"26px 0",padding:"14px 22px",borderRadius:"999px",backgroundColor:"#C9A86A",color:"#111",fontWeight:700,textAlign:"center"}}>
      {props.type === "pre_arrival" ? "Préparer mon arrivée" : props.type === "access_48h" ? "Accéder à Mon séjour" : props.type === "access_ready" ? "Voir mes informations d’accès" : props.type === "post_stay_review" && props.googleReviewUrl ? "Laisser un avis" : "Accéder à mon séjour"}
    </Button>
    <Text style={emailText}>À très bientôt,</Text><Text style={{ ...emailText, fontSize: "12px" }}>Absolu</Text>
  </EmailShell>;
}
