import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { parseAgent } from "./agents/parseAgent";
import { syncExecutorAgent } from "./agents/syncExecutorAgent";
import { syncWorkflow } from "./workflows/syncWorkflow";

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
