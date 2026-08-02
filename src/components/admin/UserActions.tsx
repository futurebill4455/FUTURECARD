"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

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
