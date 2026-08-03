import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { expireDueSubscriptions } from "@/lib/subscription-access";
import { withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Manual / scheduled expiry sweep for Super Admin */
export async function POST() {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    const result = await expireDueSubscriptions(500);
    return NextResponse.json({
      data: result,
      message: `Expired ${result.expired} subscription(s)`,
    });
  });
}
