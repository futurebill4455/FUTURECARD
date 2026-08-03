import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/session";
import { getPlatformSettings } from "@/lib/platform-settings";
import {
  isCustomDomainLive,
  normalizeDomainStatus,
} from "@/lib/custom-domain-access";

/** Never statically collect this route during `next build`. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await dbConnect();
    const cards = await Card.find({
      customDomain: { $exists: true, $nin: [null, ""] },
    })
      .select(
        "username companyName customDomain customDomainStatus customDomainActive customDomainRequestedAt customDomainReviewedAt userId updatedAt",
      )
      .sort({ customDomainRequestedAt: -1, updatedAt: -1 })
      .lean();

    const userIds = [...new Set(cards.map((c) => String(c.userId)))];
    const users = await User.find({ _id: { $in: userIds } })
      .select("name email features")
      .lean();
    const userMap = new Map(
      users.map((u) => [
        String(u._id),
        {
          name: u.name as string,
          email: u.email as string,
          customDomainFeature: Boolean(
            (u as { features?: { customDomain?: boolean } }).features
              ?.customDomain,
          ),
        },
      ]),
    );

    const settings = await getPlatformSettings();

    return NextResponse.json({
      data: cards.map((c) => {
        const status = normalizeDomainStatus(c.customDomainStatus as string);
        return {
          _id: String(c._id),
          username: c.username,
          companyName: c.companyName,
          customDomain: c.customDomain,
          customDomainStatus: status,
          customDomainActive: isCustomDomainLive({
            customDomain: c.customDomain as string,
            customDomainStatus: c.customDomainStatus as string,
            customDomainActive: c.customDomainActive as boolean | undefined,
          })
            ? true
            : Boolean(c.customDomainActive),
          customDomainRequestedAt: c.customDomainRequestedAt,
          customDomainReviewedAt: c.customDomainReviewedAt,
          userId: String(c.userId),
          owner: userMap.get(String(c.userId)) ?? null,
          updatedAt: c.updatedAt,
          isLive: isCustomDomainLive({
            customDomain: c.customDomain as string,
            customDomainStatus: c.customDomainStatus as string,
            customDomainActive: c.customDomainActive as boolean | undefined,
          }),
        };
      }),
      platformCnameTarget: settings.platformCnameTarget,
    });
  } catch (err) {
    console.error("[api/admin/domains GET]", err);
    // Empty / unreachable DB must not break the admin UI or Vercel build probing
    return NextResponse.json(
      {
        data: [],
        platformCnameTarget:
          process.env.NEXT_PUBLIC_PLATFORM_CNAME_TARGET || "app.futurecard.pro",
        error:
          err instanceof Error
            ? err.message
            : "Database unavailable — returning empty domain list",
      },
      { status: 200 },
    );
  }
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
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = patchSchema.parse(await req.json());
    await dbConnect();
    const card = await Card.findById(body.cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (body.action === "clear") {
      await Card.findByIdAndUpdate(body.cardId, {
        $unset: {
          customDomain: 1,
          customDomainRequestedAt: 1,
          customDomainReviewedAt: 1,
        },
        $set: { customDomainStatus: "none", customDomainActive: false },
      });
      return NextResponse.json({ message: "Domain cleared" });
    }

    if (!card.customDomain) {
      return NextResponse.json(
        { error: "Card has no custom domain request" },
        { status: 400 },
      );
    }

    if (body.action === "approve") {
      card.customDomainStatus = "approved";
      card.customDomainReviewedAt = new Date();
      card.customDomainActive = false;
      await card.save();
      return NextResponse.json({
        data: serialize(card),
        message: "Domain approved. Toggle Active to start mapping.",
      });
    }

    if (body.action === "reject") {
      card.customDomainStatus = "rejected";
      card.customDomainActive = false;
      card.customDomainReviewedAt = new Date();
      await card.save();
      return NextResponse.json({
        data: serialize(card),
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
      card.customDomainActive = true;
      card.customDomainReviewedAt = new Date();
      await card.save();
      return NextResponse.json({
        data: serialize(card),
        message: "Custom domain is now active and mapping traffic",
      });
    }

    if (body.action === "deactivate") {
      card.customDomainActive = false;
      await card.save();
      return NextResponse.json({
        data: serialize(card),
        message: "Custom domain deactivated (mapping paused)",
      });
    }

    // Lazy-load DNS verify so Node `dns` is not required during page-data collection
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
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    console.error("[api/admin/domains PATCH]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

function serialize(card: {
  _id: { toString(): string };
  username: string;
  companyName: string;
  customDomain?: string;
  customDomainStatus?: string;
  customDomainActive?: boolean;
  customDomainRequestedAt?: Date;
  customDomainReviewedAt?: Date;
}) {
  const status = normalizeDomainStatus(card.customDomainStatus);
  return {
    _id: card._id.toString(),
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
