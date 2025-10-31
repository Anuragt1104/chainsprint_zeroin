"use client";

import { motion } from "framer-motion";

export function CallToAction() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-4xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/20 to-sky-500/10 p-10 text-center text-indigo-100 shadow-xl backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
      
      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold text-white"
        >
          Ready to sprint with us at Cypherpunk?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-3 max-w-2xl text-sm text-indigo-100/80"
        >
          Drop in your Zerion API key, connect a wallet, and invite three friends. In minutes you&apos;ll have a live social
          sprint running with real-time notifications and highlight reels.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="https://zerion-io.typeform.com/to/QI3GRa7t"
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-indigo-500/50"
          >
            <span className="relative z-10">Claim Zerion API key</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-sky-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.a>
          <motion.a
            href="https://link.zerion.io/referral?code=EARNXZERION"
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full border border-indigo-200/60 bg-white/5 px-6 py-3 text-sm font-semibold text-indigo-100 backdrop-blur-sm transition-all hover:border-white hover:bg-white/10 hover:text-white"
          >
            Download Zerion Wallet
          </motion.a>
        </motion.div>
      </div>
      
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-400 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-sky-400 blur-3xl"
        />
      </div>
    </motion.section>
  );
}