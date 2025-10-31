const ZERION_BASE_URL = "https://api.zerion.io";

type HttpMethod = "GET" | "POST";

interface ZerionRequestOptions {
  path: string;
  method?: HttpMethod;
  searchParams?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
}

export interface PortfolioSnapshot {
  totalNetWorthUsd: number;
  change24hUsd: number;
  chains: Array<{
    chainId: string;
    netWorthUsd: number;
    change24hUsd: number;
  }>;
}

export interface TransactionItem {
  id: string;
  description: string;
  timestamp: string;
  operationType: string;
  valueUsd: number;
  counterparty?: string;
}

export interface PositionItem {
  protocol: string;
  symbol: string;
  netValueUsd: number;
  apy?: number;
  chainId: string;
}

export interface PnlSnapshot {
  realizedUsd: number;
  unrealizedUsd: number;
  costBasisUsd: number;
}

const resolveApiKey = (): string => {
  const key = process.env.ZERION_API_KEY;
  if (!key) {
    throw new Error("ZERION_API_KEY is not set. Please provide it via environment variables.");
  }
  return key;
};

const buildUrl = ({ path, searchParams }: ZerionRequestOptions): string => {
  const url = new URL(path, ZERION_BASE_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
};

const zerionFetch = async <T>(options: ZerionRequestOptions): Promise<T> => {
  const response = await fetch(buildUrl(options), {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${resolveApiKey()}:`).toString("base64")}`,
    },
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Zerion request failed: ${response.status} ${response.statusText} – ${errorBody}`);
  }

  return response.json() as Promise<T>;
};

export const ZerionClient = {
  async getPortfolio(address: string): Promise<PortfolioSnapshot> {
    const data = await zerionFetch<{ data: { attributes: PortfolioSnapshot } }>({
      path: `/wallets/${address}/portfolio`,
      searchParams: { include: "chains" },
    });
    return data.data.attributes;
  },

  async getTransactions(address: string): Promise<TransactionItem[]> {
    const data = await zerionFetch<{
      data: Array<{ id: string; attributes: Omit<TransactionItem, "id"> }>;
    }>({
      path: `/wallets/${address}/transactions`,
      searchParams: { sort: "-mined_at", ["page[size]"]: 20 },
    });
    return data.data.map((item) => ({
      id: item.id,
      ...item.attributes,
    }));
  },

  async getPositions(address: string): Promise<PositionItem[]> {
    const data = await zerionFetch<{
      data: Array<{ attributes: PositionItem }>;
    }>({
      path: `/wallets/${address}/positions`,
      searchParams: { ["filter[state]"]: "opened" },
    });
    return data.data.map((item) => item.attributes);
  },

  async getPnl(address: string): Promise<PnlSnapshot> {
    const data = await zerionFetch<{ data: { attributes: PnlSnapshot } }>({
      path: `/wallets/${address}/pnl`,
    });
    return data.data.attributes;
  },
};

export type ZerionClientType = typeof ZerionClient;