import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { createUser, findUserByEmail } from "@/lib/db/users";
import { createSubscription } from "@/lib/db/subscriptions";
import { registerSchema } from "@/lib/validations";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    try {
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

      await createSubscription({
        userId: user._id,
        plan: "free",
        startDate,
        endDate,
        isActive: true,
        paymentStatus: "paid",
        amount: 0,
      });

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
      return toApiError(err);
    }
  });
}
