import { lookup } from "node:dns/promises";

/**
 * Resolve um hostname para um endereço IPv4.
 * Se já for um IP literal, retorna sem chamada DNS.
 * Garante que o rcon-client nunca tente conectar via IPv6.
 */
export async function resolveIPv4(host: string): Promise<string> {
  const { address } = await lookup(host, { family: 4 });
  return address;
}
