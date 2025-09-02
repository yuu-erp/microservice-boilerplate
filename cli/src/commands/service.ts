import { Command } from "commander";

export default (program: Command) => {
  const service = program.command("service").description("Service commands");
  service
    .command("create <name>")
    .description("Create a new Micro service.")
    .action(async (name: string) => {
      console.log(`Create a new service: ${name}`);
    });

  return program;
};
