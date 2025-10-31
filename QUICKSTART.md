# ChainSprint Quick Start Guide

This is a fast-track guide for judges who want to quickly understand and test ChainSprint.

---

## 60-Second Overview

ChainSprint is a social coordination layer for multi-chain portfolios. It's like a fitness app for crypto investing - turning portfolio management into crew sprints with streaks, goals, and motivational loops.

**Built with:** Next.js 15, Zerion API, Supabase, RainbowKit, Framer Motion

**Key Innovation:** Transforms Zerion's portfolio data into emotional engagement loops that keep trading communities active.

---

## Test It Right Now (No Setup)

The app works immediately without any configuration thanks to graceful demo mode:

```bash
git clone <your-repo>
cd chainsprint_zeroin
npm install
npm run dev
```

Open http://localhost:3000 and you'll see:
- Full UI with realistic mock data
- Interactive crew dashboard showing portfolio metrics
- Morale calculation in action (charging/steady/recovery)
- Smooth animations and transitions
- All features working end-to-end

This demonstrates the complete user experience without needing API keys or database setup.

---

## Test With Real Data (5 Minutes)

Want to see it with actual wallet data? Here's the fastest path:

### Step 1: Get Zerion API Key
Visit: https://zerion-io.typeform.com/to/QI3GRa7t?utm_source=cypherpunk

### Step 2: Create Supabase Project
1. Go to https://supabase.com
2. Create new project (takes ~2 minutes)
3. Copy your project URL and keys from Settings > API

### Step 3: Run Database Migration
```bash
# Copy SQL from supabase/migrations/20250121_create_core_tables.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

### Step 4: Configure Environment
```bash
cp env.example .env
# Edit .env with your keys
```

### Step 5: Restart Dev Server
```bash
npm run dev
```

Now connect your wallet and see your real portfolio transformed into a crew sprint.

---

## Understanding the Code

### Three Key Files to Review

1. **src/lib/zerion.ts** (120 lines)
   - Clean TypeScript client for Zerion API
   - Shows how we integrate Portfolio, Transactions, Positions, PnL endpoints
   - Demonstrates proper authentication and error handling

2. **src/lib/sprints.ts** (83 lines)
   - The morale calculation algorithm
   - How we transform raw portfolio data into emotional engagement
   - Formatting utilities for human-readable metrics

3. **src/app/api/webhooks/zerion/route.ts** (169 lines)
   - Secure webhook handler with HMAC signature verification
   - Crew creation and snapshot persistence
   - Streak calculation based on morale

### Architecture at a Glance

```
User → Next.js Server → Zerion API → Data Processing → Supabase
                                                      ↓
User ← Beautiful UI ← Framer Motion ← React Components
```

Server-side data fetching keeps API keys secure while providing fast initial page loads.

---

## Zerion API Usage Highlights

We use all four major endpoints:

### Portfolio
```typescript
await ZerionClient.getPortfolio(address);
// Returns: totalNetWorthUsd, change24hUsd, chains[]
```
Used for: Main dashboard metrics, morale calculation

### Transactions  
```typescript
await ZerionClient.getTransactions(address);
// Returns: Decoded transactions with human descriptions
```
Used for: Activity feed, Shadow Moves feature

### Positions
```typescript
await ZerionClient.getPositions(address);
// Returns: Holdings across protocols with APY
```
Used for: Position breakdown, protocol discovery

### PnL
```typescript
await ZerionClient.getPnl(address);
// Returns: realizedUsd, unrealizedUsd, costBasisUsd
```
Used for: Profit/loss tracking, performance metrics

### Webhooks
```
POST /api/webhooks/zerion
```
Used for: Real-time crew updates, instant notifications

---

## Key Features Demonstrated

### 1. Morale System
Algorithm that calculates crew sentiment from portfolio momentum:
- +5% or more → "Charging" (increment streak)
- -3% or worse → "Recovery" (reset to day 1)
- In between → "Steady" (maintain streak)

### 2. Multi-Chain Support
Single dashboard shows aggregated data across:
- Solana
- Ethereum
- Base
- Optimism
- Arbitrum
- Polygon

### 3. Graceful Degradation
App works in three modes:
- **Full mode**: All services configured
- **Partial mode**: Some services available (others use mocks)
- **Demo mode**: No services (everything is mock data)

This makes it hackathon-judge-friendly and resilient in production.

### 4. Real-Time Updates
Webhook integration means instant crew notifications when:
- Portfolio value changes significantly
- Someone executes a trade
- PnL milestones are reached

### 5. Beautiful Animations
Framer Motion creates engagement through:
- Staggered metric animations
- Hover effects on cards
- Morale-based color gradients
- Pulsing live data indicator

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page (server component)
│   ├── layout.tsx                  # Root layout with providers
│   └── api/webhooks/zerion/        # Webhook endpoint
├── components/
│   ├── SprintDashboard.tsx         # Main dashboard UI
│   ├── Hero.tsx                    # Landing section
│   └── ...                         # Other components
├── lib/
│   ├── zerion.ts                   # Zerion API client ⭐
│   ├── sprints.ts                  # Morale calculation ⭐
│   ├── crew.ts                     # Data aggregation ⭐
│   └── supabase/                   # Database client
└── data/
    └── mock.ts                     # Demo mode data

supabase/migrations/                # Database schema
```

