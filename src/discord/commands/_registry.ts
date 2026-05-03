import type { Command } from "../command.js";
import { command as setRcon } from "./set-rcon.js";
import { command as setAdminRole } from "./set-admin-role.js";
import { command as status } from "./status.js";
import { command as players } from "./players.js";
import { command as rcon } from "./rcon.js";
import { command as broadcast } from "./broadcast.js";
import { command as kick } from "./kick.js";
import { command as ban } from "./ban.js";

export const commands: readonly Command[] = [
  setRcon,
  setAdminRole,
  status,
  players,
  rcon,
  broadcast,
  kick,
  ban,
];

export const commandsByName: ReadonlyMap<string, Command> = new Map(
  commands.map((c) => [c.data.name, c]),
);
