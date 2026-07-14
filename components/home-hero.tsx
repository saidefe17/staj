"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "./logo";

export function HomeHero() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
      <div className="flex flex-col items-center gap-2">
        <Logo
          alt="VolantX"
          width={3242}
          height={544}
          sizes="200px"
          className="h-10 w-auto"
          fetchPriority="high"
        />
        <h1 className="text-3xl font-semibold tracking-tight">Shopping</h1>
        {loading ? null : user ? (
          <p className="max-w-md text-sm text-muted">
            Tekrar hoş geldin, {user.displayName ?? user.email}. Ürün
            kataloğumuzu keşfetmeye devam et.
          </p>
        ) : (
          <p className="max-w-md text-sm text-muted">
            Kurumsal yazılımlardan dijital hizmetlere kadar geniş bir
            kataloğu keşfet, dilediğini sepetine ekle.
          </p>
        )}
      </div>

      {loading ? null : user ? (
        <Link
          href="/products"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Keşfetmeye Başlayın
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Kayıt Ol
          </Link>
        </div>
      )}
    </div>
  );
}
