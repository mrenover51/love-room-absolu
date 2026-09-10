"use client";

import { useActionState } from "react";
import { acceptRequest, rejectRequest, type RequestActionState } from "@/app/admin/demandes-reservation/actions";

const initialRequestActionState:RequestActionState={ok:false,message:""};

export function ReservationRequestActions({ id, compact=false }: { id: string; compact?: boolean }) {
  const [acceptState, acceptAction, acceptPending] = useActionState(acceptRequest, initialRequestActionState);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectRequest, initialRequestActionState);
  const state = acceptState.message ? acceptState : rejectState;
  return <div className={compact?"":"mt-6"}><div className="flex gap-3"><form action={acceptAction}><input type="hidden" name="id" value={id}/><button disabled={acceptPending||rejectPending} className={`${compact?"rounded-lg px-3 py-2":"rounded-full px-5 py-3 text-sm"} bg-[#C9A86A] text-black disabled:opacity-50`}>{acceptPending?"Acceptation…":"Accepter"}</button></form><form action={rejectAction}><input type="hidden" name="id" value={id}/><button disabled={acceptPending||rejectPending} className={`${compact?"rounded-lg px-3 py-2":"rounded-full px-5 py-3 text-sm"} border border-rose-400/30 text-rose-200 disabled:opacity-50`}>{rejectPending?"Refus…":"Refuser"}</button></form></div>{state.message&&<p role={state.ok?"status":"alert"} className={`mt-3 text-sm ${state.ok?"text-emerald-300":"text-rose-300"}`}>{state.message}</p>}</div>;
}
