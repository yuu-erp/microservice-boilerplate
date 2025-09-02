import dotenv from "dotenv";

// Load environment variables
const result = dotenv.config();
if (result.error) {
  throw new Error(`Failed to load .env file: ${result.error.message}`);
}

// Interface for type safety
interface AppConfig {
  port: number;
  nodeEnv: string;
  isDev: boolean;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
  };
  authServiceUrl: string
}

// Configuration with validation
const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60_000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "300", 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    methods: (process.env.CORS_METHODS?.split(",") || ["GET", "POST", "PUT", "DELETE"]).map(method => method.trim()),
    credentials: process.env.CORS_CREDENTIALS === "true",
  },
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://",
};

// Validate critical configurations
if (isNaN(appConfig.port)) {
  throw new Error("Invalid PORT environment variable: must be a number");
}
if (isNaN(appConfig.rateLimit.windowMs) || isNaN(appConfig.rateLimit.max)) {
  throw new Error("Invalid rate limit configuration: windowMs and max must be numbers");
}

export default appConfig;
