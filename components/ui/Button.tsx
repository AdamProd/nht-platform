"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  size?: "default" | "compact";
}

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
  size = "default",
}: ButtonProps) {
  const padding = size === "compact" ? "px-6 py-2.5" : "px-9 py-4";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "gold-gradient-bg text-[#090909] shadow-[var(--nht-shadow-glow)] hover:shadow-[var(--nht-shadow-glow-strong)]",
    secondary:
      "glass border border-white/10 text-white hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05]",
    ghost:
      "text-white/55 hover:text-[var(--nht-gold)] border border-transparent hover:border-white/[0.06]",
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={`inline-flex items-center justify-center rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${padding} ${variants[variant]} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
