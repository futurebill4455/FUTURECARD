import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import {
  clearCustomDomain,
  findCardById,
  listCardsWithCustomDomains,
  updateCardFields,
} from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { requireAdmin } from "@/lib/session";
import { getPlatformSettings } from "@/lib/platform-settings";
import {
  isCustomDomainLive,
  normalizeDomainStatus,
} from "@/lib/custom-domain-access";
import { toApiError, withApiHandler } from "@/lib/api-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      await dbConnect();
      const cards = await listCardsWithCustomDomains();

      const userIds = [...new Set(cards.map((c) => c.userId))];
      const users = await Promise.all(userIds.map((id) => findUserById(id)));
      const userMap = new Map(
        users
          .filter(Boolean)
          .map((u) => [
            u!._id,
            {
              name: u!.name,
              email: u!.email,
              customDomainFeature: Boolean(u!.features?.customDomain),
            },
          ]),
      );

      const settings = await getPlatformSettings();

      return NextResponse.json({
        data: cards.map((c) => {
          const status = normalizeDomainStatus(c.customDomainStatus);
          return {
            _id: c._id,
            username: c.username,
            companyName: c.companyName,
            customDomain: c.customDomain,
            customDomainStatus: status,
            customDomainActive: isCustomDomainLive(c)
              ? true
              : Boolean(c.customDomainActive),
            customDomainRequestedAt: c.customDomainRequestedAt,
            customDomainReviewedAt: c.customDomainReviewedAt,
            userId: c.userId,
            owner: userMap.get(c.userId) ?? null,
            updatedAt: c.updatedAt,
            isLive: isCustomDomainLive(c),
          };
        }),
        platformCnameTarget: settings.platformCnameTarget,
      });
    } catch (err) {
      console.error("[api/admin/domains GET]", err);
      return NextResponse.json(
        {
          data: [],
          platformCnameTarget:
            process.env.NEXT_PUBLIC_PLATFORM_CNAME_TARGET ||
            "app.futurecard.pro",
          error:
            err instanceof Error
              ? err.message
              : "Database unavailable — returning empty domain list",
          code: "DATABASE_UNAVAILABLE",
        },
        { status: 200 },
      );
    }
  });
}

const patchSchema = z.object({
  cardId: z.string().min(1),
  action: z.enum([
    "approve",
    "reject",
    "activate",
    "deactivate",
    "dns-check",
    "clear",
  ]),
});

export async function PATCH(req: NextRequest) {
  return withApiHandler(async () => {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
      const body = patchSchema.parse(await req.json());
      await dbConnect();
      const card = await findCardById(body.cardId);
      if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      if (body.action === "clear") {
        await clearCustomDomain(body.cardId);
        return NextResponse.json({ message: "Domain cleared" });
      }

      if (!card.customDomain) {
        return NextResponse.json(
          { error: "Card has no custom domain request" },
          { status: 400 },
        );
      }

      if (body.action === "approve") {
        const updated = await updateCardFields(body.cardId, {
          custom_domain_status: "approved",
          custom_domain_reviewed_at: new Date().toISOString(),
          custom_domain_active: false,
        });
        return NextResponse.json({
          data: serialize(updated!),
          message: "Domain approved. Toggle Active to start mapping.",
        });
      }

      if (body.action === "reject") {
        const updated = await updateCardFields(body.cardId, {
          custom_domain_status: "rejected",
          custom_domain_active: false,
          custom_domain_reviewed_at: new Date().toISOString(),
        });
        return NextResponse.json({
          data: serialize(updated!),
          message: "Domain request rejected",
        });
      }

      if (body.action === "activate") {
        const status = normalizeDomainStatus(card.customDomainStatus);
        if (status !== "approved") {
          return NextResponse.json(
            {
              error:
                "Approve the domain first, then activate it to enable mapping.",
            },
            { status: 400 },
          );
        }
        const updated = await updateCardFields(body.cardId, {
          custom_domain_active: true,
          custom_domain_reviewed_at: new Date().toISOString(),
        });
        return NextResponse.json({
          data: serialize(updated!),
          message: "Custom domain is now active and mapping traffic",
        });
      }

      if (body.action === "deactivate") {
        const updated = await updateCardFields(body.cardId, {
          custom_domain_active: false,
        });
        return NextResponse.json({
          data: serialize(updated!),
          message: "Custom domain deactivated (mapping paused)",
        });
      }

      const { verifyDomainDns } = await import("@/lib/verify-domain-dns");
      const settings = await getPlatformSettings();
      const result = await verifyDomainDns(
        card.customDomain,
        settings.platformCnameTarget,
      );
      return NextResponse.json({
        data: serialize(card),
        verification: result,
        message: result.ok
          ? "DNS looks correct"
          : result.detail || "DNS check failed",
      });
    } catch (err) {
      return toApiError(err);
    }
  });
}

function serialize(card: {
  _id: string;
  username: string;
  companyName: string;
  customDomain?: string;
  customDomainStatus?: string;
  customDomainActive?: boolean;
  customDomainRequestedAt?: string;
  customDomainReviewedAt?: string;
}) {
  const status = normalizeDomainStatus(card.customDomainStatus);
  return {
    _id: card._id,
    username: card.username,
    companyName: card.companyName,
    customDomain: card.customDomain,
    customDomainStatus: status,
    customDomainActive: Boolean(card.customDomainActive),
    customDomainRequestedAt: card.customDomainRequestedAt,
    customDomainReviewedAt: card.customDomainReviewedAt,
    isLive: isCustomDomainLive({
      customDomain: card.customDomain,
      customDomainStatus: card.customDomainStatus,
      customDomainActive: card.customDomainActive,
    }),
  };
}
