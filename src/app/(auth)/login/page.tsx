"use client";

import { FormEvent, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!res) {
        setError("Login failed — no response from auth server.");
        return;
      }

      if (res.error) {
        setError(
          "Invalid email or password. If this persists, ensure MongoDB is running (`docker compose up -d`) and you have run `pnpm seed`.",
        );
        return;
      }

      const session = await getSession();
      const dest =
        session?.user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
      router.replace(dest);
      router.refresh();
    } catch {
      setError(
        "Could not reach the auth API. Is `pnpm dev` running and MongoDB up?",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md animate-fade-up">
        <CardHeader>
          <Link href="/" className="font-display text-2xl font-bold">
            Future<span className="text-teal-700">Card</span>
          </Link>
          <CardTitle className="mt-4">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@digitalvcard.local"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <Button
              className="w-full bg-teal-700 hover:bg-teal-800"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-semibold text-teal-800">
              Register
            </Link>
          </p>
          <div className="mt-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Demo accounts</p>
            <p>Admin: admin@digitalvcard.local / Admin@123456</p>
            <p>Client: client@dhanya.local / Client@123456</p>
            <p className="mt-1">Also: admin@futurecard.local / Admin@123456</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
