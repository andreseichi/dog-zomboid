import { ActivityType, PresenceData, type Client } from "discord.js";
import { prisma } from "../db.js";
import { execRcon } from "../rcon/exec.js";

const INTERVAL_MS = 60_000; // atualiza a cada 60s

/** Extrai o número de jogadores da resposta do comando `players` do PZ.
 *  Formato esperado: "Players connected (3):\n-player1\n..."
 */
function parsePlayerCount(response: string): number {
  const match = response.match(/Players connected\s*\((\d+)\)/i);
  return match ? parseInt(match[1]!, 10) : 0;
}

async function fetchTotalPlayers(): Promise<number> {
  const guilds = await prisma.guildConfig.findMany({
    where: {
      rconHost: { not: null },
      rconPort: { not: null },
      rconPasswordEnc: { not: null },
    },
    select: { guildId: true },
  });

  const counts = await Promise.allSettled(
    guilds.map(({ guildId }) => execRcon(guildId, "players")),
  );

  return counts.reduce((sum, result) => {
    if (result.status === "fulfilled") {
      return sum + parsePlayerCount(result.value);
    }
    return sum;
  }, 0);
}

function buildPresence(total: number): PresenceData {
  const label = total === 1 ? "1 jogador online" : `${total} jogadores online`;
  return {
    status: "online" as const,
    activities: [
      {
        name: label,
        type: ActivityType.Playing,
        state: "Server na ativa",
        url: "https://www.projectzomboid.com/",
      },
    ],
  };
}

export function startPresenceLoop(client: Client<true>): void {
  const update = async (): Promise<void> => {
    try {
      const total = await fetchTotalPlayers();
      client.user.setPresence(buildPresence(total));
    } catch {
      // silencia erros — presença não é crítica
    }
  };

  void update();
  setInterval(() => void update(), INTERVAL_MS);
}
