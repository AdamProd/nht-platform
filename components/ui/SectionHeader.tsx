"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/components/motion/variants";

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  label,
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  const alignClass =
    align === "center" ? "text-center mx-auto items-center" : "text-left items-start";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className={`mb-20 flex max-w-2xl flex-col ${alignClass}`}
    >
      <span className="text-overline mb-6 text-[var(--nht-gold)]">{label}</span>
      <h2 className="text-h2 font-semibold text-white">{title}</h2>
      {description && (
        <p className="mt-6 text-base leading-[var(--nht-leading-body)] text-[var(--nht-text-secondary)] sm:text-lg">
          {description}
        </p>
      )}
    </motion.div>
  );
}
