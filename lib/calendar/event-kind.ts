export type ImportedCalendarEventKind = "block" | "reservation";

const technicalUnavailability = /\b(?:closed\s*[-:]?\s*)?not\s+available\b/i;

export function classifyImportedCalendarEvent(
  summary: string,
): ImportedCalendarEventKind {
  return technicalUnavailability.test(summary.trim()) ? "block" : "reservation";
}
