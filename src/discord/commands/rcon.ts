import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../command.js";
import { execRcon } from "../../rcon/exec.js";

export const command: Command = {
  requiresAdmin: true,
  data: new SlashCommandBuilder()
    .setName("rcon")
    .setDescription("Executa um comando RCON arbitrário.")
    .setDMPermission(false)
    .addStringOption((o) =>
      o.setName("command").setDescription("Comando RCON").setRequired(true).setMaxLength(500),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const cmd = interaction.options.getString("command", true);
    const out = await execRcon(interaction.guildId, cmd);
    const body = out.trim().length === 0 ? "(sem retorno)" : out;
    await interaction.editReply(`\`\`\`\n${truncate(body, 1900)}\n\`\`\``);
  },
};

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max) + "…";
}
