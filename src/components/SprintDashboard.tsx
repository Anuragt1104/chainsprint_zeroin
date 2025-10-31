"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { CrewDashboardData } from "@/lib/crew";

const moralePalette: Record<CrewDashboardData["summary"]["morale"], string> = {
  charging: "from-emerald-500/20 to-emerald-400/10 border-emerald-400/40",
  steady: "from-indigo-500/20 to-indigo-400/10 border-indigo-400/40",
  recovery: "from-amber-500/20 to-amber-400/10 border-amber-400/40",
};

const highlightPalette: Record<CrewDashboardData["highlights"][number]["mood"], string> = {
  positive: "border-emerald-500/40 bg-emerald-500/10",
  warning: "border-amber-500/40 bg-amber-500/10",
  neutral: "border-slate-800 bg-slate-950/70",
};

function CountUpAnimation({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  
  return <span>{prefix}{displayValue}{suffix}</span>;
}

export function SprintDashboard({ data }: { data: CrewDashboardData }) {
  const { summary, crew, highlights, source } = data;
  const isDemoMode = source === "mock";
  
  return (
    <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-3 text-center backdrop-blur-sm"
        >
          <p className="text-sm font-semibold text-amber-200">
            🎭 Demo Mode Active
            <span className="ml-2 text-xs font-normal text-amber-300/80">
              Add your Zerion API key to see live wallet data
            </span>
          </p>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`rounded-3xl border bg-gradient-to-br p-6 text-white shadow-xl backdrop-blur-sm ${moralePalette[summary.morale]}`}
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm uppercase tracking-[0.3em] text-white/70"
            >
              Crew sprint pulse
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold"
            >
              {summary.headline}
            </motion.h2>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm"
          >
            {summary.morale === "charging" && "Momentum +"}
            {summary.morale === "steady" && "Holding line"}
            {summary.morale === "recovery" && "Comeback"}
          </motion.div>
        </header>
        <p className="mt-2 text-xs uppercase tracking-[0.4em] text-white/50">
          {source === "supabase" ? (
            <span className="inline-flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Live Zerion data
            </span>
          ) : (
            "Demo data"
          )}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {summary.metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-white/20 bg-white/5 p-4 shadow-inner backdrop-blur-sm transition-shadow hover:shadow-lg"
            >
              <p className="text-sm text-white/60">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold">
                <CountUpAnimation value={metric.value} />
              </p>
              {metric.delta && (
                <p className="mt-1 text-xs font-semibold text-white/70">24h Δ {metric.delta}</p>
              )}
            </motion.div>
          ))}
        </div>

        <dl className="mt-6 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="font-semibold text-white">Sprint goal</dt>
            <dd>{crew.goal}</dd>
          </div>
          <div className="space-y-1">
            <dt className="font-semibold text-white">Crew size</dt>
            <dd>
              {crew.members} members • {crew.streakDays}
              -day streak
            </dd>
          </div>
        </dl>
      </motion.div>

      <div className="flex flex-col gap-4">
        {highlights.map((highlight, index) => (
          <motion.article
            key={highlight.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={`rounded-3xl border p-5 text-slate-100 shadow-lg backdrop-blur-sm transition-shadow hover:shadow-xl ${highlightPalette[highlight.mood]}`}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Crew signal</p>
            <h3 className="mt-2 text-lg font-semibold">{highlight.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{highlight.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}