import type { PnlSnapshot, PortfolioSnapshot, PositionItem, TransactionItem } from "@/lib/zerion";

export interface SprintMetric {
  label: string;
  value: string;
  delta?: string;
  intent: "positive" | "negative" | "neutral";
}

export interface SprintSummary {
  morale: "charging" | "steady" | "recovery";
  headline: string;
  metrics: SprintMetric[];
}

const toUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const toPercent = (value: number): string => {
  const formatter = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
  return formatter.format(value);
};

export const composeSprintSummary = ({
  portfolio,
  pnl,
  positions,
  transactions,
}: {
  portfolio: PortfolioSnapshot;
  pnl: PnlSnapshot;
  positions: PositionItem[];
  transactions: TransactionItem[];
}): SprintSummary => {
  const netWorth = portfolio.totalNetWorthUsd;
  const changePercent = netWorth === 0 ? 0 : portfolio.change24hUsd / (netWorth - portfolio.change24hUsd || 1);

  const morale: SprintSummary["morale"] = changePercent > 0.05 ? "charging" : changePercent < -0.03 ? "recovery" : "steady";

  const topPosition = positions.toSorted((a, b) => b.netValueUsd - a.netValueUsd)[0];
  const latestMove = transactions[0];

  const headline = (() => {
    if (latestMove) {
      const direction = latestMove.valueUsd >= 0 ? "scored" : "hedged";
      return `${direction.toUpperCase()}: ${latestMove.description}`;
    }
    if (topPosition) {
      return `Holding strong: ${topPosition.symbol} on ${topPosition.chainId}`;
    }
    return "Sprint ready. Make your first move.";
  })();

  const metrics: SprintMetric[] = [
    {
      label: "Net worth",
      value: toUsd(netWorth),
      delta: toUsd(portfolio.change24hUsd),
      intent: portfolio.change24hUsd >= 0 ? "positive" : "negative",
    },
    {
      label: "Realized PnL",
      value: toUsd(pnl.realizedUsd),
      intent: pnl.realizedUsd >= 0 ? "positive" : "negative",
    },
    {
      label: "Unrealized PnL",
      value: toUsd(pnl.unrealizedUsd),
      intent: pnl.unrealizedUsd >= 0 ? "positive" : "negative",
    },
    {
      label: "24h Momentum",
      value: toPercent(changePercent),
      intent: changePercent >= 0 ? "positive" : "negative",
    },
  ];

  return {
    morale,
    headline,
    metrics,
  };
};