const features = [
  {
    title: "Geniş Ürün Yelpazesi",
    description:
      "Kurumsal yazılımlardan dijital hizmetlere kadar birbirinden farklı kategorilerde ürünler.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 9h16.5M3.75 15h16.5M6 4.5h12A2.25 2.25 0 0 1 20.25 6.75v10.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 6 4.5Z"
      />
    ),
  },
  {
    title: "Güvenli Ödeme",
    description:
      "Kredi/banka kartı ve havale/EFT gibi güvenli yöntemlerle sorunsuz bir ödeme deneyimi.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M4.5 4.5h15A2.25 2.25 0 0 1 21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 4.5 4.5Zm2.25 10.5h4.5"
      />
    ),
  },
  {
    title: "Hızlı Teslimat",
    description: "Siparişlerin kısa sürede hazırlanır, kargoya verilir ve takip edilebilir.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM3 4.5h2.25l.9 10.2a1.5 1.5 0 0 0 1.5 1.35h9.3a1.5 1.5 0 0 0 1.49-1.32l.86-6.93H6.14"
      />
    ),
  },
  {
    title: "7/24 Destek",
    description: "Sorularınız ve talepleriniz için ekibimiz her zaman yanınızda.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.75 9.75v-1.5a6.75 6.75 0 1 0-13.5 0v1.5m-.75 0h1.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5Zm15 0h1.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5Zm0 6v.75a2.25 2.25 0 0 1-2.25 2.25h-3"
      />
    ),
  },
];

export function HomeFeatures() {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-primary">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              {feature.icon}
            </svg>
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
