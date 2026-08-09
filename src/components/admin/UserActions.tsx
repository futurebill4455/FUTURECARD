"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient, ApiError } from "@/lib/api-client";

export function RenewButton({
  userId,
  days = 365,
  label,
}: {
  userId: string;
  days?: number;
  label?: string;
}) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        await apiClient("/api/subscriptions", {
          method: "PATCH",
          body: JSON.stringify({ userId, renewDays: days }),
        });
        router.refresh();
      }}
    >
      {label || (days === 365 ? "Renew +1y" : `Renew +${days}d`)}
    </Button>
  );
}

export function DeactivateUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-red-600"
      onClick={async () => {
        await apiClient(`/api/users/${userId}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Suspend
    </Button>
  );
}

export function DeleteUserButton({
  userId,
  userName,
  redirectTo,
}: {
  userId: string;
  userName?: string;
  /** Navigate here after a successful delete (e.g. leave the manage page) */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    const label = userName?.trim() || "this user";
    const ok = window.confirm(
      `Are you sure you want to delete ${label} and all their cards?\n\nThis permanently removes their account, digital cards, media files, and profile data. This cannot be undone.`,
    );
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      await apiClient(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
        disabled={busy}
        onClick={() => void onDelete()}
        title="Delete user permanently"
        aria-label="Delete user"
      >
        <TrashIcon className="h-3.5 w-3.5" />
        {busy ? "Deleting…" : "Delete"}
      </Button>
      {error ? <p className="max-w-[10rem] text-[10px] text-red-400">{error}</p> : null}
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ExpireSweepButton() {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        const res = await apiClient<{ data: { expired: number } }>(
          "/api/admin/expire",
          { method: "POST" },
        );
        alert(`Expired ${res.data.expired} subscription(s)`);
        router.refresh();
      }}
    >
      Run expiry check
    </Button>
  );
}
