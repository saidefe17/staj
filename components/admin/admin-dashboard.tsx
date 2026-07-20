"use client";

import { useMemo, useState } from "react";
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

const SETTINGS_INDEX: { tab: Tab; label: string; keywords: string[] }[] = [
  {
    tab: "products",
    label: "Ürün Ekle / Düzenle / Sil",
    keywords: ["ürün", "fiyat", "kategori", "açıklama", "stok"],
  },
  {
    tab: "orders",
    label: "Sipariş Durumu ve Ödeme Bilgisi",
    keywords: ["sipariş", "kargo", "teslim", "ödeme", "havale", "iptal"],
  },
  {
    tab: "users",
    label: "Kullanıcı Rolü ve Hesap Durumu",
    keywords: ["kullanıcı", "admin", "rol", "askıya", "müşteri", "hesap"],
  },
  {
    tab: "dashboard",
    label: "İstatistikler ve Satış Özeti",
    keywords: ["istatistik", "ciro", "rapor", "dashboard", "en çok satan"],
  },
];

export function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");

  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr");
    if (!query) return [];
    return SETTINGS_INDEX.filter(
      (entry) =>
        entry.label.toLocaleLowerCase("tr").includes(query) ||
        entry.keywords.some((keyword) => keyword.includes(query)),
    );
  }, [search]);

  function jumpToSetting(target: Tab) {
    setTab(target);
    setSearch("");
  }

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

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ayar veya kayıt ara (ör. ürün, sipariş, kullanıcı)..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3.5 text-sm outline-none transition-colors focus:border-primary"
        />

        {searchSuggestions.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-10 mt-1.5 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            {searchSuggestions.map((entry) => (
              <button
                key={entry.tab}
                type="button"
                onClick={() => jumpToSetting(entry.tab)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-hover"
              >
                <span>{entry.label}</span>
                <span className="shrink-0 text-xs text-muted">
                  {TABS.find((item) => item.value === entry.tab)?.label}
                </span>
              </button>
            ))}
          </div>
        ) : null}
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
      {tab === "products" ? <ProductsPanel filter={search} /> : null}
      {tab === "orders" ? <OrdersPanel filter={search} /> : null}
      {tab === "users" ? <UsersPanel filter={search} /> : null}
    </div>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m21 21-4.3-4.3" />
    </svg>
  );
}
