import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { parseResume } from "../agents/parseAgent";
import { executeSync } from "../agents/syncExecutorAgent";
import { LaprasStateSchema, ParsedResumeSchema } from "../../types";
import { getCurrentLaprasState } from "../../utils/laprasApiClient";

const parseResumeStep = createStep({
  id: "parseResume",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    parsedResume: ParsedResumeSchema,
  }),
  execute: async ({ inputData }) => {
    const parsedResume = await parseResume(inputData.resumeContent);
    return { parsedResume };
  },
});

const getCurrentStateStep = createStep({
  id: "getCurrentState",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    currentState: LaprasStateSchema,
  }),
  execute: async () => {
    const currentState = await getCurrentLaprasState();
    return {
      currentState,
    };
  },
});

const executeSyncStep = createStep({
  id: "executeSync",
  inputSchema: z.object({
    parsedResume: ParsedResumeSchema,
    currentState: LaprasStateSchema,
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { parsedResume, currentState } = inputData;

    const result = await executeSync(parsedResume, currentState);
    const logger = mastra.getLogger();
    logger.info(JSON.stringify(result.text, null, 2));
    return { success: true };
  },
});

const getAfterStateStep = createStep({
  id: "getAfterState",
  inputSchema: z.object({
    success: z.boolean(),
  }),
  outputSchema: z.object({
    afterState: z.any(),
  }),
  execute: async () => {
    const afterState = await getCurrentLaprasState();
    return { afterState };
  },
});

const createArtifactsStep = createStep({
  id: "createArtifacts",
  inputSchema: z.object({
    currentState: LaprasStateSchema,
    afterState: LaprasStateSchema,
  }),
  outputSchema: z.object({
    artifacts: z.object({
      before: z.string(),
      after: z.string(),
    }),
  }),
  execute: async ({ inputData }) => {
    const { currentState, afterState } = inputData;

    const formatState = (state: z.infer<typeof LaprasStateSchema>) => {
      return JSON.stringify(state, null, 2);
    };

    const before = formatState(currentState);
    const after = formatState(afterState);

    const artifacts = { before, after };

    return { artifacts };
  },
});

export const syncWorkflow = createWorkflow({
  id: "lapras-resume-sync",
  inputSchema: z.object({
    resumeContent: z.string(),
  }),
  outputSchema: z.object({
    artifacts: z.object({
      before: z.string(),
      after: z.string(),
    }),
  }),
})
  .parallel([parseResumeStep, getCurrentStateStep])
  .map({
    parsedResume: {
      step: parseResumeStep,
      path: "parsedResume",
    },
    currentState: {
      step: getCurrentStateStep,
      path: "currentState",
    },
  })
  .then(executeSyncStep)
  .then(getAfterStateStep)
  .map(async ({ getStepResult }) => {
    const currentState = getStepResult(getCurrentStateStep);
    const afterState = getStepResult(getAfterStateStep);
    return { ...currentState, ...afterState };
  })
  .then(createArtifactsStep)
  .commit();
