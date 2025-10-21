import { composeSprintSummary } from "@/lib/sprints";
import { demoPortfolio, demoPnl, demoPositions, demoTransactions, mockCrew, mockHighlights } from "@/data/mock";

const moralePalette: Record<ReturnType<typeof composeSprintSummary>["morale"], string> = {
  charging: "from-emerald-500/20 to-emerald-400/10 border-emerald-400/40",
  steady: "from-indigo-500/20 to-indigo-400/10 border-indigo-400/40",
  recovery: "from-amber-500/20 to-amber-400/10 border-amber-400/40",
};

export function SprintDashboard() {
  const summary = composeSprintSummary({
    portfolio: demoPortfolio,
    pnl: demoPnl,
    positions: demoPositions,
    transactions: demoTransactions,
  });

  return (
    <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <div className={`rounded-3xl border bg-gradient-to-br p-6 text-white shadow-xl ${moralePalette[summary.morale]}`}>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Crew sprint pulse</p>
            <h2 className="text-2xl font-semibold">{summary.headline}</h2>
          </div>
          <div className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            {summary.morale === "charging" && "Momentum +"}
            {summary.morale === "steady" && "Holding line"}
            {summary.morale === "recovery" && "Comeback"}
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {summary.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/20 bg-white/5 p-4 shadow-inner">
              <p className="text-sm text-white/60">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              {metric.delta && (
                <p className="mt-1 text-xs font-semibold text-white/70">24h Δ {metric.delta}</p>
              )}
            </div>
          ))}
        </div>

        <dl className="mt-6 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="font-semibold text-white">Sprint goal</dt>
            <dd>{mockCrew.sprintGoal}</dd>
          </div>
          <div className="space-y-1">
            <dt className="font-semibold text-white">Crew size</dt>
            <dd>{mockCrew.members} members • {mockCrew.streakDays}-day streak</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-4">
        {mockHighlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 text-slate-100 shadow-lg"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Crew signal</p>
            <h3 className="mt-2 text-lg font-semibold">{highlight.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{highlight.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}