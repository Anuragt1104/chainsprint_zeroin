import { type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { DEFAULT_CREW_NAME, DEFAULT_CREW_SLUG } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { composeSprintSummary } from "@/lib/sprints";
import { ZERION_SIGNATURE_HEADER, ZERION_TIMESTAMP_HEADER, type ZerionWebhookPayload } from "@/lib/zerion-webhook";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

const parseJsonBody = (rawBody: string) => {
  try {
    return JSON.parse(rawBody) as ZerionWebhookPayload;
  } catch (error) {
    console.error("Zerion webhook: failed to parse JSON", error);
    return null;
  }
};

const verifySignature = (rawBody: string, timestamp: string | null, signature: string | null): boolean => {
  const secret = process.env.ZERION_WEBHOOK_SECRET;
  if (!secret || !timestamp || !signature) {
    return false;
  }

  const fiveMinutes = 1000 * 60 * 5;
  const timestampMs = Number.parseInt(timestamp, 10);
  if (Number.isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > fiveMinutes) {
    console.warn("Zerion webhook: timestamp outside acceptable window");
    return false;
  }

  const bodyToSign = `${timestamp}.${rawBody}`;
  const computedSignature = createHmac("sha256", secret).update(bodyToSign).digest("hex");

  try {
    const provided = Buffer.from(signature, "hex");
    const expected = Buffer.from(computedSignature, "hex");
    if (provided.length === 0 || expected.length === 0 || provided.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(provided, expected);
  } catch (error) {
    console.error("Zerion webhook: timingSafeEqual failed", error);
    return false;
  }
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const headers = request.headers;

  const signature = headers.get(ZERION_SIGNATURE_HEADER);
  const timestamp = headers.get(ZERION_TIMESTAMP_HEADER);

  if (!verifySignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const payload = parseJsonBody(rawBody);
  if (!payload) {
    return NextResponse.json({ ok: false, reason: "invalid_payload" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    console.warn("Zerion webhook: supabase not configured; skipping persistence");
    return NextResponse.json({ ok: true, persisted: false }, { status: 202 });
  }

  const client = supabaseAdmin;

  const crewSlug = payload.crewSlug ?? DEFAULT_CREW_SLUG;
  const crewName = payload.crewName ?? DEFAULT_CREW_NAME;

  const { data: crewData, error: crewLookupError } = await client
    .from("crews")
    .select("id, current_streak_days")
    .eq("slug", crewSlug)
    .maybeSingle();

  const crew = crewData as Tables<"crews"> | null;

  let crewId = crew?.id;
  let currentStreak = crew?.current_streak_days ?? 0;

  if (crewLookupError) {
    console.error("Zerion webhook: crew lookup failed", crewLookupError.message);
  }

  if (!crewId) {
    const newCrew: TablesInsert<"crews"> = {
      slug: crewSlug,
      name: crewName,
      sprint_goal: payload.sprintGoal ?? "Ship +5% net crew growth in 7 days",
      current_streak_days: 0,
    };

    const { data: insertedCrew, error: insertError } = await client
      .from("crews")
      .insert(newCrew)
      .select("id, current_streak_days")
      .maybeSingle();

    if (insertError) {
      console.error("Zerion webhook: crew insert failed", insertError.message);
      return NextResponse.json({ ok: false, reason: "crew_create_failed" }, { status: 500 });
    }

    crewId = insertedCrew?.id;
    currentStreak = insertedCrew?.current_streak_days ?? 0;
  }

  if (!crewId) {
    return NextResponse.json({ ok: false, reason: "crew_missing" }, { status: 500 });
  }

  const summary = composeSprintSummary({
    portfolio: payload.portfolio,
    pnl: payload.pnl,
    positions: payload.positions,
    transactions: payload.transactions,
  });

  const newStreak = summary.morale === "charging" ? currentStreak + 1 : summary.morale === "recovery" ? 1 : currentStreak;

  const snapshotRow: TablesInsert<"sprint_snapshots"> = {
    crew_id: crewId,
    wallet_address: payload.wallet,
    portfolio: payload.portfolio as unknown as TablesInsert<"sprint_snapshots">["portfolio"],
    pnl: payload.pnl as unknown as TablesInsert<"sprint_snapshots">["pnl"],
    positions: payload.positions as unknown as TablesInsert<"sprint_snapshots">["positions"],
    transactions: payload.transactions as unknown as TablesInsert<"sprint_snapshots">["transactions"],
    summary: summary as unknown as TablesInsert<"sprint_snapshots">["summary"],
  };

  const { error: insertSnapshotError } = await client.from("sprint_snapshots").insert(snapshotRow);

  if (insertSnapshotError) {
    console.error("Zerion webhook: snapshot insert failed", insertSnapshotError.message);
    return NextResponse.json({ ok: false, reason: "snapshot_failed" }, { status: 500 });
  }

  const eventRow: TablesInsert<"zerion_events"> = {
    crew_id: crewId,
    wallet_address: payload.wallet,
    event_type: payload.event,
    payload: payload as unknown as TablesInsert<"zerion_events">["payload"],
    signature_valid: true,
  };

  const { error: eventInsertError } = await client.from("zerion_events").insert(eventRow);

  if (eventInsertError) {
    console.error("Zerion webhook: event insert failed", eventInsertError.message);
  }

  const crewUpdate: TablesUpdate<"crews"> = {
    current_streak_days: newStreak,
    last_active_at: new Date().toISOString(),
    sprint_goal: payload.sprintGoal ?? null,
  };

  const { error: crewUpdateError } = await client.from("crews").update(crewUpdate).eq("id", crewId);

  if (crewUpdateError) {
    console.error("Zerion webhook: crew update failed", crewUpdateError.message);
  }

  return NextResponse.json({ ok: true, crewSlug, morale: summary.morale }, { status: 201 });
}