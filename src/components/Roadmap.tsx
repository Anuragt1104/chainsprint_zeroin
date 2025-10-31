"use client";

import { motion } from "framer-motion";
import { mockRoadmap } from "@/data/mock";

export function Roadmap() {
  return (
    <motion.section
      id="roadmap"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xs uppercase tracking-[0.35em] text-slate-400"
        >
          Adoption roadmap
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold text-slate-100"
        >
          From hackathon demo to sticky crews in three weeks
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl text-sm text-slate-400"
        >
          Each milestone unlocks new loops to keep users returning. We pair feature drops with creator activations and
          referral programs seeded by Zerion wallet notifications.
        </motion.p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {mockRoadmap.map((item, index) => (
          <motion.article
            key={item.quarter}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + index * 0.15 }}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="group relative rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:shadow-xl"
          >
            <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-sky-500/30 text-xs font-bold text-white backdrop-blur-sm transition-all group-hover:scale-110">
              {index + 1}
            </div>
            <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.4em] text-indigo-300">
              {item.quarter}
            </span>
            <h3 className="mt-3 text-xl font-semibold text-white transition-colors group-hover:text-indigo-300">
              {item.focus}
            </h3>
            <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}