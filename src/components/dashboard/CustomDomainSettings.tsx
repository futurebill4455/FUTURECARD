"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { apiClient, ApiError } from "@/lib/api-client";
import { FeatureLock } from "@/components/admin/FeaturePermissionChecklist";
import { normalizeDomainStatus } from "@/lib/custom-domain-access";

type DomainCard = {
  _id: string;
  username: string;
  companyName: string;
  customDomain?: string;
  customDomainStatus?: string;
  customDomainActive?: boolean;
};

const statusStyles: Record<string, string> = {
  none: "bg-zinc-100 text-zinc-600",
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-sky-50 text-sky-800",
  rejected: "bg-red-50 text-red-700",
};

function statusLabel(
  status: string,
  active?: boolean,
): string {
  if (status === "none") return "Not set";
  if (status === "approved" && active) return "Active";
  if (status === "approved") return "Approved (inactive)";
  return status;
}

export function CustomDomainSettings({
  cards,
  platformCnameTarget,
  allowed,
  lockReason,
}: {
  cards: DomainCard[];
  platformCnameTarget: string;
  allowed: boolean;
  lockReason?: string;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(cards[0]?._id ?? "");
  const selected = cards.find((c) => c._id === selectedId) ?? cards[0];
  const [domain, setDomain] = useState(selected?.customDomain ?? "");
  const [status, setStatus] = useState(
    normalizeDomainStatus(selected?.customDomainStatus),
  );
  const [active, setActive] = useState(Boolean(selected?.customDomainActive));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function selectCard(id: string) {
    const card = cards.find((c) => c._id === id);
    setSelectedId(id);
    setDomain(card?.customDomain ?? "");
    setStatus(normalizeDomainStatus(card?.customDomainStatus));
    setActive(Boolean(card?.customDomainActive));
    setMessage("");
    setError("");
  }

  async function onSubmitRequest(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await apiClient<{
        data: DomainCard;
        message?: string;
      }>(`/api/cards/${selected._id}/domain`, {
        method: "PUT",
        body: JSON.stringify({ customDomain: domain.trim() }),
      });
      setStatus(normalizeDomainStatus(res.data.customDomainStatus));
      setActive(Boolean(res.data.customDomainActive));
      setDomain(res.data.customDomain ?? "");
      setMessage(res.message || "Request submitted");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onWithdraw() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await apiClient(`/api/cards/${selected._id}/domain`, {
        method: "POST",
        body: JSON.stringify({ action: "withdraw" }),
      });
      setDomain("");
      setStatus("none");
      setActive(false);
      setMessage("Custom domain request withdrawn");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Remove failed");
    } finally {
      setBusy(false);
    }
  }

  const form = (
    <div className="space-y-5">
      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Create a digital card first, then request a custom domain for it.
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label>Card</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={selectedId}
              onChange={(e) => selectCard(e.target.value)}
            >
              {cards.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName} (/{c.username})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={onSubmitRequest} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Custom domain</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="card.mybusiness.com"
                autoComplete="off"
                disabled={!allowed}
              />
              <p className="text-xs text-muted-foreground">
                Submit a request for Super Admin review. Mapping stays inactive
                until they approve and activate the domain.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  statusStyles[status] || statusStyles.none
                }`}
              >
                {statusLabel(status, active)}
              </span>
              {status === "pending" ? (
                <span className="text-xs text-muted-foreground">
                  Waiting for Super Admin approval
                </span>
              ) : null}
              {status === "approved" && !active ? (
                <span className="text-xs text-muted-foreground">
                  Approved — waiting for admin to activate
                </span>
              ) : null}
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="font-semibold">DNS setup (CNAME)</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Point your domain before or after approval so it is ready when
                Super Admin activates mapping.
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-muted-foreground">
                <li>
                  Create a{" "}
                  <span className="font-medium text-foreground">CNAME</span> for{" "}
                  <code className="rounded bg-muted px-1 text-xs">
                    {domain || "card.mybusiness.com"}
                  </code>
                </li>
                <li>
                  Point it to{" "}
                  <code className="rounded bg-muted px-1 text-xs">
                    {platformCnameTarget}
                  </code>
                </li>
                <li>Wait for DNS propagation, then wait for Super Admin activation</li>
              </ol>
              <div className="mt-3 rounded-lg border border-dashed bg-background p-3 font-mono text-xs">
                <div>
                  Type: <span className="text-teal-800">CNAME</span>
                </div>
                <div>
                  Name/Host:{" "}
                  <span className="text-teal-800">
                    {domain ? domain.split(".")[0] : "card"}
                  </span>
                </div>
                <div>
                  Value/Target:{" "}
                  <span className="text-teal-800">{platformCnameTarget}</span>
                </div>
              </div>
            </div>

            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {message}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={busy || !allowed}
               
              >
                {busy ? "Working…" : "Submit request"}
              </Button>
              {status !== "none" ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy || !allowed}
                  onClick={onWithdraw}
                >
                  Withdraw
                </Button>
              ) : null}
            </div>
          </form>
        </>
      )}
    </div>
  );

  if (!allowed) {
    return (
      <FeatureLock
        enabled={false}
        title={lockReason || "Custom Domain not available"}
      >
        {form}
      </FeatureLock>
    );
  }

  return form;
}
