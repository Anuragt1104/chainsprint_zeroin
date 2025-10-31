"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

export const createSupabaseBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("Supabase browser client missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return null;
  }

  return createBrowserClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
    },
  });
};