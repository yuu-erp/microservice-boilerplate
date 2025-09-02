import fs from "fs";
import { Command } from "commander";
import { handlePath } from "./utils";
import dotenv from "dotenv";
dotenv.config();
const program = new Command();
const env = process.env.NODE_ENV || "development";
program.name("Micro CLI").description("CLI for micro services").version("1.0.0");

const commandFiles = fs
  .readdirSync(handlePath("./commands", __dirname))
  .filter((file) => file.endsWith(env === "production" ? ".js" : ".ts"));
for (const file of commandFiles) {
  const { default: command } = require(handlePath(`./commands/${file}`, __dirname));
  command(program);
}
program.parse(process.argv);
