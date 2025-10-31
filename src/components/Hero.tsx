"use client";

import { motion } from "framer-motion";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-8 py-16 text-white shadow-lg">
      <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200 backdrop-blur-sm"
        >
          ChainSprint × Zerion API
        </motion.span>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          Turn every onchain move into a crew sprint that people actually show up for.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-pretty text-base text-indigo-100 sm:text-lg"
        >
          ChainSprint is the social coordination layer for multi-chain wallets. Zerion&apos;s portfolio, PnL, and
          transaction intelligence powers motivational loops, transparent copy trading, and emotionally resonant stories
          that keep squads engaged.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <div className="rounded-full border border-indigo-200/40 bg-white/10 px-2 py-1 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
            <WalletConnectButton />
          </div>
          <a
            className="group rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 px-6 py-3 text-sm font-semibold text-indigo-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white hover:from-indigo-500/30 hover:to-sky-500/30 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20"
            href="#roadmap"
          >
            View adoption roadmap
          </a>
        </motion.div>
      </div>
      
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-16 top-16 h-32 w-32 rounded-full bg-indigo-400 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.5, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-8 left-16 h-40 w-40 rounded-full bg-sky-400 blur-3xl"
        />
      </div>
    </section>
  );
}