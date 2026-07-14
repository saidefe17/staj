"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? "Aydınlık temaya geç" : "Karanlık temaya geç"}
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-border bg-surface transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 ${
          isDark ? "translate-x-1" : "translate-x-7"
        }`}
      >
        {isDark ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path d="M21.75 15.5A9.75 9.75 0 1 1 8.5 2.25a.75.75 0 0 1 .82 1.19 8.25 8.25 0 0 0 10.24 12.4.75.75 0 0 1 1.19.82c-.13.35-.28.68-.45 1.01z" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path d="M12 4.5a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1.5a1 1 0 0 1-1 1zM12 22a1 1 0 0 1-1-1v-1.5a1 1 0 1 1 2 0V21a1 1 0 0 1-1 1zM4.5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1.5a1 1 0 0 1 1 1zM22 12a1 1 0 0 1-1 1h-1.5a1 1 0 1 1 0-2H21a1 1 0 0 1 1 1zM6.34 7.76a1 1 0 0 1-1.41 0L3.87 6.7a1 1 0 1 1 1.41-1.41l1.06 1.06a1 1 0 0 1 0 1.41zM19.13 18.13a1 1 0 0 1 0 1.41 1 1 0 0 1-1.41 0l-1.06-1.06a1 1 0 1 1 1.41-1.41zM17.66 6.34a1 1 0 0 1 0-1.41l1.06-1.06a1 1 0 1 1 1.41 1.41l-1.06 1.06a1 1 0 0 1-1.41 0zM5.87 19.13a1 1 0 0 1-1.41-1.41l1.06-1.06a1 1 0 1 1 1.41 1.41zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
          </svg>
        )}
      </span>
      <span className="sr-only">Temayı değiştir</span>
    </button>
  );
}
