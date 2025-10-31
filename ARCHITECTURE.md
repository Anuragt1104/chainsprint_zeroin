# ChainSprint Architecture

This document provides a comprehensive technical deep dive into ChainSprint's architecture, explaining how all the pieces fit together to create a social coordination layer for multi-chain portfolios.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Core Components](#core-components)
4. [Database Schema](#database-schema)
5. [Zerion Integration Flow](#zerion-integration-flow)
6. [Webhook Processing](#webhook-processing)
7. [State Management](#state-management)
8. [Security Considerations](#security-considerations)

---

## System Overview

ChainSprint is a Next.js 15 application that acts as a bridge between Zerion's onchain data infrastructure and a social coordination interface. The architecture is designed around three core principles:

1. **Server-first data fetching**: Portfolio data is fetched on the server to keep API keys secure and improve performance
2. **Graceful degradation**: The app works in demo mode without any external services configured
3. **Real-time updates**: Webhooks enable instant crew notifications without polling

### Technology Choices

**Why Next.js 15?**
- Server Components reduce client-side JavaScript and improve performance
- API routes provide secure serverless functions for webhooks
- Turbopack enables fast local development
- Edge runtime support for global low-latency responses

**Why Supabase?**
- PostgreSQL with full ACID compliance for crew data integrity
- Real-time subscriptions (future feature)
- Row-level security for multi-tenant crew isolation
- Generous free tier for hackathon projects

**Why RainbowKit + Wagmi?**
- Best-in-class wallet connection UX
- Multi-chain support out of the box
- Active maintenance and TypeScript support

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  React Components                        │   │
│  │  (Hero, SprintDashboard, ValuePillars, etc.)           │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────┐      │   │
│  │  │     WalletConnect Button (RainbowKit)        │      │   │
│  │  │     - MetaMask, Coinbase, Rainbow, etc.      │      │   │
│  │  └──────────────────────────────────────────────┘      │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────┐      │   │
│  │  │     SprintDashboard (Framer Motion)          │      │   │
│  │  │     - Real-time metrics                      │      │   │
│  │  │     - Morale indicator                       │      │   │
│  │  │     - Crew highlights                        │      │   │
│  │  └──────────────────────────────────────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↕                                    │
└────────────────────────────┼────────────────────────────────────┘
                             ↕
┌────────────────────────────┼────────────────────────────────────┐
│                    Next.js 15 Server                            │
│                            ↕                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Server Components                          │   │
│  │              (page.tsx)                                 │   │
│  │                                                         │   │
│  │  - Fetches crew data on server                         │   │
│  │  - No client-side API key exposure                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↕                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                       │   │
│  │                                                         │   │
│  │  ┌────────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │  crew.ts       │  │ sprints.ts  │  │ zerion.ts  │  │   │
│  │  │                │  │             │  │            │  │   │
│  │  │ Aggregates     │  │ Calculates  │  │ API Client │  │   │
│  │  │ dashboard data │  │ morale &    │  │ for Zerion │  │   │
│  │  │                │  │ metrics     │  │            │  │   │
│  │  └────────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↕                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           API Routes (Edge Functions)                   │   │
│  │                                                         │   │
│  │  POST /api/webhooks/zerion                             │   │
│  │  - Signature verification                              │   │
│  │  - Payload validation                                  │   │
│  │  - Database persistence                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                  ↕                           ↕
        ┌─────────┴─────────┐       ┌───────┴────────┐
        │                   │       │                │
        │  Zerion API       │       │  Supabase      │
        │                   │       │  (PostgreSQL)  │
        │  - Portfolio      │       │                │
        │  - Transactions   │       │  - crews       │
        │  - Positions      │       │  - snapshots   │
        │  - PnL            │       │  - events      │
        │  - Webhooks       │       │  - members     │
        │                   │       │                │
        └───────────────────┘       └────────────────┘
```

### Data Flow

1. **Initial Page Load**
   - User visits the app
   - Next.js Server Component calls `getCrewDashboardData()`
   - Function checks if Supabase is configured
   - If yes: Fetches crew data from database
   - If no: Returns mock data (demo mode)
   - Server renders HTML with data pre-populated
   - Client receives fully rendered page

2. **Wallet Connection**
   - User clicks "Connect Wallet"
   - RainbowKit modal opens
   - User selects wallet and approves connection
   - Wallet address is captured
   - `syncWalletSession()` server action creates a session record
   - Future feature: This will trigger Zerion API calls for that specific wallet

3. **Real-Time Updates (Webhook Flow)**
   - Zerion detects onchain activity for a registered wallet
   - Zerion sends POST request to `/api/webhooks/zerion`
   - Webhook handler verifies HMAC signature
   - Payload is parsed and validated
   - Crew record is created or updated
   - Sprint snapshot is saved
   - Event is logged
   - Next page load shows updated data

---

## Core Components

### 1. Zerion Client (`src/lib/zerion.ts`)

This is the heart of our Zerion integration. It provides a clean TypeScript interface for all Zerion API endpoints.

**Key Design Decisions:**

- **Base64 Basic Auth**: Zerion uses HTTP Basic Authentication. We encode the API key as `base64(apiKey:)` with an empty password.
- **Type Safety**: All responses are typed with TypeScript interfaces matching Zerion's API schema.
- **Error Handling**: Failed requests throw descriptive errors that bubble up to the caller.
- **No Caching**: We use `cache: 'no-store'` to always get fresh data (can be optimized later).

**Functions:**

```typescript
ZerionClient.getPortfolio(address)
// Returns: { totalNetWorthUsd, change24hUsd, chains[] }

ZerionClient.getTransactions(address)
// Returns: Array of decoded transactions with descriptions

ZerionClient.getPositions(address)
// Returns: Array of active positions across protocols

ZerionClient.getPnl(address)
// Returns: { realizedUsd, unrealizedUsd, costBasisUsd }
```

**Usage Example:**

```typescript
const portfolio = await ZerionClient.getPortfolio("0x1234...");
console.log(portfolio.totalNetWorthUsd); // 128450
console.log(portfolio.change24hUsd); // 6450
```

### 2. Sprint Logic (`src/lib/sprints.ts`)

This module contains the business logic for calculating crew morale and composing dashboard metrics.

**Morale Calculation Algorithm:**

```typescript
const netWorth = portfolio.totalNetWorthUsd;
const changePercent = portfolio.change24hUsd / (netWorth - portfolio.change24hUsd);

if (changePercent > 0.05) {
  morale = "charging";  // Momentum building, increment streak
} else if (changePercent < -0.03) {
  morale = "recovery";  // Drawdown detected, reset streak to 1
} else {
  morale = "steady";    // Holding the line, maintain streak
}
```

**Why these thresholds?**
- **+5%**: This is a meaningful daily gain that signals real momentum
- **-3%**: This is a typical drawdown threshold in trading systems
- The gap between -3% and +5% creates a "steady" zone that prevents thrashing

**Metric Composition:**

The `composeSprintSummary()` function generates four key metrics:

1. **Net Worth**: Total value with 24h delta
2. **Realized PnL**: Actual profits from closed positions
3. **Unrealized PnL**: Paper gains/losses from current holdings
4. **24h Momentum**: Percentage change (visual indicator)

Each metric includes an "intent" (positive/negative/neutral) that drives UI color coding.

### 3. Crew Data Aggregator (`src/lib/crew.ts`)

This is the orchestration layer that combines data from multiple sources.

**Data Sources:**

1. **Supabase**: Crew metadata, member count, last snapshot
2. **Mock Data**: Fallback when Supabase isn't configured
3. **Zerion Events**: Recent webhook events for crew highlights

**Flow:**

```typescript
async function getCrewDashboardData(crewSlug: string) {
  // 1. Check if Supabase is available
  if (!supabaseAdmin) return buildMockDashboard();

  // 2. Query crew by slug
  const crew = await supabase.from("crews")
    .select("*")
    .eq("slug", crewSlug)
    .maybeSingle();

  if (!crew) return buildMockDashboard();

  // 3. Get member count
  const { count } = await supabase.from("crew_members")
    .select("*", { count: "exact", head: true })
    .eq("crew_id", crew.id);

  // 4. Get latest snapshot
  const snapshot = await supabase.from("sprint_snapshots")
    .select("*")
    .eq("crew_id", crew.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 5. Get recent events for highlights
  const events = await supabase.from("zerion_events")
    .select("*")
    .eq("crew_id", crew.id)
    .order("received_at", { ascending: false })
    .limit(3);

  // 6. Compose dashboard data
  return {
    crew: { name, goal, members, streakDays },
    portfolio: snapshot?.portfolio ?? demoPortfolio,
    pnl: snapshot?.pnl ?? demoPnl,
    positions: snapshot?.positions ?? demoPositions,
    transactions: snapshot?.transactions ?? demoTransactions,
    summary: composeSprintSummary(...),
    highlights: events.map(highlightFromEvent),
    source: "supabase"
  };
}
```

**Graceful Degradation:**

At every step, if data is missing, we fall back to realistic mock data. This means the app never breaks, it just shows demo content.

### 4. Webhook Handler (`src/app/api/webhooks/zerion/route.ts`)

This Next.js API route receives and processes Zerion webhook events.

**Security First:**

1. **Signature Verification**: HMAC-SHA256 validation
2. **Timestamp Check**: 5-minute window to prevent replay attacks
3. **Timing-Safe Comparison**: Uses `timingSafeEqual` to prevent timing attacks

**Processing Pipeline:**

```typescript
1. Extract raw body as text (needed for signature verification)
2. Verify signature against ZERION_WEBHOOK_SECRET
3. Parse JSON payload
4. Look up crew by slug (or create new crew)
5. Calculate new sprint summary and morale
6. Update streak based on morale
7. Insert sprint snapshot (historical record)
8. Insert event log (for crew highlights)
9. Update crew metadata (streak, last active time)
10. Return success response
```

**Idempotency:**

Each webhook creates a new snapshot record rather than updating existing ones. This gives us a full audit trail and time-series data for future analytics.

### 5. Sprint Dashboard Component (`src/components/SprintDashboard.tsx`)

The main UI component that brings all the data to life.

**Client-Side Features:**

- **Animations**: Framer Motion for smooth transitions
- **Demo Mode Banner**: Visual indicator when using mock data
- **Color Coding**: Morale-based gradients (emerald for charging, amber for recovery)
- **Live Indicator**: Pulsing dot when showing real Zerion data

**Performance Optimization:**

```typescript
// Count-up animation without external libraries
function CountUpAnimation({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  
  return <span>{displayValue}</span>;
}
```

This creates a smooth update effect without adding heavy animation libraries.

**Responsive Design:**

- Mobile: Single column layout
- Tablet: Two columns (dashboard + highlights)
- Desktop: Wide metrics grid with sidebar highlights

---

## Database Schema

ChainSprint uses five core tables in PostgreSQL. Here's the complete schema with relationships:

```sql
┌────────────────────────────────────────────────────────────────┐
│                           crews                                │
├────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                  │
│ slug (text, unique)                    ← User-friendly URL     │
│ name (text)                                                    │
│ sprint_goal (text)                                             │
│ owner_wallet (text)                                            │
│ current_streak_days (integer)                                  │
│ last_active_at (timestamptz)                                   │
│ created_at (timestamptz)                                       │
└────────────────────────────────────────────────────────────────┘
                          │
                          │ 1
                          │
          ┌───────────────┼───────────────┬────────────────┐
          │               │               │                │
        n │             n │             n │              n │
          │               │               │                │
┌─────────▼──────┐ ┌──────▼──────┐ ┌─────▼────────┐ ┌────▼───────────┐
│ crew_members   │ │wallet_      │ │sprint_       │ │zerion_events   │
│                │ │sessions     │ │snapshots     │ │                │
├────────────────┤ ├─────────────┤ ├──────────────┤ ├────────────────┤
│ id (uuid, PK)  │ │id (uuid,PK) │ │id (uuid, PK) │ │id (uuid, PK)   │
│ crew_id (FK)   │ │crew_id (FK) │ │crew_id (FK)  │ │crew_id (FK)    │
│ wallet_address │ │wallet_addr  │ │wallet_addr   │ │wallet_address  │
│ role           │ │chain_id     │ │portfolio     │ │event_type      │
│ joined_at      │ │last_conn    │ │pnl           │ │payload (jsonb) │
│                │ │             │ │positions     │ │signature_valid │
│                │ │             │ │transactions  │ │received_at     │
│                │ │             │ │summary       │ │                │
│                │ │             │ │captured_at   │ │                │
└────────────────┘ └─────────────┘ └──────────────┘ └────────────────┘

Indexes for Performance:
- idx_crew_members_crew_id (crew_members.crew_id)
- idx_wallet_sessions_crew_id (wallet_sessions.crew_id)
- idx_sprint_snapshots_crew_id_captured_at (snapshots, DESC)
- idx_zerion_events_crew_id_received_at (events, DESC)
```

### Table Explanations

#### `crews`
The main entity representing a group of people coordinating together.

- **slug**: URL-friendly identifier like "orbit-degens" or "base-maxis"
- **sprint_goal**: Human-readable goal like "Secure +5% net in 7 days"
- **current_streak_days**: How many consecutive days of positive morale
- **owner_wallet**: The wallet that created the crew (future: admin permissions)

#### `crew_members`
The roster of wallets participating in a crew.

- **role**: "owner" | "admin" | "member" (future: permission system)
- **joined_at**: Timestamp for seniority sorting
- **Unique constraint**: `(crew_id, wallet_address)` prevents duplicate joins

#### `wallet_sessions`
Tracks active wallet connections for each crew member.

- **chain_id**: Which network they connected on (ethereum, base, solana, etc.)
- **last_connected_at**: Updated on each connection
- **Use case**: Show online status, track engagement

#### `sprint_snapshots`
Historical records of crew portfolio state. Each webhook creates a new snapshot.

- **portfolio**: Full JSON of Zerion portfolio response
- **pnl**: Realized and unrealized PnL at that moment
- **positions**: Array of all holdings
- **transactions**: Recent transaction feed
- **summary**: Computed metrics (morale, streak, headline)
- **captured_at**: Timestamp for time-series queries

**Why JSONB?**
PostgreSQL JSONB gives us flexibility to store Zerion's schema without complex joins, while still allowing queries like:

```sql
SELECT * FROM sprint_snapshots 
WHERE portfolio->>'totalNetWorthUsd' > '100000';
```

#### `zerion_events`
Raw webhook event log for debugging and creating crew highlights.

- **event_type**: "portfolio_update" | "transaction" | "pnl_update"
- **payload**: Full webhook payload as JSONB
- **signature_valid**: Boolean indicating whether signature check passed
- **Use case**: Audit trail, highlight generation, analytics

---

## Zerion Integration Flow

### Request Flow (Client-Initiated)

When a user connects their wallet, here's the complete flow:

```
┌──────────────────────────────────────────────────────────────┐
│ Step 1: User Connects Wallet                                │
└──────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2: syncWalletSession() Server Action                   │
│                                                              │
│ - Creates/updates wallet_sessions record                    │
│ - Associates wallet with default crew                       │
│ - Returns session ID                                        │
└──────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 3: Zerion API Calls (Future Enhancement)               │
│                                                              │
│ const portfolio = await ZerionClient.getPortfolio(address); │
│ const pnl = await ZerionClient.getPnl(address);             │
│ const positions = await ZerionClient.getPositions(address); │
│ const txns = await ZerionClient.getTransactions(address);   │
└──────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 4: Process & Store                                     │
│                                                              │
│ - Calculate sprint summary with composeSprintSummary()      │
│ - Insert into sprint_snapshots table                        │
│ - Update crew streak and last_active_at                     │
└──────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 5: UI Update                                           │
│                                                              │
│ - Revalidate path or router.refresh()                       │
│ - SprintDashboard re-renders with new data                  │
│ - Animations trigger for metric changes                     │
└──────────────────────────────────────────────────────────────┘
```

### Authentication Details

Zerion uses HTTP Basic Authentication with the API key as the username:

```typescript
const auth = Buffer.from(`${apiKey}:`).toString("base64");
// Note the colon after the key - password is empty

headers: {
  "Authorization": `Basic ${auth}`,
  "Accept": "application/json"
}
```

### Rate Limiting & Caching Strategy

Current implementation:
- No caching (`cache: 'no-store'`)
- No rate limiting (safe for low-volume hackathon)

Production improvements:
```typescript
// Add cache with revalidation
cache: 'force-cache',
next: { revalidate: 60 } // 1 minute

// Add rate limiting per crew
const rateLimiter = new Map();
// Check before API call
```

---

## Webhook Processing

Webhooks are the key to real-time crew coordination. Here's how we securely process them:

### Security: Signature Verification

Zerion signs each webhook with HMAC-SHA256:

```
┌────────────────────────────────────────────────────────────┐
│ Zerion Server                                              │
│                                                            │
│ 1. Create payload JSON                                    │
│ 2. Get current timestamp (milliseconds)                   │
│ 3. Create string: timestamp + "." + payload               │
│ 4. Sign with HMAC-SHA256(secret, string)                  │
│ 5. Send POST with headers:                                │
│    - x-zerion-timestamp: timestamp                        │
│    - x-zerion-signature: hex(hmac)                        │
└────────────────────────────────────────────────────────────┘
                          │
                          ↓ POST /api/webhooks/zerion
┌────────────────────────────────────────────────────────────┐
│ Our Webhook Handler                                        │
│                                                            │
│ 1. Extract raw body (must be exact bytes)                 │
│ 2. Extract headers (timestamp, signature)                 │
│ 3. Validate timestamp is within 5 minutes                 │
│ 4. Recreate signing string: timestamp + "." + body        │
│ 5. Compute HMAC with our stored secret                    │
│ 6. Compare using timingSafeEqual()                        │
│    - If match: Process webhook                            │
│    - If mismatch: Return 401 Unauthorized                 │
└────────────────────────────────────────────────────────────┘
```

**Why `timingSafeEqual()`?**

Regular string comparison (`===`) can be vulnerable to timing attacks where an attacker measures how long it takes to compare strings to guess the secret. `timingSafeEqual()` compares in constant time.

### Payload Processing Pipeline

```typescript
POST /api/webhooks/zerion
│
├─> 1. Verify Signature
│   ├─> Pass: Continue
│   └─> Fail: Return 401
│
├─> 2. Parse JSON
│   ├─> Success: Continue
│   └─> Fail: Return 400
│
├─> 3. Extract Metadata
│   ├─> crewSlug (from payload or default)
│   ├─> wallet address
│   └─> event type
│
├─> 4. Lookup/Create Crew
│   ├─> Query crews table by slug
│   ├─> If not found: INSERT new crew
│   └─> Get crew ID
│
├─> 5. Calculate Sprint Summary
│   └─> composeSprintSummary(portfolio, pnl, positions, txns)
│
├─> 6. Update Streak
│   ├─> If morale = "charging": streak + 1
│   ├─> If morale = "recovery": streak = 1
│   └─> If morale = "steady": no change
│
├─> 7. Persist Data
│   ├─> INSERT into sprint_snapshots
│   ├─> INSERT into zerion_events
│   └─> UPDATE crews (streak, last_active_at)
│
└─> 8. Return Success
    └─> 201 Created with morale status
```

### Error Handling Philosophy

We log errors but never expose internal details to Zerion:

```typescript
// Good: Generic error response
return NextResponse.json({ ok: false, reason: "invalid_payload" }, { status: 400 });

// Bad: Leaking internals
return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
```

This prevents information disclosure while still giving us debugging info in server logs.

---

## State Management

ChainSprint uses a hybrid approach to state management:

### Server State (Primary)

Most data lives on the server and is fetched fresh on each page load:

```typescript
// page.tsx (Server Component)
export default async function Home() {
  const crewData = await getCrewDashboardData(DEFAULT_CREW_SLUG);
  
  return <SprintDashboard data={crewData} />;
}
```

**Benefits:**
- No state synchronization bugs
- Always shows fresh data
- API keys stay on server
- Works with JavaScript disabled (progressive enhancement)

### Client State (Minimal)

Only interactive features use client state:

1. **Wallet Connection**: RainbowKit manages this internally
2. **Animations**: Framer Motion handles animation state
3. **Hover Effects**: React's built-in `useState` for micro-interactions

**Example:**

```typescript
"use client";

export function SprintDashboard({ data }) {
  const [displayValue, setDisplayValue] = useState(data.value);
  
  useEffect(() => {
    setDisplayValue(data.value);
  }, [data.value]);
  
  // Render with animated value
}
```

### Future: Real-Time Updates

Supabase provides real-time subscriptions that we can leverage:

```typescript
// Future enhancement
useEffect(() => {
  const subscription = supabase
    .channel('sprint_snapshots')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'sprint_snapshots',
      filter: `crew_id=eq.${crewId}`
    }, (payload) => {
      // Update UI without page refresh
      setCrewData(payload.new);
    })
    .subscribe();
  
  return () => subscription.unsubscribe();
}, [crewId]);
```

---

## Security Considerations

### API Key Protection

**Problem:** Client-side JavaScript can be read by anyone. If we call Zerion from the browser, anyone can steal our API key.

**Solution:** All Zerion calls happen on the server in Next.js Server Components or API routes.

```typescript
// ✅ Good: Server Component
async function fetchData() {
  const data = await ZerionClient.getPortfolio(address);
  return data;
}

// ❌ Bad: Client Component
"use client";
function Component() {
  useEffect(() => {
    // This exposes ZERION_API_KEY in browser!
    fetch(`https://api.zerion.io/...`, {
      headers: { Authorization: process.env.ZERION_API_KEY }
    });
  }, []);
}
```

### Webhook Security

Three layers of protection:

1. **Signature Verification**: Only Zerion can sign requests
2. **Timestamp Validation**: Prevents replay attacks
3. **HTTPS Only**: In production, webhooks must use HTTPS

### Database Security

Row-Level Security policies (future enhancement):

```sql
-- Only crew members can read their crew data
CREATE POLICY "Members can view own crew"
ON sprint_snapshots FOR SELECT
USING (
  crew_id IN (
    SELECT crew_id FROM crew_members 
    WHERE wallet_address = current_user
  )
);
```

### Input Validation

All external inputs are validated:

```typescript
// Webhook payload validation
if (!payload.portfolio || !payload.pnl) {
  return NextResponse.json({ ok: false }, { status: 400 });
}

// Type safety with Zod (future enhancement)
const WebhookPayloadSchema = z.object({
  event: z.string(),
  wallet: z.string(),
  portfolio: PortfolioSchema,
  // ...
});

const result = WebhookPayloadSchema.safeParse(payload);
```

---

## Performance Optimizations

### 1. Server-Side Rendering

By rendering on the server, users see content immediately without JavaScript loading delays.

### 2. Selective Client Components

Only components that need interactivity are marked `"use client"`:

```typescript
// Server Component (default)
import { SprintDashboard } from "@/components/SprintDashboard";

// Client Component (only when needed)
"use client";
export function SprintDashboard() { ... }
```

### 3. Database Indexing

All foreign keys and frequently queried columns have indexes:

```sql
CREATE INDEX idx_sprint_snapshots_crew_id_captured_at 
ON sprint_snapshots (crew_id, captured_at DESC);

-- Enables fast queries like:
SELECT * FROM sprint_snapshots 
WHERE crew_id = ? 
ORDER BY captured_at DESC 
LIMIT 1;
```

### 4. Image Optimization

Next.js automatically optimizes images:

```typescript
import Image from 'next/image';

<Image src="/hero.png" width={800} height={600} alt="Hero" />
// Automatically creates WebP, responsive sizes, lazy loads
```

---

## Scalability Considerations

### Current Architecture (Hackathon)

- Single Next.js deployment
- Single Supabase database
- No caching layer
- Suitable for: 100s of crews, 1000s of members

### Production Scaling Path

**Phase 1: Basic Optimization**
- Add Redis for caching Zerion responses
- Implement database connection pooling
- Add CDN for static assets

**Phase 2: Horizontal Scaling**
- Deploy to multiple Vercel regions
- Add Supabase read replicas
- Implement background job queue for webhook processing

**Phase 3: Microservices**
- Separate webhook processor into dedicated service
- Dedicated Zerion API proxy service
- Event-driven architecture with message queue

---

## Monitoring & Debugging

### Current Approach

Console logging at key points:

```typescript
console.log("Crew lookup:", crew);
console.error("Failed to insert snapshot:", error.message);
```

### Production Monitoring

Recommended tools:
- **Vercel Analytics**: Page load times, edge function performance
- **Sentry**: Error tracking and alerting
- **Supabase Logs**: Database query performance
- **Custom Webhook Dashboard**: Track delivery success rate

---

## Summary

ChainSprint's architecture balances simplicity with production-readiness:

- **Server-first** for security and performance
- **Type-safe** throughout with TypeScript
- **Graceful degradation** for great developer experience
- **Secure** webhook processing with signature verification
- **Scalable** foundation with clear upgrade paths

The result is a hackathon project that's not just a demo, but a real foundation for a production social coordination platform.

