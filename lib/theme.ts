/** Tokens visuels de référence pour l’identité Absolu. */
export const theme = {
  colors: { background:"#0B0908", surface:"#15110F", ivory:"#F7F1E8", champagne:"#D0AE72", brass:"#A77D43", blush:"#D4A4A0", stone:"#DED2C3", wood:"#5B3D2E" },
  shadows: { soft:"0 1px 0 rgba(255,244,225,.06), 0 24px 70px rgba(29,17,12,.20)", lift:"0 1px 0 rgba(255,244,225,.09), 0 38px 100px rgba(27,15,10,.38)", glow:"0 0 72px rgba(208,174,114,.14)" },
  radii: { control:"1rem", card:"1.5rem", panel:"2rem", pill:"999px" },
  spacing: { scale:[8,12,16,24,32,48,64,96,128], section:"clamp(6rem, 9vw, 8rem)", shell:"82rem" },
  durations: { fast:0.3, normal:0.5, reveal:0.7, image:1.2, hero:20 },
} as const;
