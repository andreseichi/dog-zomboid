import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../command.js";
import { execRcon } from "../../rcon/exec.js";

export const command: Command = {
  requiresAdmin: true,
  data: new SlashCommandBuilder()
    .setName("broadcast")
    .setDescription("Envia uma mensagem para todos os jogadores no servidor.")
    .setDMPermission(false)
    .addStringOption((o) =>
      o.setName("message").setDescription("Mensagem").setRequired(true).setMaxLength(400),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const msg = interaction.options.getString("message", true);
    const safe = sanitize(msg);
    await execRcon(interaction.guildId, `servermsg "${safe}"`);
    await interaction.editReply(`📣 Enviado: ${safe}`);
  },
};

function sanitize(s: string): string {
  return s.replace(/["\\]/g, "");
}
