"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Tables } from "@/types/database.types";

type CabinetChartProps = {
  title: string;
  dataKey: keyof Tables<"creator_stats_daily">;
  points: Tables<"creator_stats_daily">[];
  empty: string;
};

export default function CabinetChart({
  title,
  dataKey,
  points,
  empty,
}: CabinetChartProps) {
  if (points.length === 0) {
    return (
      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        <p className="mt-8 text-center text-sm text-[var(--nht-text-secondary)]">
          {empty}
        </p>
      </section>
    );
  }

  const data = points.map((point) => ({
    day: point.day,
    value: Number(point[dataKey] ?? 0),
  }));

  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="text-sm font-medium text-white">{title}</h2>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`fill-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--nht-gold)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--nht-gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "var(--nht-text-tertiary)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--nht-text-tertiary)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--nht-black-elevated)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
              labelStyle={{ color: "var(--nht-text-secondary)" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--nht-gold)"
              fill={`url(#fill-${String(dataKey)})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
