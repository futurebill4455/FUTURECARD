import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect, isDbConflictError } from "@/lib/db";
import { createUser, findUserByEmail } from "@/lib/db/users";
import { createSubscription } from "@/lib/db/subscriptions";
import { registerSchema } from "@/lib/validations";
import { toApiError, withApiHandler } from "@/lib/api-route";
import { resolveSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    try {
      // Fail fast with a clear config error (instead of opaque PostgREST 500)
      try {
        const cfg = resolveSupabaseConfig();
        if (cfg.keyKind === "anon") {
          console.warn(
            "[register] server is using the anon key — prefer SUPABASE_SERVICE_ROLE_KEY",
          );
        }
      } catch (cfgErr) {
        return toApiError(cfgErr);
      }

      const body = await req.json();

      const rawPhone =
        body?.phone === undefined || body?.phone === null
          ? ""
          : String(body.phone);
      if (!rawPhone.trim()) {
        return NextResponse.json(
          { error: "Mobile number is required" },
          { status: 400 },
        );
      }

      const validated = registerSchema.parse({
        ...body,
        phone: rawPhone,
      });

      await dbConnect();
      const exists = await findUserByEmail(validated.email);
      if (exists) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 },
        );
      }

      const password = await bcrypt.hash(validated.password, 12);
      const user = await createUser({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        password,
        role: "user",
        isApproved: false,
      });

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      try {
        await createSubscription({
          userId: user._id,
          plan: "free",
          startDate,
          endDate,
          isActive: true,
          paymentStatus: "paid",
          amount: 0,
        });
      } catch (subErr) {
        // User row is already created — don't fail the whole signup.
        if (isDbConflictError(subErr)) {
          console.warn("[register] subscription already exists for user", user._id);
        } else {
          console.error(
            "[register] subscription create failed (account still created):",
            subErr,
          );
        }
      }

      return NextResponse.json(
        {
          message:
            "Account created. Awaiting Super Admin approval before you can sign in.",
          data: { pendingApproval: true },
        },
        { status: 201 },
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        const phoneIssue = err.errors.find((e) => e.path[0] === "phone");
        return NextResponse.json(
          {
            error:
              phoneIssue?.message ||
              err.errors[0]?.message ||
              "Validation failed",
            details: err.errors,
          },
          { status: 400 },
        );
      }
      if (isDbConflictError(err)) {
        return NextResponse.json(
          { error: "Email already registered", code: "CONFLICT" },
          { status: 409 },
        );
      }
      return toApiError(err);
    }
  });
}
