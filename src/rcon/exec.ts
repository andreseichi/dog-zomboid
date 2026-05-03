import { prisma } from "../db.js";
import { decrypt } from "../crypto.js";
import { dropClient, getClient } from "./pool.js";

const SEND_TIMEOUT_MS = 5000;

export class RconNotConfiguredError extends Error {
  constructor() {
    super("RCON não configurado para esta guild. Use /set-rcon primeiro.");
    this.name = "RconNotConfiguredError";
  }
}

export async function execRcon(guildId: string, command: string): Promise<string> {
  const cfg = await prisma.guildConfig.findUnique({ where: { guildId } });
  if (!cfg || !cfg.rconHost || cfg.rconPort == null || !cfg.rconPasswordEnc) {
    throw new RconNotConfiguredError();
  }

  const password = decrypt(cfg.rconPasswordEnc);

  const send = async (): Promise<string> => {
    const client = await getClient(guildId, cfg.rconHost!, cfg.rconPort!, password);
    return await withTimeout(client.send(command), SEND_TIMEOUT_MS);
  };

  try {
    return await send();
  } catch (err) {
    await dropClient(guildId);
    return await send();
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout RCON ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}
