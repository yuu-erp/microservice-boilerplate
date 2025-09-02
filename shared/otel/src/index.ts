import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
let sdk: NodeSDK | undefined;
export function initOtel(serviceName: string, endpoint?: string) {
  if (sdk) return sdk;
  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: endpoint }),
    serviceName,
    instrumentations: [getNodeAutoInstrumentations()]
  });
  sdk.start();
  process.on("SIGTERM", () => sdk?.shutdown());
  return sdk;
}
