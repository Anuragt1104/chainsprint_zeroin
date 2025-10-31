import type { PortfolioSnapshot, PnlSnapshot, PositionItem, TransactionItem } from "@/lib/zerion";

export interface ZerionWebhookPayload {
  event: string;
  wallet: string;
  crewSlug?: string;
  crewName?: string;
  sprintGoal?: string;
  portfolio: PortfolioSnapshot;
  pnl: PnlSnapshot;
  positions: PositionItem[];
  transactions: TransactionItem[];
}

export const ZERION_SIGNATURE_HEADER = "x-zerion-signature";
export const ZERION_TIMESTAMP_HEADER = "x-zerion-timestamp";