import { env } from "./env.js";
import { prisma } from "./db.js";
import { createClient } from "./discord/client.js";
import { registerInteractionHandler } from "./discord/interaction.js";
import { startPresenceLoop } from "./discord/presence.js";
import { createHttpServer } from "./http/server.js";
import { shutdownPool } from "./rcon/pool.js";

async function main(): Promise<void> {
  const client = createClient();
  registerInteractionHandler(client);

  client.once("clientReady", (c) => {
    console.log(`✅ Discord conectado como ${c.user.tag}`);
    startPresenceLoop(c);
  });

  const http = await createHttpServer();
  await http.listen({ host: "0.0.0.0", port: env.PORT });
  console.log(`✅ HTTP /health em :${env.PORT}`);

  await client.login(env.DISCORD_TOKEN);

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\nRecebido ${signal}, encerrando…`);
    try {
      await http.close();
      client.destroy();
      await shutdownPool();
      await prisma.$disconnect();
    } finally {
      process.exit(0);
    }
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err: unknown) => {
  console.error("Fatal:", err);
  process.exit(1);
});
