import { z } from "zod";

const schema = z.object({
  DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN é obrigatório'),
  DISCORD_APP_ID: z.string().min(1, 'DISCORD_APP_ID é obrigatório'),
  DATABASE_URL: z.string().url(),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY deve ser 32 bytes em hex (64 chars)"),
  PORT: z.coerce.number().int().positive().default(3000),
  GUILD_ID: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof schema>;

export const env: Env = schema.parse(process.env);
