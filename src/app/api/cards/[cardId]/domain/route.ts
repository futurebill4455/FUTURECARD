import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { requireSession } from "@/lib/session";
import { customDomainSchema } from "@/lib/validations";
import {
  normalizeHostname,
  getPlatformHosts,
} from "@/lib/custom-domain";
import { getPlatformSettings } from "@/lib/platform-settings";
import { canRequestCustomDomain } from "@/lib/custom-domain-access";
import { resolveFeatures } from "@/types/platform.types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ cardId: string }> };

async function assertDomainPrivilege(userId: string) {
  const [user, sub] = await Promise.all([
    User.findById(userId).select("features").lean(),
    Subscription.findOne({ userId }).select("plan").lean(),
  ]);
  const features =
    user && !Array.isArray(user)
      ? resolveFeatures(
          (user as { features?: Record<string, boolean> }).features,
        )
      : resolveFeatures(null);
  const plan =
    sub && !Array.isArray(sub)
      ? ((sub as { plan?: string }).plan ?? "free")
      : "free";
  return canRequestCustomDomain(features, plan);
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { cardId } = await params;
  await dbConnect();
  const card = await Card.findOne({ _id: cardId, userId: session!.user.id })
    .select(
      "username companyName customDomain customDomainStatus customDomainActive customDomainRequestedAt customDomainReviewedAt",
    )
    .lean();

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const privilege = await assertDomainPrivilege(session!.user.id);
  const settings = await getPlatformSettings();
  return NextResponse.json({
    data: {
      ...card,
      _id: String((card as { _id: unknown })._id),
      platformCnameTarget: settings.platformCnameTarget,
      privilege,
    },
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { cardId } = await params;
    const body = await req.json();
    const { customDomain: raw } = customDomainSchema.parse(body);
    const domain = raw ? normalizeHostname(raw) : "";

    await dbConnect();

    const privilege = await assertDomainPrivilege(session!.user.id);
    if (!privilege.allowed && domain) {
      return NextResponse.json(
        { error: privilege.reason || "Custom Domain not permitted" },
        { status: 403 },
      );
    }

    if (domain) {
      const platforms = getPlatformHosts();
      if (platforms.has(domain)) {
        return NextResponse.json(
          { error: "That hostname is reserved for the platform" },
          { status: 400 },
        );
      }

      const taken = await Card.findOne({
        customDomain: domain,
        _id: { $ne: cardId },
      });
      if (taken) {
        return NextResponse.json(
          { error: "This domain is already linked to another card" },
          { status: 409 },
        );
      }
    }

    const card = await Card.findOne({ _id: cardId, userId: session!.user.id });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (!domain) {
      await Card.findOneAndUpdate(
        { _id: cardId, userId: session!.user.id },
        {
          $unset: {
            customDomain: 1,
            customDomainRequestedAt: 1,
            customDomainReviewedAt: 1,
          },
          $set: {
            customDomainStatus: "none",
            customDomainActive: false,
          },
        },
      );
      const cleared = await Card.findById(cardId);
      return NextResponse.json({
        data: cleared,
        message: "Custom domain request withdrawn",
      });
    }

    const domainChanged = card.customDomain !== domain;
    card.customDomain = domain;
    // Any new/changed request returns to pending & inactive until Super Admin acts
    if (domainChanged) {
      card.customDomainStatus = "pending";
      card.customDomainActive = false;
      card.customDomainRequestedAt = new Date();
      card.customDomainReviewedAt = undefined;
    } else if (
      card.customDomainStatus === "none" ||
      card.customDomainStatus === "rejected" ||
      card.customDomainStatus === "failed"
    ) {
      card.customDomainStatus = "pending";
      card.customDomainActive = false;
      card.customDomainRequestedAt = new Date();
      card.customDomainReviewedAt = undefined;
    }
    await card.save();

    return NextResponse.json({
      data: card,
      message:
        "Domain request submitted. It stays inactive until Super Admin approves and activates it.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: err.errors[0]?.message || "Validation failed",
          details: err.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { cardId } = await params;
  let action = "withdraw";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.action === "remove" || body?.action === "withdraw") {
      action = "withdraw";
    }
  } catch {
    /* empty */
  }

  await dbConnect();
  const card = await Card.findOne({ _id: cardId, userId: session!.user.id });
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (action === "withdraw") {
    await Card.findOneAndUpdate(
      { _id: cardId, userId: session!.user.id },
      {
        $unset: {
          customDomain: 1,
          customDomainRequestedAt: 1,
          customDomainReviewedAt: 1,
        },
        $set: { customDomainStatus: "none", customDomainActive: false },
      },
    );
    const cleared = await Card.findById(cardId);
    return NextResponse.json({
      data: cleared,
      message: "Custom domain request removed",
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
