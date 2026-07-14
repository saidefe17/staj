import Link from "next/link";

export function PaymentSuccess() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface text-primary">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-8 w-8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Ödeme Tamamlandı
        </h1>
        <p className="text-sm text-muted">
          Siparişin başarıyla alındı. Teşekkür ederiz!
        </p>
      </div>

      <Link
        href="/"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Anasayfaya Dön
      </Link>
    </div>
  );
}
