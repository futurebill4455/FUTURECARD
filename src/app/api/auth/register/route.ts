import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    await dbConnect();
    const exists = await User.findOne({ email: validated.email.toLowerCase() });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const password = await bcrypt.hash(validated.password, 12);
    const user = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      password,
      role: "user",
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    await Subscription.create({
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
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
