import { restaurants } from "@/lib/restaurants/restaurants";
import { touristAttractions } from "@/lib/tourism/attractions";

export const mapCategories = [
  "Tous",
  "Restaurants",
  "Champagnes",
  "Caves",
  "Activités",
  "Promenades",
  "Parkings",
  "Bornes électriques",
  "Supermarchés",
  "Pharmacies",
  "Urgences",
  "Stations-service",
] as const;
export type MapCategory = (typeof mapCategories)[number];
export type MapPlace = {
  id: string;
  name: string;
  category: Exclude<MapCategory, "Tous">;
  address: string;
  city: string;
  distance: string;
  drive: string;
  walk?: string;
  phone?: string;
  website?: string;
  description: string;
  href: string;
  top: boolean;
  kind: "Restaurant" | "TouristAttraction" | "LocalBusiness";
};

const activityCategory = (category: string): MapPlace["category"] =>
  category === "Visites de caves"
    ? "Caves"
    : category === "Route du Champagne"
      ? "Champagnes"
      : ["Balades", "Randonnées"].includes(category)
        ? "Promenades"
        : "Activités";
export const mapPlaces: MapPlace[] = [
  ...restaurants.map((item, index) => ({
    id: `restaurant-${item.slug}`,
    name: item.name,
    category: "Restaurants" as const,
    address: item.address,
    city: item.city,
    distance: "À calculer",
    drive: item.drive,
    phone: item.phone,
    website: item.website,
    description: item.presentation,
    href: `/restaurants/${item.slug}`,
    top: index < 10 || item.tags.includes("top"),
    kind: "Restaurant" as const,
  })),
  ...touristAttractions.map((item, index) => ({
    id: `activity-${item.slug}`,
    name: item.name,
    category: activityCategory(item.category),
    address: item.address,
    city: item.city,
    distance: item.distance,
    drive: item.drive,
    website: item.sourceUrl,
    description: item.description,
    href: `/guide-touristique/${item.slug}`,
    top: item.top || index < 10,
    kind: "TouristAttraction" as const,
  })),
];

export const unverifiedCategories = mapCategories.filter(
  (category) =>
    category !== "Tous" &&
    !mapPlaces.some((place) => place.category === category),
);
