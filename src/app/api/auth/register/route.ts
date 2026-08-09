import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
      const validated = registerSchema.parse(body);

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
        password,
        role: "user",
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
        { message: "Account created. You can sign in now." },
        { status: 201 },
      );
    } catch (err) {
      return toApiError(err);
    }
  });
}
