"use client";
import { useEffect } from "react";
export default function GlobalError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
  useEffect(()=>{console.error("global_render_failed",{digest:error.digest});},[error]);
  return <html lang="fr"><body className="grid min-h-screen place-items-center bg-[#090909] p-6 text-center text-[#F6F2EC]"><main><p className="text-xs uppercase tracking-[.3em] text-[#C9A86A]">Love Room Absolu</p><h1 className="mt-5 text-4xl">Un imprévu est survenu</h1><p className="mx-auto mt-4 max-w-lg text-white/60">Votre réservation n’a pas été perdue. Vous pouvez réessayer ou revenir à l’accueil.</p><div className="mt-8 flex justify-center gap-3"><button type="button" onClick={reset} className="rounded-full bg-[#C9A86A] px-6 py-3 text-black">Réessayer</button><a href="/" className="rounded-full border border-white/20 px-6 py-3">Accueil</a></div></main></body></html>;
}
