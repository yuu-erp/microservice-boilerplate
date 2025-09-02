import { createConfig, z } from "@shared/config";

export interface AppConfig {
  port: number;
  nodeEnv: string;
  isDev: boolean;
  rateLimit: { windowMs: number; max: number };
  cors: { origin: string | string[]; methods: string[]; credentials: boolean };
  authServiceUrl: string;
}

const Schema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RATE_LIMIT_WINDOW_MS: z.string().default("60000"),
  RATE_LIMIT_MAX: z.string().default("300"),
  CORS_ORIGIN: z.string().optional(),
  CORS_METHODS: z.string().optional(),
  CORS_CREDENTIALS: z.string().optional(),
  AUTH_SERVICE_URL: z.string().url().optional().default("http://"),
});

const env = createConfig(Schema) as Record<string, string>;

const appConfig: AppConfig = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  isDev: env.NODE_ENV !== "production",
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(env.RATE_LIMIT_MAX, 10),
  },
  cors: {
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : "*",
    methods: (env.CORS_METHODS?.split(",") || ["GET", "POST", "PUT", "DELETE"]).map((m) => m.trim()),
    credentials: env.CORS_CREDENTIALS === "true",
  },
  authServiceUrl: env.AUTH_SERVICE_URL,
};

export default appConfig;
