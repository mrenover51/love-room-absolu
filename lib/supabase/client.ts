"use client";
import { createBrowserClient } from "@supabase/ssr";
export function createSupabaseBrowserClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!anon)throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");return createBrowserClient(url,anon)}
