"use client";

import { motion } from "framer-motion";

interface AnimatedGraphProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export default function AnimatedGraph({
  data,
  color = "#8B5CF6",
  height = 80,
  className = "",
}: AnimatedGraphProps) {
  const max = Math.max(...data);
  const width = 200;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${height - (v / max) * (height - 8)}`)
    .join(" ");

  const areaPath = `M ${points} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${data.join("-")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#grad-${data.join("-")})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />
    </svg>
  );
}
