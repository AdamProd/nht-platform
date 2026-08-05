"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail, Send } from "lucide-react";
import Logo from "@/components/brand/Logo";
import Container from "@/shared/ui/Container";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const links = [
    { label: tNav("services"), href: "#services" as const },
    { label: tNav("results"), href: "#why-us" as const },
    { label: tNav("creators"), href: "#stories" as const },
    { label: tNav("faq"), href: "#faq" as const },
    { label: tNav("apply"), href: "#contact" as const },
  ];

  const legal = [
    { label: t("legal.privacy"), href: "#" as const },
    { label: t("legal.terms"), href: "#" as const },
    { label: t("legal.nda"), href: "#" as const },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-[var(--nht-black-elevated)]">
      <Container className="py-20 lg:py-24">
        <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="md" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--nht-text-tertiary)]">
              {t("tagline")}
            </p>
          </div>

          <div>
            <p className="text-overline mb-5 text-[var(--nht-text-muted)]">
              {t("navigation")}
            </p>
            <nav aria-label="Footer" className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="focus-ring w-fit text-sm text-[var(--nht-text-tertiary)] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-overline mb-5 text-[var(--nht-text-muted)]">
              {t("legalTitle")}
            </p>
            <nav aria-label="Legal" className="flex flex-col gap-3">
              {legal.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="focus-ring w-fit text-sm text-[var(--nht-text-tertiary)] transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-overline mb-5 text-[var(--nht-text-muted)]">
              {t("contactTitle")}
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={t("emailHref")}
                  className="focus-ring inline-flex items-center gap-2.5 text-sm text-[var(--nht-text-tertiary)] transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-[var(--nht-accent-warm)]" aria-hidden />
                  {t("email")}
                </a>
              </li>
              <li>
                <a
                  href={t("telegramHref")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center gap-2.5 text-sm text-[var(--nht-text-tertiary)] transition-colors hover:text-white"
                >
                  <Send className="h-4 w-4 text-[var(--nht-accent-warm)]" aria-hidden />
                  {t("telegram")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--nht-text-muted)]">
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
          <div className="flex flex-wrap gap-6">
            {legal.map((item) => (
              <Link
                key={`bottom-${item.label}`}
                href={item.href}
                className="focus-ring text-xs text-[var(--nht-text-muted)] transition-colors hover:text-[var(--nht-text-tertiary)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
