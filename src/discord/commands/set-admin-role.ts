import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../command.js";
import { prisma } from "../../db.js";

export const command: Command = {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName("set-admin-role")
    .setDescription("Define o cargo que pode rodar comandos RCON além de Manage Server.")
    .setDMPermission(false)
    .addRoleOption((o) =>
      o.setName("role").setDescription("Cargo de admin do bot").setRequired(true),
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("role", true);

    await prisma.guildConfig.upsert({
      where: { guildId: interaction.guildId },
      create: { guildId: interaction.guildId, adminRoleId: role.id },
      update: { adminRoleId: role.id },
    });

    await interaction.reply({
      content: `✅ Cargo de admin definido para <@&${role.id}>.`,
      allowedMentions: { parse: [] },
    });
  },
};
