"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient, ApiError } from "@/lib/api-client";

export function UserApprovalActions({
  userId,
  isApproved,
}: {
  userId: string;
  isApproved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function run(approved: boolean) {
    if (!approved) {
      const ok = window.confirm(
        "Reject this signup? The account and their cards will be permanently deleted.",
      );
      if (!ok) return;
    }
    setBusy(approved ? "approve" : "reject");
    setError("");
    try {
      await apiClient(`/api/admin/users/${userId}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ approved }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  if (isApproved) {
    return (
      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
        Approved
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          disabled={busy !== null}
          onClick={() => void run(true)}
        >
          {busy === "approve" ? "…" : "Approve"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-red-400 hover:text-red-300"
          disabled={busy !== null}
          onClick={() => void run(false)}
        >
          {busy === "reject" ? "…" : "Reject"}
        </Button>
      </div>
      {error ? <p className="text-[10px] text-red-400">{error}</p> : null}
    </div>
  );
}
