import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/types";
import { composeSprintSummary, type SprintSummary } from "@/lib/sprints";
import { demoPnl, demoPortfolio, demoPositions, demoTransactions, mockCrew, mockHighlights } from "@/data/mock";
import type { PnlSnapshot, PortfolioSnapshot, PositionItem, TransactionItem } from "@/lib/zerion";
import type { ZerionWebhookPayload } from "@/lib/zerion-webhook";

interface CrewHighlight {
  title: string;
  body: string;
  mood: "positive" | "warning" | "neutral";
}

export interface CrewDashboardData {
  crew: {
    name: string;
    goal: string;
    members: number;
    streakDays: number;
  };
  portfolio: PortfolioSnapshot;
  pnl: PnlSnapshot;
  positions: PositionItem[];
  transactions: TransactionItem[];
  summary: SprintSummary;
  highlights: CrewHighlight[];
  source: "supabase" | "mock";
}

const highlightFromEvent = (event: Tables<"zerion_events">): CrewHighlight => {
  const payload = event.payload as ZerionWebhookPayload | Record<string, unknown>;

  if (event.event_type === "portfolio_update" && "portfolio" in payload) {
    const portfolio = (payload as ZerionWebhookPayload).portfolio;
    const change = portfolio.change24hUsd ?? 0;
    const direction = change >= 0 ? "Momentum" : "Drawdown alert";
    return {
      title: direction,
      body: `Net worth moved by ${change.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })} across the crew in the last 24h.`,
      mood: change >= 0 ? "positive" : "warning",
    };
  }

  if (event.event_type === "transaction" && "transactions" in payload) {
    const [latestTx] = (payload as ZerionWebhookPayload).transactions;
    return {
      title: latestTx?.description ?? "Fresh onchain move",
      body: "A new transaction hit the feed. Rally the crew to react or copy the move.",
      mood: "neutral",
    };
  }

  if (event.event_type === "pnl_update" && "pnl" in payload) {
    const pnl = (payload as ZerionWebhookPayload).pnl;
    return {
      title: "PnL pulse",
      body: `Realized PnL is ${pnl.realizedUsd.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}. Keep the streak alive!`,
      mood: pnl.realizedUsd >= 0 ? "positive" : "warning",
    };
  }

  const baseTitle = event.event_type.replace(/_/g, " ");
  return {
    title: baseTitle.length ? baseTitle : "Zerion update",
    body: "New Zerion webhook data was ingested.",
    mood: "neutral",
  };
};

const buildMockDashboard = (): CrewDashboardData => {
  const summary = composeSprintSummary({
    portfolio: demoPortfolio,
    pnl: demoPnl,
    positions: demoPositions,
    transactions: demoTransactions,
  });

  return {
    crew: {
      name: mockCrew.name,
      goal: mockCrew.sprintGoal,
      members: mockCrew.members,
      streakDays: mockCrew.streakDays,
    },
    portfolio: demoPortfolio,
    pnl: demoPnl,
    positions: demoPositions,
    transactions: demoTransactions,
    summary,
    highlights: mockHighlights.map((highlight) => ({ ...highlight, mood: highlight.mood ?? "neutral" })),
    source: "mock",
  };
};

export const getCrewDashboardData = async (crewSlug: string): Promise<CrewDashboardData> => {
  if (!supabaseAdmin) {
    return buildMockDashboard();
  }

  const { data: crew, error: crewError } = await supabaseAdmin
    .from("crews")
    .select("id, name, sprint_goal, current_streak_days")
    .eq("slug", crewSlug)
    .maybeSingle();

  if (crewError) {
    console.error("Failed to load crew", crewError.message);
  }

  if (!crew) {
    return buildMockDashboard();
  }

  const { count: memberCount } = await supabaseAdmin
    .from("crew_members")
    .select("id", { count: "exact", head: true })
    .eq("crew_id", crew.id);

  const { data: snapshot } = await supabaseAdmin
    .from("sprint_snapshots")
    .select("portfolio, pnl, positions, transactions, summary")
    .eq("crew_id", crew.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: events } = await supabaseAdmin
    .from("zerion_events")
    .select("*")
    .eq("crew_id", crew.id)
    .order("received_at", { ascending: false })
    .limit(3);

  const portfolio = (snapshot?.portfolio as unknown as PortfolioSnapshot) ?? demoPortfolio;
  const pnl = (snapshot?.pnl as unknown as PnlSnapshot) ?? demoPnl;
  const positions = (snapshot?.positions as unknown as PositionItem[]) ?? demoPositions;
  const transactions = (snapshot?.transactions as unknown as TransactionItem[]) ?? demoTransactions;

  const summary = snapshot?.summary
    ? (snapshot.summary as unknown as SprintSummary)
    : composeSprintSummary({ portfolio, pnl, positions, transactions });

  const highlights = events && events.length > 0 
    ? (events as Tables<"zerion_events">[]).map(highlightFromEvent) 
    : mockHighlights;

  return {
    crew: {
      name: crew.name,
      goal: crew.sprint_goal ?? mockCrew.sprintGoal,
      members: memberCount ?? mockCrew.members,
      streakDays: crew.current_streak_days ?? mockCrew.streakDays,
    },
    portfolio,
    pnl,
    positions,
    transactions,
    summary,
    highlights: highlights.map((highlight) => ({ ...highlight })),
    source: snapshot ? "supabase" : "mock",
  };
};