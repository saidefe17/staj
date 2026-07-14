import type { Product } from "@/lib/products";

export function CartItemRow({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted">{product.category}</span>
        <span className="font-semibold">{product.name}</span>
        <span className="text-sm text-muted">
          {product.price.toLocaleString("tr-TR")} ₺
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-border">
          <button
            type="button"
            onClick={() => onQuantityChange(quantity - 1)}
            aria-label="Adeti azalt"
            className="px-3 py-1.5 text-muted transition-colors hover:text-foreground"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label="Adeti artır"
            className="px-3 py-1.5 text-muted transition-colors hover:text-foreground"
          >
            +
          </button>
        </div>

        <span className="w-20 text-right text-sm font-semibold">
          {(product.price * quantity).toLocaleString("tr-TR")} ₺
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Ürünü sepetten kaldır"
          className="text-muted transition-colors hover:text-danger"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"
      />
    </svg>
  );
}
