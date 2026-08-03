export function AvailabilityLegend() {
  return (
    <div
      className="flex flex-wrap gap-5 text-xs text-white/60"
      aria-label="Légende du calendrier"
    >
      <span className="flex items-center gap-2">
        <i className="size-3 border border-white/30" />
        Disponible
      </span>
      <span className="flex items-center gap-2">
        <i className="size-3 bg-[#C9A86A]" />
        Sélectionnée
      </span>
      <span className="flex items-center gap-2">
        <i className="size-3 bg-white/10" />
        Indisponible
      </span>
    </div>
  );
}
