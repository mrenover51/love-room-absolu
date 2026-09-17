import { Button, Text } from "@react-email/components";
import { EmailShell, emailText } from "./email-shell";
import type { CommunicationType } from "@/lib/guest-portal/types";

export type GuestCommunicationEmailData = {
  type: CommunicationType;
  firstName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  total: number;
  address: string;
  portalUrl: string;
  checkInTime: string;
  checkOutTime: string;
  options: string[];
  accessInstructions: string;
  keyboxInstructions: string;
  keyboxCode: string | null;
  checkoutInstructions: string;
  googleReviewUrl: string;
};

const title: Record<CommunicationType, string> = {
  confirmation: "Votre séjour chez Absolu est confirmé",
  pre_arrival: "Votre séjour chez Absolu approche",
  access_48h: "Votre arrivée chez Absolu approche",
  access_ready: "Rappel de votre arrivée chez Absolu",
  checkout_reminder: "Votre départ chez Absolu",
  post_stay_review: "Merci pour votre séjour chez Absolu",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${value}T12:00:00Z`));

export function GuestCommunicationEmail(props: GuestCommunicationEmailData) {
  const details = (
    <Text style={emailText}>
      {props.checkIn} → {props.checkOut}
      <br />
      {props.guestCount} voyageur{props.guestCount > 1 ? "s" : ""}
      {props.type === "confirmation" ? (
        <>
          <br />
          {(props.total / 100).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
          <br />
          {props.address}
        </>
      ) : null}
    </Text>
  );

  return (
    <EmailShell preview={title[props.type]} title={title[props.type]}>
      <Text style={emailText}>Bonjour {props.firstName},</Text>
      {props.type === "confirmation" && (
        <>
          <Text style={emailText}>Votre séjour chez Absolu est confirmé.</Text>
          {details}
          {props.options.length > 0 && (
            <Text style={emailText}>Options : {props.options.join(", ")}</Text>
          )}
        </>
      )}
      {props.type === "pre_arrival" && (
        <>
          <Text style={emailText}>
            Votre arrivée approche. La suite vous accueille à partir de {props.checkInTime.replace(":", "h")}.
          </Text>
          {details}
          <Text style={emailText}>
            {props.address}
            <br />
            Vous pouvez dès maintenant compléter votre pré-check-in.
          </Text>
        </>
      )}
      {props.type === "access_48h" && (
        <>
          <Text style={emailText}>Votre séjour chez Absolu approche.</Text>
          <Text style={emailText}>
            Votre arrivée est prévue le {formatDate(props.checkIn)} à partir de {props.checkInTime.replace(":", "h")}.
          </Text>
          <Text style={emailText}>
            <strong>Adresse :</strong>
            <br />
            {props.address}
          </Text>
          {props.accessInstructions && (
            <Text style={emailText}>
              <strong>Accès :</strong>
              <br />
              {props.accessInstructions}
            </Text>
          )}
          {props.keyboxInstructions && (
            <Text style={emailText}>
              <strong>Boîte à clés :</strong>
              <br />
              {props.keyboxInstructions}
            </Text>
          )}
          {props.keyboxCode && (
            <Text style={{ ...emailText, fontSize: "20px" }}>
              <strong>Votre code : {props.keyboxCode}</strong>
            </Text>
          )}
          <Text style={emailText}>
            <strong>Mon séjour :</strong>
            <br />
            Vous y retrouverez toutes les informations utiles pour votre séjour.
          </Text>
        </>
      )}
      {props.type === "access_ready" && (
        <Text style={emailText}>
          Nous vous souhaitons une belle arrivée chez Absolu. Vos informations d’accès restent disponibles dans votre espace personnel.
        </Text>
      )}
      {props.type === "checkout_reminder" && (
        <>
          <Text style={emailText}>
            Nous espérons que votre nuit a été douce. Le départ est prévu avant {props.checkOutTime.replace(":", "h")}.
          </Text>
          {props.checkoutInstructions && (
            <Text style={emailText}>{props.checkoutInstructions}</Text>
          )}
        </>
      )}
      {props.type === "post_stay_review" && (
        <Text style={emailText}>
          Merci d’avoir choisi Absolu. Nous espérons que cette parenthèse vous laissera un beau souvenir.
        </Text>
      )}
      <Button
        href={
          props.type === "post_stay_review" && props.googleReviewUrl
            ? props.googleReviewUrl
            : props.portalUrl
        }
        style={{
          display: "block",
          margin: "26px 0",
          padding: "14px 22px",
          borderRadius: "999px",
          backgroundColor: "#C9A86A",
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {props.type === "pre_arrival"
          ? "Préparer mon arrivée"
          : props.type === "access_48h"
            ? "Accéder à Mon séjour"
            : props.type === "access_ready"
              ? "Voir mes informations d’accès"
              : props.type === "post_stay_review" && props.googleReviewUrl
                ? "Laisser un avis"
                : "Accéder à mon séjour"}
      </Button>
      <Text style={emailText}>À très bientôt,</Text>
      <Text style={{ ...emailText, fontSize: "12px" }}>Absolu</Text>
    </EmailShell>
  );
}
