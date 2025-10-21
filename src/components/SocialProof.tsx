const quotes = [
  {
    name: "Mira · Kamino strategist",
    body: "ChainSprint turned our weekly calls into daily micro check-ins. Zerion data keeps everyone honest without screensharing spreadsheets.",
  },
  {
    name: "Roz · Base memecoin scout",
    body: "The Shadow Move prompts are the missing context behind copy trading. I can finally explain risk to my followers before they ape in.",
  },
];

export function SocialProof() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Voices from early crews</p>
        <h2 className="text-3xl font-semibold text-slate-100">Evidence of traction from pilot squads</h2>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {quotes.map((quote) => (
          <figure key={quote.name} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg">
            <blockquote className="text-sm text-slate-200">“{quote.body}”</blockquote>
            <figcaption className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {quote.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}