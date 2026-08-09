"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiClient, ApiError } from "@/lib/api-client";

export type AdminDomainRow = {
  _id: string;
  username: string;
  companyName: string;
  customDomain?: string;
  customDomainStatus?: string;
  customDomainActive?: boolean;
  customDomainRequestedAt?: string;
  customDomainReviewedAt?: string;
  isLive?: boolean;
  owner?: {
    name: string;
    email: string;
    customDomainFeature?: boolean;
  } | null;
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-sky-50 text-sky-800",
  rejected: "bg-red-50 text-red-700",
  none: "bg-zinc-100 text-zinc-600",
};

type Action =
  | "approve"
  | "reject"
  | "activate"
  | "deactivate"
  | "dns-check"
  | "clear";

export function AdminDomainsTable({
  initial,
  platformCnameTarget,
}: {
  initial: AdminDomainRow[];
  platformCnameTarget: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<"all" | "pending" | "live">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const visible = useMemo(() => {
    if (filter === "pending") {
      return rows.filter((r) => r.customDomainStatus === "pending");
    }
    if (filter === "live") {
      return rows.filter((r) => r.isLive);
    }
    return rows;
  }, [rows, filter]);

  async function act(cardId: string, action: Action) {
    setBusyId(cardId);
    setError("");
    setInfo("");
    try {
      const res = await apiClient<{
        data?: AdminDomainRow;
        message?: string;
        verification?: { ok: boolean; detail: string };
      }>("/api/admin/domains", {
        method: "PATCH",
        body: JSON.stringify({ cardId, action }),
      });
      if (action === "clear") {
        setRows((prev) => prev.filter((r) => r._id !== cardId));
      } else if (res.data) {
        setRows((prev) =>
          prev.map((r) =>
            r._id === cardId
              ? {
                  ...r,
                  ...res.data,
                  customDomainStatus: res.data!.customDomainStatus,
                  customDomainActive: res.data!.customDomainActive,
                  isLive: res.data!.isLive,
                }
              : r,
          ),
        );
      }
      if (res.verification) {
        setInfo(res.verification.detail || res.message || "");
      } else if (res.message) {
        setInfo(res.message);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review client requests, approve or reject them, then toggle{" "}
        <span className="font-medium text-foreground">Active</span> to start
        host-based mapping. CNAME target:{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {platformCnameTarget}
        </code>
      </p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All requests"],
            ["pending", "Pending"],
            ["live", "Live / Active"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === key
                ? "bg-teal-700 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {info}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-2xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No custom domain requests in this view.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Domain</th>
                <th className="px-4 py-3 font-semibold">Card / Owner</th>
                <th className="px-4 py-3 font-semibold">Approval</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const approved = row.customDomainStatus === "approved";
                return (
                  <tr key={row._id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {row.customDomain}
                      {row.customDomainRequestedAt ? (
                        <div className="text-xs font-normal text-muted-foreground">
                          Requested{" "}
                          {new Date(
                            row.customDomainRequestedAt,
                          ).toLocaleDateString()}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div>{row.companyName}</div>
                      <div className="text-xs text-muted-foreground">
                        /{row.username} · {row.owner?.email ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          statusStyles[row.customDomainStatus || "none"]
                        }`}
                      >
                        {row.customDomainStatus || "none"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={busyId === row._id || !approved}
                        title={
                          approved
                            ? "Toggle mapping active"
                            : "Approve before activating"
                        }
                        onClick={() =>
                          act(
                            row._id,
                            row.customDomainActive || row.isLive
                              ? "deactivate"
                              : "activate",
                          )
                        }
                        className={`relative h-7 w-12 rounded-full transition ${
                          row.isLive || row.customDomainActive
                            ? "bg-teal-600"
                            : "bg-zinc-200"
                        } ${!approved ? "opacity-40" : ""}`}
                      >
                        <span
                          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                            row.isLive || row.customDomainActive
                              ? "left-5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                      <div className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">
                        {row.isLive || row.customDomainActive
                          ? "Live"
                          : "Off"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                         
                          disabled={
                            busyId === row._id ||
                            row.customDomainStatus === "approved"
                          }
                          onClick={() => act(row._id, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === row._id}
                          onClick={() => act(row._id, "reject")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === row._id}
                          onClick={() => act(row._id, "dns-check")}
                        >
                          Check DNS
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === row._id}
                          onClick={() => act(row._id, "clear")}
                        >
                          Clear
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
