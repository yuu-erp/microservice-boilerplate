"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.string().default("3000"),
    SERVICE_NAME: zod_1.z.string().default("service"),
    POSTGRES_URL: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().optional(),
    OTEL_EXPORTER_OTLP_ENDPOINT: zod_1.z.string().optional()
});
function loadEnv(raw) {
    const parsed = EnvSchema.safeParse(raw);
    if (!parsed.success) {
        console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
        process.exit(1);
    }
    return parsed.data;
}
