import type { PortfolioSnapshot, PositionItem, PnlSnapshot, TransactionItem } from "@/lib/zerion";

export const demoPortfolio: PortfolioSnapshot = {
  totalNetWorthUsd: 128450,
  change24hUsd: 6450,
  chains: [
    { chainId: "solana", netWorthUsd: 64200, change24hUsd: 3200 },
    { chainId: "base", netWorthUsd: 42350, change24hUsd: 1800 },
    { chainId: "ethereum", netWorthUsd: 21900, change24hUsd: 1450 },
  ],
};

export const demoPnl: PnlSnapshot = {
  realizedUsd: 18850,
  unrealizedUsd: 27400,
  costBasisUsd: 82450,
};

export const demoPositions: PositionItem[] = [
  { protocol: "Kamino", symbol: "JUP/USDC LP", netValueUsd: 28200, apy: 0.29, chainId: "solana" },
  { protocol: "Hyperliquid", symbol: "ETH perp", netValueUsd: 22340, chainId: "base" },
  { protocol: "Drift", symbol: "SOL long", netValueUsd: 15560, apy: 0.12, chainId: "solana" },
  { protocol: "EigenLayer", symbol: "rsETH", netValueUsd: 14800, chainId: "ethereum" },
];

export const demoTransactions: TransactionItem[] = [
  {
    id: "0x1",
    description: "Opened Kamino vault for JUP/USDC",
    operationType: "deposit",
    timestamp: new Date().toISOString(),
    valueUsd: 8200,
    counterparty: "Kamino",
  },
  {
    id: "0x2",
    description: "Claimed airdrop $JUP",
    operationType: "reward",
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    valueUsd: 1200,
    counterparty: "Jupiter",
  },
];

export const mockCrew = {
  name: "Orbit Degens",
  members: 5,
  sprintGoal: "Secure +5% net in 7 days while capping drawdown at 3%",
  streakDays: 9,
};

export const mockHighlights = [
  {
    title: "Kamino LP dominated",
    body: "Collective LP positions delivered +2.3% yield over the last 48h.",
    mood: "positive" as const,
  },
  {
    title: "Risk alert",
    body: "One member hit -2.7% drawdown on SOL perp; crew rallied with hedges.",
    mood: "warning" as const,
  },
  {
    title: "Discovery unlocked",
    body: "New Base memecoin AlphaTap added with social proof from copy trades.",
    mood: "positive" as const,
  },
];

export const mockRoadmap = [
  {
    quarter: "Week 1",
    focus: "Zerion data integration",
    detail: "Server actions delivering live portfolio, positions, and PnL.",
  },
  {
    quarter: "Week 2",
    focus: "Sprint automation",
    detail: "Real-time webhook ingestion + scoring model shipping to UI.",
  },
  {
    quarter: "Week 3",
    focus: "Creator monetization",
    detail: "Launch gated crews with onchain ticketing integrations.",
  },
];