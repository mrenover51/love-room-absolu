"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

export function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 text-xs text-white/60 transition hover:border-[#C9A86A]/30 hover:text-white disabled:cursor-wait disabled:opacity-50"
    >
      <LogOut className="size-3.5" aria-hidden="true" />
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
