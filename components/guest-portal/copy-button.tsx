"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
export function CopyButton({value,label="Copier"}:{value:string;label?:string}){const[done,setDone]=useState(false);return <button type="button" onClick={async()=>{await navigator.clipboard.writeText(value);setDone(true);setTimeout(()=>setDone(false),1800)}} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#c9a86a]/35 px-5 text-sm text-[#ead19c]">{done?<Check className="size-4"/>:<Copy className="size-4"/>}{done?"Copié":label}</button>}