---

## Tech Choices Explained

### Why Next.js 15?
- Server Components keep API keys secure
- Edge functions for webhooks
- Turbopack for fast development
- Great deployment story with Vercel

### Why Supabase?
- PostgreSQL with ACID guarantees
- Simple setup with generous free tier
- Real-time subscriptions (future feature)
- Row-level security for multi-tenancy

### Why RainbowKit?
- Best wallet connection UX in Web3
- Multi-chain support out of the box
- Active maintenance and great docs

### Why Framer Motion?
- Declarative animation API
- Great performance
- Small bundle size compared to alternatives

---

## Security Highlights

### API Key Protection
All Zerion calls happen server-side. Client never sees the API key.

### Webhook Verification
Three layers:
1. HMAC-SHA256 signature verification
2. Timestamp validation (5-minute window)
3. Timing-safe comparison to prevent timing attacks

### Input Validation
All external inputs validated before processing.

### Database Security
PostgreSQL with proper indexing and query optimization.

---

## Why This Will Drive User Adoption

Traditional portfolio trackers are boring utilities. ChainSprint adds three critical elements:

### 1. Social Accountability
When you're in a crew, your moves affect the group. This creates natural accountability.

### 2. Emotional Resonance
Streaks, morale, and celebrations tap into the same psychology that makes fitness apps addictive.

### 3. Transparent Copy Trading
Shadow Moves show context (position sizing, risk assessment, conviction notes) that builds trust.

---

## Documentation Guide

- **README.md**: Complete project overview, setup, and deployment instructions
- **ARCHITECTURE.md**: Technical deep dive into system design and components  
- **CODE_GUIDE.md**: Line-by-line walkthrough of key code sections
- **QUICKSTART.md** (this file): Fast-track guide for judges

Start with this file, then dive into README.md for the full story.

---

## Demo Video Checklist

When recording your demo, show:

1. **Landing page** - Explain the problem and solution
2. **Demo mode** - Show it works without setup
3. **Dashboard** - Highlight the morale system and metrics
4. **Animations** - Show smooth transitions and hover effects
5. **Multi-chain** - Point out data from different chains
6. **Code snippets** - Quick look at Zerion integration
7. **Architecture diagram** - High-level system overview
8. **Deployment** - Show it running in production

Keep it under 5 minutes, focus on the "why" not just the "what."

---

## Deployment Checklist

Before submitting:

- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Test production deployment
- [ ] Configure Zerion webhooks with production URL
- [ ] Record demo video
- [ ] Update README with live URL
- [ ] Double-check all documentation links work
- [ ] Test demo mode works (for judges without API keys)

---

## Questions Judges Might Ask

**Q: How does this scale beyond a hackathon?**
A: Current architecture handles hundreds of crews. Scaling plan includes Redis caching, database read replicas, and dedicated webhook processor service.

**Q: What makes this different from existing portfolio trackers?**
A: We focus on social coordination and emotional engagement, not just data display. The morale system, streaks, and Shadow Moves create habits that keep users coming back.

**Q: Why use Zerion API specifically?**
A: Zerion provides decoded transactions with human-readable descriptions, multi-chain coverage, and reliable webhooks. This saves months of infrastructure work.

**Q: What about privacy?**
A: Crews can be private (invite-only) or public. Wallet addresses are stored but never displayed publicly. Users control what they share.

**Q: How do you prevent Sybil attacks or manipulation?**
A: Future versions will add wallet reputation scores, minimum account age requirements, and on-chain verification of holdings.

---

## Next Steps After Hackathon

If this wins or gets traction:

### Week 1-2: Polish MVP
- Mobile responsive improvements
- Advanced filtering in dashboard
- Historical charts with Recharts
- Push notifications setup

### Week 3-4: Creator Features
- Gated crews with onchain ticketing
- Custom crew branding
- Referral rewards program
- Creator analytics dashboard

### Month 2: Growth
- Launch with crypto influencer crews
- Integration with Zerion wallet notifications
- App store submissions (React Native)
- Ambassador program

---

## Get Help

- **Documentation Issues**: Check README.md, ARCHITECTURE.md, CODE_GUIDE.md
- **Setup Problems**: Ensure Node 18+, check .env file format
- **Demo Mode**: Should work immediately after `npm install && npm run dev`
- **Real Data**: Need Zerion API key and Supabase project

---

**Ready to dive deeper?** Start with [README.md](./README.md) for the complete story, then explore [ARCHITECTURE.md](./ARCHITECTURE.md) and [CODE_GUIDE.md](./CODE_GUIDE.md) for technical details.

**Just want to test it?** Run `npm install && npm run dev` and it works immediately in demo mode.

**Let's turn every onchain move into a crew sprint that people actually show up for.**

