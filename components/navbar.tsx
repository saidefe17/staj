"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

const navLinks = [
  { href: "/products", label: "Ürünler" },
  { href: "/#iletisim", label: "İletişim" },
];

export function Navbar() {
  const { user, loading } = useAuth();
  const { itemCount } = useCart();
  const [isBumping, setIsBumping] = useState(false);
  const previousCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > previousCount.current) {
      setIsBumping(true);
      const timeout = setTimeout(() => setIsBumping(false), 400);
      previousCount.current = itemCount;
      return () => clearTimeout(timeout);
    }
    previousCount.current = itemCount;
  }, [itemCount]);

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
          <Link
            href="/cart"
            aria-label="Sepetim"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-surface"
          >
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 ? (
              <span
                className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground transition-transform ${
                  isBumping ? "scale-125" : "scale-100"
                }`}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>

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

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13 5.4 5M7 13l-1.5 4h11.5M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      />
    </svg>
  );
}
