import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local for seed script
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
} catch {
  /* ignore */
}

type SeedAccount = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
};

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function upsertUser(
  sb: ReturnType<typeof getClient>,
  account: SeedAccount,
) {
  const email = account.email.toLowerCase();
  const passwordHash = await bcrypt.hash(account.password, 12);

  const { data: existing } = await sb
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let userId: string;
  if (existing?.id) {
    const { data, error } = await sb
      .from("users")
      .update({
        name: account.name,
        password: passwordHash,
        role: account.role,
        is_active: true,
      })
      .eq("id", existing.id)
      .select("id, password")
      .single();
    if (error) throw error;
    userId = data.id;
    const ok = await bcrypt.compare(account.password, data.password);
    if (!ok) throw new Error(`Password hash verification failed for ${email}`);
  } else {
    const { data, error } = await sb
      .from("users")
      .insert({
        name: account.name,
        email,
        password: passwordHash,
        role: account.role,
        is_active: true,
      })
      .select("id, password")
      .single();
    if (error) throw error;
    userId = data.id;
    const ok = await bcrypt.compare(account.password, data.password);
    if (!ok) throw new Error(`Password hash verification failed for ${email}`);
  }

  const start = new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);

  const { data: sub } = await sb
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (sub?.id) {
    await sb
      .from("subscriptions")
      .update({
        plan: account.role === "admin" ? "premium" : "basic",
        is_active: true,
        payment_status: "paid",
        end_date: end.toISOString(),
      })
      .eq("id", sub.id);
  } else {
    await sb.from("subscriptions").insert({
      user_id: userId,
      plan: account.role === "admin" ? "premium" : "basic",
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      is_active: true,
      payment_status: "paid",
      amount: 0,
    });
  }

  console.log(`✓ ${account.role}: ${email} / ${account.password}`);
  return userId;
}

async function main() {
  const sb = getClient();
  console.log("Seeding Supabase…", process.env.NEXT_PUBLIC_SUPABASE_URL);

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL || "admin@futurecard.local";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "Admin@123456";
  const userEmail = process.env.SEED_USER_EMAIL || "demo@futurecard.local";
  const userPass = process.env.SEED_USER_PASSWORD || "Demo@123456";

  await upsertUser(sb, {
    name: "Super Admin",
    email: adminEmail,
    password: adminPass,
    role: "admin",
  });

  await upsertUser(sb, {
    name: "Demo User",
    email: userEmail,
    password: userPass,
    role: "user",
  });

  await sb.from("platform_settings").upsert(
    {
      key: "default",
      company_name: "Future Shield",
      footer_tagline: "Verified digital visiting cards by Future Shield",
      platform_cname_target: "app.futurecard.pro",
    },
    { onConflict: "key" },
  );

  console.log("✓ Seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
