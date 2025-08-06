import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { experienceParamsBuilderAgent } from "./agents/experienceParamsBuilderAgent";
import { experienceParseAgent } from "./agents/experienceParseAgent";
import { jobSummaryParseAgent } from "./agents/jobSummaryParseAgent";
import { wantToDoParseAgent } from "./agents/wantToDoParseAgent";
import { syncWorkflow } from "./workflows/syncWorkflow";

/**
 * Mastraインスタンスを作成する
 */
export const mastra = new Mastra({
  agents: {
    experienceParseAgent,
    jobSummaryParseAgent,
    wantToDoParseAgent,
    experienceParamsBuilderAgent,
  },
  workflows: {
    syncWorkflow,
  },
  telemetry: {
    enabled: false,
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
