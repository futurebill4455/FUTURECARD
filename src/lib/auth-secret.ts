/** Shared NextAuth JWT secret resolution (middleware + authOptions must match). */
export function getAuthSecret(): string {
  const value =
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  if (value) return value;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-futurecard-secret";
  }
  console.error(
    "[auth] NEXTAUTH_SECRET (or AUTH_SECRET) is missing in production.",
  );
  return "missing-production-secret-set-NEXTAUTH_SECRET";
}
