import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../command.js";
import { execRcon } from "../../rcon/exec.js";

export const command: Command = {
  requiresAdmin: true,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um jogador do servidor PZ.")
    .setDMPermission(false)
    .addStringOption((o) =>
      o.setName("user").setDescription("Nome do jogador").setRequired(true).setMaxLength(64),
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Motivo").setRequired(false).setMaxLength(200),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const user = sanitizeUser(interaction.options.getString("user", true));
    const reason = interaction.options.getString("reason", false);
    const cmd = reason
      ? `banuser "${user}" -r "${sanitize(reason)}"`
      : `banuser "${user}"`;
    const out = await execRcon(interaction.guildId, cmd);
    await interaction.editReply(`\`\`\`\n${out || "(sem retorno)"}\n\`\`\``);
  },
};

function sanitize(s: string): string {
  return s.replace(/["\\]/g, "");
}
function sanitizeUser(s: string): string {
  return s.replace(/["\\\s]/g, "_");
}
