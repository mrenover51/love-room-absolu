export type JsonLdNode = Record<string, unknown>;
export type JsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
};
const required: Record<string, string[]> = {
  Organization: ["@id", "name", "url"],
  LocalBusiness: ["@id", "name", "address"],
  LodgingBusiness: ["@id", "name", "address"],
  Hotel: ["@id", "name", "address"],
  ImageObject: ["@id", "contentUrl", "width", "height"],
  VideoObject: ["@id", "name", "description", "thumbnailUrl", "uploadDate"],
  FAQPage: ["@id", "mainEntity"],
  BreadcrumbList: ["itemListElement"],
  Offer: ["priceCurrency", "availability"],
  Product: ["@id", "name", "image"],
  Review: ["author", "reviewRating", "reviewBody"],
  AggregateRating: ["ratingValue", "ratingCount"],
  WebSite: ["@id", "name", "url"],
  WebPage: ["@id", "name", "url"],
  Article: ["headline", "author", "datePublished"],
  BlogPosting: ["headline", "author", "datePublished"],
  Person: ["@id", "name"],
  Event: ["name", "startDate", "location"],
  Place: ["@id", "name"],
  GeoCoordinates: ["latitude", "longitude"],
};
const types = (node: JsonLdNode) =>
  Array.isArray(node["@type"])
    ? (node["@type"] as string[])
    : typeof node["@type"] === "string"
      ? [node["@type"] as string]
      : [];
export function validateJsonLd(graph: JsonLdGraph) {
  const errors: string[] = [],
    ids = new Set<string>();
  if (graph["@context"] !== "https://schema.org")
    errors.push("@context must be https://schema.org");
  for (const [nodeIndex, node] of graph["@graph"].entries()) {
    const id = typeof node["@id"] === "string" ? node["@id"] : undefined;
    if (id) {
      if (ids.has(id)) errors.push(`duplicate @id: ${id}`);
      ids.add(id);
    }
    for (const type of types(node)) {
      for (const field of required[type] ?? []) {
        if (
          node[field] === undefined ||
          node[field] === null ||
          node[field] === ""
        )
          errors.push(`${type}[${nodeIndex}] missing ${field}`);
      }
    }
    if (node["@type"] === "AggregateRating" && Number(node.ratingCount) <= 0)
      errors.push("AggregateRating ratingCount must be positive");
    if (
      node["@type"] === "Offer" &&
      node.price !== undefined &&
      Number(node.price) < 0
    )
      errors.push("Offer price must be positive");
  }
  if (errors.length)
    throw new Error(`STRUCTURED_DATA_INVALID\n${errors.join("\n")}`);
  return graph;
}
export function safeJsonLd(value: JsonLdGraph | JsonLdNode) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
