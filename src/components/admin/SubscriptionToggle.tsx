"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

function isSubscribedActive(input: {
  isActive?: boolean;
  paymentStatus?: string;
  endDate?: string | Date | null;
}) {
  if (!input.isActive) return false;
  if (
    input.paymentStatus === "expired" ||
    input.paymentStatus === "cancelled"
  ) {
    return false;
  }
  if (input.endDate) {
    return new Date(input.endDate) > new Date();
  }
  return true;
}

export function SubscriptionToggle({
  userId,
  initialSubscribed,
  endDate,
  paymentStatus,
  isActive,
  size = "md",
  showLabel = true,
}: {
  userId: string;
  /** Preferred: pass explicit subscribed state */
  initialSubscribed?: boolean;
  endDate?: string | Date | null;
  paymentStatus?: string;
  isActive?: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const derived = isSubscribedActive({ isActive, paymentStatus, endDate });
  const [subscribed, setSubscribed] = useState(
    initialSubscribed ?? derived,
  );
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    const next = !subscribed;
    setLoading(true);
    try {
      const res = await apiClient<{
        data: { subscribed: boolean };
        message?: string;
      }>(`/api/admin/users/${userId}/subscription`, {
        method: "POST",
        body: JSON.stringify({ subscribed: next }),
      });
      setSubscribed(res.data.subscribed);
      toast({
        title: res.data.subscribed ? "Subscribed" : "Unsubscribed",
        description:
          res.message ||
          (res.data.subscribed
            ? "Subscription is now active."
            : "Subscription deactivated; cards paused."),
        variant: "success",
      });
      router.refresh();
    } catch (err) {
      toast({
        title: "Update failed",
        description:
          err instanceof ApiError ? err.message : "Could not update subscription",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      {showLabel ? (
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            subscribed ? "text-teal-300" : "text-muted-foreground",
          )}
        >
          {subscribed ? "Subscribed" : "Unsubscribed"}
        </span>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={subscribed}
        aria-label={subscribed ? "Unsubscribe user" : "Subscribe user"}
        disabled={loading}
        onClick={() => void toggle()}
        className={cn(
          "relative inline-flex shrink-0 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 disabled:opacity-60",
          size === "sm" ? "h-7 w-12" : "h-8 w-14",
          subscribed
            ? "border-teal-400/40 bg-teal-400/30"
            : "border-white/15 bg-white/10",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 rounded-full bg-white shadow transition",
            size === "sm" ? "h-5 w-5" : "h-6 w-6",
            subscribed
              ? size === "sm"
                ? "left-[1.35rem]"
                : "left-7"
              : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
