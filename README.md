# ChainSprint

> Turn every onchain move into a crew sprint that people actually show up for.

Built for the [Zerion Cypherpunk Hackathon](https://zerion.io) by Alenka Media.

---

## The Problem

Crypto investing feels lonely. You check your portfolio alone, make trades alone, and when things go south, you cope alone. There's no accountability, no shared celebration when you hit gains, and no crew to help you stay disciplined during drawdowns.

Traditional social trading platforms are either:
- Too complex with information overload
- Focused on anonymous leaderboards that lack trust
- Missing the emotional connection that keeps people engaged

## Our Solution

ChainSprint transforms multi-chain portfolio management into a social coordination layer where friend groups and trading communities actually want to show up every day.

Think of it as a fitness app meets DeFi. Just like how fitness apps turn working out into streaks and challenges with friends, ChainSprint turns onchain investing into:

- **Crew sprints** with shared goals and streak tracking
- **Motivational loops** that celebrate wins and provide support during losses
- **Transparent copy trading** (Shadow Moves) with position sizing and risk context
- **Real-time crew signals** powered by Zerion's comprehensive onchain data

## Who This Is For

- **Crypto-native friend groups** who trade together and want accountability
- **Trading communities** looking for transparent coordination tools
- **Influencer crews** who want to share their moves with followers in a structured way
- **DeFi enthusiasts** across Solana, Ethereum, Base, Optimism, Arbitrum, and Polygon

---

## Key Features

### 1. Crew-Based Portfolio Coordination

Create or join a crew, set a sprint goal, and track progress together. Every member's portfolio contributes to the crew's overall performance metrics.

```
Example Sprint Goal: "Secure +5% net in 7 days while capping drawdown at 3%"
```

### 2. Real-Time Multi-Chain Dashboard

Powered by the Zerion API, ChainSprint aggregates portfolio data across:
- Solana
- Ethereum
- Base
- Optimism
- Arbitrum
- Polygon

The dashboard shows:
- Net worth and 24-hour changes
- Realized and unrealized PnL
- Active positions across protocols
- Recent transactions with decoded descriptions

### 3. Morale-Based Streak System

Our algorithm calculates crew "morale" based on portfolio momentum:

- **Charging** (>5% daily gain): Momentum is building, streak increments
- **Steady** (-3% to +5%): Holding the line, streak maintained
- **Recovery** (<-3% loss): Time to regroup, streak resets to 1

This creates a fitness-app-style engagement loop that keeps crews coming back.

### 4. Shadow Moves (Copy Trading with Context)

When a crew member makes a significant move, it shows up in the crew feed with:
- Position sizing details
- Risk assessment tags
- Conviction notes from the trader
- Easy one-click copy option

Unlike traditional copy trading, Shadow Moves provide the full context so followers can make informed decisions.

### 5. Live Crew Signals

Real-time webhook integration with Zerion means instant notifications when:
- A crew member executes a major trade
- Portfolio momentum shifts dramatically
- PnL milestones are reached
- New protocols are discovered

### 6. Graceful Demo Mode

No API keys yet? No problem. ChainSprint falls back to demo mode with realistic mock data, letting you explore the full experience before connecting your Zerion API key and Supabase database.

---

## Zerion API Integration

ChainSprint leverages four core Zerion API endpoints to power its social coordination features:

### Portfolio Endpoint
```typescript
GET /wallets/{address}/portfolio
```

**What we use:**
- `totalNetWorthUsd`: Main metric for crew net worth
- `change24hUsd`: Calculates momentum and morale
- `chains[]`: Shows multi-chain distribution

**Why it matters:** This single endpoint gives us a complete snapshot of a wallet's value across all supported chains, eliminating the need to query individual chains.

### Transactions Endpoint
```typescript
GET /wallets/{address}/transactions
```

**What we use:**
- `description`: Human-readable transaction summaries (e.g., "Opened Kamino vault for JUP/USDC")
- `operationType`: Categories like swap, deposit, stake, reward
- `valueUsd`: Transaction size for filtering significant moves
- `timestamp`: Chronological crew activity feed

**Why it matters:** Zerion's decoded transactions mean we get rich context without building our own transaction parser. This powers the Shadow Moves feed.

### Positions Endpoint
```typescript
GET /wallets/{address}/positions
```

**What we use:**
- `protocol`: Shows which DeFi protocols the crew is using
- `symbol`: Token or LP position identifiers
- `netValueUsd`: Position size for risk assessment
- `apy`: APY/APR for yield-bearing positions
- `chainId`: Multi-chain position tracking

**Why it matters:** Understanding what protocols the crew holds helps surface discovery opportunities and calculate portfolio diversification.

### PnL Endpoint
```typescript
GET /wallets/{address}/pnl
```

**What we use:**
- `realizedUsd`: Actual profits/losses from closed positions
- `unrealizedUsd`: Potential gains/losses from current holdings
- `costBasisUsd`: Total invested capital

**Why it matters:** PnL is the ultimate scoreboard for a crew sprint. This data drives our morale calculation and celebration triggers.

### Webhooks

ChainSprint implements a secure webhook endpoint that receives real-time updates from Zerion:

- HMAC-SHA256 signature verification
- Timestamp validation (5-minute window)
- Automatic crew snapshot updates
- Event logging for crew feed

**Webhook events we handle:**
- `portfolio_update`: Net worth changes
- `transaction`: New onchain activity
- `pnl_update`: Profit/loss milestones

**Security:** Every webhook is verified using the `x-zerion-signature` and `x-zerion-timestamp` headers to prevent spoofing.

---

## Tech Stack

### Frontend
- **Next.js 15** with Turbopack for fast development
- **React 19** for modern component patterns
- **TypeScript** for type safety across the entire codebase
- **Tailwind CSS 4** for responsive, modern UI
- **Framer Motion** for smooth animations and transitions

### Web3 Integration
- **RainbowKit** for beautiful wallet connection UI
- **Wagmi** for Ethereum wallet interactions
- **Viem** for efficient blockchain operations
- Support for Ethereum, Base, Optimism, Arbitrum, Polygon, and Solana

### Backend & Data
- **Supabase (PostgreSQL)** for crew data, snapshots, and webhooks
- **Edge Functions** via Next.js API routes
- **pgcrypto** extension for secure UUID generation

### External Services
- **Zerion API** for portfolio, transactions, positions, and PnL data
- **WalletConnect** for multi-wallet support

---

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, pnpm, or bun
- A Zerion API key (get yours [here](https://zerion-io.typeform.com/to/QI3GRa7t?utm_source=cypherpunk))
- A Supabase project (create one at [supabase.com](https://supabase.com))
- A WalletConnect project ID (create one at [cloud.walletconnect.com](https://cloud.walletconnect.com))

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd chainsprint_zeroin
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` and add your credentials:

```bash
# Zerion API Configuration
ZERION_API_KEY=your_zerion_api_key_here
ZERION_WEBHOOK_SECRET=your_webhook_secret_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Optional Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_CREW_SLUG=orbit-degens
```

**Note:** Without these credentials, the app will gracefully fall back to demo mode with mock data.

#### 4. Set Up Database

Initialize your Supabase database with the migration:

```bash
npm run supabase:migrate
```

This creates the necessary tables:
- `crews`: Crew metadata and sprint goals
- `crew_members`: Member roster and roles
- `wallet_sessions`: Wallet connection tracking
- `sprint_snapshots`: Historical portfolio snapshots
- `zerion_events`: Webhook event log

#### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 6. Connect Your Wallet

Click "Connect Wallet" in the top section and select your preferred wallet. The app supports:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow
- And many more via RainbowKit

---

## Deployment to Production

ChainSprint is optimized for deployment on Vercel, which provides zero-config Next.js hosting with automatic HTTPS, edge functions, and global CDN.

### Step 1: Prepare Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from Settings > API
3. Run the database migration in the SQL Editor:

```bash
# Copy the contents of supabase/migrations/20250121_create_core_tables.sql
# and paste it into the Supabase SQL Editor, then click "Run"
```

Alternatively, if you have the Supabase CLI installed:

```bash
npx supabase link --project-ref your-project-ref
npm run supabase:migrate
```

### Step 2: Deploy to Vercel

#### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

#### Option B: Manual Deploy

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel

After deployment, go to your project settings:

1. Navigate to Settings > Environment Variables
2. Add each variable from your `.env` file:

```
ZERION_API_KEY=<your-key>
ZERION_WEBHOOK_SECRET=<your-secret>
SUPABASE_URL=<your-url>
SUPABASE_SERVICE_ROLE_KEY=<your-key>
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-id>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_DEFAULT_CREW_SLUG=orbit-degens
```

3. Redeploy the application for changes to take effect

### Step 4: Configure Zerion Webhooks

To receive real-time portfolio updates:

1. Contact Zerion support or use their webhook configuration portal
2. Set your webhook URL to: `https://your-app.vercel.app/api/webhooks/zerion`
3. Ensure your `ZERION_WEBHOOK_SECRET` matches the secret provided by Zerion
4. Test the webhook by triggering a sample event

### Step 5: Verify Deployment

1. Visit your deployed URL
2. Check that the app loads without errors
3. Connect a wallet to test the flow
4. Verify that the dashboard displays correctly
5. Check your Vercel logs for any errors

### Troubleshooting Deployment

**Issue: Environment variables not loading**
- Solution: Ensure you've redeployed after adding variables in Vercel settings

**Issue: Database connection fails**
- Solution: Double-check your Supabase URL and keys, ensure the database migration ran successfully

**Issue: Wallet connection not working**
- Solution: Verify your WalletConnect project ID is correct and active

**Issue: Webhooks not arriving**
- Solution: Check Vercel function logs, verify webhook signature secret matches Zerion's configuration

---

## Project Structure

```
chainsprint_zeroin/
├── src/
│   ├── app/
│   │   ├── actions/           # Server actions
│   │   ├── api/webhooks/      # Zerion webhook handler
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── Hero.tsx           # Hero section
│   │   ├── SprintDashboard.tsx # Main dashboard
│   │   ├── ValuePillars.tsx   # Feature highlights
│   │   ├── Roadmap.tsx        # Product roadmap
│   │   └── ...                # Additional components
│   ├── lib/
│   │   ├── zerion.ts          # Zerion API client
│   │   ├── sprints.ts         # Sprint logic and morale calculation
│   │   ├── crew.ts            # Crew data aggregation
│   │   ├── supabase/          # Supabase client and types
│   │   └── wagmi/             # Wallet configuration
│   └── data/
│       └── mock.ts            # Demo mode mock data
├── supabase/
│   └── migrations/            # Database schemas
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

For code walkthroughs and implementation details, see [CODE_GUIDE.md](./CODE_GUIDE.md).

---

## Development Workflow

### Running Tests

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm run start
```

### Database Migrations

When you modify the database schema:

```bash
npm run supabase:migrate
```

---

## How Judges Can Test This

### Option 1: Demo Mode (No Setup Required)

Simply visit the deployed app without any configuration. You'll see:
- Full UI with realistic mock data
- Interactive crew dashboard
- Example transactions and positions
- All animations and features working

This gives you a feel for the product without needing API keys.

### Option 2: Full Setup with Your Own Data

Follow the "Getting Started" section above to:
1. Get a Zerion API key
2. Create a Supabase project
3. Run the app locally with real wallet data

Connect your own wallet and see your actual portfolio transformed into a crew sprint experience.

### Option 3: Review the Code

Check out [CODE_GUIDE.md](./CODE_GUIDE.md) for a detailed walkthrough of the implementation, including:
- How we integrate with Zerion's API
- The algorithm behind morale calculation
- Webhook security implementation
- UI component architecture

---

## Roadmap: From Hackathon to Production

### Week 1: Foundation (Current)
- Zerion API integration complete
- Server actions delivering live portfolio, positions, and PnL
- Graceful demo mode for testing without credentials

### Week 2: Automation
- Real-time webhook ingestion operational
- Automated sprint scoring model
- Crew notifications via push and email

### Week 3: Monetization
- Creator-gated crews with onchain ticketing
- Premium analytics for power users
- Referral rewards program

### Beyond
- Mobile app (React Native)
- Advanced copy trading with slippage controls
- DAO governance for platform evolution
- Cross-crew competitions and leaderboards

---

## Why ChainSprint Will Drive User Adoption

Traditional portfolio trackers are utilitarian. They show numbers but don't create habits.

ChainSprint adds three critical elements that drive retention:

### 1. Social Accountability
When you're in a crew sprint, your moves affect the group. This creates natural accountability that keeps you engaged even when you'd normally check out.

### 2. Emotional Resonance
The morale system and streak tracking tap into the same psychology that makes fitness apps addictive. Small daily wins compound into long-term engagement.

### 3. Trust Through Transparency
Shadow Moves aren't just "copy this trade." They show WHY someone made a move, HOW much they allocated, and WHAT risks they considered. This builds trust that keeps communities coming back.

---

## Built With Zerion API

ChainSprint wouldn't be possible without Zerion's comprehensive onchain data infrastructure. Their API gives us:

- **Multi-chain coverage** across EVM and Solana
- **Decoded transactions** with human-readable descriptions
- **Real-time webhooks** for instant crew coordination
- **Rich metadata** for protocols, tokens, and positions
- **Reliable uptime** without running our own indexers

This let us focus on building social coordination features instead of wrestling with blockchain infrastructure.

---

## License

MIT

---

## Contact

Built by Alenka Media for the Zerion Cypherpunk Hackathon.

For questions, feedback, or collaboration inquiries, reach out through:
- GitHub Issues
- Twitter: [@your-handle]
- Email: your-email@example.com

---

**Let's turn every onchain move into a crew sprint that people actually show up for.**

