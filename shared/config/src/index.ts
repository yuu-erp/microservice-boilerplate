import { z } from "zod";
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
  PORT: z.string().default("3000"),
  SERVICE_NAME: z.string().default("service"),
  POSTGRES_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional()
});
export type Env = z.infer<typeof EnvSchema>;
export function loadEnv(raw: NodeJS.ProcessEnv) {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
