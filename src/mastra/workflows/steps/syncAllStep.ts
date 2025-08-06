import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { ExperienceApiParamsList, JobSummary, LaprasState, WantToDo } from "../../../types";
import { syncExperiencesStep, updateJobSummaryStep, updateWantToDoStep } from "./syncSteps";

/**
 * 職歴を削除するステップ
 */
export const deleteExperiencesStep = createStep({
  id: "delete-experiences",
  description: "Delete all existing experiences",
  inputSchema: z.object({
    originalState: z.custom<LaprasState>(),
    experienceParams: z.custom<ExperienceApiParamsList>(),
    jobSummary: z.custom<JobSummary>(),
    wantToDo: z.custom<WantToDo>(),
  }),
  outputSchema: z.object({
    originalState: z.custom<LaprasState>(),
    experienceParams: z.custom<ExperienceApiParamsList>(),
    jobSummary: z.custom<JobSummary>(),
    wantToDo: z.custom<WantToDo>(),
  }),
  execute: async ({ inputData }) => {
    const { deleteExperiencesStep: deleteExperiences } = await import("./syncSteps");
    await deleteExperiences();
    return inputData;
  },
});

/**
 * 同期を実行するステップ
 */
export const syncAllStep = createStep({
  id: "sync-all",
  description: "Sync all data to LAPRAS",
  inputSchema: z.object({
    originalState: z.custom<LaprasState>(),
    experienceParams: z.custom<ExperienceApiParamsList>(),
    jobSummary: z.custom<JobSummary>(),
    wantToDo: z.custom<WantToDo>(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    errors: z.array(z.string()).optional(),
    originalState: z.custom<LaprasState>(),
  }),
  execute: async ({ inputData }) => {
    const errors: string[] = [];

    // 並列で同期を実行
    const [expResult, jobResult, wantResult] = await Promise.all([
      syncExperiencesStep(inputData.experienceParams),
      updateJobSummaryStep(inputData.jobSummary),
      updateWantToDoStep(inputData.wantToDo),
    ]);

    // エラーを収集
    if (!expResult.success && expResult.errors) {
      errors.push(...expResult.errors);
    }
    if (!jobResult.success && jobResult.error) {
      errors.push(jobResult.error);
    }
    if (!wantResult.success && wantResult.error) {
      errors.push(wantResult.error);
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      originalState: inputData.originalState,
    };
  },
});
