import { MessageFlags, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import type { Command } from "../command.js";
import { prisma } from "../../db.js";
import { encrypt } from "../../crypto.js";
import { dropClient, getClient } from "../../rcon/pool.js";

export const command: Command = {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName("set-rcon")
    .setDescription("Configura host/porta/senha RCON do servidor PZ desta guild.")
    .setDMPermission(false)
    .addStringOption((o) => o.setName("host").setDescription("Host RCON").setRequired(true))
    .addIntegerOption((o) =>
      o.setName("port").setDescription("Porta RCON - Padrão 27015").setMinValue(1).setMaxValue(65535).setRequired(true),
    )
    .addStringOption((o) => o.setName("password").setDescription("Senha RCON").setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const host = interaction.options.getString("host", true);
    const port = interaction.options.getInteger("port", true);
    const password = interaction.options.getString("password", true);

    const rconPasswordEnc = encrypt(password);

    await prisma.guildConfig.upsert({
      where: { guildId: interaction.guildId },
      create: { guildId: interaction.guildId, rconHost: host, rconPort: port, rconPasswordEnc },
      update: { rconHost: host, rconPort: port, rconPasswordEnc },
    });

    await dropClient(interaction.guildId);

    try {
      const client = await getClient(interaction.guildId, host, port, password);
      await client.send("players");
      await interaction.editReply(`✅ RCON configurado e conectado em \`${host}:${port}\`.`);
    } catch (err) {
      await interaction.editReply(
        `⚠️ Configuração salva, mas o teste de conexão falhou: ${errMsg(err)}`,
      );
    }
  },
};

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
