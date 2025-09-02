"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOtel = initOtel;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
let sdk;
function initOtel(serviceName, endpoint) {
    if (sdk)
        return sdk;
    sdk = new sdk_node_1.NodeSDK({
        traceExporter: new exporter_trace_otlp_http_1.OTLPTraceExporter({ url: endpoint }),
        serviceName,
        instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()]
    });
    sdk.start();
    process.on("SIGTERM", () => sdk?.shutdown());
    return sdk;
}
