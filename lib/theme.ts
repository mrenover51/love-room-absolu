/** Tokens visuels de référence pour l’identité Absolu. */
export const theme = {
  colors: { background:"#090909", surface:"#121212", ivory:"#F6F2EC", gold:"#C9A86A", pink:"#F13C98", violet:"#8E48FF" },
  shadows: { soft:"0 24px 80px rgba(0,0,0,.28)", glow:"0 0 96px rgba(241,60,152,.14)" },
  radii: { subtle:"0.5rem", pill:"999px" },
  spacing: { section:"clamp(6rem, 10vw, 9rem)", shell:"76rem" },
  durations: { fast:0.2, normal:0.5, reveal:0.7, image:1.2, hero:20 },
} as const;
