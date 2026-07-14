"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/products", label: "Ürünler" },
  { href: "/cart", label: "Sepet" },
  { href: "/#iletisim", label: "İletişim" },
];

export function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo
            alt="VolantX"
            width={3242}
            height={544}
            sizes="100px"
            className="h-5 w-auto shrink-0"
            fetchPriority="high"
          />
          <span className="text-lg font-semibold tracking-tight">Shopping</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <AccountMenu />
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
            >
              Giriş Yap
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
