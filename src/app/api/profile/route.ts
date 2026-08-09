import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { findUserByEmail, findUserById, updateUser } from "@/lib/db/users";
import { requireSession } from "@/lib/session";
import { profileUpdateSchema } from "@/lib/validations";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    await dbConnect();
    const user = await findUserById(session!.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
}

export async function PATCH(req: NextRequest) {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    try {
      const body = await req.json();
      const validated = profileUpdateSchema.parse(body);

      await dbConnect();
      const user = await findUserById(session!.user.id, {
        includePassword: true,
      });
      if (!user || !user.password) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const email = validated.email.trim().toLowerCase();
      if (email !== user.email) {
        const taken = await findUserByEmail(email);
        if (taken && taken._id !== user._id) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 409 },
          );
        }
      }

      const patch: {
        name: string;
        email: string;
        password?: string;
      } = {
        name: validated.name.trim(),
        email,
      };

      if (validated.newPassword) {
        const ok = await bcrypt.compare(
          validated.currentPassword || "",
          user.password,
        );
        if (!ok) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 },
          );
        }
        patch.password = await bcrypt.hash(validated.newPassword, 12);
      }

      const updated = await updateUser(user._id, patch);
      if (!updated) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }

      return NextResponse.json({
        data: {
          _id: updated._id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
        },
        message: validated.newPassword
          ? "Profile and password updated"
          : "Profile updated",
      });
    } catch (err) {
      return toApiError(err);
    }
  });
}
