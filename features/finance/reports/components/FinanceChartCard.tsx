"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinanceChartPoint } from "@/features/finance/types";

type Props = {
  title: string;
  points: FinanceChartPoint[];
  empty: string;
  variant?: "area" | "bar";
};

export default function FinanceChartCard({
  title,
  points,
  empty,
  variant = "area",
}: Props) {
  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="text-sm font-medium text-white">{title}</h2>
      {points.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--nht-text-secondary)]">
          {empty}
        </p>
      ) : (
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {variant === "bar" ? (
              <BarChart data={points}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--nht-text-tertiary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--nht-text-tertiary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--nht-black-elevated)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--nht-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={points}>
                <defs>
                  <linearGradient id="finance-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--nht-accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--nht-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--nht-text-tertiary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--nht-text-tertiary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--nht-black-elevated)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--nht-accent)"
                  fill="url(#finance-fill)"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
