import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CardUsageIndicator({
  used,
  limit,
  className,
  showUpgrade = true,
  adminWhatsapp,
}: {
  used: number;
  limit: number;
  className?: string;
  showUpgrade?: boolean;
  adminWhatsapp?: string;
}) {
  const capped = Math.max(1, limit);
  const atLimit = used >= capped;
  const pct = Math.min(100, Math.round((used / capped) * 100));
  const phone = (adminWhatsapp || "").replace(/\D/g, "");

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-card/80 px-4 py-3 shadow-panel",
        atLimit && "border-amber-400/30 bg-amber-500/5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Card usage
          </p>
          <p className="mt-0.5 font-display text-lg font-bold">
            {used}/{capped}{" "}
            <span className="text-sm font-semibold text-muted-foreground">
              cards used
            </span>
          </p>
        </div>
        {atLimit && showUpgrade ? (
          phone ? (
            <Button asChild size="sm" variant="outline">
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent(
                  "Hi, I need to upgrade my digital card limit.",
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Upgrade limit
              </a>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/settings">Contact support</Link>
            </Button>
          )
        ) : null}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            atLimit ? "bg-amber-400" : "bg-teal-400",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {atLimit ? (
        <p className="mt-2 text-xs text-amber-200/90">
          You have reached your card limit. Please contact support to upgrade.
        </p>
      ) : null}
    </div>
  );
}

export function CardLimitReachedPrompt({
  used,
  limit,
  adminWhatsapp,
}: {
  used: number;
  limit: number;
  adminWhatsapp?: string;
}) {
  const phone = (adminWhatsapp || "").replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-center shadow-panel">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/80">
        Limit reached
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold">
        {used}/{Math.max(1, limit)} cards used
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        You have reached your card limit. Please contact support to upgrade.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {phone ? (
          <Button asChild>
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(
                "Hi, I need to upgrade my digital card limit.",
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Message support
            </a>
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href="/cards">Back to cards</Link>
        </Button>
      </div>
    </div>
  );
}
