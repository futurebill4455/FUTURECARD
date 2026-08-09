import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { subscriptionToggleSchema } from "@/lib/validations";
import { setUserSubscribed } from "@/lib/subscription-access";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ userId: string }> };

/**
 * Admin-only: toggle a user's subscription (Supabase `subscriptions.is_active`).
 * POST { subscribed: boolean }
 */
export async function POST(req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const { userId } = await params;
      if (!userId?.trim()) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      }

      const body = await req.json();
      const { subscribed } = subscriptionToggleSchema.parse(body);

      const subscription = await setUserSubscribed(userId, subscribed);

      return NextResponse.json({
        data: {
          userId,
          subscribed: Boolean(
            subscription.isActive &&
              subscription.paymentStatus !== "expired" &&
              subscription.paymentStatus !== "cancelled" &&
              new Date(subscription.endDate) > new Date(),
          ),
          subscription,
        },
        message: subscribed
          ? "User subscribed successfully"
          : "User unsubscribed successfully",
      });
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        (err as { code?: string }).code === "NOT_FOUND"
      ) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (
        err &&
        typeof err === "object" &&
        (err as { code?: string }).code === "FORBIDDEN"
      ) {
        return NextResponse.json(
          { error: (err as Error).message },
          { status: 403 },
        );
      }
      return toApiError(err);
    }
  });
}
