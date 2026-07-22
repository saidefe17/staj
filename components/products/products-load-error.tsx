"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductsLoadError() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  function handleRetry() {
    setIsRetrying(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6">
      <p className="text-sm text-danger">
        Ürünler yüklenirken bir hata oluştu. Sunucu geçici olarak yanıt vermiyor olabilir.
      </p>
      <button
        type="button"
        onClick={handleRetry}
        disabled={isRetrying}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying ? "Yeniden deneniyor..." : "Tekrar Dene"}
      </button>
    </div>
  );
}
