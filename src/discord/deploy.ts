import { REST, Routes } from "discord.js";
import { env } from "../env.js";
import { commands } from "./commands/_registry.js";

async function main(): Promise<void> {
  const body = commands.map((c) => c.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

  if (env.GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_APP_ID, env.GUILD_ID), { body });
    console.log(`✅ Registrados ${body.length} comandos na guild ${env.GUILD_ID}`);
  } else {
    await rest.put(Routes.applicationCommands(env.DISCORD_APP_ID), { body });
    console.log(`✅ Registrados ${body.length} comandos globalmente (propaga em ~1h)`);
  }
}

main().catch((err: unknown) => {
  console.error("Falha registrando comandos:", err);
  process.exit(1);
});
