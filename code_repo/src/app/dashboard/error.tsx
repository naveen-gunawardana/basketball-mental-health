"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-6 text-5xl">🔧</div>
      <h1 className="text-2xl font-bold text-navy mb-2">Dashboard error</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Something went wrong loading your dashboard. This is usually a connection issue — try again in a moment.
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/80 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy hover:bg-navy/5 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
