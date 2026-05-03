import {
  Events,
  MessageFlags,
  PermissionFlagsBits,
  type Client,
  type Interaction,
} from "discord.js";
import { commandsByName } from "./commands/_registry.js";
import { prisma } from "../db.js";
import { RconNotConfiguredError } from "../rcon/exec.js";

export function registerInteractionHandler(client: Client): void {
  client.on(Events.InteractionCreate, (interaction) => {
    void handle(interaction);
  });
}

async function handle(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Esse bot só funciona dentro de servidores.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const command = commandsByName.get(interaction.commandName);
  if (!command) return;

  if (command.requiresAdmin) {
    const allowed = await isAllowed(
      interaction.guildId,
      interaction.member.permissions.has(PermissionFlagsBits.ManageGuild),
      interaction.member.roles.cache,
    );
    if (!allowed) {
      await interaction.reply({
        content: "Você não tem permissão para usar esse comando.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    const msg = err instanceof RconNotConfiguredError
      ? err.message
      : err instanceof Error
        ? `Erro: ${err.message}`
        : "Erro desconhecido.";

    console.error(`[command ${interaction.commandName}]`, err);

    const payload = { content: msg } as const;
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: msg }).catch(() => undefined);
    } else {
      await interaction.reply(payload).catch(() => undefined);
    }
  }
}

async function isAllowed(
  guildId: string,
  hasManageGuild: boolean,
  roles: ReadonlyMap<string, unknown>,
): Promise<boolean> {
  if (hasManageGuild) return true;
  const cfg = await prisma.guildConfig.findUnique({
    where: { guildId },
    select: { adminRoleId: true },
  });
  if (cfg?.adminRoleId && roles.has(cfg.adminRoleId)) return true;
  return false;
}
