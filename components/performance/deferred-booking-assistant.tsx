"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const BookingAssistant = dynamic(
  () =>
    import("@/components/assistant/booking-assistant").then(
      (module) => module.BookingAssistant,
    ),
  { ssr: false },
);

export function DeferredBookingAssistant() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const browser = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const id = browser.requestIdleCallback?.(() => setReady(true), {
      timeout: 2500,
    });
    const timer =
      id === undefined
        ? window.setTimeout(() => setReady(true), 1800)
        : undefined;
    return () => {
      if (id !== undefined) browser.cancelIdleCallback?.(id);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);
  return ready ? <BookingAssistant /> : null;
}
