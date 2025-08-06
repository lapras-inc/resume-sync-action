import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { experienceParamsBuilderAgent } from "./agents/experienceParamsBuilderAgent";
import { experienceParseAgent } from "./agents/experienceParseAgent";
import { jobSummaryParseAgent } from "./agents/jobSummaryParseAgent";
import { wantToDoParseAgent } from "./agents/wantToDoParseAgent";
import { parallelSyncWorkflow } from "./workflows/parallelSyncWorkflow";

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
    parallelSyncWorkflow,
  },
  telemetry: {
    enabled: false,
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
