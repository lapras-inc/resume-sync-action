import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  ExperienceApiParamsListSchema,
  JobSummarySchema,
  LaprasStateSchema,
  WantToDoSchema,
} from "../../../types";
import { updateJobSummary as updateJobSummaryApi } from "../../../utils/laprasApiClient";

/**
 * 職務要約を更新するステップ
 */
export const updateJobSummaryStep = createStep({
  id: "update-job-summary",
  description: "Update job summary in LAPRAS",
  inputSchema: z.object({
    originalState: LaprasStateSchema,
    experienceParams: ExperienceApiParamsListSchema,
    jobSummary: JobSummarySchema,
    wantToDo: WantToDoSchema,
  }),
  outputSchema: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();

    logger?.info("Updating job summary...");
    try {
      await updateJobSummaryApi(inputData.jobSummary);
      logger?.info("Job summary updated successfully");
      return { success: true };
    } catch (error) {
      const errorMsg = `Failed to update job summary: ${error instanceof Error ? error.message : String(error)}`;
      logger?.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },
});
