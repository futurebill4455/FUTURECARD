"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
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
          "Invalid email or password. If this persists, check Supabase env vars and run `pnpm seed`.",
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
        "Could not reach the auth API. Is `pnpm dev` running and is Supabase configured?",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-50" />
      <motion.div
        className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[1] w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <Link href="/" className="font-display text-2xl font-bold">
              Future<span className="text-gradient">Card</span>
            </Link>
            <CardTitle className="mt-4">Welcome back</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to your digital identity console.
            </p>
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
                  placeholder="admin@futurecard.local"
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
                <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              ) : null}
              <Button className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link
                href="/register"
                className="font-semibold text-teal-300 hover:text-teal-200"
              >
                Register
              </Link>
            </p>
            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-teal-100/80">Demo accounts</p>
              <p>Admin: admin@futurecard.local / Admin@123456</p>
              <p>User: demo@futurecard.local / Demo@123456</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
