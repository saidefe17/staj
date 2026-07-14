"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { StatsPanel } from "./stats-panel";
import { ProductsPanel } from "./products-panel";
import { OrdersPanel } from "./orders-panel";
import { UsersPanel } from "./users-panel";

type Tab = "dashboard" | "products" | "orders" | "users";

const TABS: { value: Tab; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "products", label: "Ürünler" },
  { value: "orders", label: "Siparişler" },
  { value: "users", label: "Kullanıcılar" },
];

export function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <p className="text-sm text-muted">Yükleniyor...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Yetkisiz Erişim</h1>
          <p className="mt-2 text-sm text-muted">
            Bu sayfayı görüntülemek için admin yetkisine sahip bir hesapla giriş yapmalısınız.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-muted">Ürünleri, siparişleri ve kullanıcıları yönet.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === item.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" ? <StatsPanel /> : null}
      {tab === "products" ? <ProductsPanel /> : null}
      {tab === "orders" ? <OrdersPanel /> : null}
      {tab === "users" ? <UsersPanel /> : null}
    </div>
  );
}
