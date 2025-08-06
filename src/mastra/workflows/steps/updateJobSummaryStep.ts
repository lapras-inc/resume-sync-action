import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import type { JobSummary } from "../../../types";
import { updateJobSummary as updateJobSummaryApi } from "../../../utils/laprasApiClient";

/**
 * 職務要約を更新するステップ
 */
export const updateJobSummaryStep = createStep({
  id: "update-job-summary",
  description: "Update job summary in LAPRAS",
  inputSchema: z.object({
    jobSummary: z.custom<JobSummary>(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    console.log("Updating job summary...");
    try {
      await updateJobSummaryApi(inputData.jobSummary);
      console.log("Job summary updated successfully");
      return { success: true };
    } catch (error) {
      const errorMsg = `Failed to update job summary: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },
});
