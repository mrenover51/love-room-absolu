"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
const parts = (target: string) => {
  const distance = Math.max(0, new Date(target).getTime() - Date.now()),
    days = Math.floor(distance / 86400000),
    hours = Math.floor(distance / 3600000) % 24,
    minutes = Math.floor(distance / 60000) % 60,
    seconds = Math.floor(distance / 1000) % 60;
  return { days, hours, minutes, seconds };
};
export function EventCountdown({
  target,
  personal,
}: {
  target?: string;
  personal: boolean;
}) {
  const reduced = useReducedMotion();
  const [custom, setCustom] = useState("");
  const active = personal ? custom : (target ?? "");
  const [remaining, setRemaining] = useState(() => parts(active));
  useEffect(() => {
    if (!active) return;
    const update = () => setRemaining(parts(active));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [active]);
  const values = useMemo(() => Object.entries(remaining), [remaining]);
  return (
    <section
      className="rounded-3xl border border-[#C9A86A]/25 bg-[#C9A86A]/[.06] p-6 sm:p-8"
      aria-labelledby="countdown-title"
    >
      <p className="eyebrow text-[#C9A86A]">Compte à rebours</p>
      <h2 id="countdown-title" className="mt-3 font-heading text-4xl">
        {personal
          ? "Choisissez votre date symbolique"
          : "Avant la prochaine édition"}
      </h2>
      {personal && (
        <label className="mt-5 block max-w-sm text-xs text-white/45">
          Date de votre occasion
          <input
            type="date"
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black px-4 text-white"
          />
        </label>
      )}
      {active ? (
        <div className="mt-7 grid grid-cols-4 gap-2">
          {values.map(([label, value], index) => (
            <motion.div
              key={label}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl bg-black/30 p-3 text-center sm:p-5"
            >
              <strong className="block font-heading text-3xl sm:text-5xl">
                {String(value).padStart(2, "0")}
              </strong>
              <span className="mt-1 block text-[9px] uppercase tracking-wider text-white/35">
                {label === "days"
                  ? "jours"
                  : label === "hours"
                    ? "heures"
                    : label === "minutes"
                      ? "minutes"
                      : "secondes"}
              </span>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-white/45">
          Indiquez une date pour lancer votre compte à rebours personnel.
        </p>
      )}
    </section>
  );
}
