import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Card } from "@/models/Card";
import { PageHeader, EmptyState } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";

export default async function CardsPage() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const cards = await Card.find({ userId: session!.user.id }).sort({
    createdAt: -1,
  });

  return (
    <div>
      <PageHeader
        title="Your cards"
        description="All digital visiting cards on your account."
        actions={
          <Button asChild className="bg-teal-700 hover:bg-teal-800">
            <Link href="/cards/create">Create card</Link>
          </Button>
        }
      />

      {cards.length === 0 ? (
        <EmptyState
          title="No cards yet"
          description="Build your first digital visiting card in a few minutes."
          action={
            <Button asChild className="bg-teal-700 hover:bg-teal-800">
              <Link href="/cards/create">Create card</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c._id.toString()}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {c.companyName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{c.jobTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    /{c.username}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase">
                  {c.isActive ? "Live" : "Draft"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/cards/${c._id}/edit`}>Edit</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/cards/${c._id}/preview`}>Preview</Link>
                </Button>
                <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
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
