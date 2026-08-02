/**
 * Starts an in-memory MongoDB for local development when Docker is unavailable.
 * Writes the connection URI into `.env.local` and keeps the process alive.
 *
 * Usage: pnpm db:mem
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

function upsertEnvLocal(uri: string) {
  const envPath = resolve(process.cwd(), ".env.local");
  let raw = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  if (/^MONGODB_URI=.*/m.test(raw)) {
    raw = raw.replace(/^MONGODB_URI=.*/m, `MONGODB_URI=${uri}`);
  } else {
    raw = `MONGODB_URI=${uri}\n` + raw;
  }
  writeFileSync(envPath, raw, "utf8");
}

async function main() {
  // Slow disks / AV scanners often need more than the 10s default
  process.env.MONGOMS_LAUNCH_TIMEOUT = process.env.MONGOMS_LAUNCH_TIMEOUT || "120000";

  console.log("Starting MongoMemoryServer (this can take a minute on first run)…");

  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: "futurecard",
    },
  });

  const uri = mongod.getUri("futurecard");
  upsertEnvLocal(uri);

  console.log("✓ MongoDB ready at", uri);
  console.log("✓ Updated .env.local MONGODB_URI");
  console.log("Keep this terminal open, then run in another:");
  console.log("  pnpm seed");
  console.log("  pnpm dev");

  const shutdown = async () => {
    console.log("\nStopping MongoMemoryServer…");
    await mongod.stop();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());

  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
