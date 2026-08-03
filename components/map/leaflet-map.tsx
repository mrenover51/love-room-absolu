"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { MapPlace } from "@/lib/map/places";
export function LeafletMap({
  place,
  dark,
}: {
  place: MapPlace;
  dark: boolean;
}) {
  const node = useRef<HTMLDivElement>(null),
    mapRef = useRef<import("leaflet").Map | null>(null);
  const [status, setStatus] = useState("Localisation de l’adresse…");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!node.current) return;
      const L = await import("leaflet");
      mapRef.current?.remove();
      const map = L.map(node.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([48.9706, 4.0103], 11);
      mapRef.current = map;
      L.tileLayer(
        dark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          maxZoom: 19,
        },
      ).addTo(map);
      try {
        const key = `absolu-geocode:${place.address}`,
          cached = localStorage.getItem(key);
        let point = cached ? JSON.parse(cached) : null;
        if (!point) {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place.address)}`,
          );
          const result = await response.json();
          if (result[0]) {
            point = { lat: Number(result[0].lat), lon: Number(result[0].lon) };
            localStorage.setItem(key, JSON.stringify(point));
          }
        }
        if (point && !cancelled) {
          map.setView([point.lat, point.lon], 15);
          L.circleMarker([point.lat, point.lon], {
            radius: 10,
            color: "#201B18",
            fillColor: "#C9A86A",
            fillOpacity: 1,
            weight: 3,
          })
            .addTo(map)
            .bindPopup(`<strong>${place.name}</strong><br>${place.address}`)
            .openPopup();
          setStatus("Adresse positionnée avec OpenStreetMap.");
        } else
          setStatus("Position exacte non trouvée ; carte centrée sur Avize.");
      } catch {
        setStatus("Carte centrée sur Avize ; géocodage indisponible.");
      }
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [dark, place]);
  return (
    <div>
      <div
        ref={node}
        className="h-[440px] w-full overflow-hidden rounded-3xl"
        aria-label={`Carte OpenStreetMap de ${place.name}`}
      />
      <p className="mt-3 text-xs text-white/35" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
