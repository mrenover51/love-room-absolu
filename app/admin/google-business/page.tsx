import { requireAdmin } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GoogleBusinessDashboard } from "@/components/google-business/google-business-dashboard";
import { restaurants } from "@/lib/restaurants/restaurants";
import { touristAttractions } from "@/lib/tourism/attractions";

export default async function GoogleBusinessPage() {
  await requireAdmin();
  const suggestions = {
    restaurants: restaurants.slice(0, 5).map((item) => item.name),
    activities: touristAttractions
      .filter((item) => item.top)
      .slice(0, 5)
      .map((item) => item.name),
    champagne: [
      "la Côte des Blancs",
      "l’avenue de Champagne",
      "les caves d’Épernay",
      "les villages Grand Cru",
    ],
  };
  return (
    <>
      <AdminPageHeader
        eyebrow="SEO local"
        title="Google Business Profile"
        description="Pilotez publications, avis, médias et performances de la fiche Love Room Absolu depuis une interface unique."
      />
      <GoogleBusinessDashboard suggestions={suggestions} />
    </>
  );
}
