"use server";

import { DEFAULT_CREW_SLUG } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

interface SyncWalletPayload {
  address: string;
  chainId?: number;
  crewSlug?: string;
}

export async function syncWalletSession(payload: SyncWalletPayload) {
  if (!supabaseAdmin) {
    return { ok: false, reason: "Supabase not configured" } as const;
  }

  const client: SupabaseClient<Database, "public"> = supabaseAdmin;

  const address = payload.address.toLowerCase();
  const crewSlug = payload.crewSlug ?? DEFAULT_CREW_SLUG;

  const { data: crewData, error } = await client
    .from("crews")
    .select("id")
    .eq("slug", crewSlug)
    .maybeSingle();

  const crew = crewData as Tables<"crews"> | null;

  if (error) {
    console.error("syncWalletSession: crew lookup failed", error.message);
    return { ok: false, reason: "Crew lookup failed" } as const;
  }

  if (!crew) {
    console.warn(`syncWalletSession: crew ${crewSlug} not found, skipping session sync`);
    return { ok: false, reason: "Crew missing" } as const;
  }

  const crewId = crew.id;
  if (!crewId) {
    console.warn(`syncWalletSession: crew ${crewSlug} missing id`);
    return { ok: false, reason: "Crew missing" } as const;
  }

  const lastConnectedAt = new Date().toISOString();

  const sessionRow: TablesInsert<"wallet_sessions"> = {
    crew_id: crewId,
    wallet_address: address,
    chain_id: payload.chainId?.toString() ?? null,
    last_connected_at: lastConnectedAt,
  };

  const { error: sessionError } = await client
    .from("wallet_sessions")
    .upsert(sessionRow, { onConflict: "crew_id,wallet_address" });

  if (sessionError) {
    console.error("syncWalletSession: wallet session upsert failed", sessionError.message);
    return { ok: false, reason: "Session upsert failed" } as const;
  }

  const memberRow: TablesInsert<"crew_members"> = {
    crew_id: crewId,
    wallet_address: address,
    role: "member",
  };

  const { error: memberError } = await client
    .from("crew_members")
    .upsert(memberRow, { onConflict: "crew_id,wallet_address" });

  if (memberError) {
    console.error("syncWalletSession: crew member upsert failed", memberError.message);
  }

  const crewUpdate: TablesUpdate<"crews"> = { last_active_at: lastConnectedAt };

  const { error: crewUpdateError } = await client.from("crews").update(crewUpdate).eq("id", crewId);

  if (crewUpdateError) {
    console.error("syncWalletSession: crew last_active update failed", crewUpdateError.message);
  }

  return { ok: true } as const;
}