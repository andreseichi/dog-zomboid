import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../command.js";
import { execRcon } from "../../rcon/exec.js";

export const command: Command = {
  requiresAdmin: true,
  data: new SlashCommandBuilder()
    .setName("players")
    .setDescription("Lista jogadores online no servidor PZ.")
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply();
    const out = await execRcon(interaction.guildId, "players");
    await interaction.editReply(`\`\`\`\n${truncate(out, 1900)}\n\`\`\``);
  },
};

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max) + "…";
}
