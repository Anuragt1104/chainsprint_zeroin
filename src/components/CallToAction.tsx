export function CallToAction() {
  return (
    <section className="rounded-4xl border border-indigo-400/30 bg-indigo-500/10 p-10 text-center text-indigo-100 shadow-lg">
      <h2 className="text-3xl font-semibold text-white">Ready to sprint with us at Cypherpunk?</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-indigo-100/80">
        Drop in your Zerion API key, connect a wallet, and invite three friends. In minutes you&apos;ll have a live social
        sprint running with real-time notifications and highlight reels.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <a
          href="https://zerion-io.typeform.com/to/QI3GRa7t"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-indigo-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-300"
        >
          Claim Zerion API key
        </a>
        <a
          href="https://link.zerion.io/referral?code=EARNXZERION"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-indigo-200/60 px-6 py-3 text-sm font-semibold text-indigo-100 transition hover:border-white hover:text-white"
        >
          Download Zerion Wallet
        </a>
      </div>
    </section>
  );
}