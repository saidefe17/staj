import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold tracking-tight">
            VolantX Shopping
          </span>
          <p className="max-w-xs text-sm text-muted">
            Kurumsal yazılımlardan dijital hizmetlere kadar geniş bir ürün
            kataloğu sunan alışveriş platformu.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Hızlı Erişim</span>
          <Link
            href="/products"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Ürünler
          </Link>
          <Link
            href="/cart"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Sepet
          </Link>
          <Link
            href="/register"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Kayıt Ol
          </Link>
        </div>

        <div id="iletisim" className="flex scroll-mt-24 flex-col gap-2">
          <span className="text-sm font-semibold">İletişim</span>
          <a
            href="mailto:destek@volantxshopping.com"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            destek@volantxshopping.com
          </a>
          <a
            href="tel:+908501234567"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            +90 (850) 123 45 67
          </a>
          <span className="text-sm text-muted">Maslak, İstanbul</span>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} VolantX Shopping. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
