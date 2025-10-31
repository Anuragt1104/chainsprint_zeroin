"use client";

import { motion } from "framer-motion";

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export function ValuePillars() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="grid gap-5 sm:grid-cols-3"
    >
      {pillars.map((pillar, index) => (
        <motion.article
          key={pillar.title}
          variants={item}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-400/60 hover:shadow-xl hover:shadow-indigo-500/20"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-500/20 text-lg font-bold text-indigo-300 backdrop-blur-sm transition-all duration-300 group-hover:from-indigo-500/30 group-hover:to-sky-500/30 group-hover:scale-110">
            {index + 1}
          </div>
          <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-indigo-300">
            {pillar.title}
          </h3>
          <p className="mt-3 text-sm text-slate-300">{pillar.description}</p>
        </motion.article>
      ))}
    </motion.section>
  );
}