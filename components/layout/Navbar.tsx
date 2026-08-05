"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/brand/Logo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import Button from "@/shared/ui/Button";

export default function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t("services"), href: "#services" as const },
    { label: t("results"), href: "#why-us" as const },
    { label: t("creators"), href: "#stories" as const },
    { label: t("faq"), href: "#faq" as const },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 right-0 left-0 z-50 px-3 pt-4 sm:px-5 sm:pt-5"
    >
      <div className="mx-auto max-w-[var(--nht-container-max)] px-[var(--nht-container-padding)]">
        <nav
          aria-label="Primary"
          className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 lg:px-7 lg:py-3.5 ${
            scrolled || menuOpen
              ? "glass-strong premium-border shadow-[var(--nht-shadow-md)]"
              : "border border-transparent bg-white/[0.02] backdrop-blur-md"
          }`}
        >
          <Logo size="md" />

          <ul className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="focus-ring group relative text-sm text-white/50 transition-colors duration-300 hover:text-white"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--nht-accent)] transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher variant="desktop" />
            <Button href="#contact" variant="primary" size="compact">
              {t("apply")}
            </Button>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="focus-ring relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block h-0.5 w-5 bg-white"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block h-0.5 w-5 bg-white"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block h-0.5 w-5 bg-white"
            />
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-strong premium-border mx-3 mt-2 overflow-hidden rounded-2xl sm:mx-5 lg:hidden"
          >
            <ul className="flex flex-col p-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="focus-ring block rounded-xl px-4 py-3.5 text-sm text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <LanguageSwitcher
                variant="mobile"
                onSelect={() => setMenuOpen(false)}
              />
              <li className="p-3 pt-1">
                <Button
                  href="#contact"
                  variant="primary"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("apply")}
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
