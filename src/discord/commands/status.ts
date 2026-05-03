import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../command.js";
import { prisma } from "../../db.js";
import { execRcon } from "../../rcon/exec.js";

export const command: Command = {
  requiresAdmin: false,
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Mostra a configuração RCON e testa conectividade.")
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply();

    const cfg = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guildId } });

    if (!cfg) {
      await interaction.editReply("Nenhuma configuração. Use `/set-rcon` para começar.");
      return;
    }

    const lines: string[] = [];
    lines.push(`**Host:** \`${cfg.rconHost ?? "—"}\``);
    lines.push(`**Porta:** \`${cfg.rconPort ?? "—"}\``);
    lines.push(`**Senha:** ${cfg.rconPasswordEnc ? "configurada" : "—"}`);
    lines.push(`**Admin role:** ${cfg.adminRoleId ? `<@&${cfg.adminRoleId}>` : "—"}`);

    if (cfg.rconHost && cfg.rconPort != null && cfg.rconPasswordEnc) {
      try {
        await execRcon(interaction.guildId, "players");
        lines.push(`**RCON:** ✅ conectado`);
      } catch (err) {
        lines.push(`**RCON:** ❌ ${errMsg(err)}`);
      }
    } else {
      lines.push(`**RCON:** incompleto`);
    }

    await interaction.editReply({
      content: lines.join("\n"),
      allowedMentions: { parse: [] },
    });
  },
};

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
