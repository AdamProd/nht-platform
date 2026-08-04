"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showDescriptor?: boolean;
  className?: string;
}

const sizes = {
  sm: {
    mark: "text-base",
    descriptor: "text-[8px] tracking-[0.32em]",
    gap: "gap-0",
  },
  md: {
    mark: "text-xl lg:text-2xl",
    descriptor: "text-[9px] tracking-[0.35em]",
    gap: "gap-0.5",
  },
  lg: {
    mark: "text-3xl lg:text-4xl",
    descriptor: "text-[10px] tracking-[0.38em]",
    gap: "gap-1",
  },
};

export default function Logo({
  href = "/",
  size = "md",
  showDescriptor = true,
  className = "",
}: LogoProps) {
  const t = useTranslations("brand");
  const s = sizes[size];

  const content = (
    <div className={`flex flex-col ${s.gap} ${className}`}>
      <span
        className={`${s.mark} font-semibold tracking-[-0.04em] text-white transition-colors group-hover:text-[var(--nht-gold)]`}
      >
        {t("name")}
      </span>
      {showDescriptor && (
        <span
          className={`${s.descriptor} font-medium uppercase text-white/40`}
        >
          {t("fullName")}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
