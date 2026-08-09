"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { apiClient, ApiError } from "@/lib/api-client";

/** Inline Super Admin editor for users.max_cards_limit on the users table */
export function MaxCardsLimitCell({
  userId,
  initial,
}: {
  userId: string;
  initial: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(nextRaw: string) {
    const next = Math.min(50, Math.max(1, Math.floor(Number(nextRaw) || 1)));
    setValue(String(next));
    if (next === initial) return;

    setSaving(true);
    setError("");
    try {
      await apiClient(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ maxCardsLimit: next }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
      setValue(String(initial));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-[5.5rem]">
      <Input
        type="number"
        min={1}
        max={50}
        value={value}
        disabled={saving}
        aria-label="Max cards limit"
        className="h-8 w-20 px-2 text-sm"
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => void save(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
      />
      {error ? (
        <p className="mt-1 max-w-[8rem] text-[10px] text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
