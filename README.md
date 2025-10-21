<div align="center">

# ChainSprint

**Social sprints for crypto crews powered by Zerion&apos;s multi-chain wallet intelligence.**

[Zerion API](https://developers.zerion.io/reference/intro-getting-started) • [Cypherpunk Hackathon](https://zerion.io/api) • Built by **Alenka Media**

</div>

## 🚀 Concept Overview

ChainSprint transforms raw onchain activity into collaborative "sprints." Squads of friends, creators, and DAOs stay accountable with:

- **Crew goals & streaks** backed by Zerion portfolio analytics (PnL, net worth, risk).
- **Shadow Moves** translating decoded Zerion transactions into contextual copy-trading prompts.
- **Real-time notifications** triggered by Zerion webhooks so teams react within seconds.
- **Emotional storytelling** that humanizes DeFi/NFT activity with highlight reels and support loops.

The result: higher user retention, safer copy trading, and sticky social loops that go beyond plain dashboards.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router) + Turbopack, TailwindCSS, Geist fonts
- **Data layer:** Zerion REST API for portfolio, positions, transactions, PnL + webhook subscriptions
- **State & modelling:** Server actions (planned), sprint scoring helpers in `src/lib/sprints.ts`
- **Storage (planned):** Supabase Postgres with RLS for crew memberships and sprint logs
- **Notifications (planned):** Expo push + Resend email fallback

## 📂 Key Files

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` | Marketing + concept walkthrough page for judges/users |
| `src/lib/zerion.ts` | Typed Zerion API client + helper methods |
| `src/lib/sprints.ts` | Converts Zerion data into sprint morale + metrics |
| `src/data/mock.ts` | Mock data used until live API keys are connected |
| `docs/product-vision.md` | Problem statement, personas, adoption strategy |
| `docs/architecture.md` | High-level system architecture & deployment plan |

## 🔑 Environment Setup

1. Copy `.env.example` to `.env.local` and paste your Zerion API key (provided after Typeform submission).
2. Install dependencies (already done via `npm ci`).
3. Run the app:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the ChainSprint concept site.

> **Note:** All components are wired to mock data until the Zerion API key is supplied. Plug your key into `ZERION_API_KEY` and replace demo addresses in server actions (coming in next iteration).

## 🧭 Roadmap to Demo

- **Day 1:** Wallet connect + Zerion integrations (portfolio, positions, transactions, PnL) -> live sprint dashboard.
- **Day 2:** Crew management, webhook ingestion, notification flows, and highlight reels.
- **Day 3:** Copytrade Shadow Moves, creator monetization pilots, demo polish + 4-minute walkthrough video.

## 📽️ Submission Checklist

- ✅ Deployed web experience (Vercel)
- ✅ GitHub repo (this project)
- ⏳ Demo video (script outlined in `docs/product-vision.md`)
- ⏳ Live sprint demo with real addresses after API key

## 🤝 Credits

- Product & Engineering: **Droid for Alenka Media**
- Data infrastructure: **Zerion API team**
- Inspiration from social fitness apps, creator economy tools, and Zerion partner ecosystem

Let&apos;s win Cypherpunk by making crypto coordination genuinely social.
