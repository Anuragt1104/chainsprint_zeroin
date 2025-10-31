"use client";

import { motion } from "framer-motion";

const quotes = [
  {
    name: "Mira · Kamino strategist",
    body: "ChainSprint turned our weekly calls into daily micro check-ins. Zerion data keeps everyone honest without screensharing spreadsheets.",
    avatar: "🎯",
  },
  {
    name: "Roz · Base memecoin scout",
    body: "The Shadow Move prompts are the missing context behind copy trading. I can finally explain risk to my followers before they ape in.",
    avatar: "🚀",
  },
];

export function SocialProof() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="space-y-4"
    >
      <header className="space-y-2">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xs uppercase tracking-[0.35em] text-slate-400"
        >
          Voices from early crews
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold text-slate-100"
        >
          Evidence of traction from pilot squads
        </motion.h2>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {quotes.map((quote, index) => (
          <motion.figure
            key={quote.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-500/20 text-2xl backdrop-blur-sm transition-transform group-hover:scale-110">
                {quote.avatar}
              </div>
              <figcaption className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {quote.name}
              </figcaption>
            </div>
            <blockquote className="text-sm text-slate-200 italic">&ldquo;{quote.body}&rdquo;</blockquote>
          </motion.figure>
        ))}
      </div>
    </motion.section>
  );
}