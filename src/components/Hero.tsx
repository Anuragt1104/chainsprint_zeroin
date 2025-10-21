export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-8 py-16 text-white shadow-lg">
      <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
          ChainSprint × Zerion API
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Turn every onchain move into a crew sprint that people actually show up for.
        </h1>
        <p className="text-pretty text-base text-indigo-100 sm:text-lg">
          ChainSprint is the social coordination layer for multi-chain wallets. Zerion&apos;s portfolio, PnL, and
          transaction intelligence powers motivational loops, transparent copy trading, and emotionally resonant stories
          that keep squads engaged.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button className="rounded-full bg-indigo-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-300">
            Explore the live sprint demo
          </button>
          <a
            className="rounded-full border border-indigo-200/60 px-6 py-3 text-sm font-semibold text-indigo-200 transition hover:border-white hover:text-white"
            href="#roadmap"
          >
            View adoption roadmap
          </a>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute right-16 top-16 h-32 w-32 rounded-full bg-indigo-400 blur-3xl" />
        <div className="absolute bottom-8 left-16 h-40 w-40 rounded-full bg-sky-400 blur-3xl" />
      </div>
    </section>
  );
}