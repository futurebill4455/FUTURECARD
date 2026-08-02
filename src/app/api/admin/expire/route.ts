import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { expireDueSubscriptions } from "@/lib/subscription-access";

/** Manual / scheduled expiry sweep for Super Admin */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const result = await expireDueSubscriptions(500);
  return NextResponse.json({
    data: result,
    message: `Expired ${result.expired} subscription(s)`,
  });
}
