import type { FastifyInstance } from "fastify";
import { Rcon } from "rcon-client";
import { z } from "zod";

const bodySchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  password: z.string().min(1),
});

const TIMEOUT_MS = 5000;

export async function rconTestRoute(app: FastifyInstance): Promise<void> {
  app.post("/rcon/test", async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.flatten().fieldErrors });
    }

    const { host, port, password } = parsed.data;
    const client = new Rcon({ host, port, password, timeout: TIMEOUT_MS });

    try {
      await client.connect();
      const out = await client.send("players");
      return { ok: true, response: out };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return reply.status(502).send({ ok: false, error: message });
    } finally {
      await client.end().catch(() => undefined);
    }
  });
}
