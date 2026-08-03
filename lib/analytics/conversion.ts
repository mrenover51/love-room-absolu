export type ConversionEvent =
  | "cro_sticky_cta_click"
  | "cro_popup_open"
  | "cro_quote_requested"
  | "cro_quote_available"
  | "booking_dates_selected"
  | "booking_step_view"
  | "booking_promo_applied"
  | "begin_checkout"
  | "checkout_redirect"
  | "purchase";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
  }
}

export function trackConversion(
  event: ConversionEvent,
  properties: Record<string, string | number | boolean> = {},
) {
  if (typeof window === "undefined") return;
  let consent = false;
  try {
    consent = Boolean(
      JSON.parse(localStorage.getItem("absolu-consent") ?? "{}").analytics,
    );
  } catch {
    consent = false;
  }
  if (!consent) return;
  const payload = { event, ...properties };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  window.gtag?.("event", event, properties);
  window.plausible?.(event, { props: properties });
  const sessionId=sessionStorage.getItem("absolu-analytics-session");
  if(sessionId)fetch("/api/analytics/event",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sessionId,event,path:location.pathname,referrer:document.referrer||undefined,value:typeof properties.value==="number"?properties.value:undefined,metadata:properties}),keepalive:true}).catch(()=>undefined);
}
