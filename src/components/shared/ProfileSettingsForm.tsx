"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { apiClient, ApiError } from "@/lib/api-client";

type ProfileData = {
  name: string;
  email: string;
};

export function ProfileSettingsForm({
  initial,
}: {
  initial: ProfileData;
}) {
  const { update } = useSession();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await apiClient<{
        data: ProfileData;
        message?: string;
      }>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          email,
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      setName(res.data.name);
      setEmail(res.data.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(res.message || "Profile updated");

      await update({
        name: res.data.name,
        email: res.data.email,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Display name</Label>
        <Input
          id="profile-name"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="border-t pt-4">
        <p className="mb-3 text-sm font-medium">Change password</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Leave blank to keep your current password. New password requires your
          current password.
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-teal-800" role="status">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="bg-teal-700 hover:bg-teal-800"
      >
        {loading ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
