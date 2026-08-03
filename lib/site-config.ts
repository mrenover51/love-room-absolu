import { STAY_TIMES } from "@/lib/stay-config";

const value = (name: string) => process.env[name]?.trim() || undefined;
const numberValue = (name: string) => { const raw = value(name); return raw && Number.isFinite(Number(raw)) ? Number(raw) : undefined; };
export const PUBLIC_SITE_URL = "https://love-room-absolu.fr" as const;

export const siteConfig = {
  commercialName: value("NEXT_PUBLIC_SITE_NAME") ?? "Absolu",
  city: "Avize", department: "Marne", region: "Grand Est",
  address: "36 rue Pasteur, 51190 Avize, France", phone: "0687010464", email: "love.room.absolu@gmail.com",
  url: PUBLIC_SITE_URL,
  latitude: numberValue("NEXT_PUBLIC_SITE_LATITUDE"), longitude: numberValue("NEXT_PUBLIC_SITE_LONGITUDE"),
  checkInTime: STAY_TIMES.checkIn, checkOutTime: STAY_TIMES.checkOut,
  capacity: numberValue("NEXT_PUBLIC_SITE_CAPACITY"), startingPrice: numberValue("NEXT_PUBLIC_STARTING_PRICE"),
  reviewRating: numberValue("NEXT_PUBLIC_REVIEW_RATING"), reviewCount: numberValue("NEXT_PUBLIC_REVIEW_COUNT"),
  featuredReviewBody: value("NEXT_PUBLIC_FEATURED_REVIEW_BODY"), featuredReviewAuthor: value("NEXT_PUBLIC_FEATURED_REVIEW_AUTHOR"),
} as const;

export const hasLocalSeo = Boolean(siteConfig.city && siteConfig.department);

export const legalConfig = {
  companyName: "SCI MICAMÉLIA",
  operatorName: "Rodrigues Caroline",
  ownerAddress: "425 Rempart du Nord, 51190 Avize, France",
  establishmentName: "Love Room Absolu",
  address: "36 rue Pasteur, 51190 Avize, France",
  host: "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com",
  email: "love.room.absolu@gmail.com",
  phone: "06 87 01 04 64",
} as const;
