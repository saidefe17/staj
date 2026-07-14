"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchAdminStats, type AdminStats } from "@/lib/admin";

const STATUS_LABELS: Record<string, string> = {
  processing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
};

export function StatsPanel() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const token = await getToken();
        if (!token) return;
        const data = await fetchAdminStats(token);
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setError("İstatistikler yüklenirken bir hata oluştu.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!stats) return <p className="text-sm text-muted">Yükleniyor...</p>;

  const cards = [
    { label: "Toplam Sipariş", value: stats.totalOrders.toLocaleString("tr-TR") },
    { label: "Toplam Ciro", value: `${stats.totalRevenue.toLocaleString("tr-TR")} ₺` },
    { label: "Toplam Kullanıcı", value: stats.totalUsers.toLocaleString("tr-TR") },
    { label: "Toplam Ürün", value: stats.totalProducts.toLocaleString("tr-TR") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
          >
            <p className="text-xs text-muted">{card.label}</p>
            <p className="mt-1 text-xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold">Sipariş Durumları</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(stats.ordersByStatus).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-border px-3 py-2 text-sm">
              <p className="text-muted">{STATUS_LABELS[status] ?? status}</p>
              <p className="font-semibold">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold">En Çok Satan Ürünler</h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-muted">Henüz satış verisi yok.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.topProducts.map((product) => (
              <li
                key={product.productId}
                className="flex items-center justify-between text-sm"
              >
                <span>{product.name}</span>
                <span className="font-semibold">{product.quantitySold} adet</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
