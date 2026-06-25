// KV abstraction: Upstash Redis via REST when env vars are set, in-memory fallback otherwise.
// Provision via Vercel Marketplace → Upstash Redis → sets UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.

const g = globalThis as typeof globalThis & {
  _hcKvMem?: Map<string, { value: string; exAt?: number }>;
  _hcKvSets?: Map<string, Set<string>>;
};
if (!g._hcKvMem) g._hcKvMem = new Map();
if (!g._hcKvSets) g._hcKvSets = new Map();

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function upstashCmd(cmd: unknown[]): Promise<unknown> {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
  });
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

export async function kvGet(key: string): Promise<string | null> {
  if (hasUpstash()) return (await upstashCmd(["GET", key])) as string | null;
  const entry = g._hcKvMem!.get(key);
  if (!entry) return null;
  if (entry.exAt && Date.now() > entry.exAt) { g._hcKvMem!.delete(key); return null; }
  return entry.value;
}

export async function kvSet(key: string, value: string, exSeconds?: number): Promise<void> {
  if (hasUpstash()) {
    const cmd = exSeconds ? ["SET", key, value, "EX", exSeconds] : ["SET", key, value];
    await upstashCmd(cmd);
    return;
  }
  g._hcKvMem!.set(key, { value, exAt: exSeconds ? Date.now() + exSeconds * 1000 : undefined });
}

export async function kvDel(key: string): Promise<void> {
  if (hasUpstash()) { await upstashCmd(["DEL", key]); return; }
  g._hcKvMem!.delete(key);
}

export async function kvSIsMember(key: string, member: string): Promise<boolean> {
  if (hasUpstash()) return (await upstashCmd(["SISMEMBER", key, member])) === 1;
  return g._hcKvSets!.get(key)?.has(member) ?? false;
}

export async function kvSAdd(key: string, member: string, exSeconds?: number): Promise<void> {
  if (hasUpstash()) {
    await upstashCmd(["SADD", key, member]);
    if (exSeconds) await upstashCmd(["EXPIRE", key, exSeconds]);
    return;
  }
  const set = g._hcKvSets!.get(key) ?? new Set<string>();
  set.add(member);
  g._hcKvSets!.set(key, set);
}

// Atomic set-if-not-exists. Returns true if the key was set (first time), false if already existed.
export async function kvSetNx(key: string, value: string, exSeconds: number): Promise<boolean> {
  if (hasUpstash()) {
    const result = await upstashCmd(["SET", key, value, "EX", exSeconds, "NX"]);
    return result === "OK";
  }
  const entry = g._hcKvMem!.get(key);
  if (entry && (!entry.exAt || Date.now() <= entry.exAt)) return false;
  g._hcKvMem!.set(key, { value, exAt: Date.now() + exSeconds * 1000 });
  return true;
}
