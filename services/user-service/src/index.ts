import { createApp } from "./app";

export const app = createApp();

const port = Number(process.env.PORT || 4000);
if (require.main === module) {
  app.listen(port, () => console.log("user-service started", port));
}
