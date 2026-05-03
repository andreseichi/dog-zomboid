import Fastify, { type FastifyInstance } from "fastify";
import { rconTestRoute } from "./routes/rcon-test.js";

export async function createHttpServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.get("/health", async () => ({ ok: true }));
  await app.register(rconTestRoute);

  return app;
}
