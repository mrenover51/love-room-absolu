import type { StaySettings } from "@/lib/stay-config";
import { rootSchema } from "@/lib/schema/entities";
import { safeJsonLd } from "@/lib/schema/validator";
export function StructuredData({
  staySettings,
}: {
  staySettings: StaySettings;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(rootSchema(staySettings)) }}
    />
  );
}
