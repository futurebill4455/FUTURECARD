import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import {
  clearCustomDomain,
  findCardByDomainExcluding,
  findCardByIdForUser,
  updateCardFields,
} from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { findSubscriptionByUserId } from "@/lib/db/subscriptions";
import { requireSession } from "@/lib/session";
import { customDomainSchema } from "@/lib/validations";
import {
  normalizeHostname,
  getPlatformHosts,
} from "@/lib/custom-domain";
import { getPlatformSettings } from "@/lib/platform-settings";
import { canRequestCustomDomain } from "@/lib/custom-domain-access";
import { resolveFeatures } from "@/types/platform.types";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ cardId: string }> };

async function assertDomainPrivilege(userId: string) {
  const [user, sub] = await Promise.all([
    findUserById(userId),
    findSubscriptionByUserId(userId),
  ]);
  const features = resolveFeatures(user?.features);
  const plan = sub?.plan ?? "free";
  return canRequestCustomDomain(features, plan);
}

export async function GET(_req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
    const { session, error } = await requireSession();
    if (error) return error;

    const { cardId } = await params;
    await dbConnect();
    const card = await findCardByIdForUser(cardId, session!.user.id);

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const privilege = await assertDomainPrivilege(session!.user.id);
    const settings = await getPlatformSettings();
    return NextResponse.json({
      data: {
        _id: card._id,
        username: card.username,
        companyName: card.companyName,
        customDomain: card.customDomain,
        customDomainStatus: card.customDomainStatus,
        customDomainActive: card.customDomainActive,
        customDomainRequestedAt: card.customDomainRequestedAt,
        customDomainReviewedAt: card.customDomainReviewedAt,
        platformCnameTarget: settings.platformCnameTarget,
        privilege,
      },
    });
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
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

        const taken = await findCardByDomainExcluding(domain, cardId);
        if (taken) {
          return NextResponse.json(
            { error: "This domain is already linked to another card" },
            { status: 409 },
          );
        }
      }

      const card = await findCardByIdForUser(cardId, session!.user.id);
      if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      if (!domain) {
        const cleared = await clearCustomDomain(cardId, {
          userId: session!.user.id,
        });
        return NextResponse.json({
          data: cleared,
          message: "Custom domain request withdrawn",
        });
      }

      const domainChanged = card.customDomain !== domain;
      const fields: Record<string, unknown> = {
        custom_domain: domain,
      };

      if (
        domainChanged ||
        card.customDomainStatus === "none" ||
        card.customDomainStatus === "rejected" ||
        (card.customDomainStatus as string) === "failed"
      ) {
        fields.custom_domain_status = "pending";
        fields.custom_domain_active = false;
        fields.custom_domain_requested_at = new Date().toISOString();
        fields.custom_domain_reviewed_at = null;
      }

      const updated = await updateCardFields(cardId, fields, {
        userId: session!.user.id,
      });

      return NextResponse.json({
        data: updated,
        message:
          "Domain request submitted. It stays inactive until Super Admin approves and activates it.",
      });
    } catch (err) {
      return toApiError(err);
    }
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  return withApiHandler(async () => {
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
    const card = await findCardByIdForUser(cardId, session!.user.id);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (action === "withdraw") {
      const cleared = await clearCustomDomain(cardId, {
        userId: session!.user.id,
      });
      return NextResponse.json({
        data: cleared,
        message: "Custom domain request removed",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  });
}
