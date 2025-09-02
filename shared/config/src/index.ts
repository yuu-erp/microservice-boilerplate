import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const createConfig = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  const env = parsed.data as Record<string, string>;
  return env;
};

export { z };


