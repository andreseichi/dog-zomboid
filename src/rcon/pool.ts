import { Rcon } from "rcon-client";

type Entry = { client: Rcon; host: string; port: number };

const pool = new Map<string, Entry>();

const CONNECT_TIMEOUT_MS = 5000;

export async function getClient(
  guildId: string,
  host: string,
  port: number,
  password: string,
): Promise<Rcon> {
  const existing = pool.get(guildId);
  if (existing && existing.host === host && existing.port === port) {
    return existing.client;
  }
  if (existing) {
    await existing.client.end().catch(() => undefined);
    pool.delete(guildId);
  }

  const client = new Rcon({ host, port, password, timeout: CONNECT_TIMEOUT_MS });
  client.on("end", () => {
    const e = pool.get(guildId);
    if (e && e.client === client) pool.delete(guildId);
  });
  client.on("error", () => {
    const e = pool.get(guildId);
    if (e && e.client === client) pool.delete(guildId);
  });

  await client.connect();
  pool.set(guildId, { client, host, port });
  return client;
}

export async function dropClient(guildId: string): Promise<void> {
  const entry = pool.get(guildId);
  if (!entry) return;
  pool.delete(guildId);
  await entry.client.end().catch(() => undefined);
}

export async function shutdownPool(): Promise<void> {
  const entries = [...pool.values()];
  pool.clear();
  await Promise.all(entries.map((e) => e.client.end().catch(() => undefined)));
}
