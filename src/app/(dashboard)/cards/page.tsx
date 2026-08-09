import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { listCardsByUser } from "@/lib/db/cards";
import { findUserById } from "@/lib/db/users";
import { getPlatformSettings } from "@/lib/platform-settings";
import { PageHeader, EmptyState } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { CardUsageIndicator } from "@/components/dashboard/CardUsageIndicator";
import { resolveMaxCardsLimit } from "@/types/platform.types";

export default async function CardsPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const [cards, user, settings] = await Promise.all([
    listCardsByUser(session!.user.id),
    findUserById(session!.user.id),
    getPlatformSettings(),
  ]);
  const maxCards = resolveMaxCardsLimit(user);
  const atLimit = cards.length >= maxCards;

  return (
    <div>
      <PageHeader
        title="Your cards"
        description="All digital visiting cards on your account."
        actions={
          atLimit ? (
            <Button asChild variant="outline">
              <Link href="/dashboard">Upgrade needed</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/cards/create">Create card</Link>
            </Button>
          )
        }
      />

      <CardUsageIndicator
        className="mb-6"
        used={cards.length}
        limit={maxCards}
        adminWhatsapp={settings.adminWhatsappNumber}
      />

      {cards.length === 0 ? (
        <EmptyState
          title="No cards yet"
          description="Build your first digital visiting card in a few minutes."
          action={
            <Button asChild>
              <Link href="/cards/create">Create card</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c._id}
              className="glass glow-border group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-400/10 blur-2xl transition group-hover:bg-teal-400/20" />
              <div className="relative z-[1] flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {c.companyName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{c.jobTitle}</p>
                  <p className="mt-1 text-xs text-teal-300/70">/{c.username}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    c.isActive
                      ? "border border-teal-400/30 bg-teal-400/15 text-teal-200"
                      : "border border-white/10 bg-white/5 text-muted-foreground"
                  }`}
                >
                  {c.isActive ? "Live" : "Draft"}
                </span>
              </div>
              <div className="relative z-[1] mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/cards/${c._id}/edit`}>Edit</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/cards/${c._id}/preview`}>Preview</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/${c.username}`} target="_blank">
                    Open public
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
