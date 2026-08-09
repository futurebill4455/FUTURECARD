"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PENDING_APPROVAL_MESSAGE } from "@/lib/approval";

function PendingApprovalInner() {
  const params = useSearchParams();
  const email = params.get("email");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-50" />
      <Card className="relative z-[1] w-full max-w-md">
        <CardHeader>
          <Link href="/" className="font-display text-2xl font-bold">
            Future<span className="text-gradient">Card</span>
          </Link>
          <CardTitle className="mt-4">Pending approval</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your account was created successfully and is waiting for Super Admin
            verification.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <p className="font-semibold">{PENDING_APPROVAL_MESSAGE}</p>
            {email ? (
              <p className="mt-1 text-xs text-amber-100/80">
                Registered as{" "}
                <span className="font-medium text-amber-50">{email}</span>
              </p>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            You will be able to sign in once an administrator approves your
            account. This usually doesn&apos;t take long.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/login">Back to sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </main>
      }
    >
      <PendingApprovalInner />
    </Suspense>
  );
}
