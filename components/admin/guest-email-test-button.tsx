"use client";

import { useActionState } from "react";

import {
  sendGuestEmailTest,
  type TestEmailActionState,
} from "@/app/admin/parametres/experience-client/actions";
import type { GuestEmailPreviewType } from "@/lib/guest-portal/email-preview";

const initialState: TestEmailActionState = { ok: false, message: "" };

export function GuestEmailTestButton({ type }: { type: GuestEmailPreviewType }) {
  const [state, action, pending] = useActionState(sendGuestEmailTest, initialState);
  return <div>
    <form action={action}>
      <input type="hidden" name="type" value={type} />
      <button disabled={pending} className="rounded-full border border-[#c9a86a]/30 px-5 py-3 text-sm text-[#e5c98e] disabled:opacity-50">
        {pending ? "Envoi du test…" : "Envoyer un email test"}
      </button>
    </form>
    {state.message && <p role={state.ok ? "status" : "alert"} className={`mt-2 max-w-xs text-xs ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>}
  </div>;
}
