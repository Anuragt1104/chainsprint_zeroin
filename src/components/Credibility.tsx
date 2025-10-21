const apiHighlights = [
  {
    title: "Zero setup analytics",
    detail: "Portfolio, positions, PnL, and transaction decoding stitched together in < 200ms via Zerion REST.",
  },
  {
    title: "Real-time nudges",
    detail: "Webhook subscriptions trigger push notifications when crew leaders act onchain.",
  },
  {
    title: "Cross-chain coverage",
    detail: "Ethereum, Base, Optimism, Arbitrum, Polygon, Avalanche, Solana and more supported out of the box.",
  },
];

export function Credibility() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Why Zerion makes it possible</p>
        <h2 className="text-3xl font-semibold text-slate-100">Enterprise-grade data for consumer-grade vibes</h2>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {apiHighlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-6 text-indigo-100 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-white">{highlight.title}</h3>
            <p className="mt-2 text-sm text-indigo-100/80">{highlight.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}