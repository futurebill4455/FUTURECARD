import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { createUser, findUserByEmail, listUsers } from "@/lib/db/users";
import {
  createSubscription,
  listSubscriptions,
} from "@/lib/db/subscriptions";
import { requireAdmin } from "@/lib/session";
import { createUserSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/constants";
import { DEFAULT_USER_LIMITS } from "@/types/platform.types";
import { featuresForNewUser } from "@/lib/custom-domain-access";
import { expireDueSubscriptions } from "@/lib/subscription-access";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    await dbConnect();
    await expireDueSubscriptions();

    const users = await listUsers();
    const subs = await listSubscriptions();
    const subMap = Object.fromEntries(subs.map((s) => [s.userId, s]));

    const data = users.map((u) => ({
      ...u,
      subscription: subMap[u._id] ?? null,
    }));

    return NextResponse.json({ data });
  });
}

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const body = await req.json();
      const validated = createUserSchema.parse(body);

      await dbConnect();
      const exists = await findUserByEmail(validated.email);
      if (exists) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 },
        );
      }

      const password = await bcrypt.hash(validated.password, 12);
      const planLimits = PLAN_LIMITS[validated.plan];

      const user = await createUser({
        name: validated.name,
        email: validated.email,
        password,
        role: validated.role,
        features: featuresForNewUser(validated.plan, validated.features),
        limits: {
          ...DEFAULT_USER_LIMITS,
          maxCards: planLimits.maxCards,
        },
      });

      const startDate = new Date();
      const endDate = new Date(startDate);
      const days = validated.customDays ?? planLimits.days * validated.years;
      endDate.setDate(endDate.getDate() + days);

      await createSubscription({
        userId: user._id,
        plan: validated.plan,
        startDate,
        endDate,
        isActive: true,
        paymentStatus: "paid",
        amount:
          validated.plan === "free"
            ? 0
            : validated.plan === "basic"
              ? 999
              : 2499,
      });

      return NextResponse.json(
        { data: user, message: "User created" },
        { status: 201 },
      );
    } catch (err) {
      return toApiError(err);
    }
  });
}
