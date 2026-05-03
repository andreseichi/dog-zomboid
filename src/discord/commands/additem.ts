import { SlashCommandBuilder } from "discord.js";
import { Command } from "../command.js";
import { execRcon } from "../../rcon/exec.js";

export const command: Command = {
  requiresAdmin: true,
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Adiciona um item ao inventário de um jogador")
    .setDMPermission(false)
    .addStringOption((o) =>
      o
        .setName("user")
        .setDescription("Nome do jogador in-game")
        .setRequired(true)
        .setMaxLength(64),
    )
    .addStringOption((o) =>
      o
        .setName("item")
        .setDescription("Nome do item (ex: Base.Axe) - Item ID https://pzwiki.net/wiki/PZwiki:Item_list")
        .setRequired(true)
        .setMaxLength(100),
    )
    .addIntegerOption((o) =>
      o
        .setName("quantity")
        .setDescription("Quantidade (Padrão 1)")
        .setRequired(false)
        .setMinValue(1),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getString("user", true);
    const item = sanitizeItem(interaction.options.getString("item", true));
    const quantity = interaction.options.getInteger("quantity", false) ?? 1;

    const cmd = `additem "${user}" "${item}" ${quantity}`;
    const out = await execRcon(interaction.guildId, cmd);
    await interaction.editReply(
      `Item adicionado: \`${quantity}x ${item}\` para jogador \`${user}\`.\nResposta do servidor: \`${out.trim() || "(sem retorno)"}\``,
    );
  },
};

function sanitizeUser(s: string): string {
  return s.replace(/["\\\s]/g, "_");
}
function sanitizeItem(s: string): string {
  return s.replace(/["\\]/g, "");
}
