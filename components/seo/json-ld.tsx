import { safeJsonLd, type JsonLdNode } from "@/lib/schema/validator";

export function JsonLd({ data }: { data: JsonLdNode }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
