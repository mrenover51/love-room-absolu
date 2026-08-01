const value = (name: string) => process.env[name]?.trim() || undefined;
const numberValue = (name: string) => { const raw = value(name); return raw && Number.isFinite(Number(raw)) ? Number(raw) : undefined; };

export const siteConfig = {
  commercialName: value("NEXT_PUBLIC_SITE_NAME") ?? "Absolu",
  city: value("NEXT_PUBLIC_SITE_CITY"), department: value("NEXT_PUBLIC_SITE_DEPARTMENT"), region: value("NEXT_PUBLIC_SITE_REGION"),
  address: value("NEXT_PUBLIC_SITE_ADDRESS"), phone: value("NEXT_PUBLIC_SITE_PHONE"), email: value("NEXT_PUBLIC_SITE_EMAIL"),
  url: value("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000", instagram: value("NEXT_PUBLIC_INSTAGRAM_URL"),
  latitude: numberValue("NEXT_PUBLIC_SITE_LATITUDE"), longitude: numberValue("NEXT_PUBLIC_SITE_LONGITUDE"),
  checkInTime: value("NEXT_PUBLIC_CHECK_IN_TIME"), checkOutTime: value("NEXT_PUBLIC_CHECK_OUT_TIME"),
  capacity: numberValue("NEXT_PUBLIC_SITE_CAPACITY"), startingPrice: numberValue("NEXT_PUBLIC_STARTING_PRICE"),
} as const;

export const hasLocalSeo = Boolean(siteConfig.city && siteConfig.department);

const placeholder = (label:string) => `[${label} — À COMPLÉTER]`;
export const legalConfig = {
  companyName: value("NEXT_PUBLIC_LEGAL_COMPANY_NAME") ?? placeholder("RAISON SOCIALE"),
  operatorName: value("NEXT_PUBLIC_LEGAL_OPERATOR_NAME") ?? placeholder("NOM DE L’EXPLOITANT"),
  address: siteConfig.address ?? placeholder("ADRESSE"), siret: value("NEXT_PUBLIC_LEGAL_SIRET") ?? placeholder("SIRET"),
  host: value("NEXT_PUBLIC_LEGAL_HOST") ?? placeholder("HÉBERGEUR ET ADRESSE"), email:siteConfig.email??placeholder("EMAIL"), phone:siteConfig.phone??placeholder("TÉLÉPHONE"),
  cancellation:value("NEXT_PUBLIC_CANCELLATION_POLICY")??placeholder("POLITIQUE D’ANNULATION"), deposit:value("NEXT_PUBLIC_SECURITY_DEPOSIT")??placeholder("DÉPÔT DE GARANTIE"),
  times:siteConfig.checkInTime&&siteConfig.checkOutTime?`Arrivée : ${siteConfig.checkInTime}. Départ : ${siteConfig.checkOutTime}.`:placeholder("HORAIRES D’ARRIVÉE ET DE DÉPART"),
  houseRules:value("NEXT_PUBLIC_HOUSE_RULES")??placeholder("RÈGLEMENT INTÉRIEUR"),
} as const;
