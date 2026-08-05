"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";

export default function HeroComposition() {
  const t = useTranslations("floatingStats");
  const td = useTranslations("dashboard");

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Soft violet orbs */}
      <div className="pointer-events-none absolute -top-10 -right-6 h-56 w-56 rounded-full bg-[var(--nht-accent)]/20 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[var(--nht-accent-deep)]/25 blur-[80px]" />

      <div className="relative grid gap-4 sm:grid-cols-2">
        {/* Creator card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="nht-card relative overflow-hidden p-5 sm:col-span-2 sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nht-accent-muted)] text-[var(--nht-accent-warm)]">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-overline text-[var(--nht-text-muted)]">
                {td("label")}
              </p>
              <p className="mt-1 truncate text-base font-semibold text-white">
                {td("title")}
              </p>
            </div>
            <span className="rounded-full border border-[var(--nht-border-hover)] bg-[var(--nht-accent-muted)] px-3 py-1 text-xs font-medium text-[var(--nht-accent-warm)]">
              {td("subscribersChange")}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: td("subscribers"), value: td("subscribersValue") },
              { label: td("revenue"), value: td("revenueStatValue") },
              { label: t("retention"), value: t("retentionValue") },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-3"
              >
                <p className="text-[10px] text-[var(--nht-text-muted)]">{item.label}</p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="nht-card p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nht-accent-muted)] text-[var(--nht-accent-warm)]">
              <DollarSign className="h-4 w-4" aria-hidden />
            </div>
            <TrendingUp className="h-4 w-4 text-[var(--nht-accent-warm)]" aria-hidden />
          </div>
          <p className="text-overline text-[var(--nht-text-muted)]">{t("revenueGrowth")}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {t("revenueValue")}
            <span className="ml-1 text-sm font-normal text-[var(--nht-text-tertiary)]">
              {t("revenueSuffix")}
            </span>
          </p>
          <p className="mt-2 text-xs font-medium text-[var(--nht-accent-warm)]">
            {td("revenueChange")}
          </p>
        </motion.div>

        {/* Followers / fans */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="nht-card p-5 sm:p-6"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nht-accent-muted)] text-[var(--nht-accent-warm)]">
            <Users className="h-4 w-4" aria-hidden />
          </div>
          <p className="text-overline text-[var(--nht-text-muted)]">{t("activeFans")}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {t("activeFansValue")}
          </p>
          <div className="mt-4 flex items-end gap-1.5">
            {[35, 48, 42, 62, 55, 78, 70, 88].map((h, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.7 + i * 0.05, duration: 0.4 }}
                style={{ originY: 1, height: `${h * 0.28}px` }}
                className="w-full rounded-sm bg-gradient-to-t from-[var(--nht-accent-muted)] to-[var(--nht-accent)]"
              />
            ))}
          </div>
        </motion.div>

        {/* Analytics chart card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="nht-card p-5 sm:col-span-2 sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nht-accent-muted)] text-[var(--nht-accent-warm)]">
                <BarChart3 className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <p className="text-overline text-[var(--nht-text-muted)]">{td("analytics")}</p>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  {td("monthlyRevenue")}
                </p>
              </div>
            </div>
            <p className="text-xl font-semibold tracking-tight text-white">
              {td("revenueValue")}
            </p>
          </div>
          <svg viewBox="0 0 200 56" className="h-14 w-full" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(124,58,237,0.35)" />
                <stop offset="100%" stopColor="rgba(124,58,237,0)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 0,50 20,42 40,38 60,28 80,22 100,8 120,12 140,4 160,0 180,6 200,0 L 200,56 L 0,56 Z"
              fill="url(#heroChartFill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            />
            <motion.polyline
              points="0,50 20,42 40,38 60,28 80,22 100,8 120,12 140,4 160,0 180,6 200,0"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 1.4, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
