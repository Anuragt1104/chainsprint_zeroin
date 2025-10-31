"use client";

import { motion } from "framer-motion";

const apiHighlights = [
  {
    title: "Zero setup analytics",
    detail: "Portfolio, positions, PnL, and transaction decoding stitched together in < 200ms via Zerion REST.",
    icon: "⚡",
  },
  {
    title: "Real-time nudges",
    detail: "Webhook subscriptions trigger push notifications when crew leaders act onchain.",
    icon: "🔔",
  },
  {
    title: "Cross-chain coverage",
    detail: "Ethereum, Base, Optimism, Arbitrum, Polygon, Avalanche, Solana and more supported out of the box.",
    icon: "🌐",
  },
];

export function Credibility() {
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
          Why Zerion makes it possible
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold text-slate-100"
        >
          Enterprise-grade data for consumer-grade vibes
        </motion.h2>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {apiHighlights.map((highlight, index) => (
          <motion.article
            key={highlight.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              transition: { duration: 0.2 } 
            }}
            className="group rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-6 text-indigo-100 shadow-lg backdrop-blur-sm transition-all hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/20"
          >
            <div className="mb-3 text-3xl transition-transform group-hover:scale-110">
              {highlight.icon}
            </div>
            <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-indigo-200">
              {highlight.title}
            </h3>
            <p className="mt-2 text-sm text-indigo-100/80">{highlight.detail}</p>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}