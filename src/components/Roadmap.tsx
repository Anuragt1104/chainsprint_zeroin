import { mockRoadmap } from "@/data/mock";

export function Roadmap() {
  return (
    <section id="roadmap" className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Adoption roadmap</p>
        <h2 className="text-3xl font-semibold text-slate-100">From hackathon demo to sticky crews in three weeks</h2>
        <p className="max-w-2xl text-sm text-slate-400">
          Each milestone unlocks new loops to keep users returning. We pair feature drops with creator activations and
          referral programs seeded by Zerion wallet notifications.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {mockRoadmap.map((item) => (
          <article key={item.quarter} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-300">{item.quarter}</span>
            <h3 className="mt-3 text-xl font-semibold text-white">{item.focus}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}