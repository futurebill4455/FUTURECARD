import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { findUserById, permanentlyDeleteUser, updateUser } from "@/lib/db/users";
import { requireAdmin } from "@/lib/session";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ userId: string }> };

const approvalSchema = z.object({
  /** true = approve, false = reject (deletes the account) */
  approved: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const { userId } = await params;
      const body = await req.json();
      const { approved } = approvalSchema.parse(body);

      await dbConnect();
      const user = await findUserById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (user.role === "admin") {
        return NextResponse.json(
          { error: "Admin accounts cannot be rejected via this action" },
          { status: 400 },
        );
      }

      if (approved) {
        const updated = await updateUser(userId, {
          isApproved: true,
          isActive: true,
        });
        return NextResponse.json({
          data: updated,
          message: "User approved",
        });
      }

      const result = await permanentlyDeleteUser(userId);
      if (!result.deleted) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({
        data: { deleted: true, userId },
        message: "User rejected and removed",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: err.errors },
          { status: 400 },
        );
      }
      return toApiError(err);
    }
  });
}
