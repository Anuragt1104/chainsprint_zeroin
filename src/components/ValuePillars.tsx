const pillars = [
  {
    title: "Motivate crews",
    description:
      "Fitness-style streaks, sprint goals, and celebratory reels transform multi-chain investing into a shared ritual.",
  },
  {
    title: "Derisk copy moves",
    description:
      "Zerion-powered Shadow Moves surface position sizing, risk tags, and conviction notes before a follower executes.",
  },
  {
    title: "Reward discovery",
    description:
      "Leaderboard boosts and badge drops for uncovering new protocols encourage organic exploration without spam.",
  },
];

export function ValuePillars() {
  return (
    <section className="grid gap-5 sm:grid-cols-3">
      {pillars.map((pillar) => (
        <article
          key={pillar.title}
          className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg transition hover:-translate-y-1 hover:border-indigo-400/60 hover:shadow-indigo-500/20"
        >
          <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
          <p className="mt-3 text-sm text-slate-300">{pillar.description}</p>
        </article>
      ))}
    </section>
  );
}