import { promises as dns } from "dns";
import { normalizeHostname } from "@/lib/custom-domain";

function stripTrailingDot(value: string) {
  return value.endsWith(".") ? value.slice(0, -1) : value;
}

/**
 * Checks that `domain` has a CNAME (or ALIAS chain) pointing at `expectedTarget`.
 * Falls back to comparing A records when CNAME is unavailable (some DNS setups).
 */
export async function verifyDomainDns(
  domain: string,
  expectedTarget: string,
): Promise<{ ok: boolean; detail: string; records: string[] }> {
  const host = normalizeHostname(domain);
  const target = normalizeHostname(expectedTarget);

  if (!host || !target) {
    return { ok: false, detail: "Missing domain or CNAME target", records: [] };
  }

  try {
    const cnames = await dns.resolveCname(host);
    const normalized = cnames.map((c) => stripTrailingDot(c.toLowerCase()));
    const match = normalized.some(
      (c) => c === target || c.endsWith(`.${target}`),
    );
    if (match) {
      return {
        ok: true,
        detail: `CNAME points to ${normalized.join(", ")}`,
        records: normalized,
      };
    }
    return {
      ok: false,
      detail: `CNAME found (${normalized.join(", ")}) but does not match ${target}`,
      records: normalized,
    };
  } catch {
    // No CNAME — try comparing A records with target
  }

  try {
    const [domainAddrs, targetAddrs] = await Promise.all([
      dns.resolve4(host).catch(() => [] as string[]),
      dns.resolve4(target).catch(() => [] as string[]),
    ]);
    if (
      domainAddrs.length > 0 &&
      targetAddrs.length > 0 &&
      domainAddrs.some((a) => targetAddrs.includes(a))
    ) {
      return {
        ok: true,
        detail: `A records match platform host (${domainAddrs.join(", ")})`,
        records: domainAddrs,
      };
    }
    return {
      ok: false,
      detail: `No CNAME to ${target}. Add a CNAME record: ${host} → ${target}`,
      records: domainAddrs,
    };
  } catch (err) {
    return {
      ok: false,
      detail:
        err instanceof Error
          ? err.message
          : "DNS lookup failed. Ensure the CNAME has propagated.",
      records: [],
    };
  }
}
