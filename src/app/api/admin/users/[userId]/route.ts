import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { findUserById, permanentlyDeleteUser } from "@/lib/db/users";
import { requireAdmin } from "@/lib/session";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ userId: string }> };

/**
 * Permanently delete a client user and cascade-delete their cards /
 * subscriptions / analytics. Media under media/{userId}/ is purged first.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { session, error } = await requireAdmin();
    if (error) return error;

    try {
      const { userId } = await params;

      if (!userId) {
        return NextResponse.json({ error: "User id is required" }, { status: 400 });
      }

      if (session!.user.id === userId) {
        return NextResponse.json(
          { error: "You cannot delete your own admin account" },
          { status: 400 },
        );
      }

      await dbConnect();
      const user = await findUserById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.role === "admin") {
        return NextResponse.json(
          { error: "Admin accounts cannot be deleted from this panel" },
          { status: 400 },
        );
      }

      const result = await permanentlyDeleteUser(userId);
      if (!result.deleted) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        data: {
          deleted: true,
          userId,
          storageRemoved: result.storageRemoved,
        },
        message: "User and all associated cards have been permanently deleted",
      });
    } catch (err) {
      return toApiError(err);
    }
  });
}
