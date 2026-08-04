"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/brand/Logo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

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
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 right-0 left-0 z-50 px-4 pt-5 sm:px-6"
    >
      <div className="mx-auto max-w-[var(--nht-container-max)] px-[var(--nht-container-padding)]">
        <nav
          className={`flex items-center justify-between rounded-2xl px-5 py-3.5 transition-all duration-500 lg:px-7 ${
            scrolled
              ? "glass-strong premium-border shadow-[var(--nht-shadow-md)]"
              : "bg-transparent"
          }`}
        >
          <Logo size="md" />

          <ul className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/50 transition-colors duration-300 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher variant="desktop" />
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="#contact"
                className="gold-gradient-bg inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-[#090909]"
              >
                {t("apply")}
              </Link>
            </motion.div>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-strong premium-border mx-4 mt-2 overflow-hidden rounded-2xl sm:mx-6 lg:hidden"
          >
            <ul className="flex flex-col p-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-4 py-3.5 text-sm text-white/60 transition-colors hover:text-white"
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
                <Link
                  href="#contact"
                  className="gold-gradient-bg block rounded-full py-3.5 text-center text-sm font-semibold text-[#090909]"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("apply")}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
