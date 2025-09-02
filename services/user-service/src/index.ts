import { initOtel } from "@shared/otel";

import { createApp } from "./app";

export const app = createApp();

const port = Number(process.env.PORT || 4000);
if (require.main === module) {
  initOtel("user-service", process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
  app.listen(port, () => console.log("user-service started", port));
}
