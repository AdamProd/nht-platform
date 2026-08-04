"use client";

import { motion } from "framer-motion";

export default function GlowingSphere() {
  return (
    <div className="pointer-events-none absolute top-1/2 right-0 z-0 h-[min(90vw,640px)] w-[min(90vw,640px)] -translate-y-1/2 translate-x-[15%]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full opacity-40"
        style={{
          background:
            "conic-gradient(from 0deg, transparent, rgba(200,164,93,0.3), transparent, rgba(200,164,93,0.15), transparent)",
        }}
      />

      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[8%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(240,212,138,0.9) 0%, rgba(200,164,93,0.6) 25%, rgba(168,134,74,0.3) 50%, rgba(9,9,9,0.8) 75%)",
          boxShadow:
            "0 0 80px rgba(200,164,93,0.5), 0 0 160px rgba(200,164,93,0.25), inset 0 0 60px rgba(255,255,255,0.08)",
        }}
      />

      <div
        className="absolute inset-[18%] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.35) 0%, transparent 45%)",
        }}
      />

      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_40%,rgba(9,9,9,0.4)_70%)]" />
    </div>
  );
}
