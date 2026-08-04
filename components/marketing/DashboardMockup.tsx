"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

function MiniChart() {
  const points = "0,50 20,42 40,38 60,28 80,22 100,8 120,12 140,4 160,0 180,6 200,0";
  return (
    <svg viewBox="0 0 200 60" className="h-14 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="nhtChartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(200,164,93,0.25)" />
          <stop offset="100%" stopColor="rgba(200,164,93,0)" />
        </linearGradient>
      </defs>
      <motion.path
        d={`M ${points} L 200,60 L 0,60 Z`}
        fill="url(#nhtChartFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke="#C8A45D"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.6, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function DashboardMockup() {
  const t = useTranslations("dashboard");

  const stats = [
    { label: t("subscribers"), value: t("subscribersValue"), change: t("subscribersChange") },
    { label: t("revenue"), value: t("revenueStatValue"), change: t("revenueStatChange") },
    { label: t("messages"), value: t("messagesValue"), change: t("messagesChange") },
  ];

  const activityItems = [
    t("activityItems.subscriber"),
    t("activityItems.ppv"),
    t("activityItems.tip"),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      <div className="glass-strong premium-border overflow-hidden rounded-[var(--nht-radius-3xl)]">
        <div className="bg-[#0c0c0c]/95 p-6 sm:p-7 lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-overline text-[var(--nht-text-muted)]">
                {t("label")}
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {t("title")}
              </p>
            </div>
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-[var(--nht-gold)]/60" />
            </div>
          </div>

          <div className="mb-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-[var(--nht-text-tertiary)]">
                  {t("monthlyRevenue")}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-white">
                  {t("revenueValue")}
                </p>
              </div>
              <span className="text-xs font-medium text-[var(--nht-gold)]">
                {t("revenueChange")}
              </span>
            </div>
            <MiniChart />
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}
                className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5"
              >
                <p className="text-[10px] text-[var(--nht-text-muted)]">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-[var(--nht-gold)]">
                  {stat.change}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
              <p className="text-overline text-[var(--nht-text-muted)]">
                {t("analytics")}
              </p>
              <div className="mt-4 flex items-end gap-1.5">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 1 + i * 0.06, duration: 0.4 }}
                    style={{ originY: 1, height: `${h * 0.28}px` }}
                    className="w-full max-w-[12px] rounded-sm bg-gradient-to-t from-[var(--nht-gold-muted)] to-[var(--nht-gold)]"
                  />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
              <p className="text-overline text-[var(--nht-text-muted)]">
                {t("activity")}
              </p>
              <div className="mt-4 space-y-2.5">
                {activityItems.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-[var(--nht-gold)]" />
                    <span className="text-[11px] text-[var(--nht-text-tertiary)]">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
