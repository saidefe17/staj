export function ProductImagePlaceholder({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-surface ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-1/4 w-1/4 text-muted"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.5" strokeLinejoin="round" />
        <path
          d="M21 15.5 16.5 11 6 21"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
