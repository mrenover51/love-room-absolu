/** Tokens visuels de référence pour l’identité Absolu. */
export const theme = {
  colors: { background:"#090909", surface:"#121212", ivory:"#F6F2EC", gold:"#C9A86A", pink:"#F13C98", violet:"#8E48FF" },
  shadows: { soft:"0 24px 70px rgba(0,0,0,.22)", lift:"0 34px 90px rgba(0,0,0,.34)", glow:"0 0 72px rgba(201,168,106,.12)" },
  radii: { control:"1rem", card:"1.5rem", panel:"2rem", pill:"999px" },
  spacing: { scale:[8,12,16,24,32,48,64,96,128], section:"clamp(6rem, 9vw, 8rem)", shell:"82rem" },
  durations: { fast:0.3, normal:0.5, reveal:0.7, image:1.2, hero:20 },
} as const;
