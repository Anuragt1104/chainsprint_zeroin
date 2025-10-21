# ChainSprint · Technical Architecture

## High-Level Diagram
```
Wallet (user) ─┐
                │    Zerion API (REST + Webhooks)
Zerion Wallet ──┼──▶ ChainSprint API Layer ──▶ Supabase (Auth, DB, Realtime)
Other Wallets ─┘            │
                            ▼
                    Next.js 15 App Router (SSR + ISR)
                            │
                            ▼
                     Expo/React Native client (phase 2)
```

## Modules
- **`src/lib/zerion.ts`** – strongly typed wrapper around Zerion endpoints (portfolio, positions, PnL, transactions, chains).
- **`src/lib/sprints.ts`** – goal scoring + risk metrics to translate raw data into crew insights.
- **`src/components`** – UI for feed cards, challenge dashboards, highlight reels.
- **`supabase/`** *(future)* – migration files for crews, sprint entries, reactions.

## Data Flow
1. Client authenticates with a wallet (WalletConnect/SIWE) → obtains read-only address.
2. API layer requests data from Zerion using server-side fetch with API key stored securely in environment variables.
3. Responses cached in Supabase with TTL to reduce API calls. Webhooks from Zerion trigger refresh jobs.
4. Frontend consumes aggregated data via Next.js Server Actions + Suspense-friendly hooks.

## Deployment Plan
- **Web**: Vercel (Turbopack dev/build, edge-friendly). ENV vars: `ZERION_API_KEY`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` (phase 2).
- **Database**: Supabase project with Row Level Security (RLS) for crew membership.
- **Notifications**: Expo Push service for mobile, fallback email via Resend for web-only users.

## Observability
- Request logging via Axiom or Logflare (middleware instrumentation).
- Zebrium/BetterStack or Vercel OG for error monitoring.

## Future Enhancements
- Introduce GPU-based personalization (vector embeddings for behavior -> recommended challenges).
- Add zk-based privacy filters for selective transaction sharing.