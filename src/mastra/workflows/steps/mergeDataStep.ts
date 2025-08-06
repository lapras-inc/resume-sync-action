import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { ExperienceApiParamsList, JobSummary, LaprasState, WantToDo } from "../../../types";

/**
 * データを統合するステップ
 */
export const mergeDataStep = createStep({
  id: "merge-data",
  description: "Merge all parsed and validated data",
  inputSchema: z.object({
    "get-current-state": z.object({
      originalState: z.custom<LaprasState>(),
    }),
    "experience-workflow": z.object({
      experienceParams: z.custom<ExperienceApiParamsList>(),
    }),
    "process-job-summary": z.object({
      jobSummary: z.custom<JobSummary>(),
    }),
    "process-want-to-do": z.object({
      wantToDo: z.custom<WantToDo>(),
    }),
  }),
  outputSchema: z.object({
    originalState: z.custom<LaprasState>(),
    experienceParams: z.custom<ExperienceApiParamsList>(),
    jobSummary: z.custom<JobSummary>(),
    wantToDo: z.custom<WantToDo>(),
  }),
  execute: async ({ inputData }) => {
    return {
      originalState: inputData["get-current-state"].originalState,
      experienceParams: inputData["experience-workflow"].experienceParams,
      jobSummary: inputData["process-job-summary"].jobSummary,
      wantToDo: inputData["process-want-to-do"].wantToDo,
    };
  },
});
