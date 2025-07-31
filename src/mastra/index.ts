import { Mastra } from "@mastra/core";
import { syncWorkflow } from "./workflows/syncWorkflow";
import { PinoLogger } from "@mastra/loggers";
import { parseAgent } from "./agents/parseAgent";
import { syncExecutorAgent } from "./agents/syncExecutorAgent";

/**
 * Mastraインスタンスを作成する
 */
export const mastra = new Mastra({
  agents: {
    parseAgent,
    syncExecutorAgent,
  },
  workflows: { syncWorkflow },
  telemetry: {
    enabled: false,
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
