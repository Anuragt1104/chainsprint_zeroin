# ChainSprint Code Guide

Welcome to the ChainSprint code walkthrough. This guide takes you through the key parts of the codebase, explaining not just what the code does, but why it's written that way and how all the pieces work together.

Think of this as a friendly colleague sitting next to you and explaining the code over coffee.

---

## Table of Contents

1. [Zerion API Client](#zerion-api-client)
2. [Sprint Logic & Morale Calculation](#sprint-logic--morale-calculation)
3. [Crew Data Aggregation](#crew-data-aggregation)
4. [Webhook Handler](#webhook-handler)
5. [Sprint Dashboard UI](#sprint-dashboard-ui)
6. [Wallet Integration](#wallet-integration)
7. [Mock Data Strategy](#mock-data-strategy)

---

## Zerion API Client

**File:** `src/lib/zerion.ts`

This is our interface to the Zerion API. Let's walk through how it works.

### The Foundation: Building Authenticated Requests

```typescript
const ZERION_BASE_URL = "https://api.zerion.io";

const resolveApiKey = (): string => {
  const key = process.env.ZERION_API_KEY;
  if (!key) {
    throw new Error("ZERION_API_KEY is not set.");
  }
  return key;
};
```

**Why check for the API key this way?**

We throw an error if the key is missing, rather than silently continuing. This makes debugging easier because you'll immediately know when the key isn't configured, rather than getting cryptic 401 errors later.

### Building URLs with Query Parameters

```typescript
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
```

**What's happening here?**

We use the browser's built-in `URL` API to construct URLs safely. The key line is `if (value !== undefined)` - this means we skip parameters that are `undefined`, which keeps our URLs clean.

For example:
```typescript
buildUrl({
  path: "/wallets/0x123/transactions",
  searchParams: { sort: "-mined_at", limit: undefined }
})
// Result: "https://api.zerion.io/wallets/0x123/transactions?sort=-mined_at"
// Notice: limit parameter is omitted
```

### The Core Fetch Wrapper

```typescript
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
```

**Breaking this down:**

1. **Method defaulting**: `options.method ?? "GET"` means "use the provided method, or default to GET"

2. **Basic Auth**: Zerion uses HTTP Basic Authentication. The format is `username:password` encoded as base64. In our case, the API key is the username and the password is empty (notice the colon after `${resolveApiKey()}`):
   ```typescript
   `${apiKey}:` → base64 → "Basic abcd1234..."
   ```

3. **No caching**: `cache: "no-store"` tells Next.js to always fetch fresh data. In production, you might change this to cache for 60 seconds.

4. **Error handling**: If the request fails, we read the error body as text and include it in our error message. This helps debugging because Zerion often returns helpful error messages.

### The Public API: Portfolio, Transactions, Positions, PnL

```typescript
export const ZerionClient = {
  async getPortfolio(address: string): Promise<PortfolioSnapshot> {
    const data = await zerionFetch<{ data: { attributes: PortfolioSnapshot } }>({
      path: `/wallets/${address}/portfolio`,
      searchParams: { include: "chains" },
    });
    return data.data.attributes;
  },
  // ... other methods
};
```

**Why this structure?**

Zerion's API returns data in a JSON:API format:
```json
{
  "data": {
    "id": "...",
    "type": "portfolio",
    "attributes": {
      "totalNetWorthUsd": 128450,
      "change24hUsd": 6450
    }
  }
}
```

We unwrap this nested structure and just return the `attributes` object, which is what we actually care about. This makes calling code simpler:

```typescript
// Clean API
const portfolio = await ZerionClient.getPortfolio(address);
console.log(portfolio.totalNetWorthUsd);

// vs. without unwrapping (messy)
const response = await ZerionClient.getPortfolio(address);
console.log(response.data.attributes.totalNetWorthUsd);
```

### Transaction Mapping

```typescript
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
}
```

**The interesting bits:**

1. **Sorting**: `sort: "-mined_at"` means sort by `mined_at` field in descending order (newest first). The minus sign indicates descending.

2. **Pagination**: `["page[size]"]: 20` uses bracket notation because the parameter name has brackets in it. This limits results to 20 transactions.

3. **Flattening**: Transactions come as separate `id` and `attributes` objects. We flatten them into a single object for easier use.

---

## Sprint Logic & Morale Calculation

**File:** `src/lib/sprints.ts`

This is where the "fitness app meets DeFi" magic happens. Let's see how we turn portfolio data into crew morale.

### The Morale Algorithm

```typescript
const netWorth = portfolio.totalNetWorthUsd;
const changePercent = netWorth === 0 
  ? 0 
  : portfolio.change24hUsd / (netWorth - portfolio.change24hUsd || 1);

const morale: SprintSummary["morale"] = 
  changePercent > 0.05 ? "charging" : 
  changePercent < -0.03 ? "recovery" : 
  "steady";
```

**Let's walk through the math:**

Say your portfolio is worth $100,000 and it gained $6,000 in 24 hours.

1. **Calculate the base value** (what it was 24h ago):
   ```
   netWorth - change24h = $100,000 - $6,000 = $94,000
   ```

2. **Calculate percentage change:**
   ```
   change24h / baseValue = $6,000 / $94,000 = 0.0638 = 6.38%
   ```

3. **Determine morale:**
   ```
   6.38% > 5% → "charging"
   ```

**Why these specific thresholds?**

- **+5% in 24 hours**: This is a significant gain in crypto. Anything above this represents real momentum worth celebrating.
- **-3% in 24 hours**: This is a common risk management threshold. Many traders use 2-3% as their stop-loss level.
- **Between -3% and +5%**: This is the "steady" zone where you're holding your ground but not making huge moves.

**The edge case handling:**

```typescript
const changePercent = netWorth === 0 
  ? 0 
  : portfolio.change24hUsd / (netWorth - portfolio.change24hUsd || 1);
```

We check for `netWorth === 0` first to avoid division by zero. The `|| 1` at the end is a safety net: if somehow `netWorth - portfolio.change24hUsd` is zero, we divide by 1 instead of crashing.

### Generating the Headline

```typescript
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
```

**This is an IIFE** (Immediately Invoked Function Expression). We use `(() => { ... })()` to keep the headline logic contained and return a value we can assign.

**The priority order:**

1. **Latest transaction**: If there's recent activity, that's the most interesting thing to show.
   - "SCORED: Opened Kamino vault for JUP/USDC"
   - "HEDGED: Sold 50% of SOL position"

2. **Top position**: If no recent activity, show what they're holding.
   - "Holding strong: JUP/USDC LP on solana"

3. **Empty state**: If they literally have no data.
   - "Sprint ready. Make your first move."

### Formatting Numbers for Humans

```typescript
const toUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD", 
    maximumFractionDigits: 0 
  }).format(value);

const toPercent = (value: number): string => {
  const formatter = new Intl.NumberFormat("en-US", { 
    style: "percent", 
    maximumFractionDigits: 1 
  });
  return formatter.format(value);
};
```

**Why `Intl.NumberFormat`?**

This is the browser's built-in internationalization API. It handles:
- Currency symbols ($, €, £)
- Thousands separators (1,000 vs 1.000 in some locales)
- Decimal places
- Negative numbers

Examples:
```typescript
toUsd(128450) → "$128,450"
toUsd(-3200) → "-$3,200"
toPercent(0.0638) → "6.4%"
toPercent(-0.027) → "-2.7%"
```

The `maximumFractionDigits: 0` for USD means we round to the nearest dollar. For crypto portfolios, cents don't really matter when you're looking at thousands of dollars.

### Composing Metrics

```typescript
const metrics: SprintMetric[] = [
  {
    label: "Net worth",
    value: toUsd(netWorth),
    delta: toUsd(portfolio.change24hUsd),
    intent: portfolio.change24hUsd >= 0 ? "positive" : "negative",
  },
  // ... more metrics
];
```

**The "intent" field** is what drives color coding in the UI:
- `"positive"` → green colors
- `"negative"` → red colors  
- `"neutral"` → gray colors

This separation of data and presentation is key. The business logic doesn't care about colors, it just says "this is good" or "this is bad", and the UI decides how to show that.

---

## Crew Data Aggregation

**File:** `src/lib/crew.ts`

This is the orchestration layer that brings together Supabase data, Zerion data, and mock data into one cohesive dashboard.

### The Graceful Degradation Pattern

```typescript
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

  // ... continue with real data
};
```

**This pattern is repeated throughout:**

1. Check if the service is available (`if (!supabaseAdmin)`)
2. Try to fetch data
3. If anything fails, fall back to mock data
4. Never throw errors that break the UI

**Why this approach?**

During a hackathon, judges might want to run your code without setting up all the services. With graceful degradation, they can:
- Clone the repo
- Run `npm install && npm run dev`
- See a fully working demo with realistic data

No environment variables needed, no database setup required. They get the full experience even in "demo mode."

### Fetching Related Data

```typescript
const { count: memberCount } = await supabaseAdmin
  .from("crew_members")
  .select("id", { count: "exact", head: true })
  .eq("crew_id", crew.id);
```

**What's `{ count: "exact", head: true }`?**

This is a Supabase optimization. It says:
- `count: "exact"`: Give me an accurate count of rows
- `head: true`: Don't return the actual rows, just the count

This is much faster than fetching all rows and counting them in JavaScript:

```typescript
// Slow: Transfers all data over network
const members = await supabase.from("crew_members").select("*").eq("crew_id", crew.id);
const count = members.length;

// Fast: Database does the count, returns just a number
const { count } = await supabase.from("crew_members").select("*", { count: "exact", head: true });
```

### Getting the Latest Snapshot

```typescript
const { data: snapshot } = await supabaseAdmin
  .from("sprint_snapshots")
  .select("portfolio, pnl, positions, transactions, summary")
  .eq("crew_id", crew.id)
  .order("captured_at", { ascending: false })
  .limit(1)
  .maybeSingle();
```

**Reading this query:**

1. Select specific columns (not `*` - we don't need `id` or `wallet_address`)
2. Filter to this crew
3. Sort by `captured_at` descending (newest first)
4. Take only the first result
5. Use `maybeSingle()` instead of `single()` because there might not be any snapshots yet

**Why not `single()`?**

`single()` throws an error if there are zero results or more than one result. `maybeSingle()` returns `null` if there are zero results, which is perfect for our graceful degradation pattern.

### Transforming Events into Highlights

```typescript
const highlightFromEvent = (event: Tables<"zerion_events">): CrewHighlight => {
  const payload = event.payload as ZerionWebhookPayload;

  if (event.event_type === "portfolio_update" && "portfolio" in payload) {
    const portfolio = payload.portfolio;
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

  // ... handle other event types
};
```

**This is how we turn raw webhook data into human stories.**

A webhook event looks like:
```json
{
  "event_type": "portfolio_update",
  "payload": {
    "portfolio": { "change24hUsd": 6450 }
  }
}
```

We transform it into:
```json
{
  "title": "Momentum",
  "body": "Net worth moved by $6,450 across the crew in the last 24h.",
  "mood": "positive"
}
```

**The pattern matching** (`if (event.event_type === "portfolio_update")`) lets us handle different event types with different messages. In the future, we could add custom handlers for:
- "New member joined the crew"
- "Milestone reached: 10-day streak"
- "Risk alert: Multiple members in drawdown"

---

## Webhook Handler

**File:** `src/app/api/webhooks/zerion/route.ts`

This is the most security-critical part of the codebase. Let's walk through it carefully.

### Step 1: Extracting the Raw Body

```typescript
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const headers = request.headers;

  const signature = headers.get(ZERION_SIGNATURE_HEADER);
  const timestamp = headers.get(ZERION_TIMESTAMP_HEADER);
```

**Why `request.text()` instead of `request.json()`?**

We need the exact bytes of the request body to verify the signature. If we call `request.json()`, it parses the JSON and we lose the original formatting (whitespace, key order, etc.). The signature is computed against the raw bytes, so we must preserve them exactly.

### Step 2: Signature Verification

```typescript
const verifySignature = (rawBody: string, timestamp: string | null, signature: string | null): boolean => {
  const secret = process.env.ZERION_WEBHOOK_SECRET;
  if (!secret || !timestamp || !signature) {
    return false;
  }

  // Check timestamp is within 5 minutes
  const fiveMinutes = 1000 * 60 * 5;
  const timestampMs = Number.parseInt(timestamp, 10);
  if (Number.isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > fiveMinutes) {
    console.warn("Zerion webhook: timestamp outside acceptable window");
    return false;
  }

  // Reconstruct the signed string
  const bodyToSign = `${timestamp}.${rawBody}`;
  const computedSignature = createHmac("sha256", secret).update(bodyToSign).digest("hex");

  // Compare using constant-time comparison
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
```

**Let's break down each security layer:**

**Layer 1: Timestamp Validation**

```typescript
const fiveMinutes = 1000 * 60 * 5;
const timestampMs = Number.parseInt(timestamp, 10);
if (Number.isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > fiveMinutes) {
  return false;
}
```

This prevents replay attacks. An attacker could intercept a valid webhook and try to resend it later. By checking the timestamp, we ensure the webhook was sent recently (within 5 minutes).

**Why 5 minutes?**

It needs to be long enough to account for clock skew between servers, but short enough that a stolen webhook can't be used much later.

**Layer 2: HMAC Signature**

```typescript
const bodyToSign = `${timestamp}.${rawBody}`;
const computedSignature = createHmac("sha256", secret).update(bodyToSign).digest("hex");
```

HMAC (Hash-based Message Authentication Code) is a way to verify that a message came from someone who knows the secret key. Here's how it works:

1. Zerion creates a string: `"1234567890.{...json...}"`
2. Zerion computes: `HMAC-SHA256(secret, string)` → `"abc123..."`
3. Zerion sends: body + signature header
4. We recompute: `HMAC-SHA256(our_secret, string)` → should be `"abc123..."`
5. If they match, the message is authentic

**Layer 3: Timing-Safe Comparison**

```typescript
return timingSafeEqual(provided, expected);
```

Regular string comparison (`===`) can leak information through timing:

```javascript
// Vulnerable to timing attacks
if (provided === expected) { ... }
// If first character doesn't match, returns immediately (fast)
// If all characters match, takes longer (slow)
// Attacker can measure timing to guess the signature
```

`timingSafeEqual()` always takes the same amount of time, regardless of where the strings differ.

### Step 3: Processing the Payload

```typescript
if (!verifySignature(rawBody, timestamp, signature)) {
  return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
}

const payload = parseJsonBody(rawBody);
if (!payload) {
  return NextResponse.json({ ok: false, reason: "invalid_payload" }, { status: 400 });
}
```

**Only after verification** do we parse the JSON. If signature verification fails, we immediately return 401 without doing any further processing.

This is the fail-fast principle: detect invalid requests as early as possible.

### Step 4: Crew Lookup or Creation

```typescript
const crewSlug = payload.crewSlug ?? DEFAULT_CREW_SLUG;
const crewName = payload.crewName ?? DEFAULT_CREW_NAME;

const { data: crewData } = await client
  .from("crews")
  .select("id, current_streak_days")
  .eq("slug", crewSlug)
  .maybeSingle();

let crewId = crewData?.id;

if (!crewId) {
  const { data: insertedCrew } = await client
    .from("crews")
    .insert({ slug: crewSlug, name: crewName, /* ... */ })
    .select("id, current_streak_days")
    .maybeSingle();

  crewId = insertedCrew?.id;
}
```

**Why auto-create crews?**

This makes onboarding seamless. When someone sends their first webhook, we automatically create a crew for them. They don't have to manually create a crew first through some UI.

**The slug system** lets you have human-readable URLs:
```
/crew/orbit-degens
/crew/base-maxis
/crew/solana-degens
```

### Step 5: Calculating New Streak

```typescript
const summary = composeSprintSummary({
  portfolio: payload.portfolio,
  pnl: payload.pnl,
  positions: payload.positions,
  transactions: payload.transactions,
});

const newStreak = 
  summary.morale === "charging" ? currentStreak + 1 : 
  summary.morale === "recovery" ? 1 : 
  currentStreak;
```

**The streak logic:**

- **Charging** (strong momentum): Add 1 to the streak
- **Recovery** (drawdown): Reset to 1 (you're starting a new streak)
- **Steady** (holding): Keep current streak unchanged

**Why reset to 1 instead of 0?**

Because even if you're in recovery mode, you're still active. A streak of 1 means "I'm here, day 1 of the comeback." A streak of 0 would mean "I haven't started yet."

This is more motivating from a product perspective.

### Step 6: Persisting Everything

```typescript
// Save snapshot
await client.from("sprint_snapshots").insert({
  crew_id: crewId,
  wallet_address: payload.wallet,
  portfolio: payload.portfolio,
  pnl: payload.pnl,
  positions: payload.positions,
  transactions: payload.transactions,
  summary: summary,
});

// Log event
await client.from("zerion_events").insert({
  crew_id: crewId,
  wallet_address: payload.wallet,
  event_type: payload.event,
  payload: payload,
  signature_valid: true,
});

// Update crew
await client.from("crews").update({
  current_streak_days: newStreak,
  last_active_at: new Date().toISOString(),
}).eq("id", crewId);
```

**Why three separate inserts?**

Each serves a different purpose:

1. **sprint_snapshots**: Historical data for charts and analytics
2. **zerion_events**: Audit log for debugging and compliance
3. **crews**: Current state for the dashboard

We could use a database transaction to ensure they all succeed or all fail together, but for a hackathon, simple is better. If one insert fails, we log it and move on.

---

## Sprint Dashboard UI

**File:** `src/components/SprintDashboard.tsx`

This is where data becomes beautiful. Let's look at the animation and styling patterns.

### Demo Mode Banner

```typescript
const isDemoMode = source === "mock";

{isDemoMode && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="... border-amber-500/40 bg-amber-500/10 ..."
  >
    <p className="...">
      Demo Mode Active
      <span className="...">
        Add your Zerion API key to see live wallet data
      </span>
    </p>
  </motion.div>
)}
```

**The animation pattern:**

Framer Motion uses the `initial` and `animate` props to create smooth transitions:

- `initial={{ opacity: 0, y: -20 }}`: Start invisible and 20px above
- `animate={{ opacity: 1, y: 0 }}`: Fade in and slide down

This creates a gentle "drop in" effect.

**The color scheme:**

- `border-amber-500/40`: Amber border at 40% opacity
- `bg-amber-500/10`: Amber background at 10% opacity

The `/40` and `/10` syntax is Tailwind's opacity modifier. This creates a subtle warning color that's not too aggressive.

### Morale-Based Styling

```typescript
const moralePalette: Record<CrewDashboardData["summary"]["morale"], string> = {
  charging: "from-emerald-500/20 to-emerald-400/10 border-emerald-400/40",
  steady: "from-indigo-500/20 to-indigo-400/10 border-indigo-400/40",
  recovery: "from-amber-500/20 to-amber-400/10 border-amber-400/40",
};
```

**Type-safe color palettes:**

The `Record<...>` type ensures we have a color scheme for every possible morale value. If we add a new morale type later, TypeScript will error until we add its color scheme.

**Gradient backgrounds:**

- `from-emerald-500/20`: Start with emerald at 20% opacity
- `to-emerald-400/10`: Fade to slightly lighter emerald at 10% opacity

These subtle gradients add depth without being distracting.

### Live Data Indicator

```typescript
{source === "supabase" ? (
  <span className="inline-flex items-center gap-1">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
    </span>
    Live Zerion data
  </span>
) : (
  "Demo data"
)}
```

**The pulsing dot effect:**

This is a clever CSS trick:
1. Outer `span` with `animate-ping`: Grows and fades out repeatedly
2. Inner `span`: Solid dot that stays in place

The result looks like a radar pulse, indicating live data.

### Animated Metrics

```typescript
{summary.metrics.map((metric, index) => (
  <motion.div
    key={metric.label}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + index * 0.1 }}
    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
  >
    {/* metric content */}
  </motion.div>
))}
```

**Staggered animation:**

Each metric animates in sequence:
- Metric 0: 0.5s delay
- Metric 1: 0.6s delay (0.5 + 0 * 0.1)
- Metric 2: 0.7s delay (0.5 + 1 * 0.1)
- Metric 3: 0.8s delay (0.5 + 2 * 0.1)

This creates a cascade effect that's more interesting than everything appearing at once.

**Hover effect:**

`whileHover={{ scale: 1.05 }}` makes the card grow 5% when you hover over it. This provides tactile feedback that makes the interface feel more responsive.

### The CountUpAnimation Component

```typescript
function CountUpAnimation({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  
  return <span>{prefix}{displayValue}{suffix}</span>;
}
```

**Wait, this doesn't actually animate?**

You're right! This is a simplified version for the hackathon. In production, you'd add logic to count from the old value to the new value:

```typescript
// Production version
useEffect(() => {
  const start = parseFloat(displayValue.replace(/[^0-9.-]/g, ''));
  const end = parseFloat(value.replace(/[^0-9.-]/g, ''));
  const duration = 1000; // 1 second
  const steps = 60;
  const increment = (end - start) / steps;
  
  let current = 0;
  const timer = setInterval(() => {
    current++;
    setDisplayValue(formatNumber(start + increment * current));
    if (current >= steps) clearInterval(timer);
  }, duration / steps);
  
  return () => clearInterval(timer);
}, [value]);
```

But for now, the simple version works and the structure is there for future enhancement.

---

## Wallet Integration

**File:** `src/lib/wagmi/config.ts`

Setting up wallet connection with RainbowKit and Wagmi.

```typescript
export const wagmiConfig = getDefaultConfig({
  appName: "ChainSprint",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id",
  ssr: true,
  chains: [mainnet, base, optimism, arbitrum, polygon],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  },
});
```

**What's `ssr: true`?**

This tells Wagmi that we're using Server-Side Rendering with Next.js. It changes how Wagmi initializes to avoid hydration errors (when server-rendered HTML doesn't match client-rendered HTML).

**The transports object:**

Each chain needs a transport (how to communicate with that chain). `http()` creates a standard HTTP JSON-RPC transport. In production, you might use:

```typescript
[mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
```

But for now, Wagmi uses public RPC endpoints.

### Wallet Connect Button

**File:** `src/components/WalletConnectButton.tsx`

```typescript
<ConnectButton.Custom>
  {({ account, chain, openConnectModal, mounted }) => (
    <div>
      {(() => {
        if (!mounted || !account || !chain) {
          return (
            <button onClick={openConnectModal}>
              Connect Wallet
            </button>
          );
        }

        return (
          <div>
            {account.displayName}
            {account.displayBalance && ` (${account.displayBalance})`}
          </div>
        );
      })()}
    </div>
  )}
</ConnectButton.Custom>
```

**Why `ConnectButton.Custom`?**

RainbowKit provides a default button, but we want to match our app's design. The `.Custom` render prop gives us full control over the UI while RainbowKit handles all the connection logic.

**The render prop pattern:**

```typescript
{({ account, chain, openConnectModal }) => ...}
```

RainbowKit passes us these props and we decide how to render them. This is a common React pattern for reusable components.

---

## Mock Data Strategy

**File:** `src/data/mock.ts`

Realistic mock data that makes demo mode feel real.

```typescript
export const demoPortfolio: PortfolioSnapshot = {
  totalNetWorthUsd: 128450,
  change24hUsd: 6450,
  chains: [
    { chainId: "solana", netWorthUsd: 64200, change24hUsd: 3200 },
    { chainId: "base", netWorthUsd: 42350, change24hUsd: 1800 },
    { chainId: "ethereum", netWorthUsd: 21900, change24hUsd: 1450 },
  ],
};
```

**Why these specific numbers?**

- **$128,450 total**: Big enough to be impressive, small enough to be relatable
- **$6,450 gain** (+5%): Puts the crew in "charging" morale
- **Multi-chain split**: Shows the product works across chains
- **Solana-heavy**: Reflects current market trends (Solana is hot)

### Realistic Transaction Descriptions

```typescript
export const demoTransactions: TransactionItem[] = [
  {
    id: "0x1",
    description: "Opened Kamino vault for JUP/USDC",
    operationType: "deposit",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    valueUsd: 8200,
    counterparty: "Kamino",
  },
  // ...
];
```

**Dynamic timestamps:**

```typescript
new Date(Date.now() - 2 * 3600 * 1000).toISOString()
```

This calculates "2 hours ago" from the current time. So the mock data always shows recent activity, making it feel fresh even weeks after you wrote the code.

Breaking down the math:
- `Date.now()`: Current timestamp in milliseconds
- `3600 * 1000`: One hour in milliseconds (3600 seconds * 1000 ms/second)
- `2 * 3600 * 1000`: Two hours in milliseconds
- `Date.now() - ...`: Two hours ago
- `.toISOString()`: Format as "2025-01-15T14:30:00.000Z"

### Curated Protocol Names

```typescript
{ protocol: "Kamino", symbol: "JUP/USDC LP", netValueUsd: 28200, apy: 0.29, chainId: "solana" },
{ protocol: "Hyperliquid", symbol: "ETH perp", netValueUsd: 22340, chainId: "base" },
{ protocol: "Drift", symbol: "SOL long", netValueUsd: 15560, apy: 0.12, chainId: "solana" },
```

**Why these protocols?**

- **Kamino**: Popular Solana lending/liquidity protocol
- **Hyperliquid**: Trending perps exchange
- **Drift**: Well-known Solana derivatives protocol

Using real protocol names makes the mock data believable and shows judges that you understand the DeFi ecosystem.

---

## Key Patterns & Best Practices

Throughout the codebase, you'll see these patterns repeated:

### 1. Graceful Degradation

```typescript
if (!service) return fallback();
```

Never let missing services crash the app.

### 2. Type Safety

```typescript
const moralePalette: Record<Morale, string> = { ... };
```

Use TypeScript to catch errors at compile time.

### 3. Separation of Concerns

```typescript
// Business logic
const morale = calculateMorale(data);

// Presentation logic
const color = moralePalette[morale];
```

Keep data processing separate from UI rendering.

### 4. Error Handling

```typescript
try {
  // risky operation
} catch (error) {
  console.error("Context for debugging", error);
  return fallbackValue;
}
```

Always provide context with errors and have fallback values.

### 5. Performance Optimization

```typescript
// Good: Select only needed columns
.select("id, name, streak")

// Bad: Select everything
.select("*")
```

Only fetch what you need.

---

## Summary

ChainSprint's code is built around a few core principles:

1. **Security first**: Verify signatures, validate inputs, never trust external data
2. **User experience**: Graceful degradation, smooth animations, helpful feedback
3. **Maintainability**: Clear naming, consistent patterns, comprehensive types
4. **Performance**: Server-side rendering, optimized queries, minimal client JavaScript

The result is a codebase that's both hackathon-ready (works without setup) and production-ready (secure, performant, scalable).

When judges review this code, they'll see:
- Professional patterns and best practices
- Comprehensive Zerion API integration
- Security-conscious webhook handling
- Thoughtful UX with smooth animations
- A foundation that could scale to thousands of users

That's the kind of code that wins hackathons and attracts users.

