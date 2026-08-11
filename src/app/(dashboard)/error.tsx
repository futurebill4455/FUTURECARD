"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard/error]", error?.digest, error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/10 glass p-8 text-center shadow-panel">
      <h2 className="font-display text-2xl font-bold text-teal-50">
        Dashboard failed to load
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A server error occurred
        {error?.digest ? (
          <>
            {" "}
            (digest <code className="text-teal-300">{error.digest}</code>)
          </>
        ) : null}
        . If this persists, open{" "}
        <code className="text-teal-300">/api/health</code> and confirm Supabase
        env vars on the host match your project URL and service role key.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/login">Sign in again</Link>
        </Button>
      </div>
    </div>
  );
}
