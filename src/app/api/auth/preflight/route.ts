import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { findUserByEmail } from "@/lib/db/users";
import { PENDING_APPROVAL_MESSAGE } from "@/lib/approval";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Pre-login probe so the client can show a clear pending-approval message
 * even when NextAuth collapses custom authorize errors to CredentialsSignin.
 */
export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    try {
      const body = await req.json();
      const { email, password } = schema.parse(body);

      await dbConnect();
      const user = await findUserByEmail(email.trim().toLowerCase(), {
        includePassword: true,
      });

      if (!user?.password || !user.isActive) {
        return NextResponse.json({ ok: false, pendingApproval: false });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ ok: false, pendingApproval: false });
      }

      const approved = user.role === "admin" ? true : Boolean(user.isApproved);
      if (!approved) {
        return NextResponse.json({
          ok: false,
          pendingApproval: true,
          message: PENDING_APPROVAL_MESSAGE,
        });
      }

      return NextResponse.json({ ok: true, pendingApproval: false });
    } catch (err) {
      return toApiError(err);
    }
  });
}
